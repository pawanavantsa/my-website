"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";

type ProductsShowcaseProps = {
  products: Product[];
};

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.85;
const DETAILS_OUT_MS = 160;

/** Stable ids so open/close always morphs the same pair of nodes (no per-slug remount races). */
const PREVIEW_LAYOUT_ID = "products-showcase-preview";
const TITLE_LAYOUT_ID = "products-showcase-title";

export function ProductsShowcase({ products }: ProductsShowcaseProps) {
  const reduced = useReducedMotion();
  /** null = not hovering; sticky `activeIndex` stays highlighted (inQ on load, last opened after close) */
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const [detailsOut, setDetailsOut] = useState(false);
  /** layoutId only while opening/closing — never while hovering */
  const [titleBridge, setTitleBridge] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const openedRef = useRef(opened);
  const detailsOutRef = useRef(detailsOut);
  openedRef.current = opened;
  detailsOutRef.current = detailsOut;

  const previewIndex = hoverIndex ?? activeIndex;
  const active = products[opened ? activeIndex : previewIndex] ?? products[0];
  const preview = active.hoverSlides[0];

  useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (opened || !titleBridge) return;
    const timer = window.setTimeout(() => {
      setTitleBridge(false);
      setHoverIndex(null);
    }, DURATION * 1000 + 80);
    return () => window.clearTimeout(timer);
  }, [opened, titleBridge]);

  const requestClose = () => {
    if (!openedRef.current || detailsOutRef.current) return;
    setDetailsOut(true);
    closeTimerRef.current = window.setTimeout(
      () => {
        // Clear live hover; sticky activeIndex keeps the returned name in "hovered" look.
        setHoverIndex(null);
        setTitleBridge(true);
        setOpened(false);
        setDetailsOut(false);
        closeTimerRef.current = null;
      },
      reduced ? 0 : DETAILS_OUT_MS,
    );
  };

  useEffect(() => {
    if (!opened) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, reduced]);

  const openProduct = (index: number) => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveIndex(index);
    setHoverIndex(index);
    setTitleBridge(true);
    setDetailsOut(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpened(true));
    });
  };

  return (
    <LayoutGroup id="products-showcase">
      <section
        className="relative h-[100dvh] w-full overflow-hidden bg-[#0a0a0a] text-white"
        aria-label="Products showcase"
      >
        {!opened ? (
          <div className="absolute left-5 top-5 z-20 w-[min(78vw,300px)] sm:left-10 sm:top-10 lg:left-14 lg:top-14">
            <motion.button
              type="button"
              layoutId={reduced ? undefined : PREVIEW_LAYOUT_ID}
              transition={{ layout: { duration: DURATION, ease: EASE } }}
              onClick={() => openProduct(previewIndex)}
              className="relative block aspect-[300/170] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#111] text-left"
            >
              <PreviewFace
                key={active.slug}
                preview={preview}
                tag={active.tag}
                alt={active.name}
                sizes="300px"
                showTag
                fade={!reduced}
              />
            </motion.button>
          </div>
        ) : null}

        <div
          className={`absolute bottom-24 right-10 z-20 max-w-[min(92vw,30rem)] text-right sm:bottom-28 sm:right-16 lg:bottom-16 lg:right-24 ${
            opened ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={opened}
          onMouseLeave={() => {
            // Don't clear while the title is mid-flight back into the list.
            if (!opened && !titleBridge) setHoverIndex(null);
          }}
        >
          <div className="mb-5 flex items-center justify-end gap-3">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-white/35">
              Our products
            </p>
            <span className="h-px w-14 bg-white/20 sm:w-24" aria-hidden />
          </div>

          <ul className="flex max-h-[48dvh] flex-col items-end gap-1.5 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 sm:max-h-none [&::-webkit-scrollbar]:hidden">
            {products.map((product, index) => {
              const isHovered = hoverIndex === index;
              const isSticky = hoverIndex === null && index === activeIndex;
              const isHighlighted = !opened && (isHovered || isSticky);
              const useSharedTitle =
                !opened &&
                titleBridge &&
                !reduced &&
                index === activeIndex;
              // Line→dot only on live hover — sticky/return stays quiet.
              const liveHoverMotion = isHovered && !titleBridge;
              // Real font-size (not CSS scale) so layoutId lands at final size — no pop at the end.
              const nameSizeClass = isHighlighted || useSharedTitle
                ? "text-[clamp(1.5rem,2.85vw,2.55rem)]"
                : "text-[clamp(1.4rem,2.7vw,2.4rem)]";

              return (
                <li key={product.slug}>
                  <button
                    type="button"
                    onMouseEnter={() => {
                      if (!opened) setHoverIndex(index);
                    }}
                    onFocus={() => {
                      if (!opened) setHoverIndex(index);
                    }}
                    onBlur={() => {
                      if (!opened && !titleBridge) setHoverIndex(null);
                    }}
                    onClick={() => openProduct(index)}
                    className="inline-flex items-center gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent"
                  >
                    {useSharedTitle ? (
                      <motion.span
                        layoutId={TITLE_LAYOUT_ID}
                        transition={{ layout: { duration: DURATION, ease: EASE } }}
                        className={`origin-right font-display ${nameSizeClass} font-light tracking-[-0.03em] text-white`}
                      >
                        {product.name}
                      </motion.span>
                    ) : (
                      <span
                        className={`origin-right font-display ${nameSizeClass} font-light tracking-[-0.03em] ${
                          liveHoverMotion
                            ? "transition-[color,font-size] duration-200 ease-out"
                            : ""
                        } ${
                          isHighlighted ? "text-white" : "text-[#7a7a7a]"
                        }`}
                      >
                        {product.name}
                      </span>
                    )}

                    <span
                      className="relative inline-flex h-1.5 w-[22px] shrink-0 translate-y-[3px] items-center justify-end"
                      aria-hidden
                    >
                      {isHighlighted ? (
                        liveHoverMotion ? (
                          <motion.span
                            key={`dot-hover-${product.slug}`}
                            className="absolute right-0 top-0 block h-1.5 rounded-full bg-white"
                            initial={
                              reduced
                                ? { width: 6, opacity: 1 }
                                : { width: 22, opacity: 1 }
                            }
                            animate={{ width: 6, opacity: 1 }}
                            transition={{
                              duration: 0.14,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                          />
                        ) : (
                          <span className="absolute right-0 top-0 block h-1.5 w-1.5 rounded-full bg-white" />
                        )
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <AnimatePresence>
          {opened ? (
            <motion.div
              key="opened-stage"
              className="absolute inset-0 z-30"
              initial={false}
            >
              <button
                type="button"
                aria-label="Close product view"
                onClick={requestClose}
                className="absolute inset-0 z-0 cursor-default bg-transparent"
              />

              <div className="pointer-events-none relative z-10 flex h-full flex-col items-center overflow-y-auto px-5 pb-28 pt-10 sm:px-8 sm:pb-24 sm:pt-12">
                <div className="pointer-events-auto flex w-full max-w-[min(92vw,42rem)] flex-col items-center">
                  <motion.h2
                    layoutId={
                      reduced || !titleBridge ? undefined : TITLE_LAYOUT_ID
                    }
                    transition={{ layout: { duration: DURATION, ease: EASE } }}
                    className="mb-6 text-center font-display text-[clamp(1.75rem,4vw,3rem)] font-light tracking-[-0.03em] text-white sm:mb-8"
                  >
                    {active.name}
                  </motion.h2>

                  <motion.div
                    layoutId={reduced ? undefined : PREVIEW_LAYOUT_ID}
                    transition={{ layout: { duration: DURATION, ease: EASE } }}
                    className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111] sm:rounded-3xl"
                  >
                    <PreviewFace
                      preview={preview}
                      tag={active.tag}
                      alt={active.name}
                      sizes="(max-width: 1024px) 92vw, 672px"
                    />
                  </motion.div>

                  <motion.div
                    className="mt-8 w-full max-w-xl sm:mt-10"
                    initial={reduced ? false : { opacity: 0, y: 20 }}
                    animate={
                      detailsOut
                        ? { opacity: 0, y: 8 }
                        : { opacity: 1, y: 0 }
                    }
                    transition={
                      detailsOut
                        ? { duration: 0.15, ease: "easeOut", delay: 0 }
                        : { delay: 0.4, duration: 0.5, ease: EASE }
                    }
                  >
                    <div className="flex items-center gap-4">
                      <p className="shrink-0 text-base font-semibold text-white sm:text-lg">
                        {active.tag}
                      </p>
                      <div className="relative h-[2px] min-w-0 flex-1">
                        <motion.span
                          aria-hidden
                          className="absolute left-0 top-0 block h-full rounded-full bg-white/25"
                          initial={reduced ? false : { width: 6 }}
                          animate={{ width: detailsOut ? 6 : "100%" }}
                          transition={
                            reduced
                              ? { duration: 0 }
                              : detailsOut
                                ? { duration: 0.15, delay: 0 }
                                : { delay: 0.55, duration: 0.85, ease: EASE }
                          }
                        />
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-white/45 sm:text-[0.95rem]">
                      {active.overview}
                    </p>
                    <p className="mt-4 text-sm text-white/55">
                      Want to create something with {active.name}? Let&apos;s do
                      it.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                      >
                        Request a demo
                        <ExternalIcon />
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </LayoutGroup>
  );
}

function PreviewFace({
  preview,
  tag,
  alt,
  sizes,
  showTag = false,
  fade = false,
}: {
  preview: Product["hoverSlides"][number] | undefined;
  tag: string;
  alt: string;
  sizes: string;
  showTag?: boolean;
  fade?: boolean;
}) {
  const body = (
    <>
      <PreviewMedia preview={preview} alt={alt} sizes={sizes} />
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-transparent" />
      {showTag ? (
        <p className="absolute left-4 top-4 z-[1] max-w-[75%] text-[0.65rem] leading-relaxed text-white/55">
          {tag}
        </p>
      ) : null}
    </>
  );

  if (!fade) {
    return <div className="absolute inset-0">{body}</div>;
  }

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {body}
    </motion.div>
  );
}

function PreviewMedia({
  preview,
  alt,
  sizes,
}: {
  preview: Product["hoverSlides"][number] | undefined;
  alt: string;
  sizes: string;
}) {
  if (preview?.kind === "video") {
    return (
      <video
        className="h-full w-full object-cover"
        src={preview.src}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return (
    <Image
      src={preview?.src ?? FALLBACK}
      alt={preview?.alt ?? alt}
      fill
      priority
      className="object-cover"
      sizes={sizes}
    />
  );
}

const FALLBACK =
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80";

function ExternalIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M6 4h6v6M12 4L5 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
