"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingStepperProps {
  telegramConnected: boolean;
  channelCount: number;
  deliveryCount: number;
}

const steps = [
  {
    title: "Connect Telegram",
    description: "Receive audio summaries",
    cta: "Connect",
    href: "/dashboard/settings",
  },
  {
    title: "Add a channel",
    description: "Subscribe to YouTube channels",
    cta: "Add channel",
    href: "/dashboard/channels",
  },
  {
    title: "First summary",
    description: "Arrives when a new video drops",
    cta: "View summaries",
    href: "/dashboard/summaries",
  },
];

export function OnboardingStepper({
  telegramConnected,
  channelCount,
  deliveryCount,
}: OnboardingStepperProps) {
  const completed = [telegramConnected, channelCount > 0, deliveryCount > 0];
  const completedCount = completed.filter(Boolean).length;
  const allDone = completedCount === 3;

  if (allDone) return null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground">Setup {completedCount}/3</p>
        <div className="h-1 w-20 sm:w-24 rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {steps.map((step, i) => {
          const done = completed[i];
          return (
            <div
              key={step.title}
              className={`flex-1 rounded-lg border p-3 transition-colors ${
                done
                  ? "border-emerald-500/15 bg-emerald-500/[0.04]"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/[0.06] text-muted-foreground"
                }`}>
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-tight ${done ? "text-emerald-400" : ""}`}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{step.description}</p>
                </div>
                {!done && (
                  <Button size="xs" variant="outline" className="text-[11px] h-6 shrink-0 sm:hidden" asChild>
                    <Link href={step.href}>{step.cta}</Link>
                  </Button>
                )}
              </div>
              {!done && (
                <Button size="xs" variant="outline" className="mt-2 text-[11px] h-6 hidden sm:inline-flex" asChild>
                  <Link href={step.href}>{step.cta}</Link>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
