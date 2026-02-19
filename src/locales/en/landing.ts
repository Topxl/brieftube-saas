export const landing = {
  nav: {
    howItWorks: "How it works",
    features: "Features",
    pricing: "Pricing",
    faq: "FAQ",
    star: "Star",
    logIn: "Log in",
    startFree: "Start Free",
    openMenu: "Open menu",
    menu: "Menu",
  },
  hero: {
    badge: "Free up to 5 channels — No credit card needed",
    heading: "Stay on top of your YouTube channels",
    headingHighlight: "without watching a single video",
    subtitle:
      "BriefTube monitors your channels, generates an AI audio summary, and sends it directly to your Telegram. Automatically.",
    ctaPrimary: "Get my summaries for free",
    ctaSecondary: "Try without signing up",
    socialProof: "No credit card · Cancel anytime · 7-day Pro trial",
    mockupBotRole: "bot",
    mockupVideo1Channel: "Fireship",
    mockupVideo1Title: "God-Tier Developer Roadmap",
    mockupVideo1Duration: "2:34",
    mockupVideo2Channel: "Huberman Lab",
    mockupVideo2Title: "How to Improve Your Sleep",
    mockupVideo2Duration: "4:12",
  },
  problem: {
    heading: "You subscribe to 50+ channels.",
    headingMuted: "You can't watch them all.",
    items: [
      {
        title: "Too many videos, not enough time",
        description:
          "Your subscriptions pile up. Dozens of new videos every day. You can't watch them all.",
      },
      {
        title: "Can't watch while doing other things",
        description:
          "Commuting, cooking, working out — your eyes are busy but your ears are free.",
      },
      {
        title: "Missing key insights",
        description:
          "Important videos slip through the cracks. You never know what you're missing.",
      },
    ],
  },
  howItWorks: {
    heading: "How it works",
    subtitle: "Three steps. Two minutes. Zero effort after that.",
    stepPrefix: "Step",
    steps: [
      {
        title: "Subscribe to channels",
        description:
          "Add your favorite YouTube channels from the dashboard. Paste URLs or channel IDs.",
      },
      {
        title: "AI summarizes each video",
        description:
          "When a new video drops, our AI watches it and generates a detailed summary in seconds.",
      },
      {
        title: "Listen on Telegram",
        description:
          "Receive natural-sounding audio summaries directly in your Telegram. Listen anywhere.",
      },
    ],
  },
  features: {
    heading: "Everything you need",
    subtitle: "Simple, powerful, and completely automated.",
    items: [
      {
        title: "AI-Powered Summaries",
        description:
          "Detailed summaries that capture the key points, not just the title.",
      },
      {
        title: "Natural Audio",
        description:
          "Neural text-to-speech voices that sound human. Not robotic.",
      },
      {
        title: "Instant Delivery",
        description: "Get summaries within minutes of a video going live.",
      },
      {
        title: "Multi-Language",
        description:
          "French, English, and more. Choose the voice that suits you.",
      },
      {
        title: "Unlimited Channels",
        description: "Follow every channel you care about. No limits on Pro.",
      },
      {
        title: "Listen Anywhere",
        description:
          "Telegram works offline. Download summaries and listen without internet.",
      },
    ],
  },
  demo: {
    label: "Try it now",
    heading: "Paste any YouTube URL",
    subtitle: "No account needed. We generate the summary in seconds.",
    placeholder: "https://youtube.com/watch?v=...",
    submit: "Summarize",
    error: "An error occurred.",
    upsellText: "Want to receive this automatically as audio on Telegram?",
    upsellCta: "Create a free account — 7-day Pro trial",
    hint: "3 free tries · Works on videos with subtitles",
  },
  pricing: {
    heading: "Simple pricing",
    subtitle: "Start free. Upgrade when you need more. Cancel anytime.",
    mostPopular: "Most Popular",
    perMonth: "month",
    plans: {
      free: {
        name: "Free",
        description: "Try it out. No credit card needed.",
        features: [
          "5 YouTube channels",
          "AI audio summaries",
          "Telegram delivery",
          "Standard processing",
        ],
        cta: "Start Free",
      },
      pro: {
        name: "Pro",
        description: "For power users who follow everything.",
        features: [
          "Unlimited channels",
          "Priority processing",
          "Choose your TTS voice",
          "No branding",
          "Early access to new features",
        ],
        cta: "Go Pro",
      },
    },
    selfHostPrefix: "Prefer to self-host?",
    selfHostLink: "Deploy with Docker in 5 minutes",
    selfHostSuffix: "it's open source.",
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "How does it work?",
        answer:
          "BriefTube monitors YouTube RSS feeds for new videos from your subscribed channels. When a new video is detected, our AI generates a detailed summary, converts it to natural-sounding audio, and sends it directly to your Telegram.",
      },
      {
        question: "Is it really only $9/month?",
        answer:
          "Yes! We keep costs extremely low by using efficient AI processing and lightweight infrastructure. No hidden fees, no surprise charges.",
      },
      {
        question: "What languages are supported?",
        answer:
          "We currently support French and English voices, with more languages coming soon. Pro users can choose their preferred voice from our selection.",
      },
      {
        question: "Do I need to create a Telegram bot?",
        answer:
          "No. You simply connect your Telegram account by clicking a link and sending a message to our @brief_tube_bot. It takes 10 seconds.",
      },
      {
        question: "What if I want to cancel?",
        answer:
          "Cancel anytime from your dashboard. No questions asked, no cancellation fees. Your free tier access remains active.",
      },
    ],
  },
  finalCta: {
    heading: "Start receiving audio summaries in 2 minutes",
    subtitle: "Free forever for up to 5 channels. No credit card required.",
    ctaPrimary: "Sign Up Free",
    ctaSecondary: "Self-Host (Open Source)",
    loginText: "Already have an account?",
    loginLink: "Log in",
  },
  footer: {
    privacy: "Privacy",
    terms: "Terms",
    github: "GitHub",
    contribute: "Contribute",
    copyright: (year: number) => `© ${year} BriefTube. All rights reserved.`,
  },
};
