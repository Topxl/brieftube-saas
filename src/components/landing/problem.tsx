"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const painPoints = [
  {
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Too many videos, not enough time",
    description:
      "Your subscriptions pile up. Dozens of new videos every day. You can't watch them all.",
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      </svg>
    ),
    title: "Can't watch while doing other things",
    description:
      "Commuting, cooking, working out — your eyes are busy but your ears are free.",
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
        />
      </svg>
    ),
    title: "Missing key insights",
    description:
      "Important videos slip through the cracks. You never know what you're missing.",
  },
];

export function Problem() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <h2 className="font-display text-center text-2xl font-bold md:text-3xl">
            You subscribe to 50+ channels.
            <br />
            <span className="text-muted-foreground">
              You can&apos;t watch them all.
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {painPoints.map((point) => (
              <Card
                key={point.title}
                className="hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
              >
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-red-500 backdrop-blur-sm">
                    {point.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{point.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {point.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
