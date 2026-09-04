"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";

/**
 * Mobile stand-in for the desktop hover list: product names ride a big dial
 * whose left edge pokes into the screen, and whatever swings onto the pointer
 * axis becomes the active product — the touch equivalent of hovering a name.
 *
 * Names are placed by translate only (never `rotate`), for two reasons: long
 * words rotated around a bezel are unreadable at this size, and the shared
 * title morph into the open view projects cleanly out of translate/scale but
 * not out of rotated ancestors.
 */

const RAD = Math.PI / 180;
/** Radius as a fraction of the dial column's width. */
const RADIUS_RATIO = 0.95;
/** Only the axis name and its immediate neighbours take taps. */
const TAPPABLE_NEIGHBOURS = 1;
/** Release inertia, in ms of projected travel. */
const FLICK_MS = 140;
/** A flick can never throw the dial more than this many steps. */
const MAX_FLICK_STEPS = 3;
/** Pointer slop below which a gesture counts as a tap, not a drag. */
const TAP_SLOP_PX = 8;
/** Velocity older than this is discarded — the finger had already stopped. */
const STALE_VELOCITY_MS = 90;

const SPRING = {
  type: "spring",
  stiffness: 190,
  damping: 21,
  mass: 0.9,
  restDelta: 0.02,
} as const;

/** Fold an angle into (-180, 180] so "nearest" and shortest-path both work. */
function normalizeDeg(deg: number) {
  return ((((deg + 180) % 360) + 360) % 360) - 180;
}

function wrapIndex(index: number, count: number) {
  return ((index % count) + count) % count;
}

/** Ring distance between two slots, so slot 0 and slot n-1 read as adjacent. */
function ringDistance(a: number, b: number, count: number) {
  const raw = Math.abs(a - b);
  return Math.min(raw, count - raw);
}

type ProductDialProps = {
  products: Product[];
  /** Name currently on the pointer axis. */
  activeIndex: number;
  /** Fires as the dial passes each name — mirrors desktop hover. */
  onActiveChange: (index: number) => void;
  /** Tapping the name already on the axis opens it. */
  onSelect: (index: number) => void;
  /** Set while the open view owns the shared title. */
  titleLayoutId?: string;
  bridgeIndex?: number;
  titleTransition?: object;
  hotClassName: string;
  idleClassName: string;
  disabled?: boolean;
  className?: string;
};

