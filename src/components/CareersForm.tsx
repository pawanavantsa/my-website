"use client";

import { useState } from "react";
import { FormInlineError } from "@/components/FormInlineError";
import {
  CAREERS_OTHER_ROLE_ID,
  careerRoleOptions,
  roleLabelForApplication,
} from "@/lib/careers-jobs";
import {
  validateEmail,
  validateLinkedIn,
  validateOptionalUrl,
  validatePhone,
  validateRequiredText,
  validateYearsExperience,
} from "@/lib/formValidation";

const initial = {
  fullName: "",
  email: "",
  phone: "",
  employer: "",
  jobTitle: "",
  specialization: "",
  yearsExperience: "",
  preferredRole: "",
  customRole: "",
  linkedin: "",
  portfolio: "",
  message: "",
};

type CareersFormProps = {
  theme?: "default" | "dark";
  selectedRoleId?: string;
  onSelectedRoleIdChange?: (roleId: string) => void;
};

export function CareersForm({
  theme = "default",
  selectedRoleId: selectedRoleIdProp,
  onSelectedRoleIdChange,
}: CareersFormProps) {
  const isDark = theme === "dark";
  const [values, setValues] = useState(initial);
  const [selectedRoleIdState, setSelectedRoleIdState] = useState(CAREERS_OTHER_ROLE_ID);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const selectedRoleId = selectedRoleIdProp ?? selectedRoleIdState;

  function setSelectedRoleId(roleId: string) {
    onSelectedRoleIdChange?.(roleId);
    if (selectedRoleIdProp === undefined) {
      setSelectedRoleIdState(roleId);
    }
  }

  function update<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("idle");

    const preferredRole = roleLabelForApplication(selectedRoleId, values.customRole);

    const checks: (string | null)[] = [
      validateRequiredText(values.fullName, "Full name", 2, 120),
      validateEmail(values.email),
      validatePhone(values.phone),
      validateRequiredText(values.employer, "Employer / organization", 2, 200),
      validateRequiredText(values.jobTitle, "Job title", 2, 120),
      validateRequiredText(values.specialization, "Specialization", 2, 200),
      validateYearsExperience(values.yearsExperience),
      selectedRoleId === CAREERS_OTHER_ROLE_ID
        ? validateRequiredText(values.customRole, "Desired role", 2, 120)
        : null,
      validateLinkedIn(values.linkedin),
      validateOptionalUrl(values.portfolio, "Portfolio / GitHub"),
    ];
    const first = checks.find(Boolean);
    if (first) {
      setError(first);
      return;
    }
    if (values.message.trim().length > 4000) {
      setError("Notes must be at most 4000 characters.");
      return;
    }
    if (!file) {
      setError("Please attach your resume.");
      return;
    }

    setStatus("loading");
    const fd = new FormData();
    Object.entries({ ...values, preferredRole }).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("resume", file);

    try {
      const res = await fetch("/api/careers", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setValues(initial);
      setFile(null);
      setFileName(null);
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  const inputClass = isDark
    ? "mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white shadow-sm outline-none transition placeholder:text-slate-500 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
    : "mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500";

  const formClass = isDark
    ? "grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
    : "grid gap-5 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-8";

  const labelClass = isDark
    ? "text-sm font-medium text-slate-300"
    : "text-sm font-medium text-slate-700 dark:text-slate-300";

  const showCustomRole = selectedRoleId === CAREERS_OTHER_ROLE_ID;

  return (
    <form id="careers-form" noValidate onSubmit={onSubmit} className={formClass}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={`${labelClass} sm:col-span-2`}>
          Role you&apos;re applying for *
          <select
            className={inputClass}
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            name="applicationRole"
          >
            {careerRoleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {showCustomRole ? (
          <label className={`${labelClass} sm:col-span-2`}>
            Desired role *
            <input
              className={inputClass}
              value={values.customRole}
              onChange={(e) => update("customRole", e.target.value)}
              name="customRole"
              placeholder="Tell us the role you have in mind"
            />
          </label>
        ) : null}
        <label className={labelClass}>
          Full name *
          <input
            className={inputClass}
            value={values.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            name="fullName"
            autoComplete="name"
          />
        </label>
        <label className={labelClass}>
          Email *
          <input
            type="email"
            className={inputClass}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            name="email"
            autoComplete="email"
          />
        </label>
        <label className={labelClass}>
          Phone *
          <input
            className={inputClass}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            name="phone"
            autoComplete="tel"
          />
        </label>
        <label className={labelClass}>
          Current employer / organization *
          <input
            className={inputClass}
            value={values.employer}
            onChange={(e) => update("employer", e.target.value)}
            name="employer"
          />
        </label>
        <label className={labelClass}>
          Current job title *
          <input
            className={inputClass}
            value={values.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
            name="jobTitle"
          />
        </label>
        <label className={labelClass}>
          Specialization / skill set *
          <input
            className={inputClass}
            value={values.specialization}
            onChange={(e) => update("specialization", e.target.value)}
            name="specialization"
          />
        </label>
        <label className={labelClass}>
          Years of experience *
          <input
            className={inputClass}
            value={values.yearsExperience}
            onChange={(e) => update("yearsExperience", e.target.value)}
            name="yearsExperience"
            placeholder="e.g. 4"
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Upload resume (PDF / DOC) *
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-brand-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-primary`}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              setFileName(f?.name ?? null);
            }}
            name="resume"
          />
          {fileName ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Selected: {fileName}</p>
          ) : null}
        </label>
        <label className={labelClass}>
          LinkedIn profile URL *
          <input
            className={inputClass}
            value={values.linkedin}
            onChange={(e) => update("linkedin", e.target.value)}
            name="linkedin"
            placeholder="https://www.linkedin.com/in/yourprofile"
          />
        </label>
        <label className={labelClass}>
          Portfolio / GitHub (optional)
          <input
            className={inputClass}
            value={values.portfolio}
            onChange={(e) => update("portfolio", e.target.value)}
            name="portfolio"
            placeholder="https://"
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Message / additional notes
          <textarea
            rows={4}
            className={`${inputClass} resize-y`}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            name="message"
          />
        </label>
      </div>

      {error ? <FormInlineError message={error} /> : null}
      {status === "success" ? (
        <p className="rounded-2xl border border-emerald-200/90 bg-emerald-50/95 px-4 py-3 text-sm font-medium text-emerald-900 shadow-sm dark:border-emerald-500/25 dark:bg-emerald-950/40 dark:text-emerald-100 dark:shadow-card">
          Thank you—your details were received. Our team will review your profile and reach out when
          there is a suitable opportunity.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-8 py-3 text-sm font-semibold text-white shadow-glow-sm transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Submitting…" : "Submit application"}
      </button>
      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500 dark:text-slate-500"}`}>
        By submitting, you agree to our{" "}
        <a
          className={`font-semibold ${isDark ? "text-brand-accent hover:text-white" : "text-brand-primary hover:text-brand-accent"}`}
          href="/privacy-policy"
        >
          Privacy Policy
        </a>{" "}
        and{" "}
        <a
          className={`font-semibold ${isDark ? "text-brand-accent hover:text-white" : "text-brand-primary hover:text-brand-accent"}`}
          href="/terms-and-conditions"
        >
          Terms &amp; Conditions
        </a>
        .
      </p>
    </form>
  );
}
