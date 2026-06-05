"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { subscribeWelcomeLoaderDone } from "@/lib/home-session";
import { setLenis } from "@/lib/lenis-instance";

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
    try {
      sessionStorage.removeItem("xeroura-home-scroll-y");
    } catch {
      /* ignore */
    }
    document.body.classList.add("home-scroll");
    document.documentElement.classList.add("home-scroll");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => {
        document.body.classList.remove("home-scroll");
        document.documentElement.classList.remove("home-scroll");
      };
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const lenis = new Lenis({
      autoRaf: true,
      duration: isMobile ? 0.75 : 0.9,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      gestureOrientation: "vertical",
    });
    setLenis(lenis);

    const root = document.documentElement;
    root.classList.add("lenis", "lenis-smooth");

    lenis.on("scroll", ScrollTrigger.update);

    const unsubscribe = subscribeWelcomeLoaderDone(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });
    ScrollTrigger.refresh();

    return () => {
      unsubscribe();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ScrollTrigger.clearScrollMemory();
      setLenis(null);
      lenis.destroy();
      root.classList.remove("lenis", "lenis-smooth");
      document.body.classList.remove("home-scroll");
      document.documentElement.classList.remove("home-scroll");
      clearBodyScrollLock();
    };
  }, []);

  return <>{children}</>;
}
