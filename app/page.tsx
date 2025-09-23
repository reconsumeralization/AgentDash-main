"use client"

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib"
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Command,
  Globe,
  Layers,
  LineChart,
  Lock,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow
} from "lucide-react"

const stats = [
  { label: 'Enterprise Workspaces Deployed', value: '28', subtext: 'Across security, networking, and operations' },
  { label: 'Managed Integrations', value: '40+', subtext: 'LinkedIn-first with multi-platform reach' },
  { label: 'Automated Flows', value: '120+', subtext: 'Prebuilt orchestration blueprints' },
  { label: 'Active Agents', value: '65', subtext: 'Adaptive, policy-aware collaboration' }
]

const experienceHubs = [
  {
    title: 'Social Media Command Center',
    description: 'Coordinate LinkedIn, Twitter, and omnichannel presence with AI copilots.',
    href: '/social-media',
    icon: Globe,
    tag: 'Live'
  },
  {
    title: 'Agentic Collaboration Studio',
    description: 'Deploy and monitor specialized AI teams aligned to enterprise goals.',
    href: '/agents',
    icon: Users,
    tag: 'Multi-agent'
  },
  {
    title: 'Context Surfacer',
    description: 'Surface the right insights, content, and UI variations for every persona.',
    href: '/context-surfacer',
    icon: Sparkles,
    tag: 'Adaptive'
  },
  {
    title: 'Integration & Security Hub',
    description: 'Manage connectors, credentials, and compliance with guardrails built-in.',
    href: '/integrations',
    icon: ShieldCheck,
    tag: 'Governed'
  },
  {
    title: 'Workflow Orchestration',
    description: 'Visualize, automate, and observe enterprise-grade process pipelines.',
    href: '/workflows',
    icon: Workflow,
    tag: 'Automation'
  },
  {
    title: 'Executive Dashboards',
    description: 'Track engagement, revenue, and risk from a single operations console.',
    href: '/dashboard',
    icon: LineChart,
    tag: 'Insights'
  }
]

const automationSuites = [
  {
    title: 'Onboarding & Playbooks',
    description: 'Launch ready-to-use runbooks for social, security, and GTM teams.',
    href: '/templates',
    icon: BookOpen
  },
  {
    title: 'Incident & Response',
    description: 'Escalate, triage, and resolve multi-team events with closed-loop automation.',
    href: '/security-intelligence',
    icon: ShieldCheck
  },
  {
    title: 'Partner Ecosystem',
    description: 'Centralize credentials, storage, and partner tooling for rapid expansion.',
    href: '/integrations',
    icon: Network
  }
]

const knowledgeResources = [
  {
    title: 'Platform Integration Guide',
    description: 'Step-by-step instructions for connecting DefConect to enterprise systems.',
    href: '/docs/PLATFORM_INTEGRATION_GUIDE.md',
    icon: Layers,
    cta: 'View guide'
  },
  {
    title: 'Strategy Blueprints',
    description: 'Best practices for AI-assisted networking, growth, and automation.',
    href: '/docs/STRATEGY_BLUEPRINTS.md',
    icon: Target,
    cta: 'Download playbooks'
  },
  {
    title: 'Roadmap & Release Center',
    description: 'Preview upcoming capabilities and request features from the product squad.',
    href: '/docs/RELEASE_NOTES.md',
    icon: Calendar,
    cta: 'Explore roadmap'
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-900/30 py-20">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.2), transparent 40%), radial-gradient(circle at 80% 30%, rgba(129,140,248,0.2), transparent 45%)' }} />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <Badge variant="outline" className="border-slate-500/50 bg-slate-900/60 text-slate-200">
                DefConect · Enterprise Agent Platform
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Operate every professional touchpoint from a unified AI command center.
              </h1>
              <p className="text-lg text-slate-200/80">
                Deploy secure, policy-aware agents that orchestrate social engagement, partner operations, and executive reporting — all without leaving the DefConect workspace.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/social-media">
                    Launch Command Center <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-cyan-500/70 text-cyan-200 hover:bg-cyan-500/20 hover:text-cyan-100" asChild>
                  <Link href="/docs/PLATFORM_INTEGRATION_GUIDE.md">
                    Integration Guide <BookOpen className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <Card className="bg-slate-900/60 border-slate-700/40 shadow-lg shadow-sky-500/10">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Command className="h-5 w-5 text-cyan-400" />
                  Operational Snapshot
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Always-on monitoring of agent health, integrations, and automation cadence.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {[
                  { label: 'Agents Online', value: '65', icon: Users },
                  { label: 'Integrations Stable', value: '39/40', icon: ShieldCheck },
                  { label: 'Automations Today', value: '312', icon: Workflow },
                  { label: 'LinkedIn Sync', value: 'Updated 5 min ago', icon: Sparkles }
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/40 px-4 py-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-300">
                      <Icon className="h-4 w-4 text-cyan-400" />
                      {label}
                    </span>
                    <span className="font-medium text-slate-100">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, subtext }) => (
              <Card key={label} className="bg-slate-900/60 border-slate-700/40">
                <CardContent className="space-y-2 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="text-xs text-slate-400">{subtext}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-6 pb-20">
        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Experience hubs</h2>
              <p className="text-sm text-slate-400">Jump directly into the primary workspaces powering DefConect.</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experienceHubs.map(({ title, description, href, icon: Icon, tag }) => (
              <Card key={title} className="flex h-full flex-col border-slate-700/40 bg-slate-900/60">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle className="text-base text-white">{title}</CardTitle>
                      <CardDescription className="text-xs text-slate-400">{description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-slate-700/60 text-[10px] uppercase tracking-wide text-slate-300">
                    {tag}
                  </Badge>
                </CardHeader>
                <CardContent className="mt-auto flex justify-between px-6 pb-6">
                  <Button variant="ghost" className="gap-2 text-slate-200 hover:text-white" asChild>
                    <Link href={href}>
                      Open workspace <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {automationSuites.map(({ title, description, href, icon: Icon }) => (
            <Card key={title} className="border-slate-700/40 bg-slate-900/60">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-base text-white">{title}</CardTitle>
                </div>
                <CardDescription className="text-sm text-slate-400">{description}</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Button variant="ghost" className="gap-2 text-slate-200 hover:text-white" asChild>
                  <Link href={href}>
                    Explore suite <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Resources & enablement</h2>
              <p className="text-sm text-slate-400">Documentation, playbooks, and roadmaps to accelerate your rollout.</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {knowledgeResources.map(({ title, description, href, icon: Icon, cta }) => (
              <Card key={title} className="flex h-full flex-col border-slate-700/40 bg-slate-900/60">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="text-base text-white">{title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-slate-400">{description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto px-6 pb-6">
                  <Button variant="ghost" className="gap-2 text-slate-200 hover:text-white" asChild>
                    <Link href={href}>
                      {cta} <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <Badge className="bg-slate-800 text-slate-200">Need a guided rollout?</Badge>
              <h3 className="text-2xl font-semibold text-white">Partner with our solutions engineering team.</h3>
              <p className="text-sm text-slate-400">
                We help enterprises launch safely with data governance, change management, and white-glove integration services tailored to your policies.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="gap-2" asChild>
                <Link href="mailto:solutions@defconect.com">
                  Request onboarding <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-slate-700 text-slate-100 hover:bg-slate-800" asChild>
                <Link href="/docs/SERVICE_CATALOG.md">
                  View service catalog <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

