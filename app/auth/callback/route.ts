import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { SiteConfig } from "@/site-config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Set trial for new users (profile.trial_ends_at is null on first login)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("trial_ends_at")
          .eq("id", user.id)
          .single();

        if (profile?.trial_ends_at === null) {
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + SiteConfig.trialDays);
          await supabase
            .from("profiles")
            .update({ trial_ends_at: trialEnd.toISOString() })
            .eq("id", user.id);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return to login if something went wrong
  return NextResponse.redirect(`${origin}/login`);
}
