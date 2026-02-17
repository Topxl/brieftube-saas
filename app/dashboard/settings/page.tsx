"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const voices = [
  { value: "fr-FR-DeniseNeural", label: "Denise", lang: "French" },
  { value: "fr-FR-HenriNeural", label: "Henri", lang: "French" },
  { value: "en-US-JennyNeural", label: "Jenny", lang: "English" },
  { value: "en-US-GuyNeural", label: "Guy", lang: "English" },
  { value: "fr-CA-SylvieNeural", label: "Sylvie", lang: "Canadian French" },
  { value: "es-ES-ElviraNeural", label: "Elvira", lang: "Spanish" },
  { value: "de-DE-KatjaNeural", label: "Katja", lang: "German" },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<{
    telegram_connected: boolean | null;
    telegram_connect_token: string | null;
    tts_voice: string | null;
  } | null>(null);
  const [connectToken, setConnectToken] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const loadProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("telegram_connected, telegram_connect_token, tts_voice")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setConnectToken(data.telegram_connect_token || "");
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile();
  }, [loadProfile]);

  const generateToken = async () => {
    const token = crypto.randomUUID().replace(/-/g, "");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ telegram_connect_token: token })
      .eq("id", user.id);

    setConnectToken(token);
    toast.success("Connection link generated");
  };

  const updateVoice = async (voice: string) => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ tts_voice: voice })
      .eq("id", user.id);

    setProfile((p) => (p ? { ...p, tts_voice: voice } : null));
    setSaving(false);
    toast.success("Voice updated");
  };

  if (!profile)
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        Loading...
      </div>
    );

  const telegramLink = connectToken
    ? `https://t.me/brief_tube_bot?start=${connectToken}`
    : null;

  const currentVoice = profile.tts_voice ?? "fr-FR-DeniseNeural";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account</p>
      </div>

      {/* Telegram */}
      <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06]">
        <div className="px-4 py-3">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Telegram
          </p>
        </div>
        <div className="px-4 py-4">
          {profile.telegram_connected ? (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-sm font-medium text-emerald-400">
                Connected
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Link your Telegram to receive audio summaries.
              </p>

              {telegramLink ? (
                <>
                  <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2AABEE] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:brightness-110"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    Open in Telegram
                  </a>
                  <p className="text-muted-foreground text-[11px]">
                    Then send{" "}
                    <code className="rounded bg-white/[0.06] px-1 py-0.5">
                      /start {connectToken}
                    </code>{" "}
                    in the chat.
                  </p>
                </>
              ) : (
                <Button onClick={generateToken} variant="outline" size="sm">
                  Generate connection link
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Voice */}
      <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06]">
        <div className="px-4 py-3">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Voice
          </p>
        </div>
        <div className="space-y-3 px-4 py-4">
          <Label className="text-sm">Audio voice for summaries</Label>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {voices.map((v) => (
              <button
                key={v.value}
                onClick={async () => updateVoice(v.value)}
                disabled={saving}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                  currentVoice === v.value
                    ? "text-foreground border-red-500/25 bg-red-500/[0.06]"
                    : "text-muted-foreground hover:text-foreground border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    currentVoice === v.value
                      ? "bg-red-500/20 text-red-400"
                      : "text-muted-foreground bg-white/[0.06]"
                  }`}
                >
                  {v.label.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] leading-none font-medium">
                    {v.label}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    {v.lang}
                  </p>
                </div>
                {currentVoice === v.value && (
                  <svg
                    className="ml-auto h-3.5 w-3.5 shrink-0 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
