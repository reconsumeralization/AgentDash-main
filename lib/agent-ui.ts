import type { LucideIcon } from "lucide-react"
import {
  Sparkles,
  LineChart,
  Target,
  Bot,
  Network,
  Database,
  ClipboardCheck,
  Rocket,
  Lightbulb
} from "lucide-react"

export interface ProfileHighlight {
  label: string
  value: string
  icon: LucideIcon
}

export interface MetricHighlight {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
}

export interface ChecklistItem {
  title: string
  description: string
  badge?: string
  icon?: LucideIcon
}

export interface DataModelDescriptor {
  name: string
  detail: string
}

export interface ConversationHighlight {
  id: string
  quote: string
  speaker: string
  impact: string
  timestamp: string
  category: "decision" | "insight" | "action"
}

export interface MoodPulsePoint {
  id: string
  label: string
  intensity: number // value between 0 and 1
  timestamp: string
  tone: "calm" | "optimistic" | "focused" | "urgent" | "celebratory"
  summary: string
}

export interface DashboardData {
  profileHighlights: ProfileHighlight[]
  metricHighlights: MetricHighlight[]
  demoChecklist: ChecklistItem[]
  dataModelTables: DataModelDescriptor[]
  conversationHighlights: ConversationHighlight[]
  moodPulse: MoodPulsePoint[]
}

export interface DashboardMeta {
  environment: "demo" | "live"
  generatedAt: string
}

export interface DashboardApiResponse {
  data: DashboardData
  meta: DashboardMeta
}

export const defaultDashboardData: DashboardData = {
  profileHighlights: [
    {
      label: "Current Mission",
      value: "Launch the AI partner marketplace",
      icon: Sparkles
    },
    {
      label: "Capital Focus",
      value: "Series A readiness sprint",
      icon: LineChart
    },
    {
      label: "Relationship Lens",
      value: "Activate 12 high-intent intros",
      icon: Target
    }
  ],
  metricHighlights: [
    {
      title: "Active AI agents",
      value: "4 online",
      subtitle: "Context, research, expert and relationship intelligence",
      icon: Bot
    },
    {
      title: "Tribe pulse",
      value: "12 warm matches",
      subtitle: "New intros sourced from aspiration graph",
      icon: Network
    },
    {
      title: "Data model health",
      value: "Schema v1.0",
      subtitle: "Supabase tables plus RLS ready for demo",
      icon: Database
    }
  ],
  demoChecklist: [
    {
      title: "npm run demo-seed",
      description: "Preload aspirations and conversation memory for the walkthrough.",
      badge: "Spotlight",
      icon: ClipboardCheck
    },
    {
      title: "GET /api/context",
      description: "Show how the chat remembers strategic themes across sessions.",
      badge: "Spotlight",
      icon: Rocket
    },
    {
      title: "POST /api/aspirations",
      description: "Capture a fresh goal live and watch orchestrated suggestions update.",
      badge: "Spotlight",
      icon: Lightbulb
    }
  ],
  dataModelTables: [
    { name: "users", detail: "Clerk identity and professional metadata" },
    { name: "aspirations", detail: "Future-state goals powering matches" },
    { name: "tribes", detail: "Communities aligned on trajectory" },
    { name: "connections", detail: "Graph of meaningful introductions" },
    { name: "agents", detail: "Orchestrated AI roles and capabilities" },
    { name: "conversation_context", detail: "Long-term memory for chat" }
  ],
  conversationHighlights: [
    {
      id: "highlight-1",
      quote: "Let's spin up the partner marketplace beta with three flagship AI vendors.",
      speaker: "Brian Defiant",
      impact: "Accelerates partner pipeline",
      timestamp: "09:12",
      category: "decision"
    },
    {
      id: "highlight-2",
      quote: "I can draft the investor readiness brief by Friday with fresh traction metrics.",
      speaker: "Investor Agent",
      impact: "Keeps fundraising momentum",
      timestamp: "13:47",
      category: "action"
    },
    {
      id: "highlight-3",
      quote: "Sentiment is cresting - now is the window to request intros from the Defense Cohort.",
      speaker: "Relationship Intelligence Agent",
      impact: "Unlocks new warm introductions",
      timestamp: "17:21",
      category: "insight"
    }
  ],
  moodPulse: [
    {
      id: "pulse-1",
      label: "Kickoff",
      intensity: 0.35,
      timestamp: "00:05",
      tone: "calm",
      summary: "Briefing objectives and success metrics."
    },
    {
      id: "pulse-2",
      label: "Strategy Lock",
      intensity: 0.62,
      timestamp: "09:10",
      tone: "focused",
      summary: "Defined partner marketplace north star."
    },
    {
      id: "pulse-3",
      label: "Momentum Spike",
      intensity: 0.85,
      timestamp: "13:40",
      tone: "optimistic",
      summary: "Investor agent commits to deliverables."
    },
    {
      id: "pulse-4",
      label: "Climactic Decision",
      intensity: 0.94,
      timestamp: "17:20",
      tone: "urgent",
      summary: "Queued outreach blitz to top-tier intros."
    },
    {
      id: "pulse-5",
      label: "Wrap",
      intensity: 0.55,
      timestamp: "22:00",
      tone: "celebratory",
      summary: "Confirmed follow-up cadence and next demo run."
    }
  ]
}

export const defaultDashboardMeta: DashboardMeta = {
  environment: "demo",
  generatedAt: new Date().toISOString()
}

export const defaultDashboardResponse: DashboardApiResponse = {
  data: defaultDashboardData,
  meta: defaultDashboardMeta
}

export type MoodToneColorMap = Record<MoodPulsePoint["tone"], string>

export const moodToneColors: MoodToneColorMap = {
  calm: "bg-slate-200",
  optimistic: "bg-emerald-200",
  focused: "bg-sky-200",
  urgent: "bg-amber-200",
  celebratory: "bg-indigo-200"
}

export const highlightCategoryAccent: Record<ConversationHighlight["category"], string> = {
  decision: "text-indigo-600",
  insight: "text-sky-600",
  action: "text-emerald-600"
}

export const highlightCategoryPill: Record<ConversationHighlight["category"], string> = {
  decision: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  insight: "bg-sky-50 text-sky-600 border border-sky-100",
  action: "bg-emerald-50 text-emerald-600 border border-emerald-100"
}

// Export individual arrays for backward compatibility
export const profileHighlights = defaultDashboardData.profileHighlights
export const metricHighlights = defaultDashboardData.metricHighlights
export const demoChecklist = defaultDashboardData.demoChecklist
export const dataModelTables = defaultDashboardData.dataModelTables
export const conversationHighlights = defaultDashboardData.conversationHighlights
export const moodPulse = defaultDashboardData.moodPulse
