"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * One persistent galaxy: every product is a node on a sphere, all wired to
 * every other. Hovering a product travels the camera so that node swings to
 * the front — nothing is highlighted, it simply ends up nearest to us and so
 * reads as the largest and brightest.
 *
 * Two things keep it from looking like a rotating flat image:
 *  - connections are great-circle arcs sampled in 3D, so they bend and
 *    foreshorten as the camera moves rather than staying rigid chords;
 *  - every node floats on its own slow drift, so the field reflows during a
 *    transition instead of turning as one solid body.
 *
 * Canvas rather than SVG/DOM because the whole scene reprojects every frame,
 * which in React would be a full re-render at 60fps. Canvas also gives real
 * additive glow.
 */

/** Camera distance for the perspective divide. Lower = more dramatic 3D. */
const FOCAL = 1000;
/** Sphere the product nodes sit on, in world units. */
const RADIUS = 300;
/**
 * Unlabelled nodes mixed in with the product ones. Products alone are too few
 * to read as a field, and the eye can count them; fillers give the lattice
 * depth without implying more products than we ship.
 */
const FILLER_NODES = 18;
/** Filler nodes and their wires stay behind the product ones. */
const FILLER_WEIGHT = 0.6;
/** How many neighbours each filler wires into. */
const FILLER_LINKS = 2;
/** Backdrop stars sit much further out so they parallax slowly. */
const STAR_RADIUS = 1150;
const STAR_COUNT = 220;
/** Length of the flight between two products. Long enough to read as travel. */
const TRAVEL_MS = 1450;
/** How far each node wanders from its home, as a fraction of RADIUS. */
const DRIFT = 0.06;

type Vec3 = { x: number; y: number; z: number };

/** Fibonacci sphere — even spread with no clustering at the poles. */
function sphereLayout(count: number, radius: number): Vec3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points: Vec3[] = [];

  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push({
      x: Math.cos(theta) * ring * radius,
      y: y * radius,
      z: Math.sin(theta) * ring * radius,
    });
  }

  return points;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fillers get their own even spread rather than the product spiral's unused
 * slots. Striding that spiral looks even by index but advances longitude by
 * ~2.5 golden angles a step, which packs every product into one hemisphere and
 * leaves the other side bare.
 *
 * Latitudes sit at cell centres so they interleave with the product ring, and
 * radii vary a little so the field doesn't read as one hollow shell.
 */
function fillerLayout(count: number, radius: number): Vec3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const rand = mulberry32(0xf111e2);
  const points: Vec3[] = [];

  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.5) / count) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    // Phase offset keeps fillers off the product nodes' longitudes.
    const theta = golden * i + 0.9;
    const r = radius * (0.84 + rand() * 0.26);
    points.push({
      x: Math.cos(theta) * ring * r,
      y: y * r,
      z: Math.sin(theta) * ring * r,
    });
  }

  return points;
}

function starField(): Vec3[] {
  const rand = mulberry32(20260904);
  const stars: Vec3[] = [];

  for (let i = 0; i < STAR_COUNT; i++) {
    const u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const ring = Math.sqrt(Math.max(0, 1 - u * u));
    const r = STAR_RADIUS * (0.55 + rand() * 0.45);
    stars.push({
      x: Math.cos(theta) * ring * r,
      y: u * r,
      z: Math.sin(theta) * ring * r,
    });
  }

  return stars;
}

/** Per-node drift parameters: independent frequencies and phases per axis. */
type Drift = { w: Vec3; p: Vec3 };

function driftParams(count: number): Drift[] {
  const rand = mulberry32(0x5eed21);
  return Array.from({ length: count }, () => ({
    w: {
      x: 0.00011 + rand() * 0.00013,
      y: 0.00010 + rand() * 0.00012,
      z: 0.00012 + rand() * 0.00014,
    },
    p: {
      x: rand() * Math.PI * 2,
      y: rand() * Math.PI * 2,
      z: rand() * Math.PI * 2,
    },
  }));
}

/**
 * Camera angles that bring `node` to dead centre, facing the viewer.
 * Rotation order is yaw about Y then pitch about X, so solving x1 = 0 gives
 * yaw, and y1 = 0 then gives pitch.
 */
function focusAngles(node: Vec3) {
  const h = Math.hypot(node.x, node.z);
  return { yaw: Math.atan2(-node.x, node.z), pitch: Math.atan2(node.y, h) };
}

function rotate(node: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);

  const x1 = node.x * cy + node.z * sy;
  const z1 = node.z * cy - node.x * sy;
  return {
    x: x1,
    y: node.y * cp - z1 * sp,
    z: z1 * cp + node.y * sp,
  };
}

