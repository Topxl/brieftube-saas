"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { logger } from "@/lib/logger";

interface PriceData {
  amount: number;
  currency: string;
  interval: string;
}

export default function BillingPage() {
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [managingLoading, setManagingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const supabase = createClient();

  const loadPlan = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    if (data) setPlan(data.subscription_status ?? "free");
  }, [supabase]);

  const loadPrice = useCallback(async () => {
    try {
      const res = await fetch("/api/stripe/price");
      const data = await res.json();
      if (data.amount) {
        setPriceData(data);
      }
    } catch (err) {
      logger.error("Failed to fetch price:", err);
    }
  }, []);

  useEffect(() => {
    void loadPlan();

    void loadPrice();
  }, [loadPlan, loadPrice]);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      const error = err as Error;
      logger.error("Checkout error:", error);
      setError(error.message || "Failed to start checkout process");
    } finally {
      setLoading(false);
    }
  }

  async function handleManage() {
    setManagingLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to open customer portal");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (err) {
      const error = err as Error;
      logger.error("Portal error:", error);
      setError(error.message || "Failed to open customer portal");
    } finally {
      setManagingLoading(false);
    }
  }

  function formatPrice(data: PriceData) {
    const { formatted, symbol } = formatCurrency(data.amount, data.currency);
    return symbol === "$" ? `${symbol}${formatted}` : `${formatted}${symbol}`;
  }

  const isPro = plan === "active";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Billing</h1>
        <p className="text-muted-foreground text-sm">
          Manage your subscription
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Current plan */}
      <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06]">
        <div className="px-4 py-3">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Current plan
          </p>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{isPro ? "Pro" : "Free"}</span>
            {isPro && (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase">
                Active
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {isPro ? (
              <>
                {priceData
                  ? `${formatPrice(priceData)}/${priceData.interval}`
                  : "Loading..."}{" "}
                &middot; Unlimited channels &middot; Priority processing
              </>
            ) : (
              "5 channels \u00b7 Standard processing"
            )}
          </p>
          {isPro && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleManage}
              disabled={managingLoading}
            >
              {managingLoading ? "Redirecting..." : "Manage subscription"}
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade CTA */}
      {!isPro && (
        <div className="rounded-xl border border-red-500/15 bg-gradient-to-br from-red-500/[0.04] to-orange-500/[0.02] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Upgrade to Pro</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Unlimited channels, priority processing, voice selection.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-bold">
                {priceData ? formatPrice(priceData) : "..."}
              </p>
              {priceData && (
                <p className="text-muted-foreground text-[11px]">
                  /{priceData.interval}
                </p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            className="mt-4 bg-red-600 shadow-[0_0_16px_rgba(239,68,68,0.2)] hover:bg-red-500"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? "Redirecting..." : "Upgrade to Pro"}
          </Button>
        </div>
      )}
    </div>
  );
}
