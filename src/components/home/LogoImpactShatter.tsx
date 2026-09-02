"use client";

import { useEffect, useRef, useState } from "react";
import { shatterBody, shatterDust, shatterShards, shatterShardsMeta } from "@/lib/media";

type ShardRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  n: number;
};

type ShardMeta = {
  width: number;
  height: number;
  shards: ShardRect[];
};

type Piece = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  /** Offset it starts from, pointing back toward the mark; reaches 0 at rest. */
  fromX: number;
  fromY: number;
  spin: number;
  delay: number;
  span: number;
};

type Assets = {
  body: HTMLImageElement;
  shards: HTMLImageElement;
  dust: HTMLImageElement;
  pieces: Piece[];
};

type LogoImpactShatterProps = {
  /** Runs the burst. Assets preload as soon as the component mounts. */
  active: boolean;
  className?: string;
  durationMs?: number;
  onComplete?: () => void;
};

const SOURCE_SIZE = 1024;
/** How far back along its outward vector a shard starts, as a share of its throw. */
const PULL_BACK = 0.62;
const MAX_PULL_PX = 190;

function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

function buildPieces(meta: ShardMeta): Piece[] {
  const midX = meta.width / 2;
  const midY = meta.height / 2;

  return meta.shards.map((s, i) => {
    const dx = s.cx - midX;
    const dy = s.cy - midY;
    const dist = Math.hypot(dx, dy) || 1;
    const pull = Math.min(MAX_PULL_PX, dist * PULL_BACK);
    // Nearer debris breaks away first, so the fracture reads as spreading outward.
    const norm = Math.min(1, dist / (meta.width * 0.52));

    return {
      sx: s.x,
      sy: s.y,
      sw: s.w,
      sh: s.h,
      fromX: (-dx / dist) * pull,
      fromY: (-dy / dist) * pull,
      spin: (rand(i * 7.3) - 0.5) * 1.1,
      delay: norm * 0.16 + rand(i * 3.7) * 0.05,
      span: 0.5 + rand(i * 5.1) * 0.24,
    };
  });
}

export function LogoImpactShatter({
  active,
  className = "",
  durationMs = 1100,
  onComplete,
}: LogoImpactShatterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [assets, setAssets] = useState<Assets | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [body, shards, dust, meta] = await Promise.all([
          loadImage(shatterBody),
          loadImage(shatterShards),
          loadImage(shatterDust),
          fetch(shatterShardsMeta).then((r) => r.json() as Promise<ShardMeta>),
        ]);
        if (cancelled) return;
        setAssets({ body, shards, dust, pieces: buildPieces(meta) });
      } catch {
        // The static body image underneath stays visible, so the intro degrades cleanly.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!assets) return;
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    let cancelled = false;
    let raf = 0;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cssW = parent.clientWidth;
    const cssH = parent.clientHeight;
    const size = Math.min(cssW, cssH);
    const k = size / SOURCE_SIZE;
    const originX = (cssW - size) / 2;
    const originY = (cssH - size) / 2;

    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = "high";

    const { body, shards, dust, pieces } = assets;

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, cssW, cssH);

      // The mark itself never fragments — it is present in every frame.
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.drawImage(body, originX, originY, size, size);

      // Everything else is additive, so black areas never occlude the mark.
      ctx.globalCompositeOperation = "lighter";

      for (const p of pieces) {
        const local = (t - p.delay) / p.span;
        if (local <= 0) continue;

        const e = easeOutQuart(Math.min(1, local));
        const rest = 1 - e;
        const dw = p.sw * k;
        const dh = p.sh * k;
        const cx = (p.sx + p.sw / 2 + p.fromX * rest) * k + originX;
        const cy = (p.sy + p.sh / 2 + p.fromY * rest) * k + originY;

        ctx.save();
        ctx.globalAlpha = Math.min(1, local * 5);
        ctx.translate(cx, cy);
        if (rest > 0.001) ctx.rotate(p.spin * rest);
        ctx.drawImage(shards, p.sx, p.sy, p.sw, p.sh, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }

      // Fine specks resolve into place rather than each flying separately.
      const dustIn = Math.min(1, Math.max(0, (t - 0.12) / 0.55));
      if (dustIn > 0) {
        const spread = 1 + (1 - easeOutQuart(dustIn)) * 0.06;
        ctx.save();
        ctx.globalAlpha = dustIn;
        ctx.translate(originX + size / 2, originY + size / 2);
        ctx.scale(spread, spread);
        ctx.drawImage(dust, -size / 2, -size / 2, size, size);
        ctx.restore();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    if (!active) {
      drawFrame(0);
      return;
    }

    const start = performance.now();
    let done = false;

    const frame = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / durationMs);
      drawFrame(t);

      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else if (!done) {
        done = true;
        onCompleteRef.current?.();
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [assets, active, durationMs]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
