"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

export function AddChannelForm({ onSuccess }: { onSuccess: () => void }) {
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const extractChannelInfo = (url: string) => {
    // Extract channel ID or handle from various YouTube URL formats
    // https://www.youtube.com/@channelhandle
    // https://www.youtube.com/channel/UCxxxxxx
    // https://www.youtube.com/c/channelname

    const handleMatch = url.match(/@([a-zA-Z0-9_-]+)/);
    if (handleMatch) {
      return { channelId: handleMatch[1], channelName: handleMatch[1] };
    }

    const channelMatch = url.match(/channel\/([a-zA-Z0-9_-]+)/);
    if (channelMatch) {
      return { channelId: channelMatch[1], channelName: channelMatch[1] };
    }

    const cMatch = url.match(/\/c\/([a-zA-Z0-9_-]+)/);
    if (cMatch) {
      return { channelId: cMatch[1], channelName: cMatch[1] };
    }

    // If it's just a handle or ID
    return {
      channelId: url.replace(/[@/]/g, ""),
      channelName: url.replace(/[@/]/g, ""),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelUrl.trim()) {
      toast.error("Please enter a channel URL or handle");
      return;
    }

    setLoading(true);

    try {
      const { channelId, channelName } = extractChannelInfo(channelUrl);

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          channelName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to add channel");
        return;
      }

      toast.success("Channel added successfully!");
      setChannelUrl("");
      onSuccess();

      // Refresh the page to show new subscription
      window.location.reload();
    } catch {
      // Error already logged by fetch
      toast.error("Failed to add channel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="channelUrl">YouTube Channel URL or @handle</Label>
        <Input
          id="channelUrl"
          type="text"
          placeholder="https://www.youtube.com/@channelname or @channelname"
          value={channelUrl}
          onChange={(e) => setChannelUrl(e.target.value)}
          disabled={loading}
          className="mt-2"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Channel"
        )}
      </Button>
    </form>
  );
}
