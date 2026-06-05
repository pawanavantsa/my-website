"use client";

import { GsapScrollProvider } from "@/components/landing/GsapScrollProvider";
import { Loader } from "@/components/landing/Loader";
import { XerouraHero } from "@/components/landing/XerouraHero";
import { AboutSection } from "@/components/landing/AboutSection";
import { AchievementsSection } from "@/components/landing/AchievementsSection";
import { WorkSection } from "@/components/landing/WorkSection";
import { DirectorsTalkSection } from "@/components/landing/DirectorsTalkSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function HomeLanding() {
  return (
    <GsapScrollProvider>
      <main className="relative isolate min-h-screen bg-[#eeeeee] text-black">
        <Loader />
        <XerouraHero />
        <AboutSection />
        <AchievementsSection />
        <WorkSection />
        <DirectorsTalkSection />
        <LandingFooter />
      </main>
    </GsapScrollProvider>
  );
}
