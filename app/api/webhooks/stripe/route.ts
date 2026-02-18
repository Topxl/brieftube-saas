import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const maxDuration = 300;

export const POST = async (req: NextRequest) => {
  const headerList = await headers();
  const body = await req.text();

  const stripeSignature = headerList.get("stripe-signature");

  if (!stripeSignature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    logger.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  let event: Stripe.Event | null = null;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      stripeSignature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: unknown) {
    logger.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await checkoutSessionCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
        await customerSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await customerSubscriptionDeleted(event.data.object);
        break;
      default:
        logger.info(`Unhandled event type: ${event.type}`);
        break;
    }
  } catch (error) {
    logger.error(`Error handling webhook event ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed", eventType: event.type },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
  });
};

const checkoutSessionCompleted = async (
  sessionData: Stripe.Checkout.Session,
) => {
  const session = sessionData;

  if (!session.customer || !session.subscription) {
    logger.warn("Missing customer or subscription in checkout session");
    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

  const supabase = await createClient();

  // Find user by Stripe customer ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) {
    logger.error(`User not found for customer ID: ${customerId}`);
    return;
  }

  // Get the subscription from Stripe
  const stripeSubscription =
    await stripe.subscriptions.retrieve(subscriptionId);

  logger.info("Checkout session completed", {
    userId: profile.id,
    email: profile.email,
    subscriptionId,
    status: stripeSubscription.status,
  });

  // Update user profile with subscription info
  await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscriptionId,
      subscription_status: stripeSubscription.status,
    })
    .eq("id", profile.id);

  logger.info(`Subscription activated for user: ${profile.id}`);
};

const customerSubscriptionUpdated = async (
  subscriptionData: Stripe.Subscription,
) => {
  const subscription = subscriptionData;

  logger.info("Processing customer.subscription.updated:", subscription.id);

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const supabase = await createClient();

  // Find user by Stripe customer ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) {
    logger.error(`User not found for customer ID: ${customerId}`);
    return;
  }

  // Update subscription status
  await supabase
    .from("profiles")
    .update({
      subscription_status: subscription.status,
    })
    .eq("id", profile.id);

  logger.info(
    `Subscription updated: ${subscription.id}, status: ${subscription.status}`,
  );
};

const customerSubscriptionDeleted = async (
  subscriptionData: Stripe.Subscription,
) => {
  const subscription = subscriptionData;

  logger.info("Processing customer.subscription.deleted:", subscription.id);

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const supabase = await createClient();

  // Find user by Stripe customer ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) {
    logger.error(`User not found for customer ID: ${customerId}`);
    return;
  }

  // Revert to free plan
  await supabase
    .from("profiles")
    .update({
      subscription_status: "free",
      stripe_subscription_id: null,
    })
    .eq("id", profile.id);

  logger.info(
    `Subscription canceled and reverted to free plan: ${subscription.id}`,
  );
};
