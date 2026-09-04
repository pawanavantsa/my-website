"use client";

import Link from "next/link";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ProductDeviceStage } from "@/components/products/ProductDeviceStage";
import { ProductDial } from "@/components/products/ProductDial";
import { ProductNodeField } from "@/components/products/ProductNodeField";
import {
  measureProductScreens,
  ProductScreenGallery,
  SCREEN_MORPH_MS,
  ScreenFlightAnchors,
  type ScreenOrigins,
} from "@/components/products/ProductScreenGallery";
import type { Product } from "@/lib/products";

type ProductsShowcaseProps = {
  products: Product[];
};

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.85;
/** Let copy fade before the screen morph starts home. */
const DETAILS_OUT_MS = 180;

/** Stable ids so open/close always morphs the same pair of nodes (no per-slug remount races). */
const TITLE_LAYOUT_ID = "products-showcase-title";

/** Opened title size — kept as a named token so the return landing size stays exact. */
const OPEN_TITLE =
  "font-display text-[clamp(1.55rem,5.5vw,3rem)] font-light tracking-[-0.03em] text-white";
const LIST_TITLE_HOT =
  "font-display text-[clamp(1.5rem,2.85vw,2.55rem)] font-light tracking-[-0.03em] text-white";
const LIST_TITLE_IDLE =
  "font-display text-[clamp(1.4rem,2.7vw,2.4rem)] font-light tracking-[-0.03em] text-[#7a7a7a]";
/** Dial type runs smaller — several names share the arc on a phone. */
const DIAL_TITLE_HOT =
  "font-display text-[clamp(1.15rem,4.8vw,1.7rem)] font-light tracking-[-0.03em] text-white";
const DIAL_TITLE_IDLE =
  "font-display text-[clamp(1.05rem,4.3vw,1.55rem)] font-light tracking-[-0.03em] text-[#6f6f6f]";

/** Mobile gets the dial; desktop keeps the hover list. */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

