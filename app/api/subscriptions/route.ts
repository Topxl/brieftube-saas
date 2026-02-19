import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { getYouTubeChannelInfo } from "@/lib/youtube";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// GET /api/subscriptions - Get user's YouTube channel subscriptions
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Helper to extract channel info from URL
function extractChannelInfo(url: string) {
  // Extract channel ID or handle from various YouTube URL formats
  // https://www.youtube.com/@channelhandle
  // https://www.youtube.com/channel/UCxxxxxx
  // https://www.youtube.com/c/channelname

  const handleMatch = url.match(/@([a-zA-Z0-9_-]+)/);
  if (handleMatch) {
    return { channelId: handleMatch[1], channelName: handleMatch[1] };
  }

  const channelMatch = url.match(/channel\/([a-zA-Z0-9_-]+)/);
  if (channelMatch) {
    return { channelId: channelMatch[1], channelName: channelMatch[1] };
  }

  const cMatch = url.match(/\/c\/([a-zA-Z0-9_-]+)/);
  if (cMatch) {
    return { channelId: cMatch[1], channelName: cMatch[1] };
  }

  // If it's just a handle or ID
  return {
    channelId: url.replace(/[@/]/g, ""),
    channelName: url.replace(/[@/]/g, ""),
  };
}

// POST /api/subscriptions - Add new YouTube channel subscription
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Support both { url } and { channelId, channelName } formats
  let channelId: string;
  let channelName: string;

  if (body.url) {
    // Extract from URL
    const extracted = extractChannelInfo(body.url);
    channelId = extracted.channelId;
    channelName = extracted.channelName;
  } else {
    // Direct channelId/channelName
    channelId = body.channelId;
    channelName = body.channelName;
  }

  if (!channelId || !channelName) {
    logger.error("Missing required fields:", {
      channelId,
      channelName,
      url: body.url,
    });
    return NextResponse.json(
      {
        error: "channelId and channelName are required",
        received: { channelId, channelName, url: body.url },
      },
      { status: 400 },
    );
  }

  logger.info("Adding subscription:", {
    channelId,
    channelName,
    userId: user.id,
  });

  // Fetch real channel info from YouTube (including avatar)
  const youtubeInfo = await getYouTubeChannelInfo(channelId);

  // Use YouTube scraped data
  const finalChannelId = youtubeInfo.channelId;
  const finalChannelName = youtubeInfo.channelName;
  const finalAvatarUrl = youtubeInfo.channelAvatarUrl;

  logger.info("YouTube channel info fetched:", {
    channelId: finalChannelId,
    channelName: finalChannelName,
    hasAvatar: !!finalAvatarUrl,
  });

  // Check user's profile for max active channels limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("max_channels, subscription_status, trial_ends_at")
    .eq("id", user.id)
    .single();

  // Count currently active subscriptions
  const { count: activeCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("active", true);

  const maxActiveChannels = profile?.max_channels ?? 3;
  const isPro =
    profile?.subscription_status === "active" ||
    (profile?.trial_ends_at != null &&
      new Date(profile.trial_ends_at) > new Date());

  // Free users can always add channels, but active is limited to maxActiveChannels
  const shouldBeActive = isPro || (activeCount ?? 0) < maxActiveChannels;

  // Check if already subscribed (using original channelId before YouTube fetch)
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("channel_id", finalChannelId)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Already subscribed to this channel" },
      { status: 409 },
    );
  }

  // Before inserting the subscription, mark all existing channel videos in
  // processed_videos so the RSS scanner never sees them as "new".
  // This prevents a race condition where the scanner runs between the subscription
  // insert and the video initialisation, creating spurious deliveries for old videos.
  let latestVideo: { videoId: string; title: string | null } | null = null;

  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${finalChannelId}`;
    const rssResponse = await fetch(rssUrl);
    const rssText = await rssResponse.text();

    // Extract entries in order (first = most recent)
    const entries = [...rssText.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(
      (m) => m[1],
    );

    const videos = entries
      .map((entry) => ({
        videoId: entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? null,
        title: entry.match(/<title>([^<]+)<\/title>/)?.[1] ?? null,
      }))
      .filter(
        (v): v is { videoId: string; title: string | null } => !!v.videoId,
      );

    if (videos.length === 0) {
      logger.info(`No videos found in RSS for channel ${finalChannelId}`);
    } else {
      // Mark ALL videos as skipped first — this blocks the scanner from picking
      // them up while we insert the subscription below.
      await Promise.all(
        videos.map((v) =>
          supabase.from("processed_videos").upsert(
            {
              video_id: v.videoId,
              channel_id: finalChannelId,
              video_title: "[pre-subscription]",
              video_url: `https://www.youtube.com/watch?v=${v.videoId}`,
              status: "skipped",
            },
            { onConflict: "video_id", ignoreDuplicates: true },
          ),
        ),
      );

      // Remember the latest video so we can queue it after the subscription is saved.
      latestVideo = videos[0];
      logger.info(
        `Pre-marked ${videos.length} videos as skipped for channel ${finalChannelId}`,
      );
    }
  } catch (e) {
    logger.error("Failed to pre-mark channel videos:", e);
  }

  // Add subscription with real YouTube data
  // active = false if free user already has maxActiveChannels active
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      channel_id: finalChannelId,
      channel_name: finalChannelName,
      channel_avatar_url: finalAvatarUrl,
      active: shouldBeActive,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aha moment: deliver the latest video — reuse if already processed, queue if not
  if (latestVideo) {
    try {
      const latestTitle = latestVideo.title ?? latestVideo.videoId;
      const latestUrl = `https://www.youtube.com/watch?v=${latestVideo.videoId}`;

      // Check current status — never downgrade a completed/in-progress video back to "pending"
      const { data: existingLatest } = await supabase
        .from("processed_videos")
        .select("status")
        .eq("video_id", latestVideo.videoId)
        .maybeSingle();

      const existingStatus = existingLatest?.status;

      if (
        existingStatus === "completed" ||
        existingStatus === "pending" ||
        existingStatus === "processing"
      ) {
        // Already processed or in progress — just create the delivery, no reprocessing
        await supabase.from("deliveries").upsert(
          {
            user_id: user.id,
            video_id: latestVideo.videoId,
            status: "pending",
          },
          { onConflict: "user_id,video_id" },
        );
        logger.info(
          `Latest video already ${existingStatus}, delivery created directly: ${latestVideo.videoId}`,
        );
      } else {
        // "skipped" or absent — upgrade to pending and queue
        await supabase.from("processed_videos").upsert(
          {
            video_id: latestVideo.videoId,
            channel_id: finalChannelId,
            video_title: latestTitle,
            video_url: latestUrl,
            status: "pending",
          },
          { onConflict: "video_id" },
        );

        await supabase.from("processing_queue").upsert(
          {
            video_id: latestVideo.videoId,
            youtube_url: latestUrl,
            video_title: latestTitle,
            channel_id: finalChannelId,
            status: "queued",
          },
          { onConflict: "video_id", ignoreDuplicates: true },
        );

        await supabase.from("deliveries").upsert(
          {
            user_id: user.id,
            video_id: latestVideo.videoId,
            status: "pending",
          },
          { onConflict: "user_id,video_id" },
        );

        logger.info(
          `Queued latest video for immediate delivery: ${latestTitle} (${latestVideo.videoId})`,
        );
      }
    } catch (e) {
      logger.error("Failed to deliver latest video:", e);
    }
  }

  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/subscriptions - Toggle active status for a subscription
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id: string; active: boolean };
  const { id, active } = body;

  if (!id || typeof active !== "boolean") {
    return NextResponse.json(
      { error: "id and active are required" },
      { status: 400 },
    );
  }

  // If activating, check the active channel limit
  if (active) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("max_channels, subscription_status, trial_ends_at")
      .eq("id", user.id)
      .single();

    const isPro =
      profile?.subscription_status === "active" ||
      (profile?.trial_ends_at != null &&
        new Date(profile.trial_ends_at) > new Date());
    const maxActiveChannels = profile?.max_channels ?? 3;

    if (!isPro) {
      const { count } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("active", true);

      if ((count ?? 0) >= maxActiveChannels) {
        return NextResponse.json(
          { error: "Active channel limit reached", maxActiveChannels },
          { status: 403 },
        );
      }
    }
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update({ active })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/subscriptions - Remove YouTube channel subscription
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subscriptionId = searchParams.get("id");

  if (!subscriptionId) {
    return NextResponse.json(
      { error: "Subscription ID required" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", subscriptionId)
    .eq("user_id", user.id); // Security: only delete own subscriptions

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
