"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ImageSlider } from "@/components/landing/ImageSlider";

const bioText = `Engineers, designers, and AI specialists. We build copilots, platforms, and enterprise systems that ship with clarity — from strategy through production. Our teams partner on discovery, architecture, implementation, and long-term operations so outcomes stay measurable after launch.`;

const focusAreas = [
  "AI-native product engineering",
  "Cloud & data modernization",
  "Workflow automation at scale",
  "Dedicated delivery pods",
];

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".about-label", {
        opacity: 0,
        y: 28,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 72%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".about-copy", {
        opacity: 0,
        y: 36,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 68%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".about-pill", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".about-pills",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={containerRef} className="min-h-screen px-4 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="about-label text-sm font-semibold uppercase tracking-[0.22em] text-[#666]">
              About
            </p>
            <h2 className="about-label mt-3 text-3xl font-medium tracking-tight text-black lg:text-4xl">
              Who we are
            </h2>
          </div>

          <div className="lg:col-span-8">
            <p className="about-copy text-2xl font-normal leading-[1.35] tracking-tight text-black sm:text-3xl lg:text-[2rem] lg:leading-[1.3]">
              {bioText}
            </p>
          </div>
        </div>

        <ul className="about-pills mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2 md:mt-12 md:gap-3">
          {focusAreas.map((area) => (
            <li
              key={area}
              className="about-pill rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black"
            >
              {area}
            </li>
          ))}
        </ul>

        <ImageSlider />
      </div>
    </section>
  );
}
