"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { ComponentType } from "react"
import { Badge } from "@/components/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Input } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Button } from "@/components/ui"
import { useHelpCenterData } from "@/lib"
import type { HelpArticle, HelpCategory, HelpCategoryId } from "@/lib"
import { Search, Sparkles, HelpCircle, Filter, Settings, Users, Share2, AlertTriangle } from "lucide-react"

const iconComponents: Record<string, ComponentType<{ className?: string }>> = {
  settings: Settings,
  users: Users,
  share: Share2,
  alert: AlertTriangle
}

function ArticleCard({ article }: { article: HelpArticle }) {
  return (
    <Card className="border-slate-200 bg-white/95 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="space-y-2">
        <Badge variant="outline" className="border-slate-200 text-xs uppercase tracking-wide">
          {article.categoryId}
        </Badge>
        <CardTitle className="text-lg text-slate-900">{article.title}</CardTitle>
        <CardDescription className="text-sm text-slate-600">{article.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        <ol className="list-decimal space-y-2 pl-5">
          {article.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
        {article.notes && (
          <div className="rounded-md border border-slate-200/70 bg-slate-100 px-3 py-2 text-xs text-slate-500">
            {article.notes.map((note, index) => (
              <p key={index} className={index > 0 ? "mt-2" : undefined}>{note}</p>
            ))}
          </div>
        )}
        {article.links && article.links.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {article.links.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 text-sky-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CategoryTile({ category, isActive, onSelect }: { category: HelpCategory; isActive: boolean; onSelect: () => void }) {
  const Icon = iconComponents[category.iconName] ?? HelpCircle
  return (
    <button
      onClick={onSelect}
      className={`group flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all ${
        isActive ? "border-sky-400/60 bg-sky-400/10 shadow-lg" : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
        <Icon className="h-4 w-4 text-sky-200" />
      </span>
      <span className="text-sm font-semibold text-white">{category.title}</span>
      <span className="text-xs text-slate-300">{category.description}</span>
      <span className="text-xs font-medium text-slate-200">
        {category.totalTemplates ? `${category.totalTemplates} templates` : null}
      </span>
    </button>
  )
}

export default function FileFlexHelpPage() {
  const { data, loading, error } = useHelpCenterData()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<HelpCategoryId | "all">("all")

  const filteredArticles = useMemo(() => {
    const query = search.toLowerCase().trim()
    const articles = activeCategory === "all"
      ? data.articles
      : data.articles.filter((article) => article.categoryId === activeCategory)

    if (!query) {
      return articles
    }

    return articles.filter((article) => {
      const haystack = [article.title, article.summary, ...article.steps, ...(article.notes ?? [])]
        .join(" ")
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [data.articles, activeCategory, search])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 text-slate-100">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="border-slate-200/40 bg-slate-900/40">
                FileFlex knowledge base
              </Badge>
              <h1 className="text-3xl font-semibold text-white">How can we help you connect?</h1>
              <p className="max-w-2xl text-sm text-slate-200">
                Step-by-step guidance for connecting NAS devices, importing contacts, and resolving common FileFlex issues—all curated for quick reference during demos.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-300" /> Demo-ready scripts</span>
                <span className="flex items-center gap-2"><Filter className="h-4 w-4 text-emerald-300" /> Device setup checklists</span>
                <span className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-indigo-300" /> Troubleshooting playbook</span>
              </div>
            </div>
            <div className="w-full max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search FileFlex help"
                  className="border-white/20 bg-white/10 pl-10 text-sm text-white placeholder:text-slate-400"
                />
              </div>
              {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data.categories.map((category) => (
            <CategoryTile
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onSelect={() => setActiveCategory(activeCategory === category.id ? "all" : category.id)}
            />
          ))}
        </section>

        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as HelpCategoryId | "all")}
          className="space-y-6">
          <TabsList className="bg-white/10">
            <TabsTrigger value="all">All topics</TabsTrigger>
            {data.categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredArticles.length === 0 && !loading ? (
                <Card className="border-white/20 bg-white/5 p-6 text-sm text-slate-200">
                  No articles match your filters. Try a different search term or category.
                </Card>
              ) : (
                filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div>
            {loading ? "Syncing knowledge base..." : `${filteredArticles.length} articles available.`}
          </div>
          <div className="flex gap-3">
            <Link href="https://help.fileflex.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
              Visit FileFlex Help Center
            </Link>
            <Link href="/api/help/fileflex" className="underline underline-offset-2">
              View JSON feed
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
