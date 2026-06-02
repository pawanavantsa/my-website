"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { infinityLogo } from "@/lib/media";
import { site } from "@/lib/site";

export function LandingFooter() {
  const footerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 75%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(".landing-footer-top > div, .landing-footer-top a", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.15,
      });

      tl.from(
        ".landing-footer-logo",
        {
          y: 80,
          opacity: 0,
          scale: 0.92,
          duration: 0.85,
          ease: "power4.out",
        },
        "-=0.3"
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative z-[6] mt-16 flex h-[90vh] flex-col bg-[#eeeeee] px-6 pb-10 pt-10 sm:h-[70vh] md:h-[100vh]"
    >
      <div className="landing-footer-top mx-auto flex flex-col gap-10 text-sm text-[#666] md:mt-10 md:w-7/10 md:flex-row md:justify-between">
        <div>
          <p className="font-medium text-black">General Questions</p>
          <p>{site.email}</p>
          <p className="mt-4 font-medium text-black">Business Enquiries</p>
          <p>{site.email}</p>
        </div>

        <div>
          <p className="font-medium text-black">Address</p>
          {site.address.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div>
          <p>Ready to build with us?</p>
          <a href="/contact" className="font-semibold text-black underline">
            Let&apos;s talk
          </a>
        </div>
      </div>

      <div className="landing-footer-logo flex flex-1 items-center justify-center px-4">
        <Image
          src={infinityLogo}
          alt="Xeroura"
          width={864}
          height={466}
          className="h-auto w-full max-w-[220px] object-contain sm:max-w-[280px] md:max-w-[340px]"
          sizes="(max-width: 640px) 220px, (max-width: 768px) 280px, 340px"
          priority={false}
        />
      </div>
    </footer>
  );
}
