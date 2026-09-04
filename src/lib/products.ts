export type ProductSlide = {
  src: string;
  alt: string;
  /** Local recordings can use video; remote Unsplash stays image. */
  kind?: "image" | "video";
};

/** Which device poses the product showcase should use. */
export type ProductPlatforms = "web" | "mobile" | "both";

export type Product = {
  slug: string;
  name: string;
  tag: string;
  overview: string;
  features: string[];
  accent: string;
  platforms: ProductPlatforms;
  /** Screen art for the laptop bezel (web / desktop UI). */
  webScreen?: ProductSlide;
  /** Screen art for the phone bezel (mobile UI only). */
  mobileScreen?: ProductSlide;
  /** Fallback / legacy single preview (used if a device screen is missing). */
  hoverSlides: ProductSlide[];
};

const slide = (
  src: string,
  alt: string,
  kind: ProductSlide["kind"] = "image",
): ProductSlide => ({
  src,
  alt,
  kind,
});

export const products: Product[] = [
  {
    slug: "inq",
    name: "inQ",
    tag: "School OS for modern campuses",
    overview:
      "inQ is the operating system for schools — admissions, attendance, fees, academics, and parent communication in one grounded workspace for admins, teachers, and families.",
    features: [
      "Unified school dashboard & ops pulse",
      "Attendance, marks, and homework surfaces",
      "Admissions pipeline & fee collection",
      "Parent / student mobile experience",
      "Notices, calendar, and activity feeds",
      "Role-aware access across the campus",
    ],
    accent: "from-brand-accent to-cyan-400",
    platforms: "both",
    webScreen: slide("/products/inq/web.jpg", "inQ School OS — web dashboard"),
    mobileScreen: slide(
      "/products/inq/mobile.jpg",
      "inQ — student mobile home",
    ),
    hoverSlides: [
      slide("/products/inq/web.jpg", "inQ School OS — web dashboard"),
      slide("/products/inq/mobile.jpg", "inQ — student mobile home"),
    ],
  },
  {
    slug: "xeroura-cs",
    name: "Xeroura CS",
    tag: "Unified SaaS for customer services (IT & non-IT)",
    overview:
      "Automate customer service operations across IT and non-IT sectors. AI bots respond to tickets, resolve issues, and escalate only when human intervention is required.",
    features: [
      "AI ticket response system",
      "Smart escalation engine",
      "Multi-industry support",
      "Unified dashboard",
      "Self-service portal",
      "Analytics & reporting",
    ],
    accent: "from-brand-primary to-indigo-500",
    platforms: "web",
    webScreen: slide(
      "/products/xeroura-cs/web.jpg",
      "Xeroura CS — service desk dashboard",
    ),
    hoverSlides: [
      slide(
        "/products/xeroura-cs/web.jpg",
        "Xeroura CS — service desk dashboard",
      ),
    ],
  },
  {
    slug: "livebot",
    name: "LiveBot",
    tag: "On-screen AI assistance for employees",
    overview:
      "An AI-powered on-screen assistant that helps employees find solutions in real time—guidance, troubleshooting, and workflow support without breaking focus.",
    features: [
      "On-screen AI chat window",
      "Instant problem resolution",
      "Context-aware suggestions",
      "Internal knowledge base integration",
      "Reduced dependency on senior staff",
      "Productivity boost across teams",
    ],
    accent: "from-brand-accent to-cyan-300",
    platforms: "web",
    webScreen: slide(
      "/products/livebot/web.jpg",
      "LiveBot — context-aware on-screen assist",
    ),
    hoverSlides: [
      slide(
        "/products/livebot/web.jpg",
        "LiveBot — context-aware on-screen assist",
      ),
    ],
  },
  {
    slug: "focusmate",
    name: "FocusMate",
    tag: "Mobile focus companion for deep work",
    overview:
      "FocusMate helps people protect attention on the go — timed focus sessions, gentle nudges, and a calm mobile ritual that keeps priorities clear without another desktop distraction.",
    features: [
      "Session timers & focus modes",
      "Smart break reminders",
      "Priority queue for the day",
      "Distraction blocking cues",
      "Streaks & gentle accountability",
      "Works entirely on mobile",
    ],
    accent: "from-violet-500 to-fuchsia-400",
    platforms: "mobile",
    mobileScreen: slide(
      "/products/focusmate/mobile.jpg",
      "FocusMate — deep focus home",
    ),
    hoverSlides: [
      slide("/products/focusmate/mobile.jpg", "FocusMate — deep focus home"),
    ],
  },
  {
    slug: "reachai",
    name: "ReachAI",
    tag: "Outreach intelligence for web & mobile",
    overview:
      "ReachAI helps teams plan, personalize, and measure outreach across channels — a shared web workspace for ops plus a mobile companion for reps in the field.",
    features: [
      "Campaign workspace on web",
      "Field companion on mobile",
      "Personalized message assist",
      "Reply & sentiment signals",
      "Pipeline-aware follow-ups",
      "Shared analytics across devices",
    ],
    accent: "from-sky-500 to-brand-accent",
    platforms: "both",
    webScreen: slide(
      "/products/reachai/web.jpg",
      "ReachAI — outreach workspace",
    ),
    mobileScreen: slide(
      "/products/reachai/mobile.jpg",
      "ReachAI — field companion",
    ),
    hoverSlides: [
      slide("/products/reachai/web.jpg", "ReachAI — outreach workspace"),
      slide("/products/reachai/mobile.jpg", "ReachAI — field companion"),
    ],
  },
  {
    slug: "xeroura-ai",
    name: "Xeroura AI",
    tag: "Enterprise copilot & agent platform",
    overview:
      "Design, deploy, and govern AI copilots and agents on your data—with guardrails, observability, and integration into the tools your teams already use.",
    features: [
      "Custom copilot builder",
      "RAG & enterprise knowledge",
      "Role-based access control",
      "Prompt & model governance",
      "Usage analytics",
      "Multi-channel deployment",
    ],
    accent: "from-violet-500 to-brand-primary",
    platforms: "web",
    webScreen: slide(
      "/products/xeroura-ai/web.jpg",
      "Xeroura AI — copilot studio",
    ),
    hoverSlides: [
      slide("/products/xeroura-ai/web.jpg", "Xeroura AI — copilot studio"),
    ],
  },
  {
    slug: "xeroura-flow",
    name: "Xeroura Flow",
    tag: "Intelligent workflow automation",
    overview:
      "Orchestrate approvals, handoffs, and system actions with AI-assisted routing—so repetitive processes run reliably while exceptions get the right attention.",
    features: [
      "Visual workflow designer",
      "AI routing & classification",
      "SLA & escalation rules",
      "ERP/CRM connectors",
      "Audit trails",
      "Human-in-the-loop steps",
    ],
    accent: "from-brand-primary to-brand-accent",
    platforms: "web",
    webScreen: slide(
      "/products/xeroura-flow/web.jpg",
      "Xeroura Flow — workflow designer",
    ),
    hoverSlides: [
      slide(
        "/products/xeroura-flow/web.jpg",
        "Xeroura Flow — workflow designer",
      ),
    ],
  },
  {
    slug: "xeroura-insight",
    name: "Xeroura Insight",
    tag: "Analytics & decision intelligence",
    overview:
      "Turn operational data into narratives, forecasts, and dashboards—with natural-language queries so business users get answers without waiting on analysts.",
    features: [
      "NL query interface",
      "Automated reporting",
      "Anomaly detection",
      "KPI workspaces",
      "Embedded analytics",
      "Data warehouse connectors",
    ],
    accent: "from-cyan-500 to-blue-600",
    platforms: "web",
    webScreen: slide(
      "/products/xeroura-insight/web.jpg",
      "Xeroura Insight — analytics workspace",
    ),
    hoverSlides: [
      slide(
        "/products/xeroura-insight/web.jpg",
        "Xeroura Insight — analytics workspace",
      ),
    ],
  },
  {
    slug: "xeroura-voice",
    name: "Xeroura Voice",
    tag: "Voice AI for service & sales",
    overview:
      "Deploy voice bots for IVR, outbound campaigns, and agent assist—multilingual, low-latency, and integrated with your telephony and CRM stack.",
    features: [
      "IVR & call deflection",
      "Real-time transcription",
      "Agent assist suggestions",
      "Sentiment signals",
      "Campaign analytics",
      "Telephony integrations",
    ],
    accent: "from-rose-500 to-pink-500",
    platforms: "both",
    webScreen: slide(
      "/products/xeroura-voice/web.jpg",
      "Xeroura Voice — live call floor",
    ),
    mobileScreen: slide(
      "/products/xeroura-voice/mobile.jpg",
      "Xeroura Voice — mobile companion",
    ),
    hoverSlides: [
      slide("/products/xeroura-voice/web.jpg", "Xeroura Voice — live call floor"),
      slide(
        "/products/xeroura-voice/mobile.jpg",
        "Xeroura Voice — mobile companion",
      ),
    ],
  },
  {
    slug: "xeroura-guard",
    name: "Xeroura Guard",
    tag: "AI security & compliance",
    overview:
      "Monitor prompts, outputs, and model usage for policy violations, PII leakage, and drift—so AI rollouts stay auditable and enterprise-safe.",
    features: [
      "Policy enforcement",
      "PII redaction",
      "Audit logging",
      "Risk scoring",
      "Alerting & dashboards",
      "Compliance report packs",
    ],
    accent: "from-slate-500 to-brand-navy",
    platforms: "web",
    webScreen: slide(
      "/products/xeroura-guard/web.jpg",
      "Xeroura Guard — security console",
    ),
    hoverSlides: [
      slide(
        "/products/xeroura-guard/web.jpg",
        "Xeroura Guard — security console",
      ),
    ],
  },
];

/** Highlighted on the home 10+ card */
export const featuredProductNames = [
  "inQ",
  "Xeroura CS",
  "LiveBot",
  "FocusMate",
  "ReachAI",
] as const;

export function getProductByName(name: string): Product | undefined {
  return products.find((p) => p.name === name);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productHasWeb(product: Product): boolean {
  return product.platforms === "web" || product.platforms === "both";
}

export function productHasMobile(product: Product): boolean {
  return product.platforms === "mobile" || product.platforms === "both";
}
