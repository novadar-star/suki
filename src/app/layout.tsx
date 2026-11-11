import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suki",
  description: "Turn one campaign into different creative for every account.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col md:flex-row">
          <aside className="flex shrink-0 flex-col gap-6 border-line p-4 md:w-56 md:border-r md:p-6">
            <Link href="/" className="font-display text-2xl font-bold tracking-tight">
              suki
            </Link>
            <Sidebar />
          </aside>
          <main className="min-w-0 flex-1 p-4 md:p-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