export function ProductDial({
  products,
  activeIndex,
  onActiveChange,
  onSelect,
  titleLayoutId,
  bridgeIndex,
  titleTransition,
  hotClassName,
  idleClassName,
  disabled = false,
  className = "",
}: ProductDialProps) {
  const reduced = useReducedMotion();
  const count = products.length;
  const step = 360 / count;

  const rootRef = useRef<HTMLDivElement>(null);
  const rotation = useMotionValue(-activeIndex * step);
  const radius = useMotionValue(200);

  const [nearest, setNearest] = useState(activeIndex);
  const nearestRef = useRef(activeIndex);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const runningRef = useRef<{ stop: () => void } | null>(null);
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  // Radius tracks the column width so the dial scales with the viewport.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      radius.set(Math.max(150, root.clientWidth * RADIUS_RATIO));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [radius]);

  // One subscription covers drag, snap and programmatic travel.
  useEffect(() => {
    const read = (value: number) => {
      const next = wrapIndex(Math.round(-value / step), count);
      if (next === nearestRef.current) return;
      nearestRef.current = next;
      setNearest(next);
      onActiveChangeRef.current(next);
    };
    read(rotation.get());
    return rotation.on("change", read);
  }, [count, rotation, step]);

  const settle = (target: number) => {
    runningRef.current?.stop();
    if (reduced) {
      rotation.set(target);
      return;
    }
    runningRef.current = animate(rotation, target, SPRING);
  };

  /** Shortest path to put `index` on the axis. */
  const rotateTo = (index: number) => {
    const current = rotation.get();
    settle(current + normalizeDeg(-index * step - current));
  };

  useEffect(() => {
    if (draggingRef.current) return;
    if (activeIndex === nearestRef.current) return;
    rotateTo(activeIndex);
    // rotateTo reads live refs; re-running on activeIndex alone is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, step]);

  useEffect(() => () => runningRef.current?.stop(), []);

  const gesture = useRef({ y: 0, rotation: 0, lastY: 0, lastT: 0, velocity: 0 });

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    runningRef.current?.stop();
    draggingRef.current = true;
    movedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      y: event.clientY,
      rotation: rotation.get(),
      lastY: event.clientY,
      lastT: event.timeStamp,
      velocity: 0,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const g = gesture.current;
    const dy = event.clientY - g.y;
    if (Math.abs(dy) > TAP_SLOP_PX) movedRef.current = true;

    // Drag maps 1:1 onto arc length, so the dial tracks the finger exactly.
    const r = radius.get();
    rotation.set(g.rotation + (dy / r) / RAD);

    const dt = event.timeStamp - g.lastT;
    if (dt > 0) {
      g.velocity = (event.clientY - g.lastY) / dt;
      g.lastY = event.clientY;
      g.lastT = event.timeStamp;
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const current = rotation.get();
    if (!movedRef.current) {
      settle(Math.round(current / step) * step);
      return;
    }

    // A finger that stopped before lifting shouldn't throw the dial, so a
    // stale reading counts as zero velocity.
    const g = gesture.current;
    const idle = event.timeStamp - g.lastT > STALE_VELOCITY_MS;
    const velocity = idle ? 0 : g.velocity;

    const r = radius.get();
    const flickDeg = ((velocity / r) / RAD) * FLICK_MS;
    const limit = MAX_FLICK_STEPS * step;
    const projected = current + Math.max(-limit, Math.min(limit, flickDeg));
    settle(Math.round(projected / step) * step);
  };

  return (
    <div
      ref={rootRef}
      className={`${className} ${disabled ? "pointer-events-none" : ""}`}
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="listbox"
      aria-label="Products"
    >
      {/* Zero-width axis: names hang off its right edge, so the highlighted one
        sits exactly on the pointer no matter how long the word is. */}
      <div className="absolute right-[7vw] top-[44%] w-0">
        <span
          className="pointer-events-none absolute left-[1rem] top-0 h-1 w-1 -translate-y-1/2 rounded-full bg-white/70"
          aria-hidden
        />

        {products.map((product, index) => (
          <DialName
            key={product.slug}
            index={index}
            step={step}
            rotation={rotation}
            radius={radius}
            label={product.name}
            isActive={index === nearest}
            tappable={
              ringDistance(index, nearest, count) <= TAPPABLE_NEIGHBOURS
            }
            hotClassName={hotClassName}
            idleClassName={idleClassName}
            layoutId={bridgeIndex === index ? titleLayoutId : undefined}
            titleTransition={titleTransition}
            onPick={() => {
              if (movedRef.current) return;
              if (index === nearestRef.current) onSelect(index);
              else rotateTo(index);
            }}
            onFocusName={() => {
              if (index !== nearestRef.current) rotateTo(index);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DialName({
  index,
  step,
  rotation,
  radius,
  label,
  isActive,
  tappable,
  hotClassName,
  idleClassName,
  layoutId,
  titleTransition,
  onPick,
  onFocusName,
}: {
  index: number;
  step: number;
  rotation: MotionValue<number>;
  radius: MotionValue<number>;
  label: string;
  isActive: boolean;
  tappable: boolean;
  hotClassName: string;
  idleClassName: string;
  layoutId?: string;
  titleTransition?: object;
  onPick: () => void;
  onFocusName: () => void;
}) {
  const angle = useTransform<number, number>(
    [rotation, radius],
    ([rot]) => normalizeDeg(index * step + rot),
  );
  // Names bow toward the axis: the active one is furthest right (on the
  // pointer) and its neighbours fall away around the rim.
  const x = useTransform<number, number>(
    [rotation, radius],
    ([rot, r]) => -r * (1 - Math.cos(normalizeDeg(index * step + rot) * RAD)),
  );
  const y = useTransform<number, number>(
    [rotation, radius],
    ([rot, r]) => r * Math.sin(normalizeDeg(index * step + rot) * RAD),
  );
  const opacity = useTransform(angle, (a) => {
    const face = Math.cos(a * RAD);
    return face <= 0 ? 0 : Math.pow(face, 1.7);
  });
  const scale = useTransform(angle, (a) => 0.8 + 0.2 * Math.max(0, Math.cos(a * RAD)));

  return (
    <motion.div
      className="absolute right-0 top-0 origin-right"
      style={{ x, y, opacity, scale }}
    >
      <div className="-translate-y-1/2">
        <button
          type="button"
          onClick={onPick}
          onFocus={onFocusName}
          tabIndex={tappable ? 0 : -1}
          aria-selected={isActive}
          role="option"
          className={`inline-flex items-center gap-3 whitespace-nowrap outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent ${
            tappable ? "" : "pointer-events-none"
          }`}
        >
          {layoutId ? (
            <motion.span
              layoutId={layoutId}
              transition={titleTransition}
              className={`origin-right ${hotClassName}`}
            >
              {label}
            </motion.span>
          ) : (
            <span
              className={`origin-right transition-[color,font-size] duration-200 ease-out ${
                isActive ? hotClassName : idleClassName
              }`}
            >
              {label}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
