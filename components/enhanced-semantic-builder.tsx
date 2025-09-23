"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Separator } from "@/components/ui"
import { Alert, AlertDescription } from "@/components/ui"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui"
import {
  Brain,
  Sparkles,
  Wand2,
  Zap,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  Database,
  Bot,
  Workflow,
  TrendingUp,
} from "lucide-react"
import { semanticParser, type WorkflowSemantic } from "@/lib"

interface ParsedWorkflow {
  nodes: any[]
  edges: any[]
  metadata: {
    semantic: WorkflowSemantic
    createdAt: string
    estimatedCost: number
    complexity: string
  }
}

export function EnhancedSemanticBuilder() {
  const [description, setDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [parsedSemantic, setParsedSemantic] = useState<WorkflowSemantic | null>(null)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<ParsedWorkflow | null>(null)
  const [improvements, setImprovements] = useState<string[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exampleDescriptions = [
    "Analyze NFL player statistics, injury reports, and weather conditions to optimize my fantasy football lineup for this week's games while staying under the $50,000 salary cap on DraftKings",
    "Compare betting odds across 10+ sportsbooks for NBA games tonight and identify arbitrage opportunities with at least 2% profit margin",
    "Monitor Bitcoin and Ethereum price movements using technical indicators like RSI, MACD, and Bollinger Bands to generate buy/sell signals for day trading",
    "Track my Valorant gameplay performance including K/D ratio, headshot percentage, and round win rate to identify areas for improvement and rank up faster",
  ]

  const analyzeDescription = useCallback(async () => {
    if (!description.trim()) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setError(null)

    try {
      // Simulate analysis progress
      const progressSteps = [
        { progress: 20, message: "Parsing natural language..." },
        { progress: 40, message: "Identifying domain and entities..." },
        { progress: 60, message: "Extracting actions and requirements..." },
        { progress: 80, message: "Generating workflow structure..." },
        { progress: 100, message: "Analysis complete!" },
      ]

      for (const step of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        setAnalysisProgress(step.progress)
      }

      // Parse the description
      const semantic = await semanticParser.parseDescription(description)
      setParsedSemantic(semantic)

      // Generate workflow
      const workflow = await semanticParser.generateWorkflowFromSemantic(semantic)
      setGeneratedWorkflow(workflow)

      // Get improvement suggestions
      const suggestions = await semanticParser.suggestImprovements(workflow)
      setImprovements(suggestions)
    } catch (err) {
      console.error("[v0] Analysis error:", err)
      setError("Failed to analyze description. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }, [description])

  const getDomainIcon = (domain: string) => {
    const icons = {
      "fantasy-sports": Target,
      gambling: DollarSign,
      trading: TrendingUp,
      gaming: Bot,
      analytics: Database,
      general: Workflow,
    }
    return icons[domain as keyof typeof icons] || Workflow
  }

  const getDomainColor = (domain: string) => {
    const colors = {
      "fantasy-sports": "text-green-400 bg-green-500/20",
      gambling: "text-yellow-400 bg-yellow-500/20",
      trading: "text-blue-400 bg-blue-500/20",
      gaming: "text-purple-400 bg-purple-500/20",
      analytics: "text-orange-400 bg-orange-500/20",
      general: "text-gray-400 bg-gray-500/20",
    }
    return colors[domain as keyof typeof colors] || colors.general
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          AI-Powered Workflow Generator
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Describe your workflow in natural language and watch as AI transforms it into a complete, executable workflow
          with intelligent routing and optimization.
        </p>
      </div>

      {/* Input Section */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            Describe Your Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe what you want your workflow to accomplish..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white/5 border-white/10 text-white min-h-[120px] resize-none text-base"
          />

          {/* Example Descriptions */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Try these examples:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleDescriptions.map((example, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  onClick={() => setDescription(example)}
                  className="text-left h-auto p-3 text-xs text-gray-300 hover:text-white hover:bg-white/5 border border-white/10"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4" />
              AI will analyze your description and generate an optimized workflow
            </div>
            <Button
              onClick={analyzeDescription}
              disabled={!description.trim() || isAnalyzing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Analyzing your workflow description</span>
                  <span className="text-purple-400">{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {/* Semantic Analysis Results */}
      {parsedSemantic && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Semantic Analysis Complete
              </CardTitle>
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    {showDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4">
                  <Separator className="bg-white/10" />

                  {/* Data Requirements */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Data Requirements</h4>
                    <div className="space-y-2">
                      {parsedSemantic.dataRequirements.map((req, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">{req.source}</span>
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-200">
                              {req.frequency}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">
                            {req.type} • {req.format}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Nodes */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Workflow Structure</h4>
                    <div className="space-y-2">
                      {parsedSemantic.suggestedNodes.map((node, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            {node.type === "agent" && <Bot className="w-4 h-4 text-blue-400" />}
                            {node.type === "workflow" && <Workflow className="w-4 h-4 text-green-400" />}
                            {node.type === "data" && <Database className="w-4 h-4 text-orange-400" />}
                            <span className="text-white font-medium">{node.label}</span>
                            <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 text-xs">
                              {node.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">{node.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-center mb-2">
                  {(() => {
                    const Icon = getDomainIcon(parsedSemantic.domain)
                    return <Icon className={`w-6 h-6 ${getDomainColor(parsedSemantic.domain).split(" ")[0]}`} />
                  })()}
                </div>
                <div className="text-sm font-medium text-white capitalize">
                  {parsedSemantic.domain.replace("-", " ")}
                </div>
                <div className="text-xs text-gray-400">Domain</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-sm font-medium text-white">{parsedSemantic.complexity}</div>
                <div className="text-xs text-gray-400">Complexity</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-sm font-medium text-white">${parsedSemantic.estimatedCost}</div>
                <div className="text-xs text-gray-400">Est. Cost/Run</div>
              </div>

              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-center mb-2">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-sm font-medium text-white">{parsedSemantic.suggestedNodes.length}</div>
                <div className="text-xs text-gray-400">Nodes</div>
              </div>
            </div>

            {/* Intent and Actions */}
            <div className="space-y-3">
              <div>
                <h4 className="text-white font-medium mb-2">Intent</h4>
                <p className="text-gray-300 text-sm bg-white/5 p-3 rounded-lg">{parsedSemantic.intent}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Actions</h4>
                  <div className="flex flex-wrap gap-1">
                    {parsedSemantic.actions.map((action, idx) => (
                      <Badge key={idx} className="bg-blue-500/20 text-blue-200">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Entities</h4>
                  <div className="flex flex-wrap gap-1">
                    {parsedSemantic.entities.map((entity, idx) => (
                      <Badge key={idx} variant="outline" className="border-white/20 text-gray-300">
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvement Suggestions */}
      {improvements.length > 0 && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              AI Suggestions for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {improvements.map((improvement, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{improvement}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Generated Workflow Actions */}
      {generatedWorkflow && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Workflow Ready!</h3>
                <p className="text-sm text-gray-400">
                  Generated {generatedWorkflow.nodes.length} nodes with {generatedWorkflow.edges.length} connections
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/5 bg-transparent"
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  Create Workflow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
