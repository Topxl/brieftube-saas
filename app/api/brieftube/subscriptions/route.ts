import { authRoute } from "@/lib/zod-route";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";
import { logger } from "@/lib/logger";

// GET /api/brieftube/subscriptions - Get user's YouTube subscriptions
export const GET = authRoute.handler(async (_req, { ctx }) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Error fetching subscriptions:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
});

// POST /api/brieftube/subscriptions - Add new YouTube channel subscription
export const POST = authRoute
  .body(
    z.object({
      channelId: z.string(),
      channelName: z.string(),
      channelAvatarUrl: z.string().url().optional(),
    }),
  )
  .handler(async (_req, { body, ctx }) => {
    // First, check user's profile for max_channels limit
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("max_channels")
      .eq("id", ctx.user.id)
      .single();

    if (profileError) {
      return Response.json(
        { error: "Failed to check limits" },
        { status: 500 },
      );
    }

    // Count current subscriptions
    const { count, error: countError } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", ctx.user.id)
      .eq("active", true);

    if (countError) {
      return Response.json(
        { error: "Failed to count subscriptions" },
        { status: 500 },
      );
    }

    const maxChannels = profile.max_channels ?? 5;
    if (count !== null && count >= maxChannels) {
      return Response.json(
        {
          error: `Subscription limit reached (${maxChannels} channels max). Upgrade your plan to add more.`,
        },
        { status: 403 },
      );
    }

    // Check if already subscribed to this channel
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", ctx.user.id)
      .eq("channel_id", body.channelId)
      .single();

    if (existing) {
      return Response.json(
        { error: "Already subscribed to this channel" },
        { status: 409 },
      );
    }

    // Create subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: ctx.user.id,
        channel_id: body.channelId,
        channel_name: body.channelName,
        channel_avatar_url: body.channelAvatarUrl,
        active: true,
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating subscription:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  });

// DELETE /api/brieftube/subscriptions - Remove subscription
export const DELETE = authRoute
  .body(z.object({ id: z.string() }))
  .handler(async (_req, { body, ctx }) => {
    // Verify ownership before deleting
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", body.id)
      .eq("user_id", ctx.user.id); // Security check

    if (error) {
      logger.error("Error deleting subscription:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  });