/** Wrap an angle delta into [-PI, PI] so the camera takes the short way round. */
function shortestDelta(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Ease-in-out cubic: the acceleration then settle is what reads as travel. */
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

/**
 * Points along the great-circle arc from `a` to `b`, bulged outward so the
 * connection curves clear of the node shell.
 *
 * Uses the standard circle parameterisation p(t) = u·cos(θt) + w·sin(θt),
 * which stays on the sphere for any separation. The one degenerate case is
 * exact antipodes, where `w` collapses and any perpendicular will do — that
 * happens with Fibonacci layouts (the two poles), so it needs the fallback.
 */
function arcPoints(a: Vec3, b: Vec3): Vec3[] {
  const ra = Math.hypot(a.x, a.y, a.z);
  const rb = Math.hypot(b.x, b.y, b.z);
  const ua = normalize(a);
  const ub = normalize(b);

  const dot = Math.max(-1, Math.min(1, ua.x * ub.x + ua.y * ub.y + ua.z * ub.z));
  const omega = Math.acos(dot);

  let w: Vec3 = {
    x: ub.x - ua.x * dot,
    y: ub.y - ua.y * dot,
    z: ub.z - ua.z * dot,
  };

  if (Math.hypot(w.x, w.y, w.z) < 1e-6) {
    // Antipodal (or coincident): cross with whichever axis is least parallel.
    const axis: Vec3 =
      Math.abs(ua.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
    w = {
      x: ua.y * axis.z - ua.z * axis.y,
      y: ua.z * axis.x - ua.x * axis.z,
      z: ua.x * axis.y - ua.y * axis.x,
    };
  }
  w = normalize(w);

  // Wider separations get a deeper bow so long arcs sweep rather than sag.
  const bulge = 0.09 + 0.11 * (omega / Math.PI);
  const samples = Math.max(8, Math.min(26, Math.round((omega / Math.PI) * 22) + 6));

  const out: Vec3[] = [];
  for (let s = 0; s <= samples; s++) {
    const t = s / samples;
    const ang = omega * t;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const r = (ra + (rb - ra) * t) * (1 + bulge * Math.sin(Math.PI * t));
    out.push({
      x: (ua.x * ca + w.x * sa) * r,
      y: (ua.y * ca + w.y * sa) * r,
      z: (ua.z * ca + w.z * sa) * r,
    });
  }

  return out;
}

type ProductNodeFieldProps = {
  /** Total products — one node each, plus FILLER_NODES unlabelled ones. */
  count: number;
  /** Product currently hovered / active; the camera travels to its node. */
  activeIndex: number;
  /** Fade out while the expanded detail view is open. */
  dimmed?: boolean;
  className?: string;
};

export function ProductNodeField({
  count,
  activeIndex,
  dimmed = false,
  className = "",
}: ProductNodeFieldProps) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Products first, fillers after — so index < count is a product, and the
    // camera's target list is just the product slice.
    const homes = [
      ...sphereLayout(count, RADIUS),
      ...fillerLayout(FILLER_NODES, RADIUS),
    ];
    const total = homes.length;
    const drifts = driftParams(total);
    const stars = starField();

    const targets = homes.slice(0, count).map(focusAngles);

    const pairs: Array<{ a: number; b: number; weight: number }> = [];
    const seen = new Set<string>();
    const link = (a: number, b: number, weight: number) => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      if (seen.has(key)) return;
      seen.add(key);
      pairs.push({ a, b, weight });
    };

    // Products stay fully meshed — that wiring is the point of the visual.
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) link(i, j, 1);
    }

    // Fillers only wire to their nearest neighbours: a full mesh over every
    // node would be a solid ball of lines (and O(n^2) arcs per frame).
    for (let i = count; i < total; i++) {
      const near = homes
        .map((h, j) => ({
          j,
          d:
            (h.x - homes[i].x) ** 2 +
            (h.y - homes[i].y) ** 2 +
            (h.z - homes[i].z) ** 2,
        }))
        .filter((o) => o.j !== i)
        .sort((m, n) => m.d - n.d)
        .slice(0, FILLER_LINKS);
      for (const { j } of near) link(i, j, FILLER_WEIGHT);
    }

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    // Camera flight state: a tween between two sets of angles.
    const start = targets[activeRef.current] ?? { yaw: 0, pitch: 0 };
    let fromYaw = start.yaw;
    let fromPitch = start.pitch;
    let toYaw = start.yaw;
    let toPitch = start.pitch;
    let curYaw = start.yaw;
    let curPitch = start.pitch;
    let flightStart = -TRAVEL_MS;
    let lastActive = activeRef.current;
    let raf = 0;

    const draw = (time: number) => {
      const cx = width / 2;
      const cy = height / 2;

      // --- camera ---------------------------------------------------------
      const active = activeRef.current;
      if (active !== lastActive) {
        const target = targets[active] ?? { yaw: 0, pitch: 0 };
        // Re-base the tween on wherever the camera currently is, so rapid
        // hovers redirect mid-flight instead of snapping.
        fromYaw = curYaw;
        fromPitch = curPitch;
        toYaw = fromYaw + shortestDelta(fromYaw, target.yaw);
        toPitch = target.pitch;
        flightStart = time;
        lastActive = active;
      }

      const raw = Math.min(1, Math.max(0, (time - flightStart) / TRAVEL_MS));
      const e = easeInOut(raw);
      curYaw = fromYaw + (toYaw - fromYaw) * e;
      curPitch = fromPitch + (toPitch - fromPitch) * e;

      // Idle sway keeps it alive without disturbing where the flight lands.
      const yaw = curYaw + Math.sin(time * 0.00019) * 0.06;
      const pitch = curPitch + Math.sin(time * 0.00015 + 1.2) * 0.045;

      // Slight pull-back at the midpoint of a flight — a cinematic beat that
      // makes the travel legible rather than a straight cut.
      const pull = 1 - 0.06 * Math.sin(Math.PI * raw);
      const scale = (Math.min(width, height) / (RADIUS * 2.15)) * pull;

      const project = (v: Vec3) => {
        const k = FOCAL / (FOCAL - v.z);
        return { x: cx + v.x * k * scale, y: cy + v.y * k * scale, k };
      };

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      // --- backdrop stars -------------------------------------------------
      for (let i = 0; i < stars.length; i++) {
        const r = rotate(stars[i], yaw, pitch);
        if (r.z > FOCAL * 0.9) continue;
        const p = project(r);
        if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
          continue;
        }
        const twinkle = 0.55 + 0.45 * Math.sin(time * 0.0011 + i * 1.7);
        ctx.globalAlpha = Math.min(0.5, 0.1 + p.k * 0.16) * twinkle;
        ctx.fillStyle = "#cfe8ff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.3, p.k * 0.85), 0, Math.PI * 2);
        ctx.fill();
      }

      // --- node world positions (home + independent float) ----------------
      const amp = RADIUS * DRIFT;
      const live: Vec3[] = homes.map((h, i) => {
        const d = drifts[i];
        return {
          x: h.x + Math.sin(time * d.w.x + d.p.x) * amp,
          y: h.y + Math.sin(time * d.w.y + d.p.y) * amp,
          z: h.z + Math.sin(time * d.w.z + d.p.z) * amp,
        };
      });

      const rotated = live.map((n) => rotate(n, yaw, pitch));
      const screen = rotated.map(project);

      // --- connections: great-circle arcs, depth-graded ------------------
      ctx.lineCap = "round";
      for (let i = 0; i < pairs.length; i++) {
        const { a, b, weight } = pairs[i];
        const pts = arcPoints(live[a], live[b]).map((p) =>
          project(rotate(p, yaw, pitch)),
        );

        const ka = screen[a].k;
        const kb = screen[b].k;

        // One gradient along the arc instead of per-segment alpha: same depth
        // ramp, but a single stroke so joints don't bead under additive blend.
        const grad = ctx.createLinearGradient(
          pts[0].x,
          pts[0].y,
          pts[pts.length - 1].x,
          pts[pts.length - 1].y,
        );
        const fade = (k: number) =>
          `rgba(116,182,255,${(Math.max(0, k - 0.72) * 0.34 * weight).toFixed(3)})`;
        grad.addColorStop(0, fade(ka));
        grad.addColorStop(0.5, fade((ka + kb) / 2));
        grad.addColorStop(1, fade(kb));

        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(0.3, ((ka + kb) / 2) * 0.62 * weight);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let s = 1; s < pts.length; s++) ctx.lineTo(pts[s].x, pts[s].y);
        ctx.stroke();
      }

      // --- nodes, back to front so near ones overlap far ones -------------
      const order = rotated
        .map((r, i) => ({ i, z: r.z }))
        .sort((m, n) => m.z - n.z);

      for (const { i } of order) {
        const p = screen[i];
        // Everything about a node comes from its depth alone — no special
        // casing for the active one. It's the front-most, so it's the biggest.
        const depth = Math.max(0.15, p.k - 0.62);
        const weight = i < count ? 1 : FILLER_WEIGHT;
        const core = 2.1 * p.k * weight;
        const halo = 14 * p.k * weight;

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, halo);
        glow.addColorStop(0, "#cfe9ff");
        glow.addColorStop(0.3, "#54a6f0");
        glow.addColorStop(1, "rgba(30,90,190,0)");

        ctx.globalAlpha = Math.min(1, depth * 0.62 * weight);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, halo, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = Math.min(1, (0.28 + depth * 0.95) * weight);
        ctx.fillStyle = "#eaf6ff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, core, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    if (reduced) {
      draw(0);
      return () => {
        observer.disconnect();
      };
    }

    const tick = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [count, reduced]);

  return (
    <div
      className={`pointer-events-none select-none transition-opacity duration-500 ${
        dimmed ? "opacity-0" : "opacity-100"
      } ${className}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
