import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>

      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last updated: February 18, 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p>When you use BriefTube, we collect the following information:</p>
          <ul className="text-muted-foreground ml-6 list-disc space-y-2">
            <li>
              <strong>Google Account Information:</strong> Email address and
              profile information from your Google account
            </li>
            <li>
              <strong>Telegram Information:</strong> Your Telegram chat ID when
              you connect your Telegram account
            </li>
            <li>
              <strong>YouTube Subscriptions:</strong> The YouTube channels you
              subscribe to through our service
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use the
              service, including preferences and settings
            </li>
            <li>
              <strong>Payment Information:</strong> Processed securely through
              Stripe (we do not store credit card details)
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            2. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="text-muted-foreground ml-6 list-disc space-y-2">
            <li>Provide and improve the BriefTube service</li>
            <li>Monitor YouTube channels you subscribe to</li>
            <li>Generate AI-powered summaries of new videos</li>
            <li>Deliver audio summaries to your Telegram</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send important service notifications</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Data Storage</h2>
          <p>Your data is stored securely using:</p>
          <ul className="text-muted-foreground ml-6 list-disc space-y-2">
            <li>
              <strong>Supabase:</strong> User accounts, profiles, and
              subscriptions
            </li>
            <li>
              <strong>Stripe:</strong> Payment and billing information
            </li>
            <li>
              <strong>Telegram:</strong> Delivery of audio summaries
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We share data only with:
          </p>
          <ul className="text-muted-foreground ml-6 list-disc space-y-2">
            <li>
              <strong>Stripe:</strong> For payment processing
            </li>
            <li>
              <strong>Telegram:</strong> For delivering summaries to you
            </li>
            <li>
              <strong>Google:</strong> For authentication purposes only
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="text-muted-foreground ml-6 list-disc space-y-2">
            <li>Access your personal data</li>
            <li>Request data deletion</li>
            <li>Export your data</li>
            <li>Opt-out of the service at any time</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Data Retention</h2>
          <p>
            We retain your data as long as your account is active. If you delete
            your account, we will delete your personal data within 30 days,
            except for data we are required to retain for legal or billing
            purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Security</h2>
          <p>
            We implement industry-standard security measures to protect your
            data, including encryption in transit and at rest, secure
            authentication, and regular security audits.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">8. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management.
            We do not use tracking or advertising cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new policy on this page and
            updating the "Last updated" date.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <p className="text-muted-foreground">Email: support@brieftube.com</p>
        </section>
      </div>
    </div>
  );
}
