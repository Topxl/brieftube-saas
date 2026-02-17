import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        email={user.email || ""}
        plan={profile?.subscription_status || "free"}
      />
      <div className="mx-auto max-w-[1080px] px-4 py-5 md:px-6 md:py-6">
        {children}
      </div>
    </div>
  );
}
