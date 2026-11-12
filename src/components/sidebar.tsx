"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const links = [
  { href: "/campaigns", label: "Campaigns" },
  { href: "/brand", label: "Brand Brain" },
  { href: "/accounts", label: "Accounts" },
  { href: "/trends", label: "Trend references" },
];

export function Sidebar() {
  const path = usePathname();
  // Highlight the tab just clicked while its page loads. Forget it as soon as the
  // URL changes (including Back/Forward), so the real path always wins after that.
  const [pending, setPending] = useState<string | null>(null);
  const [seenPath, setSeenPath] = useState(path);
  if (seenPath !== path) {
    setSeenPath(path);
    setPending(null);
  }
  const current = pending ?? path;
  return (
    <nav className="flex gap-1 md:flex-col" aria-label="Main">
      {links.map((l) => {
        const active = l.href === "/" ? current === "/" || current.startsWith("/campaigns") : current.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={(e) => {
              // Ctrl/Cmd/Shift-click opens a new tab or window; keep this page's highlight.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              if (!active) setPending(l.href);
            }}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "press rounded-md px-3 py-2 text-sm",
              active ? "bg-ink text-inv" : "text-muted hover:bg-panel hover:text-ink",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
