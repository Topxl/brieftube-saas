"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Subtle background orb */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/8 blur-[150px]" />
      </div>

      <div className="mx-auto max-w-2xl px-6 text-center">
        <ScrollReveal>
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Start receiving audio summaries in 2 minutes
          </h2>
          <p className="text-muted-foreground mt-4">
            Free forever for up to 5 channels. No credit card required.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-12 bg-red-600 px-8 text-base shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:bg-red-500"
              asChild
            >
              <Link href="/signup">Sign Up Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base"
              asChild
            >
              <a
                href="https://github.com/Topxl/BriefTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                Self-Host (Open Source)
              </a>
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            Already have an account?{" "}
            <Link href="/login" className="hover:text-foreground underline">
              Log in
            </Link>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
