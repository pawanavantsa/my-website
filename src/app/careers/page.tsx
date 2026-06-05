import type { Metadata } from "next";
import { CareersPageContent } from "@/components/careers/CareersPageContent";
import { InnerPageShell } from "@/components/layout/InnerPageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description: `Join ${site.legalName} — explore open roles in AI, engineering, data, marketing, and sales.`,
};

export default function CareersPage() {
  return (
    <InnerPageShell>
      <CareersPageContent />
    </InnerPageShell>
  );
}
