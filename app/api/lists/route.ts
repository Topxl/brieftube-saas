import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const createListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.string().optional(),
});

// GET /api/lists — public, list all public lists with counts
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  // Fetch all public lists with counts via aggregation
  const { data: lists, error } = await supabase
    .from("channel_lists")
    .select(
      `
      id,
      name,
      description,
      category,
      is_public,
      created_at,
      created_by,
      list_channels(count),
      list_stars(count),
      list_follows(count)
    `,
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map and filter
  let result = lists.map((l) => ({
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
    result = result.filter((l) => l.category === category);
  }

  if (q) {
    const norm = q.toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(norm) ||
        (l.description ?? "").toLowerCase().includes(norm),
    );
  }

  // Sort by star_count desc
  result.sort((a, b) => b.star_count - a.star_count);

  return NextResponse.json(result);
}

// POST /api/lists — auth required, create a new list
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const parsed = createListSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const { name, description, category } = parsed.data;

  const { data, error } = await supabase
    .from("channel_lists")
    .insert({
      created_by: user.id,
      name,
      description: description ?? null,
      category: category ?? null,
      is_public: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
