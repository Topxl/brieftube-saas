# BriefTube Platform - Supabase Integration

## Overview

This document describes the integration between BriefTube Platform (Next.js + Better-Auth) and the existing BriefTube Supabase backend.

## Architecture

### Two Authentication Systems (Coexisting)

1. **Better-Auth** - Used for BriefTube Platform
   - Organizations & teams management
   - Role-based permissions
   - Multi-tenant SaaS features
   - Stripe billing integration

2. **Supabase Auth** - Used for BriefTube Worker & Telegram
   - YouTube channel subscriptions
   - Video processing & delivery
   - Telegram bot integration
   - User profiles with TTS preferences

### Data Flow

```
User → Better-Auth Login → Platform UI
                                ↓
                         Supabase API
                                ↓
       [subscriptions, processed_videos, deliveries]
                                ↓
                         Python Worker
                                ↓
                    Telegram Bot Delivery
```

## Database Structure

### Supabase Project

- **Project ID**: `zetpgbrzehchzxodwbps`
- **URL**: `https://zetpgbrzehchzxodwbps.supabase.co`
- **Region**: `us-west-1`

### Tables

#### `profiles`

User settings and preferences

- `id` (uuid, FK to auth.users)
- `email` (text)
- `telegram_chat_id` (text)
- `telegram_connected` (boolean)
- `telegram_connect_token` (text, unique)
- `tts_voice` (text, default: 'fr-FR-DeniseNeural')
- `subscription_status` (text: 'free', 'active', 'cancelled', 'past_due')
- `max_channels` (integer, default: 5)
- `preferred_language` (text, default: 'fr')

#### `subscriptions`

YouTube channel subscriptions (user-scoped)

- `id` (uuid)
- `user_id` (uuid, FK to profiles)
- `channel_id` (text)
- `channel_name` (text)
- `channel_avatar_url` (text, nullable)
- `active` (boolean, default: true)

#### `processed_videos`

All processed videos (shared across users)

- `id` (uuid)
- `video_id` (text, unique)
- `channel_id` (text)
- `video_title` (text)
- `video_url` (text)
- `summary` (text)
- `audio_url` (text)
- `status` (text: 'pending', 'processing', 'completed', 'failed', 'skipped')
- `transcript_cost` (numeric)
- `transcript_source` (text: 'youtube', 'groq', 'manual')
- `source_language` (text)
- `processed_at` (timestamptz)

#### `processing_queue`

Worker queue for video processing

- `id` (uuid)
- `video_id` (text, unique)
- `youtube_url` (text)
- `channel_id` (text)
- `status` (text: 'queued', 'processing', 'completed', 'failed')
- `attempts` (integer)
- `user_language` (text)
- `tts_voice` (text)

#### `deliveries`

Tracks video deliveries to users

- `id` (uuid)
- `user_id` (uuid, FK to profiles)
- `video_id` (text)
- `status` (text: 'pending', 'sent', 'failed')
- `sent_at` (timestamptz)
- `source` (text: 'auto', 'on_demand')

## API Routes

### `/api/brieftube/subscriptions`

- **GET**: List user's YouTube subscriptions
- **POST**: Add new channel subscription (with limit checks)
- **DELETE**: Remove subscription

### `/api/brieftube/videos`

- **GET**: Get processed videos from subscribed channels

### `/api/brieftube/telegram/connect`

- **GET**: Get user's Telegram settings & connection token
- **POST**: Update Telegram settings (chatId, voice, language)

## Components

### UI Components Location

`/src/features/youtube-summary/components/`

- `add-channel-button.tsx` - Dialog trigger for adding channels
- `add-channel-form.tsx` - Form to add YouTube channel
- `channels-list.tsx` - Display & manage subscribed channels
- `video-feed.tsx` - List of processed videos with audio links
- `telegram-connect.tsx` - Telegram connection status & token

### Page Location

