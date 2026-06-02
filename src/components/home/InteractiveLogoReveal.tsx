"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { shatteredColor, shatteredDark } from "@/lib/media";

type RevealState = {
  x: number;
  y: number;
  r: number;
};

type InteractiveLogoRevealProps = {
  className?: string;
  hideProgress?: number;
};

type Shard = {
  x: number;
  y: number;
  ax: number;
  ay: number;
  size: number;
  rot: number;
  dx: number;
  dy: number;
  dur: number;
  delay: number;
  shape: string;
};

const TRIANGLE = "polygon(50% 0%, 100% 100%, 0% 100%)";
const DIAMOND = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
const SLIVER = "polygon(50% 0%, 65% 100%, 35% 90%)";

const SHARDS: Shard[] = [
  { x: -250, y: -120, ax: -260, ay: -70, size: 14, rot: 18, dx: -16, dy: -10, dur: 7.5, delay: 0, shape: TRIANGLE },
  { x: -300, y: 30, ax: -280, ay: 20, size: 9, rot: -32, dx: -18, dy: 8, dur: 8.6, delay: 0.6, shape: DIAMOND },
  { x: -210, y: 150, ax: -210, ay: 95, size: 11, rot: 44, dx: -12, dy: 16, dur: 9.1, delay: 1.1, shape: SLIVER },
  { x: -120, y: -200, ax: -160, ay: -135, size: 8, rot: -12, dx: -8, dy: -16, dur: 7.9, delay: 0.3, shape: DIAMOND },
  { x: -40, y: 210, ax: -95, ay: 130, size: 12, rot: 60, dx: -6, dy: 14, dur: 8.2, delay: 0.9, shape: TRIANGLE },
  { x: 60, y: -210, ax: 95, ay: -130, size: 10, rot: 24, dx: 8, dy: -14, dur: 9.4, delay: 0.2, shape: SLIVER },
  { x: 150, y: 190, ax: 210, ay: 95, size: 13, rot: -40, dx: 14, dy: 12, dur: 7.6, delay: 1.3, shape: TRIANGLE },
  { x: 250, y: -150, ax: 260, ay: -70, size: 9, rot: 36, dx: 16, dy: -10, dur: 8.8, delay: 0.5, shape: DIAMOND },
  { x: 310, y: 10, ax: 280, ay: 20, size: 12, rot: -20, dx: 18, dy: 6, dur: 9.2, delay: 1.0, shape: SLIVER },
  { x: 280, y: 140, ax: 240, ay: 90, size: 8, rot: 52, dx: 14, dy: 12, dur: 7.7, delay: 0.8, shape: DIAMOND },
  { x: -340, y: -40, ax: -300, ay: -25, size: 6, rot: 10, dx: -20, dy: -6, dur: 8.4, delay: 1.4, shape: SLIVER },
  { x: 200, y: -60, ax: 160, ay: -105, size: 7, rot: -50, dx: 12, dy: -8, dur: 8.0, delay: 0.4, shape: DIAMOND },
  { x: -160, y: 60, ax: -130, ay: 98, size: 6, rot: 28, dx: -10, dy: 10, dur: 7.4, delay: 1.2, shape: TRIANGLE },
  { x: 30, y: -120, ax: 0, ay: -45, size: 7, rot: -16, dx: 6, dy: -12, dur: 8.9, delay: 0.7, shape: SLIVER },
  { x: 120, y: 90, ax: 90, ay: 50, size: 9, rot: 40, dx: 10, dy: 10, dur: 7.8, delay: 0.1, shape: DIAMOND },
  { x: -90, y: -90, ax: -70, ay: -40, size: 7, rot: -28, dx: -8, dy: -10, dur: 8.5, delay: 1.5, shape: TRIANGLE },
];

/** Small soft brush — white = visible in luminance masks (Safari/WebKit). */
function buildBrushMask(x: number, y: number, radiusPx: number) {
  return `radial-gradient(circle ${radiusPx}px at ${x}px ${y}px, #fff 0%, rgba(255,255,255,0.75) 42%, transparent 68%)`;
}

const BRUSH_RADIUS = 120;
const BRUSH_RADIUS_DRAG = 150;

