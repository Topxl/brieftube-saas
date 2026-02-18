import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingStepper } from "@/components/dashboard/onboarding-stepper";
import { SummariesFeed } from "@/components/dashboard/summaries-feed";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: channelCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: deliveryCount } = await supabase
    .from("deliveries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "sent");

  // For the stepper: any delivery created (even pending) means the system found a new video
  const { count: anySummaryCount } = await supabase
    .from("deliveries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const telegramConnected = profile?.telegram_connected || false;
  const isPro = profile?.subscription_status === "active";

  // Trial logic — Server Component, Date.now() is safe (not a client hook)
  const trialEndsAt = profile?.trial_ends_at ?? null;
  const nowMs = Date.now(); // eslint-disable-line react-hooks/purity
  const trialDaysLeft = trialEndsAt
    ? Math.ceil((new Date(trialEndsAt).getTime() - nowMs) / 86400000)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Overview</h1>
          <p className="text-muted-foreground text-sm">
            {isPro
              ? "Pro plan"
              : trialDaysLeft > 0
                ? `Pro trial · ${trialDaysLeft} day${trialDaysLeft > 1 ? "s" : ""} left`
                : `Free plan \u00b7 ${channelCount || 0}/${profile?.max_channels || 2} channels`}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-red-600 shadow-[0_0_16px_rgba(239,68,68,0.15)] hover:bg-red-500"
          asChild
        >
          <Link href="/dashboard/channels">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Channel
          </Link>
        </Button>
      </div>

      {/* Trial banner */}
      {trialDaysLeft > 0 && <TrialBanner daysLeft={trialDaysLeft} />}

      {/* Onboarding */}
      <OnboardingStepper
        telegramConnected={telegramConnected}
        channelCount={channelCount || 0}
        deliveryCount={anySummaryCount || 0}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Channels */}
        <Card className="gap-0 py-3 sm:py-4">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/10">
              <svg
                className="h-4 w-4 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl leading-none font-bold">
                {channelCount || 0}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {isPro
                  ? "Channels"
                  : `of ${profile?.max_channels || 5} channels`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summaries */}
        <Card className="gap-0 py-3 sm:py-4">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/10">
              <svg
                className="h-4 w-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl leading-none font-bold">
                {deliveryCount || 0}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                Summaries
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Telegram */}
        <Card className="gap-0 py-3 sm:py-4">
          <CardContent className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                telegramConnected
                  ? "border-emerald-500/10 bg-emerald-500/10"
                  : "border-yellow-500/10 bg-yellow-500/10"
              }`}
            >
              <svg
                className={`h-4 w-4 ${telegramConnected ? "text-emerald-400" : "text-yellow-400"}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm leading-none font-semibold ${telegramConnected ? "text-emerald-400" : "text-yellow-400"}`}
              >
                {telegramConnected ? "Connected" : "Not linked"}
              </p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                Telegram
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summaries feed */}
      <div id="summaries">
        <Suspense fallback={null}>
          <SummariesFeed />
        </Suspense>
      </div>
    </div>
  );
}
