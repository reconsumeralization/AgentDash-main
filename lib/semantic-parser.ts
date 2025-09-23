import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

// Schema for semantic workflow parsing
const WorkflowSemanticSchema = z.object({
  intent: z.string().describe("The main intent or goal of the workflow"),
  domain: z
    .enum(["fantasy-sports", "gambling", "trading", "gaming", "analytics", "general"])
    .describe("The domain category"),
  entities: z.array(z.string()).describe("Key entities mentioned (players, teams, stocks, etc.)"),
  actions: z.array(z.string()).describe("Actions to be performed (analyze, optimize, predict, etc.)"),
  dataRequirements: z
    .array(
      z.object({
        source: z.string().describe("Data source name"),
        type: z.string().describe("Type of data needed"),
        format: z.string().describe("Expected data format"),
        frequency: z.string().describe("How often data is needed"),
      }),
    )
    .describe("Required data sources and types"),
  outputFormat: z.string().describe("Expected output format"),
  complexity: z.enum(["Simple", "Medium", "Advanced"]).describe("Estimated complexity level"),
  estimatedCost: z.number().describe("Estimated cost in SOL per execution"),
  suggestedNodes: z
    .array(
      z.object({
        type: z.enum(["agent", "workflow", "data"]).describe("Node type"),
        label: z.string().describe("Node label"),
        description: z.string().describe("Node description"),
        capabilities: z.array(z.string()).optional().describe("Agent capabilities if applicable"),
        source: z.string().optional().describe("Data source if applicable"),
        steps: z.number().optional().describe("Number of steps if workflow node"),
      }),
    )
    .describe("Suggested workflow nodes"),
  connections: z
    .array(
      z.object({
        from: z.number().describe("Source node index"),
        to: z.number().describe("Target node index"),
        relationship: z.string().describe("Relationship type"),
      }),
    )
    .describe("Suggested node connections"),
})

export type WorkflowSemantic = z.infer<typeof WorkflowSemanticSchema>

export class SemanticParser {
  private static instance: SemanticParser

  public static getInstance(): SemanticParser {
    if (!SemanticParser.instance) {
      SemanticParser.instance = new SemanticParser()
    }
    return SemanticParser.instance
  }

  async parseDescription(description: string): Promise<WorkflowSemantic> {
    try {
      const { object } = await generateObject({
        model: openai("gpt-4"),
        schema: WorkflowSemanticSchema,
        prompt: `
          Parse the following workflow description and extract structured information:
          
          "${description}"
          
          Analyze the description and provide:
          1. The main intent/goal
          2. Domain category (fantasy-sports, gambling, trading, gaming, analytics, or general)
          3. Key entities mentioned
          4. Actions to be performed
          5. Data requirements with sources, types, formats, and frequency
          6. Expected output format
          7. Complexity level (Simple, Medium, Advanced)
          8. Estimated cost in SOL (0.01-0.50 range)
          9. Suggested workflow nodes with appropriate types and descriptions
          10. Logical connections between nodes
          
          For domain-specific workflows:
          - Fantasy Sports: Focus on player analysis, lineup optimization, injury reports
          - Gambling: Focus on odds analysis, value betting, arbitrage opportunities
          - Trading: Focus on technical analysis, signals, market data
          - Gaming: Focus on performance tracking, analytics, improvement insights
          - Analytics: Focus on data processing, visualization, reporting
          
          Create a logical flow of 3-7 nodes that would accomplish the described workflow.
        `,
      })

      return object
    } catch (error) {
      console.error("[v0] Semantic parsing error:", error)

      // Fallback to basic parsing
      return this.fallbackParse(description)
    }
  }

  private fallbackParse(description: string): WorkflowSemantic {
    const words = description.toLowerCase().split(/\s+/)

    // Basic keyword detection
    const domainKeywords = {
      "fantasy-sports": ["fantasy", "lineup", "player", "nfl", "nba", "mlb", "dfs"],
      gambling: ["bet", "odds", "sportsbook", "arbitrage", "value", "wager"],
      trading: ["trade", "stock", "crypto", "signal", "technical", "chart"],
      gaming: ["game", "esports", "performance", "rank", "skill", "competitive"],
      analytics: ["analyze", "data", "report", "dashboard", "metrics", "insights"],
    }

    let detectedDomain: keyof typeof domainKeywords | undefined = undefined
    let maxMatches = 0

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      const matches = keywords.filter((keyword) => words.some((word) => word.includes(keyword))).length

      if (matches > maxMatches) {
        maxMatches = matches
        detectedDomain = domain as keyof typeof domainKeywords
      }
    }

