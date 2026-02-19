import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { EditListForm } from "@/components/lists/edit-list-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditListPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: list } = await supabase
    .from("channel_lists")
    .select(
      "id, name, description, category, created_by, list_channels(id, channel_id, channel_name, channel_avatar_url)",
    )
    .eq("id", id)
    .single();

  if (!list) notFound();
  if (list.created_by !== user.id) redirect(`/lists/${id}`);

  const channels = list.list_channels as {
    id: string;
    channel_id: string;
    channel_name: string;
    channel_avatar_url: string | null;
  }[];

  return (
    <EditListForm
      listId={id}
      initialName={list.name}
      initialDescription={list.description ?? ""}
      initialCategory={list.category ?? ""}
      initialChannels={channels}
    />
  );
}