`/app/orgs/[orgSlug]/(navigation)/youtube/page.tsx`

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL="https://zetpgbrzehchzxodwbps.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="(optional, for admin operations)"
```

### Supabase Client

Located at `/src/lib/supabase/client.ts`

Exports:

- `supabase` - Configured Supabase client
- Type definitions: `Profile`, `Subscription`, `ProcessedVideo`, `ProcessingQueue`, `Delivery`

## Navigation

Added to organization navigation:

```typescript
{
  href: `${ORGANIZATION_PATH}/youtube`,
  Icon: Video,
  label: "YouTube Summaries",
}
```

## User Flow

### 1. Connect Telegram

1. User navigates to YouTube Summaries page
2. Sees connection token
3. Opens Telegram, finds @BriefTubeBot
4. Sends token to bot
5. Bot verifies token and updates `telegram_connected = true`

### 2. Add YouTube Channel

1. Click "Add Channel" button
2. Enter YouTube channel URL or @handle
3. System extracts channel ID
4. Checks subscription limit (`max_channels` from profile)
5. Creates subscription in Supabase

### 3. Automatic Processing

1. Python worker scans RSS feeds for new videos
2. Worker adds videos to `processing_queue`
3. Worker processes:
   - Extracts transcript (YouTube or Groq)
   - Generates summary (Gemini)
   - Creates audio (Edge TTS)
   - Uploads audio file
4. Worker updates `processed_videos` status to 'completed'
5. Worker creates `deliveries` entries for subscribed users
6. Telegram bot sends audio to users

### 4. View Summaries

1. User sees processed videos in feed
2. Can play audio directly
3. Can view original video on YouTube

## Security Considerations

### Row Level Security (RLS)

All Supabase tables have RLS enabled. Users can only:

- Read their own subscriptions
- Read videos from their subscribed channels
- Update their own profile settings

### API Security

- All API routes use `authRoute` from Better-Auth
- User ID from Better-Auth is used to query Supabase
- No cross-user data leakage

### Token Security

- `telegram_connect_token` is unique per user
- Generated with `nanoid(16)` (16 characters, URL-safe)
- Token is only used once during connection

## Future Enhancements

### Organization-Scoped Subscriptions

Currently subscriptions are user-scoped. Future enhancement:

- Add `organization_id` to subscriptions table
- Share subscriptions across team members
- Organization-level billing & limits

### Better-Auth Profile Sync

Create a bridge between Better-Auth users and Supabase profiles:

- On user signup in Better-Auth → create profile in Supabase
- Sync email updates
- Consider migrating entirely to Better-Auth

### Webhook Integration

Add webhooks to notify Platform of:

- New videos processed
- Delivery status updates
- Worker errors

## Dependencies

### NPM Packages

- `@supabase/supabase-js` - Supabase client
- `nanoid` - Token generation (already installed)

### Python Worker Dependencies

- `psycopg2-binary` - PostgreSQL client
- `python-telegram-bot` - Telegram bot
- `edge-tts` - Text-to-speech
- `groq` - Transcript extraction
- `google-generativeai` - AI summarization
- `feedparser` - RSS parsing

## Monitoring

### Key Metrics to Track

- Subscriptions per user
- Videos processed per day
- Delivery success rate
- Processing queue length
- API response times

### Logs to Monitor

- Supabase API errors (in Next.js logs)
- Python worker logs (worker/logs/)
- Telegram bot delivery failures
- Rate limiting errors

## Troubleshooting

### "Failed to add channel"

- Check Supabase connection
- Verify `max_channels` limit not exceeded
- Check if channel already subscribed

### "Telegram not connecting"

- Verify bot is running
- Check `telegram_connect_token` is generated
- Ensure token matches in bot and database

### "Videos not appearing"

- Check Python worker is running
- Verify subscriptions are active
- Check `processing_queue` status
- Review worker logs for errors

## Contact & Support

For issues related to:

- **Platform UI**: Check BriefTube Platform logs
- **Worker Processing**: Check Python worker logs at `/home/vj/Bureau/BriefTube/worker/`
- **Supabase**: Use Supabase dashboard at https://supabase.com/dashboard/project/zetpgbrzehchzxodwbps

---

**Last Updated**: February 16, 2026
**Integration Version**: 1.0
