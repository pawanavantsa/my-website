"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { unsplash } from "@/lib/media";

const images = [
  { src: unsplash.heroCollaboration, alt: "Team collaboration" },
  { src: unsplash.aiNeural, alt: "AI technology" },
  { src: unsplash.cloudServer, alt: "Cloud infrastructure" },
  { src: unsplash.codingDesk, alt: "Software development" },
  { src: unsplash.dataAbstract, alt: "Data visualization" },
  { src: unsplash.teamMeeting, alt: "Workshop session" },
  { src: unsplash.productDesign, alt: "Product planning" },
] as const;

const COPIES = 3;
const AUTO_SCROLL_MS = 3000;

function getOneSetWidth(container: HTMLDivElement) {
  const slides = container.querySelectorAll<HTMLElement>("[data-slide]");
  if (slides.length < 2) return 0;
  const step = slides[1].offsetLeft - slides[0].offsetLeft;
  return step * images.length;
}

function centerScrollOnSlide(container: HTMLDivElement, slide: HTMLElement, smooth = false) {
  const left = slide.offsetLeft - (container.clientWidth - slide.offsetWidth) / 2;
  container.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
}

function getNearestSlide(container: HTMLDivElement) {
  const containerCenter = container.scrollLeft + container.clientWidth / 2;
  const slides = container.querySelectorAll<HTMLElement>("[data-slide]");
  let nearest: HTMLElement | null = null;
  let minDist = Infinity;

  slides.forEach((slide) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const dist = Math.abs(containerCenter - slideCenter);
    if (dist < minDist) {
      minDist = dist;
      nearest = slide;
    }
  });

  return { nearest, slides };
}

