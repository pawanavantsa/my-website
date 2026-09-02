"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LogoImpactShatter } from "@/components/home/LogoImpactShatter";
import { shatterBody, shatteredColor, shatteredDark } from "@/lib/media";

type RevealState = {
  x: number;
  y: number;
  r: number;
};

type InteractiveLogoRevealProps = {
  className?: string;
  hideProgress?: number;
  /** Undefined skips the drop intro entirely; false holds the mark off-screen until true. */
  introActive?: boolean;
  /** Fires the moment the mark lands, so callers can chain the name reveal. */
  onImpact?: () => void;
};

/** Small soft brush — white = visible in luminance masks (Safari/WebKit). */
function buildBrushMask(x: number, y: number, radiusPx: number) {
  return `radial-gradient(circle ${radiusPx}px at ${x}px ${y}px, #fff 0%, rgba(255,255,255,0.8) 48%, transparent 78%)`;
}

const BRUSH_RADIUS = 175;
const BRUSH_RADIUS_DRAG = 215;

const DROP_DURATION_S = 0.78;
const DROP_IMPACT_MS = DROP_DURATION_S * 1000;
const SHATTER_DURATION_MS = 1100;
const REST_AFTER_MS = DROP_IMPACT_MS + SHATTER_DURATION_MS;

type IntroPhase = "hidden" | "dropping" | "burst" | "rest";

export function InteractiveLogoReveal({
  className = "",
  hideProgress = 0,
  introActive,
  onImpact,
}: InteractiveLogoRevealProps) {
  const reduced = useReducedMotion();
  const anchorRef = useRef<HTMLDivElement>(null);
  const onImpactRef = useRef(onImpact);
  const [brushVisible, setBrushVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reveal, setReveal] = useState<RevealState>({ x: 0, y: 0, r: BRUSH_RADIUS });
  const [phase, setPhase] = useState<IntroPhase>(introActive === undefined ? "rest" : "hidden");

  onImpactRef.current = onImpact;

  useEffect(() => {
    if (introActive === undefined || !introActive) return;

    if (reduced) {
      setPhase("rest");
      onImpactRef.current?.();
      return;
    }

    setPhase("dropping");

    const impactTimer = window.setTimeout(() => {
      setPhase("burst");
      onImpactRef.current?.();
    }, DROP_IMPACT_MS);

    const restTimer = window.setTimeout(() => {
      setPhase("rest");
    }, REST_AFTER_MS);

    return () => {
      window.clearTimeout(impactTimer);
      window.clearTimeout(restTimer);
    };
  }, [introActive, reduced]);

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

  const maskImage = buildBrushMask(reveal.x, reveal.y, reveal.r);

  const clearReveal = () => {
    setBrushVisible(false);
    setDragging(false);
  };

  const activateBrush = (clientX: number, clientY: number, isDragging = false) => {
    setBrushVisible(true);
    updateReveal(clientX, clientY, isDragging);
  };

  const interactive = phase === "rest" && hideProgress <= 0.01;
  const showRestImage = Boolean(reduced) || phase === "rest";
  // Mounted from the start so the shard assets decode well before impact.
  const useCanvas = !reduced && !showRestImage;
  // Sits under the canvas, so a slow decode can never blank the falling mark.
  const showBodyImage = !showRestImage;

  return (
    <motion.div
      className={`group relative w-full select-none ${className}`}
      style={{ opacity: hideProgress > 0.01 ? 0 : 1 }}
      animate={reduced || phase !== "rest" ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 7.2, repeat: reduced || phase !== "rest" ? 0 : Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="relative w-full origin-center"
        initial={false}
        animate={
          phase === "hidden"
            ? { opacity: 0, scaleX: 1.85, scaleY: 1.85, y: "-32%", rotate: -6 }
            : { opacity: 1, scaleX: 1, scaleY: 1, y: "0%", rotate: 0, filter: "blur(0px)" }
        }
        transition={
          phase !== "hidden"
            ? {
                duration: DROP_DURATION_S,
                ease: [0.5, 0, 0.82, 0.42],
              }
            : { duration: 0 }
        }
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(45,212,191,0.12),transparent_62%)] blur-2xl"
          animate={reduced ? undefined : { opacity: brushVisible ? 0.5 : [0.25, 0.4, 0.25] }}
          transition={{ duration: brushVisible ? 0.25 : 5, repeat: brushVisible || reduced ? 0 : Infinity, ease: "easeInOut" }}
        />

        <motion.div
          id="home-hero-logo-anchor"
          ref={anchorRef}
          role="img"
          aria-label="Xeroura infinity mark"
          className={`relative aspect-square w-full touch-none select-none ${
            interactive ? "cursor-crosshair" : "pointer-events-none"
          }`}
          animate={
            phase === "burst"
              ? {
                  scaleX: [1, 1.06, 0.985, 1],
                  scaleY: [1, 0.88, 1.03, 1],
                  y: [0, 10, -4, 0],
                }
              : { scaleX: 1, scaleY: 1, y: 0 }
          }
          transition={
            phase === "burst"
              ? { duration: 0.58, times: [0, 0.18, 0.55, 1], ease: [0.22, 1, 0.36, 1] }
              : { duration: 0 }
          }
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
          {/* Intact mark — the debris is simply not out yet. */}
          {showBodyImage ? (
            <div className="pointer-events-none absolute inset-0">
              <Image
                src={shatterBody}
                alt=""
                fill
                priority
                draggable={false}
                className="object-contain [-webkit-user-drag:none] [user-drag:none]"
                sizes="(max-width: 1024px) 92vw, 720px"
              />
            </div>
          ) : null}

          {/* Impact throws the render's real shards out to their final positions. */}
          {useCanvas ? (
            <LogoImpactShatter active={phase === "burst"} durationMs={SHATTER_DURATION_MS} />
          ) : null}

          {/* Identical to the canvas' last frame, so the handoff is invisible.
              Kept mounted throughout so it is decoded before that handoff. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ opacity: showRestImage ? 1 : 0 }}
          >
            <Image
              src={shatteredDark}
              alt=""
              fill
              priority
              draggable={false}
              className="object-contain [-webkit-user-drag:none] [user-drag:none]"
              sizes="(max-width: 1024px) 92vw, 720px"
            />
          </div>

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: brushVisible && interactive ? 1 : 0,
              visibility: brushVisible && interactive ? "visible" : "hidden",
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
