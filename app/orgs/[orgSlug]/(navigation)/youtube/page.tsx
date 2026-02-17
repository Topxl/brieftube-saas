import {
  Layout,
  LayoutHeader,
  LayoutTitle,
  LayoutContent,
  LayoutActions,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { createClient } from "@/lib/supabase/server";
import type { ProcessedVideo } from "@/lib/supabase/client";
import { AddChannelButton } from "@/features/youtube-summary/components/add-channel-button";
import { ChannelsList } from "@/features/youtube-summary/components/channels-list";
import { VideoFeed } from "@/features/youtube-summary/components/video-feed";
import { TelegramConnect } from "@/features/youtube-summary/components/telegram-connect";

export default async function YouTubeSummariesPage() {
  const user = await getRequiredUser();
  const supabase = await createClient();

  // Fetch subscriptions
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch videos from subscribed channels
  let videos: ProcessedVideo[] = [];
  if (subscriptions && subscriptions.length > 0) {
    const channelIds = subscriptions.map((s) => s.channel_id);
    const { data: videosData } = await supabase
      .from("processed_videos")
      .select("*")
      .in("channel_id", channelIds)
      .eq("status", "completed")
      .order("processed_at", { ascending: false })
      .limit(20);

    videos = (videosData ?? []) as ProcessedVideo[];
  }

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>YouTube Summaries</LayoutTitle>
      </LayoutHeader>
      <LayoutActions>
        <AddChannelButton maxChannels={profile?.max_channels || 5} />
      </LayoutActions>
      <LayoutContent className="space-y-8">
        <TelegramConnect profile={profile} />
        <ChannelsList subscriptions={subscriptions || []} />
        <VideoFeed videos={videos} />
      </LayoutContent>
    </Layout>
  );
}
