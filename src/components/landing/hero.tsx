import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-32">
      {/* Gradient background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-red-600/15 blur-[150px]"
          style={{ animation: "orb-drift 20s ease-in-out infinite" }}
        />
        <div
          className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/12 blur-[150px]"
          style={{ animation: "orb-drift 25s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-violet-500/10 blur-[150px]"
          style={{ animation: "orb-drift 22s ease-in-out infinite 5s" }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-3 flex flex-col items-center gap-2">
          <a
            href="https://github.com/Topxl/BriefTube"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08]"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Open Source on GitHub
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </a>
          <div className="text-muted-foreground inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-sm backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            Free to start — No credit card required
          </div>
        </div>

        <h1 className="font-display text-4xl leading-tight font-bold tracking-tight md:text-6xl md:leading-[1.1]">
          YouTube Videos,{" "}
          <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
            Summarized as Audio
          </span>
          , Delivered to Your{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Telegram
          </span>
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg md:text-xl">
          Subscribe to your favorite channels. Get AI-powered audio summaries of
          every new video. Listen on your commute, at the gym, while cooking.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="h-12 bg-red-600 px-8 text-base shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all duration-300 hover:bg-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
            asChild
          >
            <Link href="/signup">Start Free</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base"
            asChild
          >
            <a href="#how-it-works">See How It Works</a>
          </Button>
        </div>

        {/* Telegram mockup */}
        <div
          className="mx-auto mt-16 max-w-sm"
          style={{ animation: "float 6s ease-in-out infinite" }}
        >
          <div className="rounded-2xl border border-white/[0.08] border-t-white/[0.15] bg-white/[0.04] p-4 shadow-[0_12px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-[0_0_16px_rgba(239,68,68,0.3)]">
                BT
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">BriefTube</p>
                <p className="text-muted-foreground text-xs">bot</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
                <p className="text-muted-foreground text-xs font-medium">
                  Fireship
                </p>
                <p className="text-sm font-medium">
                  God-Tier Developer Roadmap
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/20 text-red-500">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <div className="h-1 flex-1 rounded-full bg-white/[0.08]">
                    <div className="h-1 w-2/3 rounded-full bg-red-500" />
                  </div>
                  <span className="text-muted-foreground text-xs">2:34</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
                <p className="text-muted-foreground text-xs font-medium">
                  Huberman Lab
                </p>
                <p className="text-sm font-medium">How to Improve Your Sleep</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/20 text-red-500">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <div className="h-1 flex-1 rounded-full bg-white/[0.08]">
                    <div className="h-1 w-1/3 rounded-full bg-red-500" />
                  </div>
                  <span className="text-muted-foreground text-xs">4:12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
