import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/dashboard/profile-content";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isPro =
    profile?.subscription_status === "active" ||
    (profile?.trial_ends_at != null &&
      new Date(profile.trial_ends_at) > new Date());

  const isTrial =
    profile?.trial_ends_at != null &&
    new Date(profile.trial_ends_at) > new Date();

  return (
    <ProfileContent
      email={user.email ?? ""}
      isPro={isPro}
      isTrial={isTrial}
      hasStripeCustomer={!!profile?.stripe_customer_id}
      initialTelegramConnected={profile?.telegram_connected ?? false}
      initialVoice={profile?.tts_voice ?? "fr-FR-DeniseNeural"}
      maxChannels={profile?.max_channels ?? 3}
    />
  );
}
