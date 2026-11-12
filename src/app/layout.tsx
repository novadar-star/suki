import type { Metadata } from "next";
import { Gabarito, Onest, Sometype_Mono } from "next/font/google";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

// Same three families and variable names as the landing page, from suki-brand/tokens.css.
const gabarito = Gabarito({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-gabarito" });
const onest = Onest({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-onest" });
const sometype = Sometype_Mono({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-sometype" });

export const metadata: Metadata = {
  title: "Suki",
  description: "Suki ghostwrites. You sign. From brief to signed-off, brand-safe content for every account.",
  // Served from public/ rather than as src/app/icon.png: Next's icon loader breaks
  // when the project path contains an apostrophe, which takes down the whole dev server.
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${gabarito.variable} ${onest.variable} ${sometype.variable}`}>
      <body>
        <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col md:flex-row">
          <aside className="flex shrink-0 flex-col gap-6 border-line p-4 md:sticky md:top-0 md:h-screen md:w-56 md:border-r md:p-6">
            {/* The logo goes to the home (landing) page; the Campaigns nav item goes to the campaigns list. */}
            <Link
              href="/"
              aria-label="Suki home"
              title="Back to Suki home"
              className="press flex items-center gap-2.5 rounded-md font-display text-2xl font-semibold tracking-tight hover:opacity-80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/suki-icon.png" alt="" width={28} height={28} className="size-7" style={{ borderRadius: "var(--r-icon)" }} />
              Suki
            </Link>
            <Sidebar />
          </aside>
          <main className="min-w-0 flex-1 p-4 md:p-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
