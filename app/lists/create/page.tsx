"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Tables } from "@/types/supabase";

const CATEGORIES = [
  "Tech",
  "Finance",
  "Science",
  "Gaming",
  "Education",
  "News",
  "Entertainment",
  "Health",
  "Sports",
  "Other",
];

type ChannelEntry = {
  channel_id: string;
  channel_name: string;
  channel_avatar_url: string | null;
};

export default function CreateListPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [channels, setChannels] = useState<ChannelEntry[]>([]);
  const [addingChannel, setAddingChannel] = useState(false);
  const [channelError, setChannelError] = useState("");
  const [importing, setImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const importFromSubscriptions = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/subscriptions");
      const data = (await res.json()) as Tables<"subscriptions">[];
      if (!res.ok) {
        toast.error("Failed to load subscriptions");
        return;
      }
      // Only personal subscriptions (exclude list ghost subs)
      const personal = data.filter(
        (s) => !s.source_type || s.source_type === "youtube_channel",
      );
      if (personal.length === 0) {
        toast.error("No personal subscriptions found");
        return;
      }
      setChannels((prev) => {
        const existing = new Set(prev.map((c) => c.channel_id));
        const toAdd = personal
          .filter((s) => !existing.has(s.channel_id))
          .map((s) => ({
            channel_id: s.channel_id,
            channel_name: s.channel_name,
            channel_avatar_url: s.channel_avatar_url ?? null,
          }));
        return [...prev, ...toAdd];
      });
      toast.success(`${personal.length} subscriptions imported`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setImporting(false);
    }
  };

  const addChannel = async () => {
    if (!channelUrl.trim()) return;
    setAddingChannel(true);
    setChannelError("");
    try {
      // Use the existing subscriptions API to resolve channel info
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: channelUrl }),
      });
      const data = (await res.json()) as {
        channel_id: string;
        channel_name: string;
        channel_avatar_url: string | null;
        error?: string;
        id: string;
      };

      if (res.status === 409) {
        // Already subscribed — channel was resolved, add to our local list
        // We need to fetch the channel info differently
        setChannelError(
          "You're already subscribed to this channel, but we'll add it to your list.",
        );
        // Fall through — channel info still available
      } else if (!res.ok) {
        setChannelError(data.error ?? "Failed to resolve channel");
        return;
      }

      // Check if already in the list
      if (channels.some((c) => c.channel_id === data.channel_id)) {
        setChannelError("Channel already in list");
        return;
      }

      setChannels((prev) => [
        ...prev,
        {
          channel_id: data.channel_id,
          channel_name: data.channel_name,
          channel_avatar_url: data.channel_avatar_url,
        },
      ]);
      setChannelUrl("");
      setChannelError("");
    } catch {
      setChannelError("Something went wrong");
    } finally {
      setAddingChannel(false);
    }
  };

  const removeChannel = (channelId: string) => {
    setChannels((prev) => prev.filter((c) => c.channel_id !== channelId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      // 1. Create the list
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          category: category || undefined,
        }),
      });
      const list = (await res.json()) as { id: string; error?: string };
      if (!res.ok) {
        toast.error(list.error ?? "Failed to create list");
        return;
      }

      // 2. Add channels via list_channels API
      if (channels.length > 0) {
        await fetch(`/api/lists/${list.id}/channels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channels }),
        });
      }

      toast.success("List created!");
      router.push(`/lists/${list.id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Top bar */}
      <div className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-2xl items-center px-4 py-4">
          <Link
            href="/lists"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Lists
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Create a list</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Share a curated collection of YouTube channels with the community.
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          {/* List name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Best AI channels"
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this list about?"
              maxLength={500}
              rows={3}
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Category{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? "" : cat)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    category === cat
                      ? "border-red-500/30 bg-red-500/[0.08] text-red-400"
                      : "text-muted-foreground hover:text-foreground border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Channels</label>
              <button
                type="button"
                onClick={() => void importFromSubscriptions()}
                disabled={importing}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Import my subscriptions
              </button>
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                value={channelUrl}
                onChange={(e) => {
                  setChannelUrl(e.target.value);
                  setChannelError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void addChannel();
                  }
                }}
                placeholder="youtube.com/@channel or channel ID"
                className="flex-1"
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
              />
              <Button
                type="button"
                onClick={() => void addChannel()}
                disabled={addingChannel || !channelUrl.trim()}
                variant="outline"
                className="shrink-0"
              >
                {addingChannel ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {channelError && (
              <p className="text-xs text-red-400">{channelError}</p>
            )}

            {channels.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                <div className="divide-y divide-white/[0.04]">
                  {channels.map((ch) => (
                    <div
                      key={ch.channel_id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      {ch.channel_avatar_url ? (
                        <Image
                          src={ch.channel_avatar_url}
                          alt={ch.channel_name}
                          width={28}
                          height={28}
                          className="h-7 w-7 shrink-0 rounded-full"
                        />
                      ) : (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-xs font-bold text-red-400">
                          {ch.channel_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {ch.channel_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeChannel(ch.channel_id)}
                        className="text-muted-foreground ml-2 shrink-0 transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="bg-red-600 hover:bg-red-500"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create list
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