export function InteractiveLogoReveal({ className = "", hideProgress = 0 }: InteractiveLogoRevealProps) {
  const reduced = useReducedMotion();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [brushVisible, setBrushVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reveal, setReveal] = useState<RevealState>({ x: 0, y: 0, r: BRUSH_RADIUS });

  const updateReveal = (clientX: number, clientY: number, isDragging = dragging) => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const brushRadius = isDragging ? BRUSH_RADIUS_DRAG : BRUSH_RADIUS;
    setReveal({
      x: clientX - rect.left,
      y: clientY - rect.top,
      r: brushRadius,
    });
  };

  // Never drop the mask to "none" while fading — that flashes the full color layer.
  const maskImage = buildBrushMask(reveal.x, reveal.y, reveal.r);

  const clearReveal = () => {
    setBrushVisible(false);
    setHovering(false);
    setDragging(false);
  };

  const activateBrush = (clientX: number, clientY: number, isDragging = false) => {
    setHovering(true);
    setBrushVisible(true);
    updateReveal(clientX, clientY, isDragging);
  };

  return (
    <motion.div
      className={`group relative w-full select-none ${className}`}
      style={{ opacity: hideProgress > 0.01 ? 0 : 1 }}
      animate={reduced ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 7.2, repeat: reduced ? 0 : Infinity, ease: "easeInOut" }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(45,212,191,0.12),transparent_62%)] blur-2xl"
        animate={reduced ? undefined : { opacity: brushVisible ? 0.5 : [0.25, 0.4, 0.25] }}
        transition={{ duration: brushVisible ? 0.25 : 5, repeat: brushVisible || reduced ? 0 : Infinity, ease: "easeInOut" }}
      />

      <div
        id="home-hero-logo-anchor"
        ref={anchorRef}
        className="relative aspect-square w-full cursor-crosshair touch-none select-none"
        onDragStart={(event) => event.preventDefault()}
        onPointerEnter={(event) => activateBrush(event.clientX, event.clientY)}
        onPointerMove={(event) => updateReveal(event.clientX, event.clientY)}
        onPointerDown={(event) => {
          event.preventDefault();
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          activateBrush(event.clientX, event.clientY, true);
        }}
        onPointerUp={(event) => {
          setDragging(false);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerLeave={clearReveal}
        onPointerCancel={clearReveal}
      >
        <Image
          src={shatteredDark}
          alt="Xeroura infinity mark"
          fill
          priority
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
          className="pointer-events-none object-contain [-webkit-user-drag:none] [user-drag:none]"
          sizes="(max-width: 1024px) 92vw, 720px"
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: brushVisible ? 1 : 0,
            visibility: brushVisible ? "visible" : "hidden",
            transition: brushVisible ? "opacity 0.12s ease-out" : "opacity 0s linear, visibility 0s linear",
            WebkitMaskImage: maskImage,
            maskImage,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskPosition: "0 0",
            maskPosition: "0 0",
            maskMode: "luminance",
          } as React.CSSProperties}
        >
          <Image
            src={shatteredColor}
            alt=""
            fill
            aria-hidden
            priority
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            className="pointer-events-none object-contain saturate-[1.15] contrast-[1.05] [-webkit-user-drag:none] [user-drag:none]"
            sizes="(max-width: 1024px) 92vw, 720px"
          />
        </div>

        <div className="pointer-events-none absolute inset-0">
          {SHARDS.map((s, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                width: s.size,
                height: s.size,
                marginLeft: -s.size / 2,
                marginTop: -s.size / 2,
                clipPath: s.shape,
                background:
                  "linear-gradient(135deg, rgba(226,232,240,0.20), rgba(148,163,184,0.04))",
              }}
              animate={
                reduced
                  ? { x: s.x, y: s.y, rotate: s.rot, opacity: 0.4 }
                  : hovering
                    ? {
                        x: s.ax,
                        y: s.ay,
                        scale: 0.42,
                        opacity: 0.1,
                        rotate: s.rot + 26,
                      }
                    : {
                        x: [s.x, s.x + s.dx, s.x],
                        y: [s.y, s.y + s.dy, s.y],
                        rotate: [s.rot, s.rot + 10, s.rot],
                        scale: 1,
                        opacity: [0.3, 0.65, 0.3],
                      }
              }
              transition={
                hovering
                  ? { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
                  : {
                      duration: s.dur,
                      repeat: reduced ? 0 : Infinity,
                      ease: "easeInOut",
                      delay: s.delay,
                    }
              }
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
