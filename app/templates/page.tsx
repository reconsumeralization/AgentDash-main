"use client"

import { useMemo, useState } from "react"
import type { ComponentType } from "react"
import Link from "next/link"
import { Button } from "@/components/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { GuidanceTemplatesDemo } from "@/components/guidance-templates-demo"
import {
  Brain,
  GitBranch,
  Bot,
  Globe,
  Sparkles,
  Star,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  Target,
  Layers
} from "lucide-react"
import { useTemplatesData } from "@/lib"
import type {
  TemplateCard,
  TemplateCategoryId,
  TemplateIconName
} from "@/lib"

const iconComponents: Record<TemplateIconName, ComponentType<{ className?: string }>> = {
  brain: Brain,
  workflow: GitBranch,
  bot: Bot,
  globe: Globe,
  sparkles: Sparkles,
  trendingUp: TrendingUp,
  target: Target,
  layers: Layers
}

function TemplateCardItem({ template }: { template: TemplateCard }) {
  return (
    <Card className="border-slate-200 bg-white/90 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <Badge variant="outline" className="border-slate-200 text-xs uppercase tracking-wide">
          {template.categoryId}
        </Badge>
        <CardTitle className="mt-2 text-lg text-slate-900">{template.title}</CardTitle>
        <CardDescription className="text-sm text-slate-600">{template.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        <div className="flex flex-wrap gap-2 text-xs">
          {template.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-slate-200">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{template.downloads.toLocaleString()} downloads</span>
          <span>{template.rating.toFixed(1)} rating</span>
          <span>Updated {template.updatedAt}</span>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs capitalize">
            {template.difficulty}
          </Badge>
          <Button variant="ghost" size="sm" className="text-xs">
            Preview
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TemplatesPage() {
  const { data, loading, error } = useTemplatesData()
  const [activeCategory, setActiveCategory] = useState<TemplateCategoryId | "all">("all")
  const [search, setSearch] = useState("")

  const allTemplates = useMemo(() => {
    const seen = new Set<string>()
    const merged: TemplateCard[] = []
    for (const section of [data.featured, data.newest]) {
      for (const item of section) {
        if (!seen.has(item.id)) {
          merged.push(item)
          seen.add(item.id)
        }
      }
    }
    return merged
  }, [data])

  const filteredTemplates = useMemo(() => {
    const query = search.toLowerCase().trim()
    return allTemplates.filter((template) => {
      const matchesCategory = activeCategory === "all" || template.categoryId === activeCategory
      const haystack = (template.title + template.summary + template.tags.join(" ")).toLowerCase()
      const matchesSearch = query ? haystack.includes(query) : true
      return matchesCategory && matchesSearch
    })
  }, [allTemplates, activeCategory, search])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 text-slate-100">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="border-slate-200/40 bg-slate-900/40">
                Template studio
              </Badge>
              <h1 className="text-3xl font-semibold text-white">Launch faster with curated AI templates</h1>
              <p className="max-w-2xl text-sm text-slate-200">
                Mix and match guidance dashboards, workflows, and agent loadouts to showcase DefConect in record time.
                Every card below is production-ready and mapped to the Supabase schema.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-300" /> Investor-ready narratives</span>
                <span className="flex items-center gap-2"><Star className="h-4 w-4 text-indigo-300" /> Workflow accelerators</span>
                <span className="flex items-center gap-2"><Filter className="h-4 w-4 text-emerald-300" /> LinkedIn automation kits</span>
              </div>
            </div>
            <div className="w-full max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search templates, tags, or categories"
                  className="border-white/20 bg-white/10 pl-10 text-sm text-white placeholder:text-slate-400"
                />
              </div>
              {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data.categories.map((category) => {
            const Icon = iconComponents[category.iconName]
            const isActive = activeCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(isActive ? "all" : category.id)}
                className={`group flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all ${
                  isActive
                    ? "border-sky-400/60 bg-sky-400/10 shadow-lg"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-4 w-4 text-sky-200" />
                </span>
                <span className="text-sm font-semibold text-white">{category.title}</span>
                <span className="text-xs text-slate-300">{category.description}</span>
                <span className="text-xs font-medium text-slate-200">
                  {category.totalTemplates} templates
                </span>
              </button>
            )
          })}
        </section>

        <Tabs defaultValue="featured" className="space-y-6">
          <TabsList className="bg-white/10">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="new">New arrivals</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="demo">Guidance demo</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.length === 0 && !loading ? (
                <Card className="border-white/20 bg-white/5 p-6 text-sm text-slate-200">
                  No templates match your filters yet. Try another category or clear the search.
                </Card>
              ) : (
                filteredTemplates.map((template) => (
                  <TemplateCardItem key={template.id} template={template} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.newest.map((template) => (
                <TemplateCardItem key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {data.collections.map((collection) => {
                const Icon = iconComponents[collection.iconName] || Sparkles
                const collectionTemplates = collection.templateIds
                  .map((id) => allTemplates.find((template) => template.id === id))
                  .filter((template): template is TemplateCard => Boolean(template))
                return (
                  <Card key={collection.id} className="border-slate-200 bg-white/90 shadow-sm">
                    <CardHeader className="flex flex-row items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/10">
                        <Icon className="h-5 w-5 text-sky-500" />
                      </span>
                      <div>
                        <CardTitle className="text-lg text-slate-900">{collection.title}</CardTitle>
                        <CardDescription className="text-sm text-slate-600">
                          {collection.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {collectionTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm"
                        >
                          <div className="font-medium text-slate-800">{template.title}</div>
                          <div className="text-xs text-slate-500">{template.summary}</div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full border-slate-300">
                        Load collection in studio
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="demo">
            <Card className="border-slate-200 bg-white/90">
              <CardHeader>
                <CardTitle className="text-slate-900">Guidance template walkthrough</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Preview the storytelling experience investors love.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GuidanceTemplatesDemo />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div>
            {loading ? "Loading template catalog..." : `${filteredTemplates.length} templates ready to deploy.`}
          </div>
          <Link href="/api/templates" className="underline underline-offset-2">
            View JSON feed
          </Link>
        </footer>
      </div>
    </div>
  )
}


