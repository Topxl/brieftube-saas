"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayIcon, ExternalLinkIcon } from "lucide-react";
import type { ProcessedVideo } from "@/lib/supabase/client";

export function VideoFeed({ videos }: { videos: ProcessedVideo[] }) {
  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No videos processed yet. Subscribe to channels and new videos will appear here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Summaries</CardTitle>
        <CardDescription>Latest AI-generated summaries from your subscribed channels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium line-clamp-2">{video.video_title}</h3>
                  {video.transcript_source && (
                    <Badge variant="outline" className="text-xs">
                      {video.transcript_source}
                    </Badge>
                  )}
                </div>

                {video.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.summary}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{video.source_language?.toUpperCase()}</span>
                  {video.summary_length && (
                    <span>{video.summary_length} characters</span>
                  )}
                  {video.processed_at && (
                    <span>
                      {new Date(video.processed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                {video.audio_url && (
                  <Button size="sm" variant="default" asChild>
                    <a href={video.audio_url} target="_blank" rel="noopener noreferrer">
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Audio
                    </a>
                  </Button>
                )}
                {video.video_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon className="h-4 w-4 mr-1" />
                      Video
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
