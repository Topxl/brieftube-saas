"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AddChannelForm } from "./add-channel-form";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export function AddChannelButton({ maxChannels }: { maxChannels: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscribe to YouTube Channel</DialogTitle>
          <DialogDescription>
            Add a YouTube channel to receive AI-generated audio summaries of new videos.
            You can add up to {maxChannels} channels with your current plan.
          </DialogDescription>
        </DialogHeader>
        <AddChannelForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
