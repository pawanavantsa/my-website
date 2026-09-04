"use client";

import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { productHasMobile, productHasWeb } from "@/lib/products";

export const WEB_SCREEN_LAYOUT_ID = "products-showcase-web-screen";
export const MOBILE_SCREEN_LAYOUT_ID = "products-showcase-mobile-screen";

const EASE = [0.22, 1, 0.36, 1] as const;
export const SCREEN_MORPH_MS = 620;
const LAYOUT_TRANSITION = {
  layout: { duration: SCREEN_MORPH_MS / 1000, ease: EASE },
};

export type ScreenRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type ScreenOrigins = {
  web?: ScreenRect;
  mobile?: ScreenRect;
};

type ProductScreenGalleryProps = {
  product: Product;
  /** Enable shared-element ids only while the morph is active. */
  bridge?: boolean;
  className?: string;
};

/**
 * Expanded screens. Height-capped to keep the open view unscrollable.
 * Mobile uses object-contain — our phone assets are ~9:16 while the device
 * hole is taller, and cover was chopping ReachAI / Voice (nav + headers).
 */
export function ProductScreenGallery({
  product,
  bridge = false,
  className = "",
}: ProductScreenGalleryProps) {
  const hasWeb = productHasWeb(product);
  const hasMobile = productHasMobile(product);
  const web = product.webScreen ?? product.hoverSlides[0];
  const mobile = product.mobileScreen ?? product.hoverSlides[0];

  if (hasWeb && hasMobile) {
    return (
      <div
        className={`flex w-full items-end justify-center gap-3 sm:gap-5 ${className}`}
      >
        <ScreenFrame
          layoutId={bridge ? WEB_SCREEN_LAYOUT_ID : undefined}
          src={web.src}
          alt={web.alt}
          radius={16}
          className="aspect-[16/9] w-[min(52vw,36rem)] max-h-[min(28dvh,21rem)] sm:max-h-[min(38dvh,21rem)] sm:w-[min(56vw,36rem)]"
          fit="cover"
        />
        <ScreenFrame
          layoutId={bridge ? MOBILE_SCREEN_LAYOUT_ID : undefined}
          src={mobile.src}
          alt={mobile.alt}
          radius={24}
          className="aspect-[9/16] h-[min(28dvh,21rem)] w-auto sm:h-[min(38dvh,21rem)]"
          fit="contain"
        />
      </div>
    );
  }

  if (hasMobile) {
    return (
      <div className={`flex w-full justify-center ${className}`}>
        <ScreenFrame
          layoutId={bridge ? MOBILE_SCREEN_LAYOUT_ID : undefined}
          src={mobile.src}
          alt={mobile.alt}
          radius={26}
          className="aspect-[9/16] h-[min(36dvh,28rem)] w-auto sm:h-[min(50dvh,28rem)]"
          fit="contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex w-full justify-center ${className}`}>
      <ScreenFrame
        layoutId={bridge ? WEB_SCREEN_LAYOUT_ID : undefined}
        src={web.src}
        alt={web.alt}
        radius={16}
        className="aspect-[16/9] w-[min(88vw,42rem)] max-h-[min(30dvh,23rem)] sm:w-[min(70vw,42rem)] sm:max-h-[min(40dvh,23rem)]"
        fit="cover"
      />
    </div>
  );
}

function ScreenFrame({
  layoutId,
  src,
  alt,
  radius,
  className,
  fit = "cover",
}: {
  layoutId?: string;
  src: string;
  alt: string;
  radius: number;
  className: string;
  fit?: "contain" | "cover";
}) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={LAYOUT_TRANSITION}
      className={`relative shrink-0 overflow-hidden bg-black ${className}`}
      style={{
        borderRadius: radius,
        boxShadow: layoutId
          ? "0 12px 40px rgba(0,0,0,0.4)"
          : "0 20px 60px rgba(0,0,0,0.5)",
        willChange: layoutId ? "transform" : undefined,
        transform: "translateZ(0)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`absolute inset-0 h-full w-full object-top ${
          fit === "contain" ? "object-contain" : "object-cover"
        }`}
        decoding="sync"
      />
    </motion.div>
  );
}

/** Flat clones parked on the measured device-screen rects — the layoutId source. */
export function ScreenFlightAnchors({
  product,
  origins,
  active,
}: {
  product: Product;
  origins: ScreenOrigins;
  active: boolean;
}) {
  if (!active) return null;

  const web = product.webScreen ?? product.hoverSlides[0];
  const mobile = product.mobileScreen ?? product.hoverSlides[0];
  const hasWeb = productHasWeb(product);
  const hasMobile = productHasMobile(product);

  return (
    <>
      {hasWeb && origins.web ? (
        <FlightTile
          layoutId={WEB_SCREEN_LAYOUT_ID}
          src={web.src}
          alt={web.alt}
          rect={origins.web}
          radius={Math.max(4, origins.web.width * 0.012)}
          fit="cover"
        />
      ) : null}

      {hasMobile && origins.mobile ? (
        <FlightTile
          layoutId={MOBILE_SCREEN_LAYOUT_ID}
          src={mobile.src}
          alt={mobile.alt}
          rect={origins.mobile}
          radius={Math.max(8, origins.mobile.width * 0.09)}
          fit="contain"
        />
      ) : null}
    </>
  );
}

function FlightTile({
  layoutId,
  src,
  alt,
  rect,
  radius,
  fit = "cover",
}: {
  layoutId: string;
  src: string;
  alt: string;
  rect: ScreenRect;
  radius: number;
  fit?: "contain" | "cover";
}) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={LAYOUT_TRANSITION}
      className="pointer-events-none fixed z-40 overflow-hidden bg-black"
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: radius,
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`absolute inset-0 h-full w-full object-top ${
          fit === "contain" ? "object-contain" : "object-cover"
        }`}
        decoding="sync"
      />
    </motion.div>
  );
}

export function measureProductScreens(
  root: HTMLElement | null,
  product: Product,
): ScreenOrigins {
  if (!root) return {};

  const read = (kind: "web" | "mobile"): ScreenRect | undefined => {
    const el = root.querySelector(`[data-product-screen="${kind}"]`);
    if (!el) return undefined;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return undefined;
    return {
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    };
  };

  const out: ScreenOrigins = {};
  if (productHasWeb(product)) out.web = read("web");
  if (productHasMobile(product)) out.mobile = read("mobile");
  return out;
}
