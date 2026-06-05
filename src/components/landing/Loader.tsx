"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { installScrambleAudioUnlock, primeScrambleAudio } from "@/lib/scramble-flip-audio";

const words = [
  "Welcome",
  "स्वागत है",
  "Bienvenue",
  "Willkommen",
  "ようこそ",
  "Witamy",
  "స్వాగతం",
];

export function Loader() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [done, setDone] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanup = installScrambleAudioUnlock();
    return cleanup;
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      window.dispatchEvent(new CustomEvent("welcome-loader-done"));
      setDone(true);
      return;
    }

    if (index < words.length - 1) {
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setIndex((prev) => prev + 1);
          setFade(true);
        }, 150);
      }, 280);
      return () => clearInterval(interval);
    }

    const timeout = setTimeout(() => {
      if (!loaderRef.current) return;
      gsap.to(loaderRef.current, {
        scale: 0.5,
        y: -200,
        opacity: 0,
        duration: 1,
        ease: "power3.inOut",
        onComplete: () => {
          void primeScrambleAudio();
          window.dispatchEvent(new CustomEvent("welcome-loader-done"));
          setDone(true);
        },
      });
    }, 900);

    return () => clearTimeout(timeout);
  }, [index]);

  if (done) return null;

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[99999] flex h-screen w-screen items-center justify-center bg-black text-4xl font-bold text-white"
    >
      <span className={`transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
        {words[index]}
      </span>
    </div>
  );
}
