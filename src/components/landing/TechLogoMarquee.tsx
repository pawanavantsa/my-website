"use client";

import { technologyLogos, techLogoUrl } from "@/lib/tech-logos";

function LogoStrip({ stripId, hidden }: { stripId: string; hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-x-6 pr-6 sm:gap-x-7 md:gap-x-8"
    >
      {technologyLogos.map((tech) => (
        <li
          key={`${stripId}-${tech.slug}`}
          className="group flex w-20 shrink-0 flex-col items-center gap-2 sm:w-[5.25rem]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={techLogoUrl(tech.slug)}
            alt={tech.name}
            width={40}
            height={40}
            className="h-8 w-auto max-w-[5.5rem] object-contain opacity-[0.42] grayscale transition duration-300 group-hover:opacity-90 group-hover:grayscale-0 sm:h-9"
            loading="lazy"
            draggable={false}
          />
          <span className="max-w-full truncate text-center text-[10px] font-medium uppercase tracking-wider text-[#999] transition group-hover:text-[#444] sm:text-[11px]">
            {tech.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TechLogoMarquee() {
  return (
    <div className="relative mt-6 w-full overflow-hidden py-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#eeeeee] via-[#eeeeee]/90 to-transparent sm:w-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#eeeeee] via-[#eeeeee]/90 to-transparent sm:w-20"
      />

      <div className="tech-marquee-track flex w-max">
        <LogoStrip stripId="a" />
        <LogoStrip stripId="b" hidden />
      </div>
    </div>
  );
}
