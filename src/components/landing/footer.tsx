import Link from "next/link";
import { headers } from "next/headers";

export async function Footer() {
  // Force dynamic rendering
  await headers();

  return (
    <footer className="border-t border-white/[0.06] bg-white/[0.02] py-10 backdrop-blur-sm">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-red-600 text-xs font-bold text-white">
            B
          </div>
          <span>BriefTube</span>
        </div>

        <div className="flex gap-6">
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <a
            href="https://github.com/Topxl/BriefTube"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/Topxl/BriefTube/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Contribute
          </a>
        </div>

        <p>&copy; {new Date().getFullYear()} BriefTube. All rights reserved.</p>
      </div>
    </footer>
  );
}
