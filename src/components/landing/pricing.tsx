"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { formatCurrency } from "@/lib/format";
import { logger } from "@/lib/logger";
import { t } from "@/locales";

const tl = t.landing.pricing;

type PriceData = {
  amount: number;
  currency: string;
  interval: string;
};

const plans = [
  {
    key: "free" as const,
    price: "0",
    isPro: false,
    highlighted: false,
    href: "/login",
  },
  {
    key: "pro" as const,
    price: "9",
    isPro: true,
    highlighted: true,
    href: "/login",
  },
];

export function Pricing() {
  const [proPriceData, setProPriceData] = useState<PriceData | null>(null);

  useEffect(() => {
    fetch("/api/stripe/price")
      .then(async (res) => res.json())
      .then((data: PriceData) => {
        if (data.amount) {
          setProPriceData(data);
        }
      })
      .catch((err) => logger.error("Failed to fetch price:", err));
  }, []);

  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <ScrollReveal>
          <h2 className="font-display text-center text-2xl font-bold md:text-3xl">
            {tl.heading}
          </h2>
          <p className="text-muted-foreground mt-3 text-center">
            {tl.subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {plans.map((plan) => {
              const planData = tl.plans[plan.key];
              const displayPrice =
                plan.isPro && proPriceData
                  ? formatCurrency(proPriceData.amount, proPriceData.currency)
                  : { formatted: plan.price, symbol: "" };

              const interval =
                plan.isPro && proPriceData
                  ? proPriceData.interval
                  : tl.perMonth;

              return (
                <Card
                  key={plan.key}
                  className={`relative transition-all duration-300 hover:-translate-y-1 ${
                    plan.highlighted
                      ? "border-red-500/20 shadow-[0_8px_32px_rgba(239,68,68,0.1)] hover:shadow-[0_12px_48px_rgba(239,68,68,0.15)]"
                      : "hover:border-white/[0.12]"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 text-xs font-medium text-white shadow-[0_0_16px_rgba(239,68,68,0.3)]">
                        {tl.mostPopular}
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{planData.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      {displayPrice.symbol === "$" ? (
                        <>
                          <span className="text-4xl font-bold">
                            {displayPrice.symbol}
                            {displayPrice.formatted}
                          </span>
                          <span className="text-muted-foreground">
                            /{interval}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">
                            {displayPrice.formatted}
                            {displayPrice.symbol}
                          </span>
                          <span className="text-muted-foreground">
                            /{interval}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {planData.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="mb-6 space-y-3">
                      {planData.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <svg
                            className="h-4 w-4 shrink-0 text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:bg-red-500"
                          : ""
                      }`}
                      variant={plan.highlighted ? "destructive" : "outline"}
                      asChild
                    >
                      <Link href={plan.href}>{planData.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollReveal>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          {tl.selfHostPrefix}{" "}
          <a
            href="https://github.com/Topxl/BriefTube#self-hosting"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline"
          >
            {tl.selfHostLink}
          </a>{" "}
          &mdash; {tl.selfHostSuffix}
        </p>
      </div>
    </section>
  );
}
