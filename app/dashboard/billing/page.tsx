"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy billing page - redirects to organization billing
 * @deprecated Use /orgs/[orgSlug]/settings/billing instead
 */
export default function BillingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to organization billing page
    router.push("/orgs/settings/billing");
  }, [router]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Redirecting to billing page...
        </p>
      </div>
    </div>
  );
}