export function ProductsShowcase({ products }: ProductsShowcaseProps) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  /** null = not hovering; sticky `activeIndex` stays highlighted (inQ on load, last opened after close) */
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const [detailsOut, setDetailsOut] = useState(false);
  /** layoutId for the product name while opening/closing */
  const [titleBridge, setTitleBridge] = useState(false);
  /** layoutId for screens — cleared after morph settles so no ghost projections linger */
  const [screenBridge, setScreenBridge] = useState(false);
  /** 'out' = leaving devices; 'in' = returning — controls whether bezels go blank. */
  const [flightDir, setFlightDir] = useState<"out" | "in" | null>(null);
  const [screenOrigins, setScreenOrigins] = useState<ScreenOrigins>({});
  /** Brief post-close lock so the closing click can't fall through onto the device. */
  const [stageLocked, setStageLocked] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const openRafRef = useRef<number | null>(null);
  const stageLockTimerRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(opened);
  const detailsOutRef = useRef(detailsOut);
  const activeIndexRef = useRef(activeIndex);
  /** Bumps on every open/close so stale rAF/timeouts can't bounce the view back open. */
  const sessionRef = useRef(0);
  openedRef.current = opened;
  detailsOutRef.current = detailsOut;
  activeIndexRef.current = activeIndex;

  const previewIndex = hoverIndex ?? activeIndex;
  const active = products[opened ? activeIndex : previewIndex] ?? products[0];
  const titleShared = !reduced && titleBridge;
  const screensShared = !reduced && screenBridge;
  /** Flat anchors sit on the device holes only while bridging and the gallery is gone. */
  const showFlightAnchors = screensShared && !opened;
  /** Only blank the bezels when screens are flying OUT — on return they stay lit under the anchors. */
  const hideDeviceScreens = showFlightAnchors && flightDir === "out";

  const cancelPendingOpen = () => {
    if (openRafRef.current != null) {
      window.cancelAnimationFrame(openRafRef.current);
      openRafRef.current = null;
    }
  };

  // The showcase is a fixed stage — the dial owns vertical gestures, so the
  // page itself must not scroll or rubber-band underneath it.
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      overscroll: body.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.overscroll;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) window.clearTimeout(closeTimerRef.current);
      if (stageLockTimerRef.current != null) {
        window.clearTimeout(stageLockTimerRef.current);
      }
      cancelPendingOpen();
    };
  }, []);

  useEffect(() => {
    if (opened || !titleBridge) return;
    const session = sessionRef.current;
    const timer = window.setTimeout(() => {
      if (sessionRef.current !== session) return;
      setTitleBridge(false);
      setScreenBridge(false);
      setFlightDir(null);
      setHoverIndex(null);
    }, SCREEN_MORPH_MS + 40);
    return () => window.clearTimeout(timer);
  }, [opened, titleBridge]);

  const requestClose = () => {
    if (!openedRef.current || detailsOutRef.current) return;
    cancelPendingOpen();
    sessionRef.current += 1;
    const session = sessionRef.current;
    setDetailsOut(true);
    detailsOutRef.current = true;

    closeTimerRef.current = window.setTimeout(
      () => {
        if (sessionRef.current !== session) return;
        const product = products[activeIndexRef.current] ?? products[0];
        // One atomic handoff: anchors on the holes + close the gallery.
        // (Previously re-attached layoutIds while still open, then rAF-closed —
        // that raced a pending open rAF and bounced the view back open, stuck.)
        flushSync(() => {
          setScreenOrigins(measureProductScreens(stageRef.current, product));
          setHoverIndex(null);
          setFlightDir("in");
          setTitleBridge(true);
          setScreenBridge(true);
          setOpened(false);
          setDetailsOut(false);
          setStageLocked(true);
        });
        openedRef.current = false;
        detailsOutRef.current = false;
        closeTimerRef.current = null;
        if (stageLockTimerRef.current != null) {
          window.clearTimeout(stageLockTimerRef.current);
        }
        stageLockTimerRef.current = window.setTimeout(() => {
          setStageLocked(false);
          stageLockTimerRef.current = null;
        }, 320);
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
    cancelPendingOpen();
    sessionRef.current += 1;
    const session = sessionRef.current;

    setActiveIndex(index);
    setHoverIndex(index);
    setDetailsOut(false);
    detailsOutRef.current = false;

    // Commit the chosen product onto the stage, park flat anchors on its
    // screen holes, then open — flushSync so layoutId has a real source frame.
    openRafRef.current = window.requestAnimationFrame(() => {
      if (sessionRef.current !== session) return;
      const next = products[index] ?? products[0];
      flushSync(() => {
        setScreenOrigins(measureProductScreens(stageRef.current, next));
        setFlightDir("out");
        setTitleBridge(true);
        setScreenBridge(true);
      });
      openRafRef.current = window.requestAnimationFrame(() => {
        if (sessionRef.current !== session) return;
        openRafRef.current = null;
        setOpened(true);
        openedRef.current = true;
      });
    });
  };

  return (
    <LayoutGroup id="products-showcase">
      <section
        className="relative h-[100dvh] w-full overflow-hidden bg-[#0a0a0a] text-white"
        aria-label="Products showcase"
      >
        {/* Devices stay mounted. Screens hide while flat flight anchors own
            the shared-layout morph (measuring 3D holes, morphing in 2D). */}
        <motion.div
          ref={stageRef}
          className={`absolute left-[13vw] right-[13vw] top-3 z-20 md:left-10 md:right-auto md:top-6 md:w-[min(72vw,600px)] lg:left-14 lg:top-10 ${
            opened || stageLocked ? "pointer-events-none" : ""
          }`}
          initial={false}
          animate={{ opacity: opened ? 0 : 1 }}
          transition={{
            duration: reduced ? 0 : opened ? 0.28 : 0.2,
            ease: EASE,
            // On return, reveal chassis immediately under the flying screens.
            delay: reduced ? 0 : opened ? 0.04 : 0,
          }}
        >
          <motion.button
            type="button"
            onClick={() => openProduct(previewIndex)}
            tabIndex={opened || stageLocked ? -1 : 0}
            className="relative block aspect-[16/11] w-full bg-transparent text-left outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent"
          >
            <ProductDeviceStage
              product={active}
              hideScreens={hideDeviceScreens}
            />
          </motion.button>
        </motion.div>

        <ScreenFlightAnchors
          product={active}
          origins={screenOrigins}
          active={showFlightAnchors}
        />

        {/* Galaxy sits behind everything: z-[5] is above the page but under
            both UI panels (z-20), so it can span the full stage. Softened on
            phone so devices + list keep the stage. Outer opacity wraps the
            field so it doesn't fight the dimmed opacity-0/100 toggle. */}
        <div
          className="pointer-events-none absolute left-1/2 top-[46%] z-[5] h-[min(88vh,700px)] w-[min(142vw,700px)] -translate-x-1/2 -translate-y-1/2 opacity-40 md:left-[56%] md:top-1/2 md:h-[min(118vh,1320px)] md:w-[min(96vw,1320px)] md:opacity-100"
          aria-hidden
        >
          <ProductNodeField
            count={products.length}
            activeIndex={previewIndex}
            dimmed={opened}
            className="h-full w-full"
          />
        </div>

        <div
          className={`absolute bottom-36 left-6 z-20 hidden max-w-[min(88vw,26rem)] transition-opacity duration-500 md:block sm:bottom-40 sm:left-10 sm:max-w-[28rem] lg:bottom-28 lg:left-14 ${
            opened ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={opened}
        >
          <div className="mb-5 flex items-center gap-3">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-white/35">
              Our belief
            </p>
            <span className="h-px w-14 bg-white/20 sm:w-20" aria-hidden />
          </div>
          <h2 className="font-display text-[clamp(1.9rem,3.2vw,2.65rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#e8f4ff]">
            Better tools.
            <br />
            Brighter people.
          </h2>
          <p className="mt-5 max-w-[24rem] text-[1.05rem] leading-relaxed text-white/40 sm:text-[1.1rem]">
            Tools that take on the busywork — so people can stay sharp on what
            matters.
          </p>
        </div>

        {/* Mobile: the dial replaces hover. One of the two is mounted at a
            time — both carry TITLE_LAYOUT_ID, and two live copies would fight
            over the shared morph. */}
        {isMobile ? (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 top-[28%] z-20 transition-opacity duration-300 ${
              opened ? "opacity-0" : "opacity-100"
            }`}
            aria-hidden={opened}
          >
            {/* Eyebrow sits on the dial's own axis, so its line always points
                at whichever name is currently selected. */}
            <div className="absolute left-5 top-[44%] flex -translate-y-1/2 items-center gap-2">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.28em] text-white/35">
                Our products
              </p>
              <span
                className="h-px w-7 bg-gradient-to-r from-white/10 to-white/40"
                aria-hidden
              />
            </div>

            <ProductDial
              products={products}
              activeIndex={previewIndex}
              onActiveChange={(index) => {
                if (!opened) setHoverIndex(index);
              }}
              onSelect={openProduct}
              titleLayoutId={TITLE_LAYOUT_ID}
              bridgeIndex={
                !opened && titleBridge && !reduced ? activeIndex : undefined
              }
              titleTransition={{ layout: { duration: DURATION, ease: EASE } }}
              hotClassName={DIAL_TITLE_HOT}
              idleClassName={DIAL_TITLE_IDLE}
              disabled={opened}
              className="pointer-events-auto absolute inset-y-0 right-0 w-[58vw]"
            />
          </div>
        ) : null}

        {isMobile ? null : (
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

          <ul className="flex flex-col items-end gap-1.5 pr-1 sm:gap-2">
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
              const nameClass =
                isHighlighted || useSharedTitle ? LIST_TITLE_HOT : LIST_TITLE_IDLE;

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
                        className={`origin-right ${nameClass}`}
                      >
                        {product.name}
                      </motion.span>
                    ) : (
                      <span
                        className={`origin-right ${nameClass} ${
                          liveHoverMotion
                            ? "transition-[color,font-size] duration-200 ease-out"
                            : ""
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
        )}

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

              <div className="pointer-events-none relative z-10 flex h-full flex-col items-center overflow-hidden px-4 pb-24 pt-12 sm:px-10 sm:pb-12 sm:pt-16 lg:pt-[4.5rem]">
                <div className="pointer-events-auto flex max-h-full w-full max-w-[min(92vw,48rem)] flex-col items-center">
                  <motion.h2
                    layoutId={titleShared ? TITLE_LAYOUT_ID : undefined}
                    transition={{ layout: { duration: DURATION, ease: EASE } }}
                    className={`mb-5 shrink-0 text-center sm:mb-10 ${OPEN_TITLE}`}
                  >
                    {active.name}
                  </motion.h2>

                  <ProductScreenGallery
                    product={active}
                    bridge={screensShared}
                    className="min-h-0 w-full shrink"
                  />

                  <motion.div
                    className="mt-5 w-full max-w-xl self-start sm:mt-10"
                    initial={reduced ? false : { opacity: 0, y: 18 }}
                    animate={
                      detailsOut
                        ? { opacity: 0, y: 6 }
                        : { opacity: 1, y: 0 }
                    }
                    transition={
                      detailsOut
                        ? { duration: 0.15, ease: "easeOut", delay: 0 }
                        : { delay: 0.32, duration: 0.45, ease: EASE }
                    }
                  >
                    <div className="flex items-center gap-4">
                      <p className="shrink-0 text-sm font-semibold text-white sm:text-lg">
                        {active.tag}
                      </p>
                      <div className="relative h-px min-w-0 flex-1">
                        <motion.span
                          aria-hidden
                          className="absolute left-0 top-0 block h-full rounded-full bg-white/30"
                          initial={reduced ? false : { width: 6 }}
                          animate={{ width: detailsOut ? 6 : "100%" }}
                          transition={
                            reduced
                              ? { duration: 0 }
                              : detailsOut
                                ? { duration: 0.15, delay: 0 }
                                : { delay: 0.42, duration: 0.8, ease: EASE }
                          }
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/45 sm:mt-4 sm:text-[0.95rem]">
                      {active.overview}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 sm:mt-5">
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
