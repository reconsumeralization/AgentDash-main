"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Badge } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Separator } from "@/components/ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui"
import {
  Brain,
  Sparkles,
  Library,
  Wand2,
  Search,
  Star,
  Download,
  Upload,
  Zap,
  Target,
  TrendingUp,
  DollarSign,
  GamepadIcon,
  BarChart3,
} from "lucide-react"

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  complexity: "Simple" | "Medium" | "Advanced"
  estimatedCost: number
  rating: number
  nodes: any[]
  edges: any[]
  semanticDescription: string
}

interface SemanticNode {
  intent: string
  entities: string[]
  actions: string[]
  dataRequirements: string[]
  outputFormat: string
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "fantasy-sports-optimizer",
    name: "Fantasy Sports Lineup Optimizer",
    description:
      "Automatically optimize fantasy sports lineups based on player performance, matchups, and salary constraints",
    category: "Fantasy Sports",
    tags: ["NFL", "NBA", "optimization", "DFS"],
    complexity: "Advanced",
    estimatedCost: 0.15,
    rating: 4.8,
    nodes: [],
    edges: [],
    semanticDescription:
      "Analyze player statistics, injury reports, and matchup data to create optimal fantasy lineups within salary constraints",
  },
  {
    id: "betting-odds-analyzer",
    name: "Sports Betting Odds Analyzer",
    description: "Compare odds across multiple sportsbooks and identify value betting opportunities",
    category: "Gambling",
    tags: ["odds", "arbitrage", "value betting", "sportsbooks"],
    complexity: "Medium",
    estimatedCost: 0.08,
    rating: 4.6,
    nodes: [],
    edges: [],
    semanticDescription:
      "Scrape odds from multiple sportsbooks, calculate implied probabilities, and identify profitable betting opportunities",
  },
  {
    id: "crypto-trading-signals",
    name: "Cryptocurrency Trading Signals",
    description: "Generate trading signals based on technical analysis and market sentiment",
    category: "Trading",
    tags: ["crypto", "technical analysis", "signals", "trading"],
    complexity: "Advanced",
    estimatedCost: 0.25,
    rating: 4.7,
    nodes: [],
    edges: [],
    semanticDescription:
      "Analyze price charts, volume patterns, and social sentiment to generate buy/sell signals for cryptocurrency trading",
  },
  {
    id: "gaming-performance-tracker",
    name: "Gaming Performance Analytics",
    description: "Track and analyze gaming performance across multiple games and platforms",
    category: "Gaming",
    tags: ["esports", "performance", "analytics", "tracking"],
    complexity: "Simple",
    estimatedCost: 0.05,
    rating: 4.4,
    nodes: [],
    edges: [],
    semanticDescription:
      "Collect gameplay data, analyze performance metrics, and provide insights for improvement in competitive gaming",
  },
]

const categories = [
  { id: "all", name: "All Categories", iconName: "Library", color: "text-gray-400" },
  { id: "fantasy-sports", name: "Fantasy Sports", iconName: "Target", color: "text-green-400" },
  { id: "gambling", name: "Gambling", iconName: "DollarSign", color: "text-yellow-400" },
  { id: "trading", name: "Trading", iconName: "TrendingUp", color: "text-blue-400" },
  { id: "gaming", name: "Gaming", iconName: "GamepadIcon", color: "text-purple-400" },
  { id: "analytics", name: "Analytics", iconName: "BarChart3", color: "text-orange-400" },
]

// Function to get category icon component by name
const getCategoryIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Library": return Library;
    case "Target": return Target;
    case "DollarSign": return DollarSign;
    case "TrendingUp": return TrendingUp;
    case "GamepadIcon": return GamepadIcon;
    case "BarChart3": return BarChart3;
    default: return Library;
  }
}

