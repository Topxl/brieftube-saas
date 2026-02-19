import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Params = { params: Promise<{ id: string; channelId: string }> };

// DELETE /api/lists/[id]/channels/[channelId] — remove a channel from a list (owner only)
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, channelId } = await params;
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

  const { error } = await supabase
    .from("list_channels")
    .delete()
    .eq("list_id", id)
    .eq("channel_id", channelId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
