import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListsSection } from "@/components/dashboard/lists-section";

export default async function DashboardListsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, trial_ends_at")
    .eq("id", user.id)
    .single();

  const isPro =
    profile?.subscription_status === "active" ||
    (profile?.trial_ends_at != null &&
      new Date(profile.trial_ends_at) > new Date());

  // Followed lists
  const { data: followedLists } = await supabase
    .from("list_follows")
    .select(
      "list_id, channel_lists(id, name, description, category, created_by)",
    )
    .eq("user_id", user.id);

  // My created lists with channel count
  const { data: myLists } = await supabase
    .from("channel_lists")
    .select("id, name, description, category, list_channels(count)")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  const myListsMapped = (myLists ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    category: l.category,
    channel_count:
      (l.list_channels as unknown as { count: number }[])[0]?.count ?? 0,
  }));

  return (
    <div className="space-y-8">
      {/* Followed lists */}
      <ListsSection
        initialFollowedLists={
          (followedLists ?? []) as Parameters<
            typeof ListsSection
          >[0]["initialFollowedLists"]
        }
        isPro={isPro}
      />

      {/* My created lists */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">My lists</h2>
            <p className="text-muted-foreground text-xs">
              Lists you created and published
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/lists">
                <ExternalLink className="h-3.5 w-3.5" />
                Discover
              </Link>
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-500" asChild>
              <Link href="/lists/create">
                <Plus className="h-3.5 w-3.5" />
                Create
              </Link>
            </Button>
          </div>
        </div>

        {myListsMapped.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-8 text-center">
            <p className="text-sm font-medium">No lists created yet</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Share curated YouTube channel collections with the community.
            </p>
            <Button
              size="sm"
              className="mt-4 bg-red-600 hover:bg-red-500"
              asChild
            >
              <Link href="/lists/create">Create a list</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/[0.06]">
            <div className="divide-y divide-white/[0.04]">
              {myListsMapped.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/lists/${list.id}`}
                      className="hover:text-foreground truncate text-sm font-medium transition-colors"
                    >
                      {list.name}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      {list.channel_count} channel
                      {list.channel_count !== 1 ? "s" : ""}
                      {list.category ? ` · ${list.category}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/lists/${list.id}/edit`}
                    className="text-muted-foreground hover:text-foreground ml-3 flex shrink-0 items-center gap-1 text-xs transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
