import { createBrowserClient } from "@supabase/ssr";
import type { Database, Tables } from "@/types/supabase";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required",
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Export types for convenience
export type Profile = Tables<"profiles">;
export type Subscription = Tables<"subscriptions">;
export type ProcessedVideo = Tables<"processed_videos">;
export type Delivery = Tables<"deliveries">;
export type ProcessingQueue = Tables<"processing_queue">;
