import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SummariesFeed } from "@/components/dashboard/summaries-feed";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import { SourcesSection } from "@/components/dashboard/sources-section";
import { DeliverySection } from "@/components/dashboard/delivery-section";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Redirect new users to onboarding
  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const { data: sources } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const isPro =
    profile.subscription_status === "active" ||
    (profile.trial_ends_at != null &&
      new Date(profile.trial_ends_at) > new Date());
  const maxChannels = profile.max_channels ?? 3;
  const telegramConnected = profile.telegram_connected ?? false;
  const ttsVoice = profile.tts_voice ?? "fr-FR-DeniseNeural";

  // Trial logic — Server Component, Date.now() is safe here (not a client hook)
  const trialEndsAt = profile.trial_ends_at ?? null;
  const nowMs = Date.now(); // eslint-disable-line react-hooks/purity
  const trialDaysLeft = trialEndsAt
    ? Math.ceil((new Date(trialEndsAt).getTime() - nowMs) / 86400000)
    : 0;

  return (
    <div className="space-y-8">
      {/* Trial banner */}
      {trialDaysLeft > 0 && <TrialBanner daysLeft={trialDaysLeft} />}

      {/* Section 1: Sources */}
      <SourcesSection
        initialSources={sources ?? []}
        maxChannels={maxChannels}
        isPro={isPro}
      />

      {/* Section 2: Recent summaries */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Recent summaries</h2>
        <Suspense fallback={null}>
          <SummariesFeed />
        </Suspense>
      </div>

      {/* Section 3: Delivery */}
      <DeliverySection
        initialTelegramConnected={telegramConnected}
        initialVoice={ttsVoice}
      />
    </div>
  );
}
