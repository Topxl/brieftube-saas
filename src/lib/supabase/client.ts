import { createBrowserClient } from "@supabase/ssr";
import type { Database, Tables } from "@/types/supabase";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return null during build if Supabase is not configured
    if (process.env.CI || process.env.VERCEL_ENV === "preview") {
      return null as unknown as ReturnType<
        typeof createBrowserClient<Database>
      >;
    }
    throw new Error("Missing Supabase environment variables");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Singleton instance for client-side usage
export const supabase = createClient();

// Export types for convenience
export type Profile = Tables<"profiles">;
export type Subscription = Tables<"subscriptions">;
export type ProcessedVideo = Tables<"processed_videos">;
export type Delivery = Tables<"deliveries">;
export type ProcessingQueue = Tables<"processing_queue">;
