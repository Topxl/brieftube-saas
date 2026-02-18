import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="BriefTube" width={26} height={26} />
          <span className="text-sm font-semibold">BriefTube</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
