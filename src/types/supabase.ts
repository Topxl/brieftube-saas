export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      deliveries: {
        Row: {
          created_at: string | null;
          id: string;
          sent_at: string | null;
          source: string | null;
          status: string | null;
          user_id: string;
          video_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          sent_at?: string | null;
          source?: string | null;
          status?: string | null;
          user_id: string;
          video_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          sent_at?: string | null;
          source?: string | null;
          status?: string | null;
          user_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deliveries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      processed_videos: {
        Row: {
          audio_url: string | null;
          channel_id: string;
          created_at: string | null;
          failure_count: number | null;
          id: string;
          metadata: Json | null;
          processed_at: string | null;
          retry_at: string | null;
          retry_count: number | null;
          source_language: string | null;
          status: string | null;
          summary: string | null;
          summary_length: number | null;
          transcript_cost: number | null;
          transcript_length: number | null;
          transcript_source: string | null;
          transcript_status: string | null;
          video_id: string;
          video_title: string | null;
          video_url: string | null;
        };
        Insert: {
          audio_url?: string | null;
          channel_id: string;
          created_at?: string | null;
          failure_count?: number | null;
          id?: string;
          metadata?: Json | null;
          processed_at?: string | null;
          retry_at?: string | null;
          retry_count?: number | null;
          source_language?: string | null;
          status?: string | null;
          summary?: string | null;
          summary_length?: number | null;
          transcript_cost?: number | null;
          transcript_length?: number | null;
          transcript_source?: string | null;
          transcript_status?: string | null;
          video_id: string;
          video_title?: string | null;
          video_url?: string | null;
        };
        Update: {
          audio_url?: string | null;
          channel_id?: string;
          created_at?: string | null;
          failure_count?: number | null;
          id?: string;
          metadata?: Json | null;
          processed_at?: string | null;
          retry_at?: string | null;
          retry_count?: number | null;
          source_language?: string | null;
          status?: string | null;
          summary?: string | null;
          summary_length?: number | null;
          transcript_cost?: number | null;
          transcript_length?: number | null;
          transcript_source?: string | null;
          transcript_status?: string | null;
          video_id?: string;
          video_title?: string | null;
          video_url?: string | null;
        };
        Relationships: [];
      };
      processing_queue: {
        Row: {
          attempts: number | null;
          channel_id: string;
          channel_name: string | null;
          completed_at: string | null;
          created_at: string | null;
          error_message: string | null;
          id: string;
          max_attempts: number | null;
          priority: number | null;
          started_at: string | null;
          status: string | null;
          tts_voice: string | null;
          user_language: string | null;
          video_id: string;
          video_title: string | null;
          worker_id: string | null;
          youtube_url: string;
        };
        Insert: {
          attempts?: number | null;
          channel_id: string;
          channel_name?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          max_attempts?: number | null;
          priority?: number | null;
          started_at?: string | null;
          status?: string | null;
          tts_voice?: string | null;
          user_language?: string | null;
          video_id: string;
          video_title?: string | null;
          worker_id?: string | null;
          youtube_url: string;
        };
        Update: {
          attempts?: number | null;
          channel_id?: string;
          channel_name?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          max_attempts?: number | null;
          priority?: number | null;
          started_at?: string | null;
          status?: string | null;
          tts_voice?: string | null;
          user_language?: string | null;
          video_id?: string;
          video_title?: string | null;
          worker_id?: string | null;
          youtube_url?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          max_channels: number | null;
          onboarding_completed: boolean | null;
          preferred_language: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          telegram_chat_id: string | null;
          telegram_connect_token: string | null;
          telegram_connected: boolean | null;
          trial_ends_at: string | null;
          tts_voice: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          max_channels?: number | null;
          onboarding_completed?: boolean | null;
          preferred_language?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          telegram_chat_id?: string | null;
          telegram_connect_token?: string | null;
          telegram_connected?: boolean | null;
          trial_ends_at?: string | null;
          tts_voice?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          max_channels?: number | null;
          onboarding_completed?: boolean | null;
          preferred_language?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          telegram_chat_id?: string | null;
          telegram_connect_token?: string | null;
          telegram_connected?: boolean | null;
          trial_ends_at?: string | null;
          tts_voice?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          active: boolean | null;
          channel_avatar_url: string | null;
          channel_id: string;
          channel_name: string;
          created_at: string | null;
          id: string;
          source_type: string | null;
          user_id: string;
        };
        Insert: {
          active?: boolean | null;
          channel_avatar_url?: string | null;
          channel_id: string;
          channel_name: string;
          created_at?: string | null;
          id?: string;
          source_type?: string | null;
          user_id: string;
        };
        Update: {
          active?: boolean | null;
          channel_avatar_url?: string | null;
          channel_id?: string;
          channel_name?: string;
          created_at?: string | null;
          id?: string;
          source_type?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      transcript_cost_analytics: {
        Row: {
          avg_cost: number | null;
          date: string | null;
          groq_count: number | null;
          total_chars: number | null;
          total_cost: number | null;
          total_videos: number | null;
          youtube_count: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
