import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

type YouTubeSubscriptionItem = {
  snippet: {
    resourceId: { channelId: string };
    title: string;
    thumbnails?: {
      default?: { url: string };
      medium?: { url: string };
    };
  };
};

type YouTubeSubscriptionsResponse = {
  nextPageToken?: string;
  items: YouTubeSubscriptionItem[];
};

type ChannelEntry = {
  channelId: string;
  channelName: string;
  avatarUrl: string | null;
};

async function fetchAllSubscriptions(
  accessToken: string,
): Promise<ChannelEntry[]> {
  const channels: ChannelEntry[] = [];
  let pageToken: string | undefined;

  // Pagination is inherently sequential — each page depends on the previous token
  do {
    const params = new URLSearchParams({
      part: "snippet",
      mine: "true",
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });

    // eslint-disable-next-line no-await-in-loop
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/subscriptions?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      // eslint-disable-next-line no-await-in-loop
      logger.error("YouTube API error:", await res.text());
      break;
    }

    // eslint-disable-next-line no-await-in-loop
    const data = (await res.json()) as YouTubeSubscriptionsResponse;

    for (const item of data.items) {
      channels.push({
        channelId: item.snippet.resourceId.channelId,
        channelName: item.snippet.title,
        avatarUrl:
          item.snippet.thumbnails?.medium?.url ??
          item.snippet.thumbnails?.default?.url ??
          null,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return channels;
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    logger.error("YouTube OAuth error:", error);
    return NextResponse.redirect(
      new URL("/onboarding?youtube_error=access_denied", baseUrl),
    );
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("youtube_oauth_state")?.value;
  cookieStore.delete("youtube_oauth_state");

  if (!state || state !== savedState) {
    return NextResponse.redirect(
      new URL("/onboarding?youtube_error=invalid_state", baseUrl),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/onboarding?youtube_error=no_code", baseUrl),
    );
  }

  // Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", baseUrl));
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: `${baseUrl}/api/youtube/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    logger.error("Token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(
      new URL("/dashboard/channels?youtube_error=token_failed", baseUrl),
    );
  }

  const { access_token } = (await tokenRes.json()) as { access_token: string };

  // Fetch user profile for limits + existing subscriptions in parallel
  const [profileRes, existingSubsRes, youtubeChannels] = await Promise.all([
    supabase
      .from("profiles")
      .select("max_channels, subscription_status, trial_ends_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("subscriptions")
      .select("channel_id, active")
      .eq("user_id", user.id),
    fetchAllSubscriptions(access_token),
  ]);

  const profile = profileRes.data;
  const isPro =
    profile?.subscription_status === "active" ||
    (profile?.trial_ends_at != null &&
      new Date(profile.trial_ends_at) > new Date());
  const maxActiveChannels = profile?.max_channels ?? 3;
  const existingActiveCount = (existingSubsRes.data ?? []).filter(
    (s) => s.active,
  ).length;
  // How many active slots are still available
  const slotsAvailable = isPro
    ? Infinity
    : Math.max(0, maxActiveChannels - existingActiveCount);

  logger.info(`Fetched ${youtubeChannels.length} YouTube subscriptions`);

  // Filter out already-subscribed channels (active or inactive)
  const existingChannelIds = new Set(
    (existingSubsRes.data ?? []).map((s) => s.channel_id),
  );

  // Import ALL non-duplicate channels; only mark active for available slots
  const toImport = youtubeChannels
    .filter((c) => !existingChannelIds.has(c.channelId))
    .map((c, index) => ({
      user_id: user.id,
      channel_id: c.channelId,
      channel_name: c.channelName,
      channel_avatar_url: c.avatarUrl,
      active: isPro || index < slotsAvailable,
    }));

  const skipped = youtubeChannels.length - toImport.length;

  const { data: inserted, error: insertError } = await supabase
    .from("subscriptions")
    .insert(toImport)
    .select();

  if (insertError) {
    logger.error("Bulk insert failed:", insertError);
    return NextResponse.redirect(
      new URL("/onboarding?youtube_error=import_failed", baseUrl),
    );
  }

  const imported = inserted.length;
  logger.info(`Import complete: ${imported} imported, ${skipped} skipped`);

  return NextResponse.redirect(
    new URL(
      `/onboarding?youtube_imported=${imported}&youtube_skipped=${skipped}`,
      baseUrl,
    ),
  );
}
