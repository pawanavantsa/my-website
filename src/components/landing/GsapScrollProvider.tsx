"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  clampHomeScroll,
  getSavedHomeScroll,
  HOME_SCROLL_RESTORE,
  saveHomeScroll,
} from "@/lib/home-session";

gsap.registerPlugin(ScrollTrigger);

function clearBodyScrollLock() {
  const body = document.body;
  const html = document.documentElement;
  body.style.position = "";
  body.style.top = "";
  body.style.width = "";
  body.style.overflow = "";
  html.style.overflow = "";
}

export function GsapScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    clearBodyScrollLock();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const y = clampHomeScroll(getSavedHomeScroll());
      if (y > 0) window.scrollTo(0, y);
      return;
    }

    const lenis = new Lenis({
      lerp: 0.14,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.1,
      autoRaf: false,
    });

    const root = document.documentElement;
    root.classList.add("lenis", "lenis-smooth");

    let saveScheduled = false;
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      if (!saveScheduled) {
        saveScheduled = true;
        requestAnimationFrame(() => {
          saveHomeScroll(lenis.scroll);
          saveScheduled = false;
        });
      }
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    ScrollTrigger.scrollerProxy(root, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value as number, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    const restoreScroll = (rawY?: number) => {
      const y = clampHomeScroll(rawY ?? getSavedHomeScroll());
      if (y <= 0) {
        ScrollTrigger.refresh();
        return;
      }
      lenis.scrollTo(y, { immediate: true });
      ScrollTrigger.refresh();
    };

    const onRestore = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      requestAnimationFrame(() => restoreScroll(detail));
    };

    const onRefresh = () => lenis.resize();
    const onWelcomeDone = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    ScrollTrigger.addEventListener("refresh", onRefresh);
    window.addEventListener(HOME_SCROLL_RESTORE, onRestore);
    window.addEventListener("welcome-loader-done", onWelcomeDone);

    const boot = () => {
      ScrollTrigger.refresh();
      const y = getSavedHomeScroll();
      if (y > 0) {
        requestAnimationFrame(() => restoreScroll(y));
      }
    };
    boot();

    return () => {
      saveHomeScroll(lenis.scroll);
      window.removeEventListener("welcome-loader-done", onWelcomeDone);
      window.removeEventListener(HOME_SCROLL_RESTORE, onRestore);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      cancelAnimationFrame(frame);
      lenis.destroy();
      root.classList.remove("lenis", "lenis-smooth");
      clearBodyScrollLock();
    };
  }, []);

  return <>{children}</>;
}
