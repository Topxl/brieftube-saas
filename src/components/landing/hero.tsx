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
          <div className="text-muted-foreground inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-sm backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            Gratuit jusqu'à 2 chaînes — Sans carte bancaire
          </div>
        </div>

        <h1 className="font-display text-4xl leading-tight font-bold tracking-tight md:text-6xl md:leading-[1.1]">
          Reste au courant de tes chaînes YouTube{" "}
          <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
            sans regarder une seule vidéo
          </span>
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg md:text-xl">
          BriefTube surveille tes chaînes, génère un résumé IA en audio, et
          l'envoie directement sur ton Telegram. Automatiquement.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="h-12 bg-red-600 px-8 text-base shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all duration-300 hover:bg-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
            asChild
          >
            <Link href="/signup">Recevoir mes résumés gratuitement</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base"
            asChild
          >
            <a href="#demo">Tester sans créer de compte</a>
          </Button>
        </div>

        {/* Social proof */}
        <p className="text-muted-foreground mt-5 text-sm">
          Sans carte bancaire · Annulation à tout moment · 14 jours Pro offerts
        </p>

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
