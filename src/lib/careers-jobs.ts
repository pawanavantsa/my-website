export type CareerJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  summary: string;
  responsibilities: readonly string[];
  requirements: readonly string[];
};

export const CAREERS_OTHER_ROLE_ID = "other";

export const careerJobs: CareerJob[] = [
  {
    id: "head-of-growth-marketing",
    title: "Head of Growth Marketing",
    department: "Marketing",
    location: "Hyderabad · Hybrid",
    type: "Full-time",
    experience: "5+ years",
    summary:
      "Own Xeroura’s brand narrative, demand generation, and go-to-market motion for enterprise AI products—from story to pipeline.",
    responsibilities: [
      "Define and execute integrated campaigns across digital, events, content, and partner channels.",
      "Build messaging that translates complex AI capabilities into clear value for enterprise buyers.",
      "Partner with sales on account-based programs, collateral, and launch plans for new offerings.",
      "Measure funnel performance, experiment quickly, and report on ROI to leadership.",
      "Manage agency relationships, budgets, and brand consistency across touchpoints.",
    ],
    requirements: [
      "5+ years in B2B marketing, ideally in technology, SaaS, or AI/data products.",
      "Proven track record running demand-gen programs that produce qualified enterprise leads.",
      "Strong writing and storytelling skills; comfortable owning website, case studies, and sales enablement.",
      "Experience working closely with sales and product teams in a fast-moving environment.",
      "MBA or equivalent experience is a plus; hands-on execution mindset is essential.",
    ],
  },
  {
    id: "ai-ml-engineer",
    title: "AI / ML Engineer",
    department: "Engineering",
    location: "Remote · India",
    type: "Full-time",
    experience: "2+ years",
    summary:
      "Design, build, and ship production-grade ML systems—copilots, retrieval pipelines, and model-serving for enterprise clients.",
    responsibilities: [
      "Implement and fine-tune models for NLP, speech, document intelligence, and agent workflows.",
      "Build robust data pipelines, evaluation harnesses, and observability for ML in production.",
      "Collaborate with product and client teams to translate requirements into shippable features.",
      "Optimize latency, cost, and reliability across cloud deployments.",
      "Contribute to internal platform patterns, reusable components, and engineering best practices.",
    ],
    requirements: [
      "Strong Python skills and experience with modern ML frameworks (PyTorch, Hugging Face, etc.).",
      "Hands-on work with LLMs, RAG, or classical ML in real customer or product settings.",
      "Familiarity with cloud platforms, containers, and CI/CD for ML services.",
      "Clear communication and ownership in cross-functional delivery.",
      "Bachelor’s or Master’s in CS, ML, or related field—or equivalent practical experience.",
    ],
  },
  {
    id: "ai-ml-intern",
    title: "AI / ML Intern",
    department: "Engineering",
    location: "Remote · India",
    type: "Internship",
    experience: "0–1 year",
    summary:
      "Learn by building—support research, prototyping, and production features alongside senior engineers on live Xeroura products.",
    responsibilities: [
      "Assist with data preparation, model experiments, and benchmark evaluations.",
      "Prototype features under mentorship and document findings clearly.",
      "Integrate models into APIs or internal tools with guidance from the team.",
      "Participate in code reviews, stand-ups, and sprint delivery.",
      "Present outcomes and learnings at the end of the internship.",
    ],
    requirements: [
      "Pursuing or recently completed a degree in CS, AI, Data Science, or related field.",
      "Solid Python fundamentals and curiosity about LLMs or applied ML.",
      "Familiarity with Git and willingness to learn production engineering practices.",
      "Self-starter who communicates progress and asks for help early.",
      "Minimum 3-month commitment; 6 months preferred.",
    ],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    department: "Data & Analytics",
    location: "Remote · India",
    type: "Full-time",
    experience: "3+ years",
    summary:
      "Turn messy enterprise data into decisions—analytics, experimentation, and ML insights that power Xeroura products and client outcomes.",
    responsibilities: [
      "Explore datasets, define metrics, and build models that support product and client goals.",
      "Design experiments and dashboards that stakeholders can trust and act on.",
      "Work with engineers to productionize models and monitoring for drift and quality.",
      "Partner with delivery teams on client engagements requiring custom analytics or forecasting.",
      "Document methodologies and communicate results to technical and non-technical audiences.",
    ],
    requirements: [
      "3+ years in data science, analytics, or applied ML roles.",
      "Proficiency in Python, SQL, and common ML/statistics toolkits.",
      "Experience with visualization, experimentation, or time-series/forecasting is valuable.",
      "Comfort presenting insights to product and business stakeholders.",
      "Degree in Statistics, Mathematics, CS, or equivalent experience.",
    ],
  },
  {
    id: "enterprise-sales-bd",
    title: "Enterprise Sales & Business Development Manager",
    department: "Sales",
    location: "Hyderabad · Hybrid · Travel",
    type: "Full-time",
    experience: "4+ years",
    summary:
      "Open doors with enterprises—build relationships, qualify opportunities, and bring in leads and projects for Xeroura’s AI platforms and delivery teams.",
    responsibilities: [
      "Identify and pursue target accounts across industries adopting AI and digital transformation.",
      "Run discovery calls, shape proposals, and coordinate with pre-sales and delivery on pursuits.",
      "Maintain a healthy pipeline in CRM with accurate forecasting and follow-through.",
      "Represent Xeroura at events, partner networks, and executive conversations.",
      "Gather market feedback to inform product positioning and GTM priorities.",
    ],
    requirements: [
      "4+ years in B2B sales or business development, preferably selling technology or services.",
      "Track record of sourcing and closing enterprise leads or mid-to-large deals.",
      "Strong verbal and written communication; comfortable with C-level and IT stakeholders.",
      "Organized, persistent, and motivated by building long-term client relationships.",
      "Experience in AI, cloud, or software services is a strong plus.",
    ],
  },
];

export const careerRoleOptions = [
  ...careerJobs.map((job) => ({ value: job.id, label: job.title })),
  { value: CAREERS_OTHER_ROLE_ID, label: "Other role / open application" },
];

export function getCareerJob(id: string) {
  return careerJobs.find((job) => job.id === id);
}

export function roleLabelForApplication(roleId: string, customRole?: string) {
  if (roleId === CAREERS_OTHER_ROLE_ID) {
    return customRole?.trim() || "Other role / open application";
  }
  return getCareerJob(roleId)?.title ?? roleId;
}
