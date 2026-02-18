import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * This is the schema for the environment variables.
 *
 * Please import **this** file and use the `env` variable
 */
export const env = createEnv({
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION || process.env.VERCEL_ENV === "preview",
  server: {
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_AUDIENCE_ID: z.string().optional(),
    RESEND_WEBHOOK_SECRET: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_PRO_PRICE_ID: z.string().optional(),
    STRIPE_ULTRA_PRICE_ID: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    YOUTUBE_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]),
    CI: z.coerce.boolean().optional(),
  },
  /**
   * If you add `client` environment variables, you need to add them to
   * `experimental__runtimeEnv` as well.
   */
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    NEXT_PUBLIC_EMAIL_CONTACT: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_EMAIL_CONTACT: process.env.NEXT_PUBLIC_EMAIL_CONTACT,
  },
});
