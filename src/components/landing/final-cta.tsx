"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function FinalCTA() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Subtle background orb */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/8 blur-[150px]" />
      </div>

      <div className="mx-auto max-w-2xl px-6 text-center">
        <ScrollReveal>
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Start receiving audio summaries in 2 minutes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Free forever for up to 5 channels. No credit card required.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" className="h-12 px-8 text-base bg-red-600 hover:bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]" asChild>
            <Link href="/signup">Sign Up Free</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
            <a href="https://github.com/Topxl/BriefTube" target="_blank" rel="noopener noreferrer">
              Self-Host (Open Source)
            </a>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-foreground">
            Log in
          </Link>
        </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
