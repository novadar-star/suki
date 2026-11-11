"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/brand", label: "Brand Brain" },
  { href: "/accounts", label: "Accounts" },
  { href: "/trends", label: "Trend references" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 md:flex-col" aria-label="Main">
      {links.map((l) => {
        const active = path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "press rounded-md px-3 py-2 text-sm",
              active ? "bg-ink text-white" : "text-muted hover:bg-white hover:text-ink",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
