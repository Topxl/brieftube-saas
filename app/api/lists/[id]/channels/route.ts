import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const channelEntrySchema = z.object({
  channel_id: z.string(),
  channel_name: z.string(),
  channel_avatar_url: z.string().nullable().optional(),
});

const bodySchema = z.object({
  channels: z.array(channelEntrySchema).min(1).max(50),
});

// POST /api/lists/[id]/channels — add channels to a list (owner only)
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: list } = await supabase
    .from("channel_lists")
    .select("created_by")
    .eq("id", id)
    .single();

  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  if (list.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const rows = parsed.data.channels.map((c) => ({
    list_id: id,
    channel_id: c.channel_id,
    channel_name: c.channel_name,
    channel_avatar_url: c.channel_avatar_url ?? null,
  }));

  const { error } = await supabase
    .from("list_channels")
    .upsert(rows, { onConflict: "list_id,channel_id", ignoreDuplicates: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
