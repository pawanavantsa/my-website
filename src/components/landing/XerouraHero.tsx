"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { InteractiveLogoReveal } from "@/components/home/InteractiveLogoReveal";
import {
  HERO_NAME_LINES,
  SCRAMBLE_CHARS,
  SCRAMBLE_TICK_COUNT,
  SCRAMBLE_TICK_MS,
  scrambleLetterStartS,
} from "@/lib/hero-scramble";
import { subscribeWelcomeLoaderDone } from "@/lib/home-session";
import { createHeroAudioGate, playNameRevealFlipAudio } from "@/lib/scramble-flip-audio";

const highlights = [
  "AI copilots & automation",
  "Enterprise cloud platforms",
  "Product engineering pods",
];

function ScrambleLine({ text, className = "" }: { text: string; className?: string }) {
  return (
    <h1
      className={`font-landing overflow-hidden text-[clamp(1.75rem,4.5vw,3.25rem)] font-semibold leading-[0.92] tracking-[-0.03em] ${className}`}
    >
      {text.split("").map((char, ci) => (
        <span key={ci} data-char={char} className="letter inline-block will-change-transform">
          {char === " " ? "\u00A0" : "\u00A0"}
        </span>
      ))}
    </h1>
  );
}

export function XerouraHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScramble, setCanScramble] = useState(false);

  useEffect(() => {
    return subscribeWelcomeLoaderDone(() => setCanScramble(true));
  }, []);

  useEffect(() => {
    if (!canScramble || !containerRef.current) return;

    const root = containerRef.current;
    const letters = root.querySelectorAll<HTMLSpanElement>(".letter");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      letters.forEach((letterEl) => {
        letterEl.textContent = letterEl.getAttribute("data-char") || "";
      });
      gsap.set(root.querySelectorAll(".hero-text"), { opacity: 1, y: 0 });
      return;
    }

    const audioGate = createHeroAudioGate(root);
    void playNameRevealFlipAudio({ isAudible: audioGate.isAudible });

    const tl = gsap.timeline();

    letters.forEach((letterEl, index) => {
      const finalChar = letterEl.getAttribute("data-char") || "";
      tl.to(
        letterEl,
        {
          duration: 0.4,
          onStart: () => {
            let scrambleCount = 0;
            const interval = setInterval(() => {
              letterEl.textContent = SCRAMBLE_CHARS.charAt(
                Math.floor(Math.random() * SCRAMBLE_CHARS.length),
              );
              scrambleCount++;
              if (scrambleCount > SCRAMBLE_TICK_COUNT - 1) {
                clearInterval(interval);
                letterEl.textContent = finalChar;
              }
            }, SCRAMBLE_TICK_MS);
          },
        },
        scrambleLetterStartS(index),
      );
    });

    const heroCopy = root.querySelectorAll<HTMLElement>(".hero-text");
    tl.to(
      heroCopy,
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: "power3.out",
      },
      "+=0.35"
    );

    return () => {
      audioGate.destroy();
    };
  }, [canScramble]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative z-[50] flex h-[100dvh] max-h-[100dvh] items-center overflow-hidden bg-black px-4 pb-20 pt-6 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
        <div className="relative z-10 mx-auto w-full max-w-[min(94vw,600px)] lg:mx-0 lg:max-w-[680px]">
          <InteractiveLogoReveal />
        </div>

        <div className="flex flex-col justify-center gap-4 lg:gap-5">
          <div className="space-y-1">
            <ScrambleLine text={HERO_NAME_LINES[0]} />
            <ScrambleLine text={HERO_NAME_LINES[1]} />
          </div>

          <p className="hero-text max-w-md translate-y-4 text-sm leading-relaxed text-slate-300 opacity-0 sm:text-base">
            Humanising intelligence, powered by AI — we design and ship production-grade software,
            copilots, and delivery teams for enterprise scale.
          </p>

          <ul className="hero-text flex flex-wrap gap-2 translate-y-4 opacity-0">
            {highlights.map((item) => (
              <li
                key={item}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 sm:text-sm"
              >
                {item}
              </li>
            ))}
          </ul>

          <p className="hero-text translate-y-4 text-xs uppercase tracking-[0.2em] text-brand-accent opacity-0">
            Hyderabad · Global delivery
          </p>
        </div>
      </div>
    </section>
  );
}
