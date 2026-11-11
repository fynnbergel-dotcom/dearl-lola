import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { Ambient } from "@/components/ambient";
import { EasterEgg } from "@/components/easter-egg";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Providers } from "@/components/providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dear Lola · A little something, just for you",
    template: "%s · Dear Lola",
  },
  description:
    "A small, warm corner of the internet where every Lola gets a personal compliment the moment she arrives.",
  applicationName: "Dear Lola",
  openGraph: {
    type: "website",
    siteName: "Dear Lola",
    title: "Dear Lola",
    description: "Take a breath. Something nice is on its way.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dear Lola",
    description: "Take a breath. Something nice is on its way.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0b14" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh antialiased">
        <Providers>
          <a
            href="#main"
            className="bg-primary text-primary-fg sr-only z-[100] rounded-xl px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            Skip to content
          </a>
          <Ambient />
          <Nav />
          <main id="main" className="relative">
            {children}
          </main>
          <Footer />
          <EasterEgg />
        </Providers>
      </body>
    </html>
  );
}
