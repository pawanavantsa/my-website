import type { Metadata } from "next";
import { HomeLanding } from "@/components/landing/HomeLanding";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  openGraph: {
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <HomeLanding />;
}
