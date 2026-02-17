import { authRoute } from "@/lib/zod-route";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";
import { customAlphabet } from "nanoid";
import { logger } from "@/lib/logger";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  16,
);

// GET /api/brieftube/telegram/connect - Get user's Telegram settings
export const GET = authRoute.handler(async (_req, { ctx }) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "telegram_chat_id, telegram_connected, telegram_connect_token, tts_voice",
    )
    .eq("id", ctx.user.id)
    .single();

  if (error) {
    logger.error("Error fetching profile:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  // If no token exists, generate one
  if (!profile.telegram_connect_token) {
    const token = nanoid();
    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({ telegram_connect_token: token })
      .eq("id", ctx.user.id)
      .select(
        "telegram_chat_id, telegram_connected, telegram_connect_token, tts_voice",
      )
      .single();

    if (updateError) {
      logger.error("Error updating profile:", updateError);
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json(updated);
  }

  return Response.json(profile);
});

// POST /api/brieftube/telegram/connect - Update Telegram settings
export const POST = authRoute
  .body(
    z.object({
      chatId: z.string().optional(),
      connected: z.boolean().optional(),
      ttsVoice: z.string().optional(),
    }),
  )
  .handler(async (_req, { body, ctx }) => {
    const updateData: {
      telegram_chat_id?: string;
      telegram_connected?: boolean;
      tts_voice?: string;
    } = {};

    if (body.chatId !== undefined) updateData.telegram_chat_id = body.chatId;
    if (body.connected !== undefined)
      updateData.telegram_connected = body.connected;
    if (body.ttsVoice !== undefined) updateData.tts_voice = body.ttsVoice;

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", ctx.user.id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating profile:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  });
