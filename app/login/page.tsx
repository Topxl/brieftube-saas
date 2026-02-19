"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleLoginButton } from "./_components/google-login-button";
import { t } from "@/locales";

const tl = t.auth.login;

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-red-600/8 blur-[150px]"
          style={{ animation: "orb-drift 20s ease-in-out infinite" }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-[250px] w-[250px] rounded-full bg-blue-500/8 blur-[150px]"
          style={{ animation: "orb-drift 25s ease-in-out infinite reverse" }}
        />
      </div>

      <Card className="w-full max-w-sm shadow-[0_12px_48px_rgba(0,0,0,0.4)]">
        <CardHeader className="text-center">
          <Link
            href="/"
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-sm font-bold text-white shadow-[0_0_24px_rgba(239,68,68,0.3)]"
          >
            B
          </Link>
          <CardTitle>{tl.heading}</CardTitle>
          <p className="text-muted-foreground text-sm">{tl.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleLoginButton />

          <p className="text-muted-foreground text-center text-xs">
            {tl.terms}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
