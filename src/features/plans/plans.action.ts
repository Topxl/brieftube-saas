"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { AUTH_PLANS } from "@/lib/auth/stripe/auth-plans";
import { ActionError } from "@/lib/errors/action-error";
import { logger } from "@/lib/logger";
import { getServerUrl } from "@/lib/server-url";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

export const upgradeOrgAction = orgAction
  .metadata({
    permissions: {
      subscription: ["manage"],
    },
  })
  .inputSchema(
    z.object({
      plan: z.string(),
      annual: z.boolean().default(false),
      successUrl: z.string(),
      cancelUrl: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: { plan, annual, successUrl, cancelUrl },
      ctx: { org },
    }) => {
      try {
        logger.info("Creating upgrade checkout", {
          orgId: org.id,
          plan,
          annual,
          hasCustomerId: !!org.stripeCustomerId,
        });

        // Find the plan
        const authPlan = AUTH_PLANS.find((p) => p.name === plan);
        if (!authPlan) {
          throw new ActionError(`Plan "${plan}" not found`);
        }

        // Get the price ID based on annual or monthly
        const priceId = annual
          ? authPlan.annualDiscountPriceId
          : authPlan.priceId;

        logger.info("Using price ID", {
          plan,
          annual,
          priceId,
          hasPriceId: !!priceId,
        });

        if (!priceId) {
          throw new ActionError(
            `Price ID not configured for ${plan} (${annual ? "annual" : "monthly"})`,
          );
        }

        // Get or create Stripe customer
        const customerId = org.stripeCustomerId;

        if (!customerId) {
          throw new ActionError(
            "No Stripe customer ID found for this organization",
          );
        }

        // Create checkout session
        logger.info("Creating Stripe checkout session", {
          customerId,
          priceId,
        });

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${getServerUrl()}${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${getServerUrl()}${cancelUrl}`,
          metadata: {
            organizationId: org.id,
            plan: plan,
          },
          subscription_data: {
            metadata: {
              organizationId: org.id,
              plan: plan,
            },
            trial_period_days: authPlan.freeTrial?.days,
          },
        });

        logger.info("Checkout session created", {
          sessionId: session.id,
          url: session.url,
        });

        return {
          url: session.url,
        };
      } catch (error) {
        logger.error("Failed to create upgrade checkout", {
          error,
          orgId: org.id,
          plan,
        });
        throw error instanceof ActionError
          ? error
          : new ActionError(
              "Failed to create checkout session. Please try again.",
            );
      }
    },
  );
