"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { ChevronDown, ExternalLink, Play, Pause } from "lucide-react";

interface Delivery {
  id: string;
  user_id: string;
  video_id: string;
  status: string | null;
  source: string | null;
  sent_at: string | null;
  created_at: string | null;
}

interface ProcessedVideo {
  video_id: string;
  video_title: string | null;
  video_url: string | null;
  summary: string | null;
  audio_url: string | null;
  channel_id: string;
  status: string | null;
}

type EnrichedDelivery = Delivery & { video?: ProcessedVideo };

const PAGE_SIZE = 20;
const SPEEDS = [1, 1.5, 2, 3] as const;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SummaryRow({
  delivery,
  resolvedTitle,
}: {
  delivery: EnrichedDelivery;
  resolvedTitle?: string;
}) {
  const video = delivery.video;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const title = video?.video_title || resolvedTitle || null;
  const thumbnailUrl = `https://img.youtube.com/vi/${delivery.video_id}/default.jpg`;

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
    setPlaying(!playing);
  }, [playing]);

  const cycleSpeed = useCallback(() => {
    const audio = audioRef.current;
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (audio) audio.playbackRate = next;
  }, [speed]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    setCurrentTime(audio.currentTime);
    setProgress((audio.currentTime / audio.duration) * 100);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = pct * audio.duration;
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
      {/* Main row: thumbnail + title + controls */}
      <div className="flex items-center gap-3 p-3">
        {/* Thumbnail with play overlay */}
        <button
          onClick={togglePlay}
          className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/30 sm:h-[72px] sm:w-[72px]"
        >
          <img
            src={thumbnailUrl}
            alt={video?.video_title || ""}
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-black/50 backdrop-blur-sm">
              {playing ? (
                <Pause className="h-3 w-3 text-white" fill="white" />
              ) : (
                <Play className="ml-px h-3 w-3 text-white" fill="white" />
              )}
            </div>
          </div>
        </button>

        {/* Title + meta — clickable to toggle summary */}
        <button
          onClick={() => video?.summary && setShowSummary(!showSummary)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="line-clamp-2 text-sm leading-snug font-medium">
            {title || "Untitled video"}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-muted-foreground text-[11px]">
              {delivery.created_at ? formatDate(delivery.created_at) : ""}
            </span>
            {delivery.status && delivery.status !== "sent" && (
              <span
                className={`rounded-full px-1.5 py-px text-[9px] font-medium ${
                  delivery.status === "pending"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {delivery.status}
              </span>
            )}
            {video?.summary && (
              <ChevronDown
                className={`text-muted-foreground h-3 w-3 transition-transform duration-200 ${showSummary ? "rotate-180" : ""}`}
              />
            )}
          </div>
        </button>

        {/* Right-side actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={cycleSpeed}
            className="text-muted-foreground hover:text-foreground rounded-md border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums transition-colors hover:bg-white/[0.1]"
          >
            x{speed}
          </button>
          {video?.video_url && (
            <a
              href={video.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground flex h-6 w-6 items-center justify-center rounded-md transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Audio player bar */}
      {video?.audio_url && (
        <div className="space-y-1 px-3 pb-2.5">
          <audio
            ref={audioRef}
            src={video.audio_url}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />

          {/* Progress bar */}
          <div
            className="group/bar h-1 w-full cursor-pointer rounded-full bg-white/[0.06]"
            onClick={handleSeek}
          >
            <div
              className="relative h-full rounded-full bg-red-500 transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute top-1/2 right-0 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-sm transition-opacity group-hover/bar:opacity-100" />
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[10px] tabular-nums">
              {formatTime(currentTime)}
            </span>
            <span className="text-muted-foreground text-[10px] tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Summary text — revealed on title click */}
      {video?.summary && (
        <div
          className="grid transition-all duration-300 ease-out"
          style={{ gridTemplateRows: showSummary ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="border-t border-white/[0.04] px-3 py-3">
              <p className="text-muted-foreground text-xs leading-relaxed break-words whitespace-pre-line">
                {video.summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SummariesFeed() {
  const [deliveries, setDeliveries] = useState<EnrichedDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const supabase = createClient();

  const loadDeliveries = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: deliveryData } = await supabase
        .from("deliveries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!deliveryData) {
        setLoading(false);
        return;
      }

      setHasMore(deliveryData.length === PAGE_SIZE);

      const videoIds = [...new Set(deliveryData.map((d) => d.video_id))];

      let videoMap: Record<string, ProcessedVideo> = {};
      if (videoIds.length > 0) {
        const { data: videos } = await supabase
          .from("processed_videos")
          .select("*")
          .in("video_id", videoIds);

        if (videos) {
          videoMap = Object.fromEntries(videos.map((v) => [v.video_id, v]));
        }
      }

      const enriched: EnrichedDelivery[] = deliveryData.map((d) => ({
        ...d,
        video: videoMap[d.video_id],
      }));

      setDeliveries((prev) =>
        pageNum === 0 ? enriched : [...prev, ...enriched],
      );
      setPage(pageNum);
      setLoading(false);
    },
    [supabase],
  );

  useEffect(() => {
     
    void loadDeliveries(0);
  }, [loadDeliveries]);

  // Resolve missing titles via noembed API
  useEffect(() => {
    const missing = deliveries.filter(
      (d) => !d.video?.video_title && !titles[d.video_id],
    );
    if (missing.length === 0) return;

    const ids = [...new Set(missing.map((d) => d.video_id))];
    ids.forEach(async (videoId) => {
      try {
        const res = await fetch(
          `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
        );
        const data = await res.json();
        if (data.title) {
          setTitles((prev) => ({ ...prev, [videoId]: data.title }));
        }
      } catch {
        // silently ignore — fallback stays "Untitled video"
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveries]);

  if (!loading && deliveries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-sm font-semibold">
          Recent summaries
        </h2>
      </div>

      <div className="space-y-2.5">
        {deliveries.map((delivery) => (
          <SummaryRow
            key={delivery.id}
            delivery={delivery}
            resolvedTitle={titles[delivery.video_id]}
          />
        ))}
      </div>

      {loading && (
        <p className="text-muted-foreground py-3 text-center text-xs">
          Loading...
        </p>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => loadDeliveries(page + 1)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
