"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { infinityLogo } from "@/lib/media";
import { mailtoHref, site } from "@/lib/site";

export function LandingFooter() {
  const footerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".landing-footer-block", {
        y: 28,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 82%",
          once: true,
          toggleActions: "play none none none",
        },
      });

      gsap.from(".landing-footer-logo", {
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".landing-footer-logo",
          start: "top 90%",
          once: true,
          toggleActions: "play none none none",
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative z-[6] mt-16 flex h-[90vh] flex-col bg-[#eeeeee] px-6 pb-10 pt-10 sm:h-[70vh] md:h-[100vh]"
    >
      <div className="landing-footer-top mx-auto flex flex-col gap-10 text-sm text-[#666] md:mt-10 md:w-7/10 md:flex-row md:justify-between">
        <div className="landing-footer-block">
          <p className="font-medium text-black">Get in touch</p>
          <a
            href={mailtoHref()}
            className="mt-2 inline-block text-base font-semibold text-brand-primary underline decoration-brand-primary/50 underline-offset-4 transition hover:text-brand-accent hover:decoration-brand-accent"
          >
            {site.email}
          </a>
        </div>

        <div className="landing-footer-block">
          <p className="font-medium text-black">Address</p>
          {site.address.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="landing-footer-block">
          <p className="font-medium text-black">Ready to build with us?</p>
          <Link
            href="/contact"
            className="mt-2 inline-block text-base font-semibold text-brand-primary underline decoration-brand-primary/50 underline-offset-4 transition hover:text-brand-accent hover:decoration-brand-accent"
          >
            Let&apos;s talk
          </Link>
        </div>
      </div>

      <div className="landing-footer-logo flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <Image
          src={infinityLogo}
          alt="Xeroura"
          width={864}
          height={466}
          className="h-auto w-full max-w-[220px] object-contain will-change-transform sm:max-w-[280px] md:max-w-[340px]"
          sizes="(max-width: 640px) 220px, (max-width: 768px) 280px, 340px"
          priority={false}
        />
        <div className="text-center text-xs leading-relaxed text-[#888] sm:text-sm">
          <p>
            <span className="font-medium text-[#666]">CIN:</span> {site.cin}
          </p>
          <p className="mt-1">
            <span className="font-medium text-[#666]">GSTIN:</span> {site.gstin}
          </p>
        </div>
      </div>
    </footer>
  );
}
