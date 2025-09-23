export type TemplateCategoryId = "guidance" | "workflow" | "agent" | "api"
export type TemplateIconName =
  | "brain"
  | "workflow"
  | "bot"
  | "globe"
  | "sparkles"
  | "trendingUp"
  | "target"
  | "layers"

export interface TemplateCategory {
  id: TemplateCategoryId
  title: string
  description: string
  totalTemplates: number
  iconName: TemplateIconName
}

export interface TemplateCard {
  id: string
  title: string
  summary: string
  categoryId: TemplateCategoryId
  difficulty: "starter" | "intermediate" | "advanced"
  downloads: number
  rating: number
  updatedAt: string
  tags: string[]
  heroColor: string
}

export interface TemplateCollection {
  id: string
  title: string
  description: string
  iconName: TemplateIconName
  templateIds: string[]
}

export interface TemplatesData {
  categories: TemplateCategory[]
  featured: TemplateCard[]
  newest: TemplateCard[]
  collections: TemplateCollection[]
}

export interface TemplatesMeta {
  environment: "demo" | "live"
  generatedAt: string
}

export interface TemplatesApiResponse {
  data: TemplatesData
  meta: TemplatesMeta
}

const templateCategories: TemplateCategory[] = [
  {
    id: "guidance",
    title: "Guidance templates",
    description: "Narrative dashboards and executive briefing packs",
    totalTemplates: 8,
    iconName: "brain"
  },
  {
    id: "workflow",
    title: "Workflow templates",
    description: "Pre-orchestrated multi-agent flows",
    totalTemplates: 12,
    iconName: "workflow"
  },
  {
    id: "agent",
    title: "Agent templates",
    description: "Specialist agent configurations ready to deploy",
    totalTemplates: 9,
    iconName: "bot"
  },
  {
    id: "api",
    title: "API blueprints",
    description: "Developer-first API and integration starters",
    totalTemplates: 11,
    iconName: "globe"
  }
]

const featuredTemplates: TemplateCard[] = [
  {
    id: "linkedin-strategy-dashboard",
    title: "LinkedIn strategy dashboard",
    summary: "Showcase networking pulse, ambition tracking, and outreach sequencing in one view.",
    categoryId: "guidance",
    difficulty: "intermediate",
    downloads: 1247,
    rating: 4.9,
    updatedAt: "2025-09-10",
    tags: ["linkedin", "networking", "executive"],
    heroColor: "from-blue-500 to-indigo-500"
  },
  {
    id: "agent-portfolio-brief",
    title: "Agent portfolio brief",
    summary: "Summarise every agent, capability, and routing rule for investor updates.",
    categoryId: "guidance",
    difficulty: "starter",
    downloads: 986,
    rating: 4.7,
    updatedAt: "2025-08-28",
    tags: ["report", "agents", "fundraising"],
    heroColor: "from-purple-500 to-slate-600"
  },
  {
    id: "deal-desk-command",
    title: "Deal desk command center",
    summary: "Track warm introductions, negotiate offers, and orchestrate follow-up like a newsroom.",
    categoryId: "workflow",
    difficulty: "advanced",
    downloads: 612,
    rating: 4.8,
    updatedAt: "2025-09-05",
    tags: ["sales", "deal", "automation"],
    heroColor: "from-emerald-500 to-teal-500"
  }
]

const newestTemplates: TemplateCard[] = [
  {
    id: "investor-fast-lane",
    title: "Investor fast lane workflow",
    summary: "Qualify investor fit, draft updates, and schedule follow-ups automatically.",
    categoryId: "workflow",
    difficulty: "intermediate",
    downloads: 432,
    rating: 4.6,
    updatedAt: "2025-09-12",
    tags: ["investor", "automation"],
    heroColor: "from-amber-500 to-orange-500"
  },
  {
    id: "ai-ops-agent",
    title: "AI ops agent kit",
    summary: "Provision an operational agent with logging, alerts, and audit prompts.",
    categoryId: "agent",
    difficulty: "advanced",
    downloads: 389,
    rating: 4.8,
    updatedAt: "2025-09-11",
    tags: ["operations", "monitoring"],
    heroColor: "from-slate-600 to-slate-900"
  },
  {
    id: "integration-blueprint",
    title: "Integration blueprint",
    summary: "Document your API surface with auth patterns, sample requests, and webhook flows.",
    categoryId: "api",
    difficulty: "starter",
    downloads: 541,
    rating: 4.5,
    updatedAt: "2025-09-09",
    tags: ["api", "devrel", "docs"],
    heroColor: "from-cyan-500 to-blue-500"
  }
]

const templateCollections: TemplateCollection[] = [
  {
    id: "demo-ready",
    title: "Demo ready set",
    description: "Everything you need for investor or partner walkthroughs.",
    iconName: "sparkles",
    templateIds: [
      "linkedin-strategy-dashboard",
      "agent-portfolio-brief",
      "integration-blueprint"
    ]
  },
  {
    id: "growth-engine",
    title: "Growth engine",
    description: "Blend workflows and agents that keep new business flowing.",
    iconName: "trendingUp",
    templateIds: [
      "deal-desk-command",
      "investor-fast-lane",
      "ai-ops-agent"
    ]
  },
  {
    id: "playbook-starter",
    title: "Playbook starter",
    description: "Curated starter templates for teams adopting DefConect.",
    iconName: "layers",
    templateIds: [
      "agent-portfolio-brief",
      "integration-blueprint"
    ]
  },
  {
    id: "leadership-suite",
    title: "Leadership suite",
    description: "Keep executives updated with the latest narrative dashboards.",
    iconName: "target",
    templateIds: [
      "linkedin-strategy-dashboard",
      "deal-desk-command"
    ]
  }
]

export const defaultTemplatesData: TemplatesData = {
  categories: templateCategories,
  featured: featuredTemplates,
  newest: newestTemplates,
  collections: templateCollections
}

export const defaultTemplatesMeta: TemplatesMeta = {
  environment: "demo",
  generatedAt: new Date().toISOString()
}

export const defaultTemplatesResponse: TemplatesApiResponse = {
  data: defaultTemplatesData,
  meta: defaultTemplatesMeta
}
