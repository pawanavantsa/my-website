"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import useUserActivity from "@/hooks/useUserActivity";
import { NavIcon } from "@/components/icons/NavIcon";
import { logoSrc } from "@/lib/media";
import { navLinks, site } from "@/lib/site";

const menuItems = navLinks.filter((l) => l.href !== "/");

const SHEET_MAX_H = 480;

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mouseHover, setMouseHover] = useState(false);
  const [visible, setVisible] = useState(pathname !== "/");
  const activeUser = useUserActivity();
  const scrollYRef = useRef(0);
  const menuListRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => setOpen(false), []);

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

    scrollYRef.current = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollYRef.current);
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
                onClick={() => setOpen(true)}
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
                    className="relative h-5 w-5"
                  >
                    <Image src={logoSrc} alt="" fill className="object-contain" sizes="20px" />
                  </motion.div>
                </div>

                <motion.div className="relative hidden h-6 overflow-hidden md:block md:min-w-[200px]">
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
                <span className="truncate text-sm md:hidden">{site.name}</span>
              </button>
            ) : (
              <p className="truncate text-sm font-medium text-white">{site.name}</p>
            )}

            <div className="flex shrink-0 items-center gap-2">
              {!open ? (
                <span className="rounded-xl bg-[#EEEEEE] px-3 py-1 text-xs font-medium text-black">
                  Menu
                </span>
              ) : null}
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                aria-expanded={open}
                aria-controls="site-bottom-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => (open ? close() : setOpen(true))}
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
                  <div className="flex items-center gap-2">
                    <Link
                      href="/contact"
                      className="rounded-xl bg-[#EEEEEE] px-3 py-1 text-sm font-medium text-black"
                      onClick={close}
                    >
                      Let&apos;s talk
                    </Link>
                    <button
                      type="button"
                      className="rounded-xl border border-white/20 px-3 py-1 text-sm text-slate-300 transition hover:border-white/40 hover:text-white"
                      onClick={close}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <ul
                  ref={menuListRef}
                  className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
                  onWheel={onMenuWheel}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <li className="group flex h-16 w-full items-center gap-4 border-b border-stone-800 p-3">
                    <Link href="/" className="flex w-full items-center gap-4" onClick={close}>
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white/5">
                        <Image src={logoSrc} alt="" fill className="object-contain p-1" sizes="48px" />
                      </div>
                      <span className="text-xl transition-transform duration-300 group-hover:translate-x-3">
                        Home
                      </span>
                    </Link>
                  </li>
                  {menuItems.map((item) => (
                    <li
                      key={item.href}
                      className="group flex h-20 w-full items-center gap-4 border-b border-stone-800 p-4"
                    >
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-4"
                        onClick={close}
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-brand-accent/40 group-hover:bg-white/10">
                          <NavIcon
                            href={item.href}
                            className="h-7 w-7 text-slate-300 transition-colors duration-300 group-hover:text-brand-accent"
                          />
                        </div>
                        <span className="text-2xl transition-transform duration-300 group-hover:translate-x-4">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
