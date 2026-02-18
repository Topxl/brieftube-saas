import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(
        "/login",
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      ),
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Google OAuth not configured" },
      { status: 500 },
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("youtube_oauth_state", state, {
    httpOnly: true,
    maxAge: 600,
    path: "/",
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/youtube/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    access_type: "online",
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
