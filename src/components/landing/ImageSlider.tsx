"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

export function ImageSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setIsPressed(true);
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };

  const onMouseMove = (e: MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 2;
  };

  const stopDragging = () => {
    isDragging.current = false;
    setIsPressed(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDragging);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => {
          setIsHover(false);
          setIsPressed(false);
        }}
        onMouseDown={onMouseDown}
        className="hide-scrollbar mt-12 flex cursor-grab gap-3 overflow-x-auto px-1 active:cursor-grabbing select-none md:mt-16 md:gap-4"
      >
        {images.map((item) => (
          <Image
            key={item.src}
            src={item.src}
            alt={item.alt}
            width={1400}
            height={900}
            className="h-[280px] w-auto max-w-none shrink-0 rounded-lg object-cover md:h-[400px]"
            draggable={false}
          />
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
