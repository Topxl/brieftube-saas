"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { ActionError } from "@/lib/errors/action-error";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getServerUrl } from "@/lib/server-url";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

export const openStripePortalAction = orgAction
  .metadata({
    permissions: {
      subscription: ["manage"],
    },
  })
  .action(async ({ ctx: { org } }) => {
    try {
      const stripeCustomerId = org.stripeCustomerId;

      logger.info("Opening Stripe portal", {
        orgId: org.id,
        hasCustomerId: !!stripeCustomerId,
      });

      if (!stripeCustomerId) {
        throw new ActionError("No stripe customer id found");
      }

      const stripeBilling = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${getServerUrl()}/orgs/${org.slug}/settings/billing`,
      });

      logger.info("Stripe portal created", { url: stripeBilling.url });

      return {
        url: stripeBilling.url,
      };
    } catch (error) {
      logger.error("Failed to create Stripe portal", { error });
      throw error instanceof ActionError
        ? error
        : new ActionError("Failed to create billing portal");
    }
  });

export const cancelOrgSubscriptionAction = orgAction
  .metadata({
    permissions: {
      subscription: ["manage"],
    },
  })
  .schema(
    z.object({
      returnUrl: z.string(),
    }),
  )
  .action(async ({ parsedInput: { returnUrl }, ctx: { org } }) => {
    try {
      const stripeCustomerId = org.stripeCustomerId;

      logger.info("Creating cancel portal", {
        orgId: org.id,
        hasCustomerId: !!stripeCustomerId,
      });

      if (!stripeCustomerId) {
        throw new ActionError("No stripe customer id found");
      }

      // Get the current subscription
      const subscription = await prisma.subscription.findFirst({
        where: { referenceId: org.id },
      });

      if (!subscription?.stripeSubscriptionId) {
        throw new ActionError("No active subscription found");
      }

      // Create billing portal session which allows the user to cancel
      const stripeBilling = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${getServerUrl()}${returnUrl}`,
      });

      logger.info("Cancel portal created", { url: stripeBilling.url });

      return {
        url: stripeBilling.url,
      };
    } catch (error) {
      logger.error("Failed to create cancel portal", { error });
      throw error instanceof ActionError
        ? error
        : new ActionError("Failed to create billing portal");
    }
  });
