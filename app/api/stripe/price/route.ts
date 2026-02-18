import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export async function GET() {
  const priceId = env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      { error: "Price not configured" },
      { status: 500 },
    );
  }

  const stripe = getStripe();
  const price = await stripe.prices.retrieve(priceId);

  return NextResponse.json({
    amount: (price.unit_amount ?? 0) / 100,
    currency: price.currency,
    interval: price.recurring?.interval ?? "month",
  });
}
