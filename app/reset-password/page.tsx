"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase sets the session from the URL hash automatically
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to dashboard after 2 seconds
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
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
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10 text-green-500">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Password updated</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Your password has been changed. Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
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
          <CardTitle>Set new password</CardTitle>
          <p className="text-muted-foreground text-sm">
            Choose a strong password for your account
          </p>
        </CardHeader>
        <CardContent>
          {!sessionReady && (
            <p className="mb-4 text-sm text-yellow-500">
              Loading session... If this takes too long, try clicking the reset
              link in your email again.
            </p>
          )}
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                minLength={8}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:bg-red-500"
              disabled={loading || !sessionReady}
            >
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