export function ImageSlider() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isTouching = useRef(false);
  const autoScrollPaused = useRef(false);
  const isHoverRef = useRef(false);
  const isInView = useRef(true);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const rafRef = useRef<number | null>(null);
  const scrollEndTimer = useRef<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const extendedImages = useMemo(
    () => Array.from({ length: COPIES }, () => images).flat(),
    [],
  );

  const updateVisuals = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const slides = container.querySelectorAll<HTMLElement>("[data-slide]");

    slides.forEach((slide) => {
      const inner = slide.querySelector<HTMLElement>("[data-slide-inner]");
      if (!inner) return;

      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(containerCenter - slideCenter);
      const maxDist = slide.offsetWidth * 1.65;
      const t = Math.min(dist / maxDist, 1);
      const scale = 1.18 - t * 0.34;
      const opacity = 1 - t * 0.42;

      inner.style.transform = `scale(${scale})`;
      inner.style.opacity = String(opacity);
      inner.style.zIndex = String(Math.round((1 - t) * 20));
    });
  }, []);

  const fixInfiniteLoop = useCallback(() => {
    const container = scrollRef.current;
    if (!container || isDragging.current || isTouching.current) return;

    const oneSet = getOneSetWidth(container);
    if (oneSet <= 0) return;

    const { scrollLeft } = container;
    if (scrollLeft < oneSet * 0.5) {
      container.scrollLeft = scrollLeft + oneSet;
    } else if (scrollLeft > oneSet * 2.5) {
      container.scrollLeft = scrollLeft - oneSet;
    }
  }, []);

  const scheduleVisuals = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateVisuals();
    });
  }, [updateVisuals]);

  const snapToNearest = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { nearest } = getNearestSlide(container);
    if (nearest) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      centerScrollOnSlide(container, nearest, smooth);
    }
  }, []);

  const onScrollSettled = useCallback(() => {
    fixInfiniteLoop();
    updateVisuals();
    if (!isDragging.current && !isTouching.current) {
      snapToNearest();
    }
  }, [fixInfiniteLoop, snapToNearest, updateVisuals]);

  const scheduleScrollSettled = useCallback(() => {
    scheduleVisuals();
    if (scrollEndTimer.current !== null) {
      window.clearTimeout(scrollEndTimer.current);
    }
    scrollEndTimer.current = window.setTimeout(onScrollSettled, 120);
  }, [onScrollSettled, scheduleVisuals]);

  const advanceToNext = useCallback(() => {
    const container = scrollRef.current;
    if (!container || isDragging.current || isTouching.current || autoScrollPaused.current || !isInView.current) {
      return;
    }

    const { nearest, slides } = getNearestSlide(container);
    if (!nearest) return;

    const currentIndex = Array.from(slides).indexOf(nearest);
    const nextSlide = slides[currentIndex + 1];
    if (!nextSlide) return;

    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    centerScrollOnSlide(container, nextSlide, smooth);
  }, []);

  const stopDragging = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsPressed(false);
    scheduleScrollSettled();
    if (!isHoverRef.current) autoScrollPaused.current = false;
  }, [scheduleScrollSettled]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const init = () => {
      const slides = container.querySelectorAll<HTMLElement>("[data-slide]");
      const startSlide = slides[images.length];
      if (startSlide) centerScrollOnSlide(container, startSlide);
      updateVisuals();
    };

    requestAnimationFrame(init);

    const onScroll = () => scheduleScrollSettled();
    const onScrollEnd = () => onScrollSettled();

    container.addEventListener("scroll", onScroll, { passive: true });
    container.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("resize", scheduleVisuals);

    return () => {
      container.removeEventListener("scroll", onScroll);
      container.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("resize", scheduleVisuals);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (scrollEndTimer.current !== null) window.clearTimeout(scrollEndTimer.current);
    };
  }, [onScrollSettled, scheduleScrollSettled, scheduleVisuals, updateVisuals]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      if (!isDragging.current || !scrollRef.current) return;
      scrollRef.current.scrollLeft = scrollLeftStart.current - (e.clientX - startX.current) * 1.35;
      scheduleVisuals();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [scheduleVisuals, stopDragging]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView.current = entry.isIntersecting;
      },
      { threshold: 0.35 },
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(advanceToNext, AUTO_SCROLL_MS);
    return () => window.clearInterval(interval);
  }, [advanceToNext]);

  return (
    <div ref={rootRef} className="relative mt-12 w-full md:mt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#eeeeee] via-[#eeeeee]/80 to-transparent md:w-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#eeeeee] via-[#eeeeee]/80 to-transparent md:w-20"
      />

      <div
        ref={scrollRef}
        onMouseEnter={() => {
          isHoverRef.current = true;
          setIsHover(true);
          autoScrollPaused.current = true;
        }}
        onMouseLeave={() => {
          isHoverRef.current = false;
          setIsHover(false);
          setIsPressed(false);
          if (!isDragging.current) autoScrollPaused.current = false;
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          const container = scrollRef.current;
          if (!container) return;
          isDragging.current = true;
          autoScrollPaused.current = true;
          setIsPressed(true);
          startX.current = e.pageX;
          scrollLeftStart.current = container.scrollLeft;
        }}
        onTouchStart={() => {
          isTouching.current = true;
          autoScrollPaused.current = true;
        }}
        onTouchEnd={() => {
          isTouching.current = false;
          scheduleScrollSettled();
          window.setTimeout(() => {
            if (!isTouching.current && !isDragging.current) {
              autoScrollPaused.current = false;
            }
          }, AUTO_SCROLL_MS);
        }}
        onTouchCancel={() => {
          isTouching.current = false;
          scheduleScrollSettled();
        }}
        className="hide-scrollbar flex h-[280px] cursor-grab items-center gap-4 overflow-x-auto overscroll-x-contain px-[calc(50%-min(42vw,150px))] active:cursor-grabbing select-none [touch-action:pan-x] [-webkit-overflow-scrolling:touch] sm:h-[340px] md:h-[400px] md:gap-5 md:px-[calc(50%-150px)]"
      >
        {extendedImages.map((item, index) => (
          <div
            key={`${index}-${item.src}`}
            data-slide
            className="flex w-[min(42vw,300px)] shrink-0 items-center justify-center"
          >
            <div
              data-slide-inner
              className="relative h-[220px] w-[min(38vw,260px)] origin-center will-change-transform sm:h-[260px] sm:w-[min(40vw,280px)] md:h-[320px] md:w-[300px]"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 42vw, 300px"
                className="rounded-xl object-cover shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>

      {isHover ? (
        <div
          className="pointer-events-none fixed z-[9999] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-xs font-medium text-black shadow-lg"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          {isPressed ? "↔" : "✋"}
        </div>
      ) : null}
    </div>
  );
}
