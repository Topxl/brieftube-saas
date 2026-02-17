import { authRoute } from "@/lib/zod-route";
import { supabase } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

// GET /api/brieftube/videos - Get processed videos from subscribed channels
export const GET = authRoute.handler(async (_req, { ctx }) => {
  // First, get user's subscribed channels
  const { data: subscriptions, error: subError } = await supabase
    .from("subscriptions")
    .select("channel_id")
    .eq("user_id", ctx.user.id)
    .eq("active", true);

  if (subError) {
    logger.error("Error fetching subscriptions:", subError);
    return Response.json({ error: subError.message }, { status: 500 });
  }

  if (subscriptions.length === 0) {
    return Response.json([]);
  }

  const channelIds = subscriptions.map((s) => s.channel_id);

  // Get processed videos from those channels
  const { data: videos, error: videosError } = await supabase
    .from("processed_videos")
    .select("*")
    .in("channel_id", channelIds)
    .eq("status", "completed")
    .order("processed_at", { ascending: false })
    .limit(50);

  if (videosError) {
    logger.error("Error fetching videos:", videosError);
    return Response.json({ error: videosError.message }, { status: 500 });
  }

  return Response.json(videos);
});
