import { unsplash } from "@/lib/media";

export type ProductSlide = {
  src: string;
  alt: string;
  /** Local recordings can use video; remote Unsplash stays image. */
  kind?: "image" | "video";
};

export type Product = {
  slug: string;
  name: string;
  tag: string;
  overview: string;
  features: string[];
  accent: string;
  /** Right-panel slideshow while this product is hovered / focused. */
  hoverSlides: ProductSlide[];
};

const slide = (src: string, alt: string, kind: ProductSlide["kind"] = "image"): ProductSlide => ({
  src,
  alt,
  kind,
});

/**
 * inQ hover media — replace these with your recordings under
 * `public/products/inq/` (mp4/webm or stills) when ready.
 */
const inqPlaceholders: ProductSlide[] = [
  slide(unsplash.aiNeural, "inQ — intelligence workspace preview"),
  slide(unsplash.dataAbstract, "inQ — live insight surfaces"),
  slide(unsplash.codingDesk, "inQ — operator console preview"),
];

export const products: Product[] = [
  {
    slug: "inq",
    name: "inQ",
    tag: "Intelligent query & insight platform",
    overview:
      "inQ turns enterprise questions into instant, trusted answers — grounded in your systems, workflows, and knowledge so teams decide faster without hunting across tools.",
    features: [
      "Natural-language queries across systems",
      "Grounded answers with source citations",
      "Role-aware access to sensitive data",
      "Live dashboards & saved inquiries",
      "Workflow handoff to tickets & copilots",
      "Audit trail for every answer",
    ],
    accent: "from-brand-accent to-cyan-400",
    hoverSlides: inqPlaceholders,
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
    hoverSlides: [
      slide(unsplash.teamMeeting, "Xeroura CS — service desk collaboration"),
      slide(unsplash.heroCollaboration, "Xeroura CS — unified operations"),
      slide(unsplash.cloudServer, "Xeroura CS — platform reliability"),
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
    hoverSlides: [
      slide(unsplash.codingDesk, "LiveBot — on-screen guidance"),
      slide(unsplash.productDesign, "LiveBot — employee workflows"),
      slide(unsplash.aiNeural, "LiveBot — contextual AI assist"),
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
    hoverSlides: [
      slide(unsplash.aiNeural, "Xeroura AI — copilot canvas"),
      slide(unsplash.dataAbstract, "Xeroura AI — enterprise knowledge"),
      slide(unsplash.cloudServer, "Xeroura AI — governed deployment"),
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
    hoverSlides: [
      slide(unsplash.productDesign, "Xeroura Flow — workflow design"),
      slide(unsplash.teamMeeting, "Xeroura Flow — approvals & handoffs"),
      slide(unsplash.cloudServer, "Xeroura Flow — connected systems"),
    ],
  },
  {
    slug: "xeroura-docai",
    name: "Xeroura DocAI",
    tag: "Document intelligence at scale",
    overview:
      "Extract, classify, and summarize contracts, invoices, and operational documents—with review queues built for regulated and high-volume environments.",
    features: [
      "OCR & structured extraction",
      "Template-free learning",
      "Clause & risk highlighting",
      "Batch processing",
      "Export to downstream systems",
      "Reviewer workflows",
    ],
    accent: "from-amber-500 to-orange-400",
    hoverSlides: [
      slide(unsplash.codingDesk, "Xeroura DocAI — document intake"),
      slide(unsplash.dataAbstract, "Xeroura DocAI — extraction & review"),
      slide(unsplash.heroCollaboration, "Xeroura DocAI — team review queues"),
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
    hoverSlides: [
      slide(unsplash.dataAbstract, "Xeroura Insight — analytics surfaces"),
      slide(unsplash.aiNeural, "Xeroura Insight — decision intelligence"),
      slide(unsplash.teamMeeting, "Xeroura Insight — business narratives"),
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
    hoverSlides: [
      slide(unsplash.heroCollaboration, "Xeroura Voice — contact operations"),
      slide(unsplash.cloudServer, "Xeroura Voice — telephony stack"),
      slide(unsplash.teamMeeting, "Xeroura Voice — agent assist"),
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
    hoverSlides: [
      slide(unsplash.cloudServer, "Xeroura Guard — secure AI controls"),
      slide(unsplash.dataAbstract, "Xeroura Guard — policy monitoring"),
      slide(unsplash.codingDesk, "Xeroura Guard — audit workflows"),
    ],
  },
  {
    slug: "xeroura-teams",
    name: "Xeroura Teams",
    tag: "Delivery & ops copilot",
    overview:
      "A copilot for engineering and operations pods—sprint context, runbooks, incident history, and status updates in one place for faster delivery.",
    features: [
      "Sprint & backlog context",
      "Runbook retrieval",
      "Incident summarization",
      "Status report drafts",
      "Tool integrations (Jira, Slack)",
      "Team knowledge graph",
    ],
    accent: "from-emerald-500 to-teal-400",
    hoverSlides: [
      slide(unsplash.teamMeeting, "Xeroura Teams — delivery pods"),
      slide(unsplash.productDesign, "Xeroura Teams — sprint context"),
      slide(unsplash.codingDesk, "Xeroura Teams — ops copilots"),
    ],
  },
  {
    slug: "xeroura-connect",
    name: "Xeroura Connect",
    tag: "Integration & API orchestration",
    overview:
      "Connect SaaS, legacy APIs, and data stores with managed pipelines—so AI products and automations share a consistent, observable integration layer.",
    features: [
      "Prebuilt connectors",
      "Event-driven sync",
      "Transformation layer",
      "Retry & dead-letter handling",
      "API gateway patterns",
      "Monitoring & alerts",
    ],
    accent: "from-indigo-500 to-violet-500",
    hoverSlides: [
      slide(unsplash.cloudServer, "Xeroura Connect — integration fabric"),
      slide(unsplash.dataAbstract, "Xeroura Connect — event pipelines"),
      slide(unsplash.aiNeural, "Xeroura Connect — observable APIs"),
    ],
  },
];

/** Highlighted on the home 10+ card */
export const featuredProductNames = [
  "inQ",
  "Xeroura CS",
  "LiveBot",
  "Xeroura AI",
  "Xeroura Flow",
] as const;

export function getProductByName(name: string): Product | undefined {
  return products.find((p) => p.name === name);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
