import { logger } from "@/lib/logger";
import { nanoid } from "nanoid";
import type { MailAdapter } from "./send-email";

/**
 * Console Mail Adapter for Development
 *
 * Instead of sending real emails, logs the email content to console.
 * Use this when RESEND_API_KEY is not configured.
 */

/* eslint-disable no-console */
export const consoleMailAdapter: MailAdapter = {
  send: async (params) => {
    logger.info("📧 [DEV EMAIL] Email would be sent:", {
      to: params.to,
      subject: params.subject,
      from: params.from,
    });

    // Extract verification link or OTP from HTML
    const linkMatch = params.html.match(/href="([^"]+)"/);
    const otpMatch = params.html.match(/\b(\d{6})\b/);

    if (linkMatch) {
      logger.info("🔗 [VERIFICATION LINK]", `\n\n${linkMatch[1]}\n`);
      console.log(`\n${"=".repeat(80)}`);
      console.log("📧 EMAIL VERIFICATION LINK:");
      console.log("=".repeat(80));
      console.log(linkMatch[1]);
      console.log(`${"=".repeat(80)}\n`);
    }

    if (otpMatch) {
      logger.info("🔢 [OTP CODE]", otpMatch[1]);
      console.log(`\n${"=".repeat(80)}`);
      console.log("📧 EMAIL OTP CODE:");
      console.log("=".repeat(80));
      console.log(otpMatch[1]);
      console.log(`${"=".repeat(80)}\n`);
    }

    return {
      error: null,
      data: {
        id: nanoid(),
      },
    };
  },
};
