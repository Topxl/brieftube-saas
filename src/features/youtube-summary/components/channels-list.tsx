"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { Subscription } from "@/lib/supabase/client";

export function ChannelsList({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, channelName: string) => {
    if (!confirm(`Are you sure you want to unsubscribe from ${channelName}?`)) {
      return;
    }

    setDeleting(id);

    try {
      const response = await fetch(`/api/subscriptions?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to remove subscription");
        return;
      }

      toast.success("Subscription removed");
      window.location.reload();
    } catch {
      // Error already logged by fetch
      toast.error("Failed to remove subscription");
    } finally {
      setDeleting(null);
    }
  };

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center">
            No channels subscribed yet. Add your first channel to start
            receiving summaries!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Channels ({subscriptions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                {sub.channel_avatar_url && (
                  <img
                    src={sub.channel_avatar_url}
                    alt={sub.channel_name}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{sub.channel_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {sub.channel_id}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => handleDelete(sub.id, sub.channel_name)}
                disabled={deleting === sub.id}
              >
                <TrashIcon className="text-destructive h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
