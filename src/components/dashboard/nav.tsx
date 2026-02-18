"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Tv,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Channels", href: "/dashboard/channels", icon: Tv },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const initial = email.charAt(0).toUpperCase();

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="BriefTube" width={26} height={26} />
              <span className="hidden text-sm font-semibold sm:inline">
                BriefTube
              </span>
            </Link>

            {/* Desktop nav links */}
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

          {/* Desktop right side */}
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

          {/* Mobile account button */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-sm font-semibold transition-colors hover:bg-white/[0.12]">
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs font-medium">{email}</p>
                  <div className="mt-1">
                    <PlanBadge plan={plan} />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void handleLogout()}
                  className="text-red-400 focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/[0.06] bg-black/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden">
        <div className="flex h-16 items-stretch">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                  active ? "text-red-400" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
