"use client";

import { useState } from "react";
import { CareersForm } from "@/components/CareersForm";
import { Reveal } from "@/components/Reveal";
import { ip } from "@/lib/inner-page";
import {
  CAREERS_OTHER_ROLE_ID,
  careerJobs,
  type CareerJob,
} from "@/lib/careers-jobs";

function JobCard({
  job,
  expanded,
  onToggle,
  onApply,
}: {
  job: CareerJob;
  expanded: boolean;
  onToggle: () => void;
  onApply: () => void;
}) {
  return (
    <article className={`${ip.card} overflow-hidden transition-colors hover:border-white/20`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-accent">
              {job.department}
            </span>
            <span className="text-xs text-slate-500">{job.type}</span>
          </div>
          <h2 className="mt-3 font-display text-xl font-semibold text-white sm:text-2xl">{job.title}</h2>
          <p className="mt-2 text-sm text-slate-400">
            {job.location} · {job.experience}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{job.summary}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-brand-accent/40 hover:bg-white/5"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition hover:shadow-glow"
          >
            Apply
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
          <div>
            <h3 className={ip.h3}>What you&apos;ll do</h3>
            <ul className="mt-3 space-y-2">
              {job.responsibilities.map((item) => (
                <li key={item} className={`${ip.body} flex gap-2`}>
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-accent" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={ip.h3}>What we&apos;re looking for</h3>
            <ul className="mt-3 space-y-2">
              {job.requirements.map((item) => (
                <li key={item} className={`${ip.body} flex gap-2`}>
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-accent" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function CareersPageContent() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(careerJobs[0]?.id ?? CAREERS_OTHER_ROLE_ID);

  function scrollToForm(roleId: string) {
    setSelectedRoleId(roleId);
    window.requestAnimationFrame(() => {
      document.getElementById("careers-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <section className={ip.section}>
        <div className={`${ip.container} relative`}>
          <div className="pointer-events-none absolute inset-0 grid-glow opacity-20" />
          <Reveal className="relative">
            <p className={ip.eyebrow}>Careers</p>
            <h1 className={ip.h1}>Build enterprise AI with us</h1>
            <p className={ip.lead}>
              We&apos;re hiring across marketing, engineering, data, and sales. Explore open roles
              below—or tell us how you&apos;d like to contribute if you don&apos;t see a perfect fit.
            </p>
          </Reveal>
        </div>
      </section>

      <section className={ip.sectionAlt}>
        <div className={`${ip.container} space-y-6`}>
          <Reveal>
            <h2 className={ip.h2}>Open roles</h2>
            <p className={`${ip.bodyLg} mt-2 max-w-2xl`}>
              {careerJobs.length} open positions—engineering and data roles are remote across India;
              other teams are based in Hyderabad with hybrid options.
            </p>
          </Reveal>

          <div className="space-y-4">
            {careerJobs.map((job, index) => (
              <Reveal key={job.id} delayMs={index * 60}>
                <JobCard
                  job={job}
                  expanded={expandedId === job.id}
                  onToggle={() => setExpandedId((current) => (current === job.id ? null : job.id))}
                  onApply={() => scrollToForm(job.id)}
                />
              </Reveal>
            ))}
          </div>

          <Reveal delayMs={careerJobs.length * 60}>
            <article className={`${ip.card} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
              <div>
                <h2 className={ip.h3}>Interested in working with us?</h2>
                <p className={`${ip.body} mt-2 max-w-xl`}>
                  Don&apos;t see your role listed? Apply for other opportunities and tell us the
                  position you&apos;re aiming for—we review every profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => scrollToForm(CAREERS_OTHER_ROLE_ID)}
                className="shrink-0 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-brand-accent/40 hover:bg-white/5"
              >
                Apply for other roles
              </button>
            </article>
          </Reveal>
        </div>
      </section>

      <section className={`${ip.section} border-b-0`} id="apply">
        <div className={`${ip.container} max-w-3xl`}>
          <Reveal>
            <h2 className={ip.h2}>Submit your application</h2>
            <p className={`${ip.bodyLg} mt-2`}>
              The selected role carries through from the listing above. You can change it in the
              dropdown before you submit.
            </p>
            <div className="mt-8">
              <CareersForm
                theme="dark"
                selectedRoleId={selectedRoleId}
                onSelectedRoleIdChange={setSelectedRoleId}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
