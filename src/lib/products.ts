export type Product = {
  slug: string;
  name: string;
  tag: string;
  overview: string;
  features: string[];
  accent: string;
};

export const products: Product[] = [
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
  },
];

/** Highlighted on the home 10+ card */
export const featuredProductNames = [
  "Xeroura CS",
  "LiveBot",
  "Xeroura AI",
  "Xeroura Flow",
  "Xeroura DocAI",
] as const;

export function getProductByName(name: string): Product | undefined {
  return products.find((p) => p.name === name);
}
