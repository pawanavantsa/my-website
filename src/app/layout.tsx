import type { Metadata } from "next";
import { DM_Sans, Outfit, Syne } from "next/font/google";
import { SiteChrome } from "@/components/SiteChrome";
import { ThemeProvider } from "@/components/ThemeProvider";
import { site } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hero-title",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: `${site.name} | AI-first products & enterprise IT`,
    template: `%s | ${site.name}`,
  },
  description:
    "Xeroura Technologies delivers AI-driven products, enterprise-grade software, and workforce services. Engineering intelligent digital futures from Hyderabad, India.",
  openGraph: {
    title: site.name,
    description: site.tagline,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${dmSans.variable} ${syne.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-clip font-sans">
        <ThemeProvider>
          <main className="relative z-10">{children}</main>
          <SiteChrome />
        </ThemeProvider>
      </body>
    </html>
  );
}
