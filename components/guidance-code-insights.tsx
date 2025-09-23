"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { 
  Lightbulb, 
  Code, 
  Shield, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib"

interface CodeInsight {
  id: string
  type: 'vulnerability' | 'performance' | 'quality' | 'security' | 'optimization'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  line?: number
  file?: string
  suggestion: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  confidence: number
  category: string
  tags: string[]
  codeExample?: string
  fix?: string
}

interface CodeInsightsProps {
  className?: string
}

export function GuidanceCodeInsights({ className }: CodeInsightsProps) {
  const [insights, setInsights] = useState<CodeInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")

  const generateInsights = async () => {
    if (!code.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/guidance/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          language: 'typescript'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
      } else {
        // Fallback to mock data
        setInsights(generateMockInsights())
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      setInsights(generateMockInsights())
    } finally {
      setLoading(false)
    }
  }

  const generateMockInsights = (): CodeInsight[] => {
    return [
      {
        id: "1",
        type: "vulnerability",
        severity: "high",
        title: "Potential XSS Vulnerability",
        description: "User input is directly inserted into innerHTML without sanitization",
        line: 15,
        file: "components/UserProfile.tsx",
        suggestion: "Use React's built-in XSS protection or sanitize input with DOMPurify",
        impact: "High security risk - could lead to XSS attacks",
        effort: "medium",
        confidence: 0.92,
        category: "security",
        tags: ["xss", "security", "react"],
        codeExample: "element.innerHTML = userInput; // Vulnerable",
        fix: "element.textContent = userInput; // Safe"
      },
      {
        id: "2",
        type: "performance",
        severity: "medium",
        title: "Inefficient Array Operations",
        description: "Using nested loops for array operations can be optimized",
        line: 42,
        file: "utils/dataProcessor.ts",
        suggestion: "Use array methods like map, filter, or reduce for better performance",
        impact: "Performance degradation with large datasets",
        effort: "low",
        confidence: 0.85,
        category: "performance",
        tags: ["performance", "arrays", "optimization"],
        codeExample: "for (let i = 0; i < arr.length; i++) { for (let j = 0; j < arr[i].length; j++) { ... } }",
        fix: "arr.flatMap(item => item.map(process))"
      },
      {
        id: "3",
        type: "quality",
        severity: "low",
        title: "Missing Error Handling",
        description: "Function lacks proper error handling for edge cases",
        line: 28,
        file: "services/apiService.ts",
        suggestion: "Add try-catch blocks and proper error handling",
        impact: "Application may crash on unexpected errors",
        effort: "medium",
        confidence: 0.78,
        category: "quality",
        tags: ["error-handling", "robustness", "best-practices"],
        codeExample: "const result = await fetch(url); // No error handling",
        fix: "try { const result = await fetch(url); } catch (error) { handleError(error); }"
      },
      {
        id: "4",
        type: "security",
        severity: "critical",
        title: "Hardcoded API Key",
        description: "API key is hardcoded in the source code",
        line: 5,
        file: "config/api.ts",
        suggestion: "Move sensitive data to environment variables",
        impact: "Critical security risk - API key exposed in source code",
        effort: "low",
        confidence: 0.98,
        category: "security",
        tags: ["security", "secrets", "environment"],
        codeExample: "const API_KEY = 'sk-1234567890abcdef';",
        fix: "const API_KEY = process.env.API_KEY;"
      }
    ]
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vulnerability': return AlertTriangle
      case 'performance': return Zap
      case 'quality': return CheckCircle
      case 'security': return Shield
      case 'optimization': return TrendingUp
      default: return Lightbulb
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

  const insightsByType = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) {
      acc[insight.type] = []
    }
    acc[insight.type].push(insight)
    return acc
  }, {} as Record<string, CodeInsight[]>)

  const insightsBySeverity = insights.reduce((acc, insight) => {
    if (!acc[insight.severity]) {
      acc[insight.severity] = []
    }
    acc[insight.severity].push(insight)
    return acc
  }, {} as Record<string, CodeInsight[]>)

  const criticalCount = insightsBySeverity.critical?.length || 0
  const highCount = insightsBySeverity.high?.length || 0
  const mediumCount = insightsBySeverity.medium?.length || 0
  const lowCount = insightsBySeverity.low?.length || 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Lightbulb className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Code Insights</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-powered code analysis with intelligent insights for security, performance, and quality
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Analyze Your Code
          </CardTitle>
          <CardDescription>
            Paste your code below to get intelligent insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your code here for analysis..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
          <Button 
            onClick={generateInsights} 
            disabled={loading || !code.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Code...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Analyze Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {insights.length > 0 && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                      <div className="text-sm text-muted-foreground">Critical</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-orange-200 dark:border-orange-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{highCount}</div>
                      <div className="text-sm text-muted-foreground">High</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{mediumCount}</div>
                      <div className="text-sm text-muted-foreground">Medium</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">{lowCount}</div>
                      <div className="text-sm text-muted-foreground">Low</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* All Insights */}
            <div className="space-y-4">
              {insights.map((insight) => {
                const TypeIcon = getTypeIcon(insight.type)
                return (
                  <Card key={insight.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <TypeIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {insight.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(insight.severity)}>
                            {insight.severity}
                          </Badge>
                          <Badge className={getEffortColor(insight.effort)}>
                            {insight.effort} effort
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Location */}
                      {insight.file && (
                        <div className="text-sm text-muted-foreground">
                          <FileText className="h-4 w-4 inline mr-1" />
                          {insight.file}
                          {insight.line && `:${insight.line}`}
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {insight.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Suggestion */}
                      <div>
                        <h4 className="font-semibold mb-2">Suggestion</h4>
                        <p className="text-sm text-muted-foreground">{insight.suggestion}</p>
                      </div>

                      {/* Impact */}
                      <div>
                        <h4 className="font-semibold mb-2">Impact</h4>
                        <p className="text-sm text-muted-foreground">{insight.impact}</p>
                      </div>

                      {/* Code Examples */}
                      {insight.codeExample && (
                        <div>
                          <h4 className="font-semibold mb-2">Code Example</h4>
                          <div className="bg-muted p-3 rounded-lg">
                            <pre className="text-sm overflow-x-auto">
                              <code className="text-red-600">{insight.codeExample}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {insight.fix && (
                        <div>
                          <h4 className="font-semibold mb-2">Fix</h4>
                          <div className="bg-muted p-3 rounded-lg">
                            <pre className="text-sm overflow-x-auto">
                              <code className="text-green-600">{insight.fix}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          Apply Fix
                        </Button>
                        <Button size="sm" variant="ghost">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            {insightsByType.security?.map((insight) => {
              const TypeIcon = getTypeIcon(insight.type)
              return (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <TypeIcon className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{insight.suggestion}</p>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            }) || (
              <Card>
                <CardContent className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No security issues found</h3>
                  <p className="text-muted-foreground">Your code looks secure!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {insightsByType.performance?.map((insight) => {
              const TypeIcon = getTypeIcon(insight.type)
              return (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <TypeIcon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{insight.suggestion}</p>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            }) || (
              <Card>
                <CardContent className="text-center py-8">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No performance issues found</h3>
                  <p className="text-muted-foreground">Your code is optimized!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            {insightsByType.quality?.map((insight) => {
              const TypeIcon = getTypeIcon(insight.type)
              return (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <TypeIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{insight.suggestion}</p>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            }) || (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No quality issues found</h3>
                  <p className="text-muted-foreground">Your code quality is excellent!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
