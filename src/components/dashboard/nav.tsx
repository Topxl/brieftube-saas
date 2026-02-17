"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Channels", href: "/dashboard/channels" },
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Billing", href: "/dashboard/billing" },
];

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
        plan === "active"
          ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          : "text-muted-foreground border border-white/[0.08] bg-white/[0.06]"
      }`}
    >
      {plan === "active" ? "Pro" : "Free"}
    </span>
  );
}

export function DashboardNav({ email, plan }: { email: string; plan: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-5">
          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image
                    src="/logo.svg"
                    alt="BriefTube"
                    width={24}
                    height={24}
                  />
                  BriefTube
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-0.5 px-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      pathname === item.href
                        ? "text-foreground bg-white/[0.08] font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 space-y-3 border-t border-white/[0.06] px-4 pt-4">
                <div className="flex items-center gap-2">
                  <PlanBadge plan={plan} />
                  <span className="text-muted-foreground truncate text-xs">
                    {email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full justify-start"
                  onClick={() => {
                    setOpen(false);
                    void handleLogout();
                  }}
                >
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="BriefTube" width={26} height={26} />
            <span className="hidden text-sm font-semibold sm:inline">
              BriefTube
            </span>
          </Link>

          <div className="hidden items-center md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 text-[13px] transition-colors duration-200 ${
                    active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[17px] h-[2px] rounded-full bg-red-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <PlanBadge plan={plan} />
          <span className="text-muted-foreground max-w-[160px] truncate text-xs">
            {email}
          </span>
          <div className="h-4 w-px bg-white/[0.08]" />
          <button
            onClick={() => void handleLogout()}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
