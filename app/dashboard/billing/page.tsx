import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isPro = profile?.subscription_status === "active";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground text-sm">
          Manage your subscription and billing
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>{isPro ? "Pro Plan" : "Free Plan"}</CardTitle>
            <CardDescription>
              {isPro ? "You have full access" : "Limited features"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary size-4" />
                <span className="text-sm">
                  {isPro ? "Unlimited channels" : "5 channels max"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary size-4" />
                <span className="text-sm">AI audio summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary size-4" />
                <span className="text-sm">Telegram delivery</span>
              </div>
              {isPro && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-primary size-4" />
                    <span className="text-sm">Priority processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-primary size-4" />
                    <span className="text-sm">Choose your TTS voice</span>
                  </div>
                </>
              )}
            </div>

            {!isPro && (
              <Button asChild className="w-full">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Billing Info */}
        {profile?.stripe_customer_id && (
          <Card>
            <CardHeader>
              <CardTitle>Billing Portal</CardTitle>
              <CardDescription>
                Manage your payment methods and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/api/stripe/portal" method="POST">
                <Button type="submit" variant="outline" className="w-full">
                  Open Billing Portal
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
