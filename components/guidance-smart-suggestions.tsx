"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { 
  Sparkles, 
  Lightbulb, 
  Code, 
  Zap, 
  Target, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib"

interface SmartSuggestion {
  id: string
  type: 'code' | 'optimization' | 'security' | 'performance' | 'architecture'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  effort: 'low' | 'medium' | 'high'
  category: string
  tags: string[]
  codeExample?: string
  benefits: string[]
  implementation?: string
}

interface GuidanceSmartSuggestionsProps {
  className?: string
}

export function GuidanceSmartSuggestions({ className }: GuidanceSmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = [
    { id: "all", name: "All Suggestions", icon: Sparkles },
    { id: "code", name: "Code Quality", icon: Code },
    { id: "optimization", name: "Optimization", icon: TrendingUp },
    { id: "security", name: "Security", icon: Target },
    { id: "performance", name: "Performance", icon: Zap },
    { id: "architecture", name: "Architecture", icon: Lightbulb }
  ]

  const generateSuggestions = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/guidance/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.trim(),
          category: selectedCategory !== "all" ? selectedCategory : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } else {
        // Fallback to mock data
        setSuggestions(generateMockSuggestions())
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
      setSuggestions(generateMockSuggestions())
    } finally {
      setLoading(false)
    }
  }

  const generateMockSuggestions = (): SmartSuggestion[] => {
    return [
      {
        id: "1",
        type: "code",
        title: "Implement TypeScript Strict Mode",
        description: "Enable strict mode for better type safety and catch potential runtime errors",
        confidence: 0.95,
        impact: "high",
        effort: "medium",
        category: "code",
        tags: ["typescript", "type-safety", "best-practices"],
        benefits: [
          "Prevents null/undefined errors",
          "Improves code maintainability",
          "Better IDE support and autocomplete"
        ],
        implementation: "Add 'strict': true to tsconfig.json"
      },
      {
        id: "2",
        type: "performance",
        title: "Optimize Bundle Size with Tree Shaking",
        description: "Remove unused code from your bundle to improve loading performance",
        confidence: 0.88,
        impact: "high",
        effort: "low",
        category: "performance",
        tags: ["bundle", "optimization", "webpack"],
        benefits: [
          "Reduces bundle size by 20-40%",
          "Faster page load times",
          "Better Core Web Vitals scores"
        ]
      },
      {
        id: "3",
        type: "security",
        title: "Implement Content Security Policy",
        description: "Add CSP headers to prevent XSS attacks and improve security posture",
        confidence: 0.92,
        impact: "critical",
        effort: "medium",
        category: "security",
        tags: ["security", "csp", "xss-prevention"],
        benefits: [
          "Prevents XSS attacks",
          "Complies with security standards",
          "Protects user data"
        ]
      },
      {
        id: "4",
        type: "optimization",
        title: "Add React.memo for Expensive Components",
        description: "Optimize re-renders by memoizing components that don't need frequent updates",
        confidence: 0.85,
        impact: "medium",
        effort: "low",
        category: "optimization",
        tags: ["react", "performance", "memoization"],
        benefits: [
          "Reduces unnecessary re-renders",
          "Improves app responsiveness",
          "Better user experience"
        ]
      }
    ]
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return Code
      case 'optimization': return TrendingUp
      case 'security': return Target
      case 'performance': return Zap
      case 'architecture': return Lightbulb
      default: return Sparkles
    }
  }

  const filteredSuggestions = selectedCategory === "all" 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Smart Suggestions</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-powered suggestions to improve your code quality, performance, and security
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Generate Suggestions
          </CardTitle>
          <CardDescription>
            Describe your code, project, or specific area you'd like to improve
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your code, project, or specific area you'd like to improve..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button 
              onClick={generateSuggestions} 
              disabled={loading || !input.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          )
        })}
      </div>

      {/* Suggestions */}
      <div className="space-y-4">
        {filteredSuggestions.length === 0 && !loading ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No suggestions yet</h3>
              <p className="text-muted-foreground">
                Enter a description above to generate AI-powered suggestions for your code
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSuggestions.map((suggestion) => {
            const TypeIcon = getTypeIcon(suggestion.type)
            return (
              <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {suggestion.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(suggestion.impact)}>
                        {suggestion.impact} impact
                      </Badge>
                      <Badge className={getEffortColor(suggestion.effort)}>
                        {suggestion.effort} effort
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {suggestion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Benefits
                    </h4>
                    <ul className="space-y-1">
                      {suggestion.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Implementation */}
                  {suggestion.implementation && (
                    <div>
                      <h4 className="font-semibold mb-2">Implementation</h4>
                      <div className="bg-muted p-3 rounded-lg">
                        <code className="text-sm">{suggestion.implementation}</code>
                      </div>
                    </div>
                  )}

                  {/* Code Example */}
                  {suggestion.codeExample && (
                    <div>
                      <h4 className="font-semibold mb-2">Code Example</h4>
                      <div className="bg-muted p-3 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          <code>{suggestion.codeExample}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      Apply Suggestion
                    </Button>
                    <Button size="sm" variant="ghost">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
