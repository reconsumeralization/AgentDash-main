"use client"

import { Label } from "@/components/ui"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Input } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import {
  Brain,
  FileText,
  Zap,
  CheckCircle,
  Target,
  Sparkles,
  Code,
  Lightbulb,
  Settings,
  Copy,
  Download,
} from "lucide-react"

interface ContextAnalysis {
  id: string
  input: string
  complexity: "low" | "medium" | "high"
  domain: string
  requirements: string[]
  suggestedAgents: string[]
  confidence: number
  status: "analyzing" | "complete" | "error"
  sentiment: "positive" | "neutral" | "negative"
  urgency: "low" | "medium" | "high"
  estimatedTime: string
  resourcesNeeded: string[]
  riskFactors: string[]
}

interface PromptTemplate {
  id: string
  name: string
  category: string
  template: string
  variables: string[]
  effectiveness: number
  description: string
  useCase: string
  complexity: "beginner" | "intermediate" | "advanced"
}

interface AgentBlueprint {
  id: string
  name: string
  role: string
  capabilities: string[]
  prompt: string
  parameters: Record<string, any>
  status: "draft" | "ready" | "deployed"
}

export function ContextEngineer() {
  const [currentAnalysis, setCurrentAnalysis] = useState<ContextAnalysis | null>(null)
  const [inputText, setInputText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [generatedAgents, setGeneratedAgents] = useState<AgentBlueprint[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({})

  const [promptTemplates] = useState<PromptTemplate[]>([
    {
      id: "1",
      name: "Expert Agent Creator",
      category: "Agent Generation",
      description: "Creates specialized expert agents with domain-specific knowledge",
      useCase: "When you need deep expertise in a specific field",
      complexity: "advanced",
      template:
        "You are a world-class {DOMAIN} expert with {YEARS_EXPERIENCE} years of experience in {EXPERTISE_AREAS}. Your specializations include {SPECIALIZATIONS}. You approach problems with {METHODOLOGY} and always consider {CONSTRAINTS}. Your responses should be {TONE} and include {OUTPUT_ELEMENTS}. When faced with {DOMAIN} challenges, you prioritize {PRIORITIES} and ensure {QUALITY_STANDARDS}.",
      variables: [
        "DOMAIN",
        "YEARS_EXPERIENCE",
        "EXPERTISE_AREAS",
        "SPECIALIZATIONS",
        "METHODOLOGY",
        "CONSTRAINTS",
        "TONE",
        "OUTPUT_ELEMENTS",
        "PRIORITIES",
        "QUALITY_STANDARDS",
      ],
      effectiveness: 95,
    },
    {
      id: "2",
      name: "Context Analyzer Pro",
      category: "Analysis",
      description: "Advanced context analysis with multi-dimensional evaluation",
      useCase: "For comprehensive understanding of complex requests",
      complexity: "intermediate",
      template:
        "Perform a comprehensive analysis of: '{USER_INPUT}'. Evaluate across these dimensions: 1) Core objectives and success criteria, 2) Complexity assessment ({COMPLEXITY_FACTORS}), 3) Domain expertise requirements, 4) Resource and time implications, 5) Risk factors and mitigation strategies, 6) Stakeholder considerations, 7) Success metrics and KPIs. Provide {ANALYSIS_DEPTH} analysis with {RECOMMENDATION_TYPE} recommendations.",
      variables: ["USER_INPUT", "COMPLEXITY_FACTORS", "ANALYSIS_DEPTH", "RECOMMENDATION_TYPE"],
      effectiveness: 92,
    },
    {
      id: "3",
      name: "Research Orchestrator",
      category: "Research",
      description: "Coordinates multi-source research with synthesis capabilities",
      useCase: "For comprehensive research projects requiring multiple perspectives",
      complexity: "advanced",
      template:
        "Lead a comprehensive research initiative on '{RESEARCH_TOPIC}'. Coordinate investigation across {RESEARCH_DOMAINS} using {RESEARCH_METHODS}. Focus areas: {FOCUS_AREAS}. Synthesize findings for {TARGET_AUDIENCE} with emphasis on {KEY_INSIGHTS}. Ensure {QUALITY_CRITERIA} and provide {DELIVERABLE_FORMAT}. Consider {CONSTRAINTS} and timeline of {TIMELINE}.",
      variables: [
        "RESEARCH_TOPIC",
        "RESEARCH_DOMAINS",
        "RESEARCH_METHODS",
        "FOCUS_AREAS",
        "TARGET_AUDIENCE",
        "KEY_INSIGHTS",
        "QUALITY_CRITERIA",
        "DELIVERABLE_FORMAT",
        "CONSTRAINTS",
        "TIMELINE",
      ],
      effectiveness: 89,
    },
    {
      id: "4",
      name: "Creative Problem Solver",
      category: "Innovation",
      description: "Generates innovative solutions using creative thinking frameworks",
      useCase: "For breakthrough thinking and innovative problem-solving",
      complexity: "intermediate",
      template:
        "Apply creative problem-solving to: '{PROBLEM_STATEMENT}'. Use {CREATIVE_FRAMEWORKS} to generate {SOLUTION_COUNT} innovative approaches. Consider {CONSTRAINTS} while exploring {SOLUTION_SPACES}. Evaluate solutions based on {EVALUATION_CRITERIA}. Present findings with {PRESENTATION_STYLE} including {VISUAL_ELEMENTS}. Prioritize {SUCCESS_FACTORS}.",
      variables: [
        "PROBLEM_STATEMENT",
        "CREATIVE_FRAMEWORKS",
        "SOLUTION_COUNT",
        "CONSTRAINTS",
        "SOLUTION_SPACES",
        "EVALUATION_CRITERIA",
        "PRESENTATION_STYLE",
        "VISUAL_ELEMENTS",
        "SUCCESS_FACTORS",
      ],
      effectiveness: 87,
    },
    {
      id: "5",
      name: "Technical Architect",
      category: "Technology",
      description: "Designs technical solutions with architectural best practices",
      useCase: "For complex technical system design and architecture",
      complexity: "advanced",
      template:
        "Design a technical architecture for: '{SYSTEM_REQUIREMENTS}'. Consider {TECHNICAL_CONSTRAINTS}, {SCALABILITY_NEEDS}, and {PERFORMANCE_REQUIREMENTS}. Apply {ARCHITECTURAL_PATTERNS} and ensure {QUALITY_ATTRIBUTES}. Include {TECHNOLOGY_STACK} recommendations with {INTEGRATION_APPROACHES}. Address {SECURITY_CONSIDERATIONS} and {OPERATIONAL_REQUIREMENTS}.",
      variables: [
        "SYSTEM_REQUIREMENTS",
        "TECHNICAL_CONSTRAINTS",
        "SCALABILITY_NEEDS",
        "PERFORMANCE_REQUIREMENTS",
        "ARCHITECTURAL_PATTERNS",
        "QUALITY_ATTRIBUTES",
        "TECHNOLOGY_STACK",
        "INTEGRATION_APPROACHES",
        "SECURITY_CONSIDERATIONS",
        "OPERATIONAL_REQUIREMENTS",
      ],
      effectiveness: 94,
    },
  ])

  const analyzeContext = async () => {
    if (!inputText.trim()) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const analysis: ContextAnalysis = {
      id: Date.now().toString(),
      input: inputText,
      complexity: "medium",
      domain: "General",
      requirements: [],
      suggestedAgents: [],
      confidence: 0,
      status: "analyzing",
      sentiment: "neutral",
      urgency: "medium",
      estimatedTime: "",
      resourcesNeeded: [],
      riskFactors: [],
    }

    setCurrentAnalysis(analysis)

    const steps = [
      { progress: 15, action: "Parsing linguistic structure..." },
      { progress: 30, action: "Analyzing semantic meaning..." },
      { progress: 45, action: "Identifying domain expertise..." },
      { progress: 60, action: "Assessing complexity factors..." },
      { progress: 75, action: "Evaluating resource requirements..." },
      { progress: 90, action: "Generating agent recommendations..." },
      { progress: 100, action: "Synthesis complete!" },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setAnalysisProgress(step.progress)

      if (step.progress === 100) {
        const completedAnalysis: ContextAnalysis = {
          ...analysis,
          complexity: determineComplexity(inputText),
          domain: detectDomain(inputText),
          requirements: extractRequirements(inputText),
          suggestedAgents: suggestAgents(inputText),
          confidence: Math.floor(Math.random() * 15) + 85,
          status: "complete",
          sentiment: analyzeSentiment(inputText),
          urgency: assessUrgency(inputText),
          estimatedTime: estimateTime(inputText),
          resourcesNeeded: identifyResources(inputText),
          riskFactors: identifyRisks(inputText),
        }
        setCurrentAnalysis(completedAnalysis)
        generateAgentBlueprints(completedAnalysis)
      }
    }

    setIsAnalyzing(false)
    setAnalysisProgress(0)
  }

  const determineComplexity = (text: string): "low" | "medium" | "high" => {
    const complexityIndicators = {
      high: ["integrate", "architecture", "scalable", "enterprise", "multi-step", "complex", "advanced"],
      medium: ["analyze", "develop", "create", "implement", "optimize", "coordinate"],
      low: ["simple", "basic", "quick", "easy", "straightforward"],
    }

    const textLower = text.toLowerCase()
    if (complexityIndicators.high.some((indicator) => textLower.includes(indicator))) return "high"
    if (complexityIndicators.medium.some((indicator) => textLower.includes(indicator))) return "medium"
    return text.length > 200 ? "medium" : "low"
  }

  const analyzeSentiment = (text: string): "positive" | "neutral" | "negative" => {
    const positive = ["excited", "great", "awesome", "love", "amazing", "excellent"]
    const negative = ["problem", "issue", "difficult", "struggling", "broken", "urgent"]

    const textLower = text.toLowerCase()
    if (positive.some((word) => textLower.includes(word))) return "positive"
    if (negative.some((word) => textLower.includes(word))) return "negative"
    return "neutral"
  }

  const assessUrgency = (text: string): "low" | "medium" | "high" => {
    const urgent = ["urgent", "asap", "immediately", "critical", "emergency", "deadline"]
    const textLower = text.toLowerCase()
    return urgent.some((word) => textLower.includes(word)) ? "high" : "medium"
  }

  const estimateTime = (text: string): string => {
    const complexity = determineComplexity(text)
    const timeEstimates = {
      low: "1-3 hours",
      medium: "1-3 days",
      high: "1-2 weeks",
    }
    return timeEstimates[complexity]
  }

  const identifyResources = (text: string): string[] => {
    const resources = []
    if (text.includes("data") || text.includes("database")) resources.push("Data Access")
    if (text.includes("design") || text.includes("ui")) resources.push("Design Tools")
    if (text.includes("code") || text.includes("development")) resources.push("Development Environment")
    if (text.includes("research")) resources.push("Research Access")
    return resources.length > 0 ? resources : ["General Computing"]
  }

  const identifyRisks = (text: string): string[] => {
    const risks = []
    if (text.includes("deadline") || text.includes("urgent")) risks.push("Time Constraints")
    if (text.includes("complex") || text.includes("difficult")) risks.push("Technical Complexity")
    if (text.includes("new") || text.includes("unfamiliar")) risks.push("Knowledge Gaps")
    return risks
  }

  const generateAgentBlueprints = (analysis: ContextAnalysis) => {
    const blueprints: AgentBlueprint[] = analysis.suggestedAgents.map((agentName, index) => ({
      id: `agent-${Date.now()}-${index}`,
      name: agentName,
      role: `Specialized ${agentName.toLowerCase()} for ${analysis.domain}`,
      capabilities: getAgentCapabilities(agentName, analysis),
      prompt: generateAgentPrompt(agentName, analysis),
      parameters: {
        temperature: analysis.complexity === "high" ? 0.8 : 0.7,
        maxTokens: analysis.complexity === "high" ? 4000 : 2000,
        domain: analysis.domain,
        complexity: analysis.complexity,
      },
      status: "ready",
    }))

    setGeneratedAgents(blueprints)
  }

  const getAgentCapabilities = (agentName: string, analysis: ContextAnalysis): string[] => {
    const baseCapabilities = {
      "Development Expert": ["Code Generation", "Architecture Design", "Code Review", "Debugging"],
      "Design Specialist": ["UI/UX Design", "Visual Design", "Prototyping", "Design Systems"],
      "Research Agent": ["Information Gathering", "Data Analysis", "Report Generation", "Source Verification"],
      "Data Analyst": ["Data Processing", "Statistical Analysis", "Visualization", "Insights Generation"],
      "General Assistant": ["Task Coordination", "Communication", "Documentation", "Problem Solving"],
    }

    return baseCapabilities[agentName as keyof typeof baseCapabilities] || ["General Assistance", "Task Support"]
  }

  const generateAgentPrompt = (agentName: string, analysis: ContextAnalysis): string => {
    return `You are a specialized ${agentName} with expertise in ${analysis.domain}. Your task is to address ${analysis.complexity} complexity requirements: ${analysis.requirements.join(", ")}. Maintain high quality standards and provide detailed, actionable responses.`
  }

  const detectDomain = (text: string): string => {
    const domains = {
      "code|programming|software|development|api|database": "Software Development",
      "design|ui|ux|interface|visual|graphic": "Design & UX",
      "data|analytics|science|ml|ai|machine learning": "Data Science & AI",
      "business|marketing|strategy|sales|revenue": "Business & Marketing",
      "research|academic|study|analysis|investigation": "Research & Analysis",
      "finance|accounting|budget|investment": "Finance & Accounting",
      "health|medical|healthcare|wellness": "Healthcare & Wellness",
      "education|teaching|learning|training": "Education & Training",
    }

    for (const [keywords, domain] of Object.entries(domains)) {
      if (new RegExp(keywords, "i").test(text)) {
        return domain
      }
    }
    return "General"
  }

  const extractRequirements = (text: string): string[] => {
    const requirements = []
    if (text.includes("create") || text.includes("build") || text.includes("develop"))
      requirements.push("Creation/Development")
    if (text.includes("analyze") || text.includes("research") || text.includes("investigate"))
      requirements.push("Analysis/Research")
    if (text.includes("optimize") || text.includes("improve") || text.includes("enhance"))
      requirements.push("Optimization")
    if (text.includes("explain") || text.includes("understand") || text.includes("learn"))
      requirements.push("Explanation/Education")
    if (text.includes("integrate") || text.includes("connect") || text.includes("combine"))
      requirements.push("Integration")
    if (text.includes("automate") || text.includes("streamline")) requirements.push("Automation")
    return requirements.length > 0 ? requirements : ["General Assistance"]
  }

  const suggestAgents = (text: string): string[] => {
    const agents = []
    if (text.includes("code") || text.includes("programming") || text.includes("development"))
      agents.push("Development Expert")
    if (text.includes("design") || text.includes("ui") || text.includes("ux")) agents.push("Design Specialist")
    if (text.includes("research") || text.includes("analyze") || text.includes("study")) agents.push("Research Agent")
    if (text.includes("data") || text.includes("analytics") || text.includes("statistics")) agents.push("Data Analyst")
    if (text.includes("business") || text.includes("strategy") || text.includes("marketing"))
      agents.push("Business Strategist")
    return agents.length > 0 ? agents : ["General Assistant", "Context Analyzer"]
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "low":
        return "text-green-500 bg-green-500/10"
      case "medium":
        return "text-yellow-500 bg-yellow-500/10"
      case "high":
        return "text-red-500 bg-red-500/10"
      default:
        return "text-muted-foreground bg-muted/10"
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-500 bg-green-500/10"
      case "negative":
        return "text-red-500 bg-red-500/10"
      default:
        return "text-blue-500 bg-blue-500/10"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "text-green-500 bg-green-500/10"
      case "medium":
        return "text-yellow-500 bg-yellow-500/10"
      case "high":
        return "text-red-500 bg-red-500/10"
      default:
        return "text-muted-foreground bg-muted/10"
    }
  }

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    const initialVariables: Record<string, string> = {}
    template.variables.forEach((variable) => {
      initialVariables[variable] = ""
    })
    setCustomVariables(initialVariables)
  }

  const generateCustomPrompt = () => {
    if (!selectedTemplate) return ""

    let prompt = selectedTemplate.template
    Object.entries(customVariables).forEach(([variable, value]) => {
      prompt = prompt.replace(new RegExp(`{${variable}}`, "g"), value || `[${variable}]`)
    })
    return prompt
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary animate-pulse" />
                Advanced Context Engineering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your task, project, or challenge for comprehensive context analysis..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />

              <Button
                onClick={analyzeContext}
                disabled={!inputText.trim() || isAnalyzing}
                className="w-full hover:scale-[1.02] transition-all duration-200"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Analyzing Context...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Analyze Context
                  </>
                )}
              </Button>

              {isAnalyzing && (
                <div className="space-y-3 animate-in fade-in duration-500">
                  <Progress value={analysisProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground text-center animate-pulse">
                    Processing multi-dimensional context analysis...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {currentAnalysis && currentAnalysis.status === "complete" && (
            <Card className="animate-in slide-in-from-bottom-4 duration-700 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 animate-bounce" />
                  Comprehensive Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Label className="text-xs font-medium text-muted-foreground">Complexity</Label>
                    <Badge className={`mt-1 ${getComplexityColor(currentAnalysis.complexity)}`}>
                      {currentAnalysis.complexity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Label className="text-xs font-medium text-muted-foreground">Sentiment</Label>
                    <Badge className={`mt-1 ${getSentimentColor(currentAnalysis.sentiment)}`}>
                      {currentAnalysis.sentiment.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Label className="text-xs font-medium text-muted-foreground">Urgency</Label>
                    <Badge className={`mt-1 ${getUrgencyColor(currentAnalysis.urgency)}`}>
                      {currentAnalysis.urgency.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Label className="text-xs font-medium text-muted-foreground">Est. Time</Label>
                    <div className="text-sm font-medium mt-1">{currentAnalysis.estimatedTime}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Domain Expertise</Label>
                    <Badge variant="outline" className="mt-2 bg-primary/10 hover:bg-primary/20 transition-colors">
                      {currentAnalysis.domain}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Key Requirements</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentAnalysis.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="hover:bg-secondary/80 transition-colors">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Resources Needed</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentAnalysis.resourcesNeeded.map((resource, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                        >
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Risk Factors</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentAnalysis.riskFactors.length > 0 ? (
                        currentAnalysis.riskFactors.map((risk, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
                          >
                            {risk}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="bg-green-500/10">
                          Low Risk
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Recommended Agent Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentAnalysis.suggestedAgents.map((agent, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-primary/10 hover:bg-primary/20 transition-all hover:scale-105"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {agent}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Analysis Confidence</span>
                  <div className="flex items-center gap-3">
                    <Progress value={currentAnalysis.confidence} className="w-24 h-2" />
                    <span className="text-sm font-mono font-bold">{currentAnalysis.confidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Advanced Prompt Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {promptTemplates.map((template, index) => (
                <div
                  key={template.id}
                  className="p-4 border border-border rounded-lg space-y-3 hover:shadow-md hover:border-primary/30 transition-all duration-300 animate-in slide-in-from-left-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base">{template.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          template.complexity === "advanced"
                            ? "bg-red-500/10 text-red-600"
                            : template.complexity === "intermediate"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {template.complexity}
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-primary/10">
                        {template.effectiveness}% effective
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <p className="text-xs text-muted-foreground italic">Use case: {template.useCase}</p>

                  <div className="p-3 text-sm text-muted-foreground font-mono bg-muted/30 rounded border-l-4 border-primary/30">
                    {template.template}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs px-2 py-1 bg-accent/50">
                        {variable}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTemplateSelect(template)}
                      className="hover:scale-105 transition-all duration-200"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Customize
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:scale-105 transition-all duration-200">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          {generatedAgents.length > 0 && (
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  Generated Agent Blueprints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="p-4 border border-border rounded-lg space-y-3 hover:shadow-md hover:border-primary/30 transition-all duration-300 animate-in slide-in-from-right-2"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{agent.name}</h4>
                      <Badge variant={agent.status === "ready" ? "default" : "secondary"} className="animate-pulse">
                        {agent.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">{agent.role}</p>

                    <div>
                      <Label className="text-xs font-medium">Capabilities</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {agent.capabilities.map((capability, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-muted/30 rounded text-sm font-mono">{agent.prompt}</div>

                    <div className="flex gap-2">
                      <Button size="sm" className="hover:scale-105 transition-all duration-200">
                        <Zap className="w-3 h-3 mr-1" />
                        Deploy Agent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:scale-105 transition-all duration-200 bg-transparent"
                      >
                        <Code className="w-3 h-3 mr-1" />
                        View Config
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          {selectedTemplate && (
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary animate-pulse" />
                  Custom Prompt Builder - {selectedTemplate.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {selectedTemplate.variables.map((variable, index) => (
                    <div
                      key={variable}
                      className="space-y-2 animate-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Label className="text-sm font-medium">{variable.replace(/_/g, " ")}</Label>
                      <Input
                        placeholder={`Enter ${variable.toLowerCase().replace(/_/g, " ")}...`}
                        value={customVariables[variable] || ""}
                        onChange={(e) =>
                          setCustomVariables((prev) => ({
                            ...prev,
                            [variable]: e.target.value,
                          }))
                        }
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Generated Prompt</Label>
                  <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary/30 text-sm font-mono min-h-[100px]">
                    {generateCustomPrompt()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="hover:scale-105 transition-all duration-200">
                    <Download className="w-4 h-4 mr-2" />
                    Export Prompt
                  </Button>
                  <Button variant="outline" className="hover:scale-105 transition-all duration-200 bg-transparent">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