export function SemanticWorkflowBuilder() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)
  const [semanticInput, setSemanticInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)

  const filteredTemplates = workflowTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category.toLowerCase().includes(selectedCategory.replace("-", " "))
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const parseSemanticDescription = useCallback((description: string): SemanticNode => {
    // Simple semantic parsing - in a real implementation, this would use NLP
    const words = description.toLowerCase().split(/\s+/)

    const actionWords = ["analyze", "optimize", "generate", "compare", "track", "calculate", "scrape", "identify"]
    const entityWords = ["player", "odds", "price", "performance", "data", "statistics", "signals"]

    const actions = actionWords.filter((action) => words.some((word) => word.includes(action)))
    const entities = entityWords.filter((entity) => words.some((word) => word.includes(entity)))

    return {
      intent: actions[0] || "process",
      entities,
      actions,
      dataRequirements: ["API data", "historical data"],
      outputFormat: "structured data",
    }
  }, [])

  const generateWorkflowFromSemantic = useCallback(
    async (description: string) => {
      setIsGenerating(true)

      // Simulate AI workflow generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const semanticNode = parseSemanticDescription(description)

      const generatedNodes = [
        {
          id: "input",
          type: "data",
          position: { x: 100, y: 100 },
          data: {
            label: "Data Input",
            source: "API",
            format: "JSON",
          },
        },
        {
          id: "processor",
          type: "agent",
          position: { x: 400, y: 100 },
          data: {
            label: `${semanticNode.intent.charAt(0).toUpperCase() + semanticNode.intent.slice(1)} Agent`,
            type: "Processing Agent",
            capabilities: semanticNode.actions,
            cost: 0.05,
          },
        },
        {
          id: "output",
          type: "workflow",
          position: { x: 700, y: 100 },
          data: {
            label: "Output Generator",
            description: `Generate ${semanticNode.outputFormat}`,
            steps: 3,
          },
        },
      ]

      const generatedEdges = [
        { id: "e1", source: "input", target: "processor", animated: true },
        { id: "e2", source: "processor", target: "output", animated: true },
      ]

      setGeneratedWorkflow({
        nodes: generatedNodes,
        edges: generatedEdges,
        semantic: semanticNode,
        description,
      })

      setIsGenerating(false)
    },
    [parseSemanticDescription],
  )

  const createWorkflowFromTemplate = useCallback((template: WorkflowTemplate) => {
    // In a real implementation, this would create actual nodes and edges
    console.log("[v0] Creating workflow from template:", template.name)
    setSelectedTemplate(template)
    setShowTemplateDialog(false)
  }, [])

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Semantic Workflow Builder
          </h2>
          <p className="text-gray-400">Create workflows using natural language descriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200">
                <Library className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-black/90 backdrop-blur-sm border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Library className="w-5 h-5 text-blue-400" />
                  Workflow Template Library
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Choose from pre-built workflows or create your own
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Category Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  {categories.map((category) => {
                    const Icon = getCategoryIconComponent(category.iconName)
                    return (
                      <Button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        size="sm"
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className={`${
                          selectedCategory === category.id
                            ? "bg-blue-500/30 text-blue-200"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <Icon className={`w-4 h-4 mr-1 ${category.color}`} />
                        {category.name}
                      </Button>
                    )
                  })}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white"
                  />
                </div>

                {/* Templates Grid */}
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {filteredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => createWorkflowFromTemplate(template)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-sm text-white">{template.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    template.complexity === "Simple"
                                      ? "bg-green-500/20 text-green-200"
                                      : template.complexity === "Medium"
                                        ? "bg-yellow-500/20 text-yellow-200"
                                        : "bg-red-500/20 text-red-200"
                                  }`}
                                >
                                  {template.complexity}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-400">{template.rating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-purple-400">${template.estimatedCost}/run</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-gray-400 mb-3">{template.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs border-white/20 text-gray-300">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Semantic Input */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            Describe Your Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe what you want your workflow to do in natural language. For example: 'Analyze NFL player statistics and injury reports to optimize my fantasy football lineup for this week's games while staying under the salary cap.'"
            value={semanticInput}
            onChange={(e) => setSemanticInput(e.target.value)}
            className="bg-white/5 border-white/10 text-white min-h-[100px] resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Brain className="w-4 h-4" />
              AI will parse your description and generate a workflow
            </div>
            <Button
              onClick={() => generateWorkflowFromSemantic(semanticInput)}
              disabled={!semanticInput.trim() || isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
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

      {/* Generated Workflow Preview */}
      {generatedWorkflow && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400" />
              Generated Workflow Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-medium mb-2">Semantic Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Intent:</span>
                    <Badge className="bg-blue-500/20 text-blue-200">{generatedWorkflow.semantic.intent}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Actions:</span>
                    <div className="flex gap-1">
                      {generatedWorkflow.semantic.actions.map((action: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-green-500/20 text-green-200 text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Entities:</span>
                    <div className="flex gap-1">
                      {generatedWorkflow.semantic.entities.map((entity: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="border-white/20 text-gray-300 text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Workflow Structure</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-400">Nodes: {generatedWorkflow.nodes.length}</div>
                  <div className="text-gray-400">Connections: {generatedWorkflow.edges.length}</div>
                  <div className="text-gray-400">Estimated Cost: $0.05/run</div>
                </div>
              </div>
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Ready to create this workflow?</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/5 bg-transparent"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-200">
                  <Upload className="w-4 h-4 mr-1" />
                  Create Workflow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Template Details */}
      {selectedTemplate && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">{selectedTemplate.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-white">{selectedTemplate.complexity}</div>
                <div className="text-sm text-gray-400">Complexity</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-purple-400">${selectedTemplate.estimatedCost}</div>
                <div className="text-sm text-gray-400">Est. Cost/Run</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-yellow-400">{selectedTemplate.rating}</div>
                <div className="text-sm text-gray-400">Rating</div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Semantic Description</h4>
              <p className="text-sm text-gray-400 italic">"{selectedTemplate.semanticDescription}"</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {selectedTemplate.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-white/20 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200">Use This Template</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
