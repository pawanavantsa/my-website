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

const AUTO_SCROLL_MS = 3000;

export function ImageSlider() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const autoScrollPaused = useRef(false);
  const isHoverRef = useRef(false);
  const isInView = useRef(true);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const rafRef = useRef<number | null>(null);
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

  const advanceToNext = useCallback(() => {
    const container = scrollRef.current;
    if (!container || isDragging.current || autoScrollPaused.current || !isInView.current) return;

    const { nearest, slides } = getNearestSlide(container);
    if (!nearest) return;

    const currentIndex = Array.from(slides).indexOf(nearest);
    const nextSlide = slides[currentIndex + 1];
    if (!nextSlide) return;

    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    centerScrollOnSlide(container, nextSlide, smooth);
  }, []);

  const onPointerDown = (clientX: number) => {
    const container = scrollRef.current;
    if (!container) return;
    isDragging.current = true;
    autoScrollPaused.current = true;
    setIsPressed(true);
    startX.current = clientX;
    scrollLeftStart.current = container.scrollLeft;
  };

  const onPointerMove = (clientX: number) => {
    const container = scrollRef.current;
    if (!isDragging.current || !container) return;
    container.scrollLeft = scrollLeftStart.current - (clientX - startX.current) * 1.35;
    scheduleVisuals();
  };

  const stopDragging = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsPressed(false);
    snapToNearest();
    if (!isHoverRef.current) autoScrollPaused.current = false;
  }, [snapToNearest]);

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
    container.addEventListener("scroll", scheduleVisuals, { passive: true });
    window.addEventListener("resize", scheduleVisuals);

    return () => {
      container.removeEventListener("scroll", scheduleVisuals);
      window.removeEventListener("resize", scheduleVisuals);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleVisuals, updateVisuals]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      onPointerMove(e.clientX);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchend", stopDragging);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchend", stopDragging);
    };
  }, [stopDragging]);

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
        onMouseDown={(e) => onPointerDown(e.pageX)}
        onTouchStart={(e) => onPointerDown(e.touches[0].pageX)}
        onTouchMove={(e) => {
          if (!isDragging.current) return;
          e.preventDefault();
          onPointerMove(e.touches[0].pageX);
        }}
        className="hide-scrollbar flex h-[280px] cursor-grab items-center gap-4 overflow-x-auto px-[calc(50%-min(42vw,150px))] active:cursor-grabbing select-none touch-pan-y sm:h-[340px] md:h-[400px] md:gap-5 md:px-[calc(50%-150px)]"
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
