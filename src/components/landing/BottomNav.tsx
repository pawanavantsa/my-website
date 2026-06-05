"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import useUserActivity from "@/hooks/useUserActivity";
import { MenuBrandLogo, NavIcon } from "@/components/icons/NavIcon";
import { getLenis } from "@/lib/lenis-instance";
import { navLinks, site } from "@/lib/site";

const SHEET_MAX_H = 480;

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mouseHover, setMouseHover] = useState(false);
  const [visible, setVisible] = useState(pathname !== "/");
  const activeUser = useUserActivity();
  const scrollYRef = useRef(0);
  const menuListRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const openMenu = useCallback(() => setOpen(true), []);

  useEffect(() => {
    if (pathname !== "/") {
      setVisible(true);
      return;
    }

    setVisible(false);
    setOpen(false);

    const onWelcomeDone = () => setVisible(true);
    window.addEventListener("welcome-loader-done", onWelcomeDone);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
    }

    return () => window.removeEventListener("welcome-loader-done", onWelcomeDone);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const lenis = getLenis();
    scrollYRef.current = lenis ? lenis.scroll : window.scrollY;

    if (lenis) {
      lenis.scrollTo(scrollYRef.current, { immediate: true });
      lenis.stop();
    }

    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;

      const y = scrollYRef.current;
      if (lenis) {
        lenis.scrollTo(y, { immediate: true });
        lenis.start();
      } else {
        window.scrollTo(0, y);
      }
    };
  }, [open, close]);

  const onMenuWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  if (!visible) return null;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[980] cursor-default bg-black/50"
            aria-label="Close menu"
            onClick={close}
          />
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[990] flex justify-center px-3">
        <motion.div
          animate={{ height: open ? SHEET_MAX_H : 48 }}
          transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          className="pointer-events-auto flex w-full max-w-[min(100%,36rem)] flex-col overflow-hidden rounded-2xl bg-black text-white shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
          onMouseEnter={() => setMouseHover(true)}
          onMouseLeave={() => setMouseHover(false)}
        >
          <div className="flex h-12 shrink-0 items-center justify-between px-3">
            {!open ? (
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                aria-expanded={false}
                aria-controls="site-bottom-menu"
                aria-label="Open menu"
                onClick={openMenu}
              >
                <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden">
                  <motion.div
                    animate={!activeUser && !mouseHover ? { y: "100%" } : { y: 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut", delay: 0.1 }}
                    className="absolute bottom-full left-0 text-brand-accent"
                  >
                    ↑
                  </motion.div>
                  <motion.div
                    animate={mouseHover && activeUser ? { y: "100%" } : { y: 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut", delay: 0.1 }}
                    className="absolute bottom-full left-0 scale-125 text-brand-accent"
                  >
                    ✕
                  </motion.div>
                  <motion.div
                    animate={!mouseHover && activeUser ? { y: 0 } : { y: "130%" }}
                    transition={{ duration: 0.45, ease: "easeInOut", delay: 0.1 }}
                    className="relative flex h-5 w-5 items-center justify-center"
                  >
                    <MenuBrandLogo className="h-5 w-5" />
                  </motion.div>
                </div>

                <motion.div className="pointer-events-none relative hidden h-6 overflow-hidden md:block md:min-w-[200px]">
                  <motion.div
                    animate={!mouseHover && activeUser ? { y: 0 } : { y: "-100%" }}
                    transition={{ duration: 0.45, ease: "easeInOut", delay: 0.1 }}
                    className="text-sm"
                  >
                    {site.name}
                  </motion.div>
                  <motion.div
                    animate={mouseHover && activeUser ? { y: 0 } : { y: "100%" }}
                    transition={{ duration: 0.45, ease: "easeInOut", delay: 0.1 }}
                    className="absolute left-0 top-0 text-sm"
                  >
                    Open menu
                  </motion.div>
                  <motion.div
                    animate={!activeUser ? { y: 0 } : { y: "100%" }}
                    transition={{ duration: 0.45, ease: "easeInOut", delay: 0.1 }}
                    className="absolute left-0 top-0 text-sm text-slate-400"
                  >
                    Welcome back
                  </motion.div>
                </motion.div>
                <span className="pointer-events-none truncate text-sm md:hidden">{site.name}</span>
              </button>
            ) : (
              <p className="truncate text-sm font-medium text-white">{site.name}</p>
            )}

            <div className="flex shrink-0 items-center gap-2">
              {!open ? (
                <button
                  type="button"
                  className="rounded-xl bg-[#EEEEEE] px-3 py-1 text-xs font-medium text-black transition hover:bg-white"
                  aria-label="Open menu"
                  onClick={openMenu}
                >
                  Menu
                </button>
              ) : null}
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                aria-expanded={open}
                aria-controls="site-bottom-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => (open ? close() : openMenu())}
              >
                <span
                  className={`absolute h-0.5 w-4 rounded bg-white transition-transform duration-300 ${
                    open ? "rotate-45" : "-translate-y-1"
                  }`}
                />
                <span
                  className={`absolute h-0.5 w-4 rounded bg-white transition-transform duration-300 ${
                    open ? "-rotate-45" : "translate-y-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {open ? (
              <motion.div
                id="site-bottom-menu"
                key="menu-body"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-1"
                style={{ maxHeight: SHEET_MAX_H - 48 }}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-stone-800 pb-4">
                  <h2 className="text-lg font-medium md:text-xl">Navigate</h2>
                  <Link
                    href="/contact"
                    className="rounded-xl bg-[#EEEEEE] px-3 py-1 text-sm font-medium text-black"
                    onClick={close}
                  >
                    Let&apos;s talk
                  </Link>
                </div>

                <ul
                  ref={menuListRef}
                  className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
                  onWheel={onMenuWheel}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  {navLinks.map((item) => {
                    const active = isNavActive(pathname, item.href);

                    return (
                      <li
                        key={item.href}
                        className={`group relative flex w-full items-center gap-4 border-b border-stone-800 p-4 ${
                          active ? "min-h-[5.5rem]" : "h-20"
                        }`}
                      >
                        {active ? (
                          <>
                            <div
                              aria-hidden
                              className="menu-active-glow pointer-events-none absolute inset-0"
                            />
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-y-2 left-3 right-3 rounded-xl bg-[radial-gradient(ellipse_at_30%_50%,rgba(0,212,216,0.11),transparent_68%)]"
                            />
                          </>
                        ) : null}
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className="relative z-[1] flex w-full min-h-[3rem] cursor-pointer items-center gap-4"
                          onClick={close}
                        >
                          <div
                            className={`pointer-events-none flex shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
                              active
                                ? "h-16 w-16 border-brand-accent/30 bg-brand-accent/[0.09]"
                                : "h-14 w-14 border-white/10 bg-white/5 group-hover:border-brand-accent/40 group-hover:bg-white/10"
                            }`}
                          >
                            <NavIcon
                              href={item.href}
                              className={`transition-all duration-300 ${
                                active
                                  ? "h-8 w-8 text-brand-accent/90"
                                  : "h-7 w-7 text-slate-300 group-hover:text-brand-accent"
                              }`}
                            />
                          </div>
                          <span
                            className={`pointer-events-none flex-1 transition-all duration-300 ${
                              active
                                ? "text-[1.75rem] font-medium text-white"
                                : "text-2xl group-hover:translate-x-4"
                            }`}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