    const actionWords = ["analyze", "optimize", "generate", "compare", "track", "calculate", "predict", "identify"]
    const entityWords = ["player", "team", "stock", "price", "odds", "game", "data", "performance"]

    const actions = actionWords.filter((action) => words.some((word) => word.includes(action)))

    const entities = entityWords.filter((entity) => words.some((word) => word.includes(entity)))

    return {
      intent: actions[0] ? `${actions[0]} ${entities[0] || "data"}` : "process data",
      domain: detectedDomain as any,
      entities,
      actions,
      dataRequirements: [
        {
          source: "API",
          type: "real-time data",
          format: "JSON",
          frequency: "on-demand",
        },
      ],
      outputFormat: "structured results",
      complexity: "Medium",
      estimatedCost: 0.05,
      suggestedNodes: [
        {
          type: "data",
          label: "Data Input",
          description: "Collect required data",
        },
        {
          type: "agent",
          label: "Processing Agent",
          description: "Process and analyze data",
          capabilities: actions,
        },
        {
          type: "workflow",
          label: "Output Generator",
          description: "Generate final results",
          steps: 2,
        },
      ],
      connections: [
        { from: 0, to: 1, relationship: "provides data to" },
        { from: 1, to: 2, relationship: "sends results to" },
      ],
    }
  }

  async generateWorkflowFromSemantic(semantic: WorkflowSemantic) {
    const nodes = semantic.suggestedNodes.map((node, index) => ({
      id: `node-${index}`,
      type: node.type,
      position: {
        x: 100 + index * 300,
        y: 100 + Math.floor(index / 3) * 200,
      },
      data: {
        label: node.label,
        description: node.description,
        ...(node.type === "agent" && {
          type: `${semantic.domain} Agent`,
          capabilities: node.capabilities || semantic.actions,
          cost: semantic.estimatedCost / semantic.suggestedNodes.length,
        }),
        ...(node.type === "data" && {
          source: node.source || semantic.dataRequirements[0]?.source || "API",
          format: semantic.dataRequirements[0]?.format || "JSON",
        }),
        ...(node.type === "workflow" && {
          steps: node.steps || 3,
        }),
      },
    }))

    const edges = semantic.connections.map((connection, index) => ({
      id: `edge-${index}`,
      source: `node-${connection.from}`,
      target: `node-${connection.to}`,
      animated: true,
      label: connection.relationship,
      style: { stroke: this.getEdgeColor(semantic.domain) },
    }))

    return {
      nodes,
      edges,
      metadata: {
        semantic,
        createdAt: new Date().toISOString(),
        estimatedCost: semantic.estimatedCost,
        complexity: semantic.complexity,
      },
    }
  }

  private getEdgeColor(domain: string): string {
    const colors = {
      "fantasy-sports": "#10b981",
      gambling: "#f59e0b",
      trading: "#3b82f6",
      gaming: "#8b5cf6",
      analytics: "#f97316",
      general: "#6b7280",
    }
    return colors[domain as keyof typeof colors] || colors.general
  }

  async suggestImprovements(workflow: any): Promise<string[]> {
    try {
      const { object } = await generateObject({
        model: openai("gpt-4"),
        schema: z.object({
          improvements: z.array(z.string()).describe("Suggested improvements for the workflow"),
        }),
        prompt: `
          Analyze this workflow and suggest improvements:
          
          Workflow: ${JSON.stringify(workflow, null, 2)}
          
          Consider:
          1. Missing data sources or validation steps
          2. Error handling and fallback mechanisms
          3. Performance optimizations
          4. Cost reduction opportunities
          5. Additional features that would add value
          6. Security and privacy considerations
          
          Provide 3-5 specific, actionable improvement suggestions.
        `,
      })

      return object.improvements
    } catch (error) {
      console.error("[v0] Error generating improvements:", error)
      return [
        "Add error handling for API failures",
        "Implement data caching to reduce costs",
        "Add validation steps for input data",
        "Consider adding notification system for results",
      ]
    }
  }
}

// Export singleton instance
export const semanticParser = SemanticParser.getInstance()
