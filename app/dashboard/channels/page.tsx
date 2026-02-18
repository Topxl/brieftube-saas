"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

import type { Tables } from "@/types/supabase";

type Subscription = Tables<"subscriptions">;

export default function ChannelsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maxChannels, setMaxChannels] = useState(5);
  const [plan, setPlan] = useState("free");
  const supabase = createClient();

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("max_channels, subscription_status")
      .eq("id", user.id)
      .single();

    if (profile) {
      setMaxChannels(profile.max_channels ?? 5);
      setPlan(profile.subscription_status ?? "free");
    }

    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setSubs(data);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function addChannel(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: channelUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add channel");
        setError(data.error || "Failed to add channel");
        return;
      }

      setChannelUrl("");
      toast.success("Channel added");
      void loadData();
    } catch {
      toast.error("Something went wrong");
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function removeChannel(id: string) {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to remove channel");
      return;
    }
    setSubs(subs.filter((s) => s.id !== id));
    toast.success("Channel removed");
  }

  const isPro = plan === "active";
  const atLimit = !isPro && subs.length >= maxChannels;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">Channels</h1>
        <p className="text-muted-foreground text-sm">
          {isPro
            ? `${subs.length} channels (unlimited)`
            : `${subs.length} of ${maxChannels} channels`}
        </p>
      </div>

      {/* Add form / Upgrade banner */}
      {atLimit ? (
        <div className="rounded-xl border border-red-500/15 bg-gradient-to-r from-red-500/[0.06] to-orange-500/[0.03] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Want more channels?</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Upgrade to Pro for unlimited channels and priority processing.
              </p>
            </div>
            <Button
              size="sm"
              className="w-full shrink-0 bg-red-600 shadow-[0_0_16px_rgba(239,68,68,0.2)] hover:bg-red-500 sm:w-auto"
              asChild
            >
              <Link href="/dashboard/billing">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={addChannel}
          className="flex gap-2"
          suppressHydrationWarning
        >
          <Input
            type="url"
            name="youtube-channel-url"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            placeholder="youtube.com/@channel or channel ID"
            className="flex-1"
            autoComplete="off"
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore
            suppressHydrationWarning
          />
          <Button
            type="submit"
            disabled={loading}
            className="shrink-0 bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.15)] hover:bg-red-500"
            suppressHydrationWarning
          >
            {loading ? "Adding..." : "Add"}
          </Button>
        </form>
      )}
      {error && <p className="-mt-2 text-xs text-red-400">{error}</p>}

      {/* Channel List */}
      {subs.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
            <svg
              className="text-muted-foreground h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
          </div>
          <p className="mb-0.5 text-sm font-medium">No channels yet</p>
          <p className="text-muted-foreground text-xs">
            Paste a YouTube channel URL above to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.06]">
          <div className="divide-y divide-white/[0.04]">
            {subs.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between px-3 py-2.5 transition-colors hover:bg-white/[0.02] sm:px-4 sm:py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {sub.channel_avatar_url ? (
                    <img
                      src={sub.channel_avatar_url}
                      alt={sub.channel_name}
                      className="h-8 w-8 shrink-0 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-xs font-bold text-red-400">
                      {sub.channel_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {sub.channel_name}
                    </p>
                    <a
                      href={`https://www.youtube.com/channel/${sub.channel_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground text-[11px] transition-colors"
                    >
                      YouTube &rarr;
                    </a>
                  </div>
                </div>
                <button
                  className="text-muted-foreground ml-2 shrink-0 px-2 py-1 text-xs transition-colors hover:text-red-400"
                  onClick={async () => removeChannel(sub.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
