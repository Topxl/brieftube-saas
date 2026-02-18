import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";
import { getRequiredUser } from "@/lib/auth/auth-user";

export default async function OnboardingPage() {
  const user = await getRequiredUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("tts_voice")
    .eq("id", user.id)
    .single();

  const initialVoice = profile?.tts_voice ?? "fr-FR-DeniseNeural";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <OnboardingWizard initialVoice={initialVoice} />
    </div>
  );
}
