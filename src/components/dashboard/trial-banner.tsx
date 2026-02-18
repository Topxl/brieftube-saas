import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  if (daysLeft <= 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-amber-400">
          {daysLeft === 1
            ? "Dernier jour de ta période Pro"
            : `${daysLeft} jours restants dans ta période Pro`}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Chaînes illimitées, toutes les voix TTS, traitement prioritaire.
        </p>
      </div>
      <Button
        size="sm"
        className="shrink-0 bg-amber-500 text-black hover:bg-amber-400"
        asChild
      >
        <Link href="/dashboard/billing">Passer en Pro</Link>
      </Button>
    </div>
  );
}
