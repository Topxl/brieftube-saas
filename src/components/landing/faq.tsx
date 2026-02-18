"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const faqs = [
  {
    question: "How does it work?",
    answer:
      "BriefTube monitors YouTube RSS feeds for new videos from your subscribed channels. When a new video is detected, our AI generates a detailed summary, converts it to natural-sounding audio, and sends it directly to your Telegram.",
  },
  {
    question: "Is it really only 1\u20AC/month?",
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
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-2xl px-6">
        <ScrollReveal>
          <h2 className="font-display text-center text-2xl font-bold md:text-3xl">
            Frequently asked questions
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-12 space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium"
                >
                  {faq.question}
                  <svg
                    className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-300 ${
                      open === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{
                    gridTemplateRows: open === i ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="text-muted-foreground px-5 pb-4 text-sm">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
