import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Star, Users, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Tech",
  "Finance",
  "Science",
  "Gaming",
  "Education",
  "News",
  "Entertainment",
  "Health",
  "Sports",
  "Other",
];

type ListRow = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  created_at: string | null;
  created_by: string;
  channel_count: number;
  star_count: number;
  follow_count: number;
};

export default async function ListsDiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Build query with server-side filtering
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);

  // Fetch lists directly from Supabase (server component)
  const query = supabase
    .from("channel_lists")
    .select(
      `
      id, name, description, category, created_at, created_by, is_public,
      list_channels(count),
      list_stars(count),
      list_follows(count)
    `,
    )
    .eq("is_public", true);

  const { data: rawLists } = await query;

  let lists: ListRow[] = (rawLists ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    category: l.category,
    created_at: l.created_at,
    created_by: l.created_by,
    channel_count:
      (l.list_channels as unknown as { count: number }[])[0]?.count ?? 0,
    star_count: (l.list_stars as unknown as { count: number }[])[0]?.count ?? 0,
    follow_count:
      (l.list_follows as unknown as { count: number }[])[0]?.count ?? 0,
  }));

  if (category) {
    lists = lists.filter((l) => l.category === category);
  }

  if (q) {
    const norm = q.toLowerCase();
    lists = lists.filter(
      (l) =>
        l.name.toLowerCase().includes(norm) ||
        (l.description ?? "").toLowerCase().includes(norm),
    );
  }

  lists.sort((a, b) => b.star_count - a.star_count);

  return (
    <div className="bg-background min-h-screen">
      {/* Simple top bar */}
      <div className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-sm font-semibold">
            BriefTube
          </Link>
          {user ? (
            <Button size="sm" asChild>
              <Link href="/lists/create">
                <Plus className="h-3.5 w-3.5" />
                Create list
              </Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Channel Lists</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Curated collections of YouTube channels by the community.
          </p>
        </div>

        {/* Category filter chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/lists"
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              !category
                ? "border-red-500/30 bg-red-500/[0.08] text-red-400"
                : "text-muted-foreground hover:text-foreground border-white/[0.08] hover:border-white/20"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/lists?category=${cat}${q ? `&q=${q}` : ""}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? "border-red-500/30 bg-red-500/[0.08] text-red-400"
                  : "text-muted-foreground hover:text-foreground border-white/[0.08] hover:border-white/20"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Lists */}
        {lists.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
              <Youtube className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-sm font-medium">No lists yet</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {category
                ? `No lists in ${category} yet.`
                : "Be the first to create a curated channel list."}
            </p>
            {user && (
              <Button
                size="sm"
                className="mt-4 bg-red-600 hover:bg-red-500"
                asChild
              >
                <Link href="/lists/create">Create a list</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-sm font-semibold">
                        {list.name}
                      </h2>
                      {list.category && (
                        <span className="text-muted-foreground shrink-0 rounded-full border border-white/[0.06] px-2 py-0.5 text-[10px]">
                          {list.category}
                        </span>
                      )}
                    </div>
                    {list.description && (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {list.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Youtube className="h-3 w-3" />
                    {list.channel_count} channel
                    {list.channel_count !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {list.star_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {list.follow_count} following
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
