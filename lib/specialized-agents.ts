import { type AgentConfig, agentRegistry, AgentHelper } from "./agent-integrators"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Specialized Agent Types
export interface SpecializedAgentConfig extends AgentConfig {
  domain: string
  specializations: string[]
  knowledgeBase: string[]
  contextWindow: number
  memoryEnabled: boolean
  learningEnabled: boolean
  customInstructions: string[]
}

export interface AgentMemory {
  agentId: string
  interactions: AgentInteraction[]
  preferences: Record<string, any>
  learnings: string[]
  context: Record<string, any>
}

export interface AgentInteraction {
  id: string
  timestamp: Date
  input: string
  output: string
  feedback?: "positive" | "negative" | "neutral"
  context: Record<string, any>
}

// Domain-Specific Agent Templates
export const SPECIALIZED_AGENT_DOMAINS = {
  FANTASY_SPORTS: {
    domain: "fantasy_sports",
    specializations: ["player_analysis", "lineup_optimization", "waiver_wire", "trade_analysis"],
    knowledgeBase: ["nfl_stats", "nba_stats", "mlb_stats", "injury_reports", "weather_data"],
    systemPrompt: `You are a fantasy sports expert with deep knowledge of player statistics, 
    matchup analysis, and strategic lineup optimization. You provide data-driven recommendations 
    for fantasy football, basketball, and baseball. Always consider recent performance, 
    matchups, weather conditions, and injury reports.`,
    customInstructions: [
      "Always provide confidence levels for recommendations",
      "Consider both floor and ceiling for player projections",
      "Factor in recent trends and matchup history",
      "Provide alternative options for different risk tolerances",
    ],
  },
  GAMBLING_ANALYTICS: {
    domain: "gambling_analytics",
    specializations: ["odds_analysis", "value_betting", "bankroll_management", "risk_assessment"],
    knowledgeBase: ["betting_odds", "historical_data", "team_stats", "market_movements"],
    systemPrompt: `You are a professional sports betting analyst focused on finding value 
    in betting markets. You analyze odds, identify market inefficiencies, and provide 
    disciplined bankroll management advice. Always emphasize responsible gambling and 
    risk management principles.`,
    customInstructions: [
      "Always include risk warnings and responsible gambling reminders",
      "Provide clear reasoning for all recommendations",
      "Include expected value calculations when possible",
      "Suggest appropriate bet sizing based on confidence",
    ],
  },
  TRADING_SIGNALS: {
    domain: "trading_signals",
    specializations: ["technical_analysis", "fundamental_analysis", "risk_management", "market_sentiment"],
    knowledgeBase: ["price_data", "volume_data", "news_sentiment", "economic_indicators"],
    systemPrompt: `You are a quantitative trading analyst specializing in market analysis 
    and signal generation. You combine technical indicators, fundamental analysis, and 
    sentiment data to identify trading opportunities. Always emphasize risk management 
    and position sizing.`,
    customInstructions: [
      "Include stop-loss and take-profit levels",
      "Provide risk-reward ratios for all trades",
      "Consider market conditions and volatility",
      "Suggest position sizing based on account risk",
    ],
  },
  CONTENT_CREATION: {
    domain: "content_creation",
    specializations: ["copywriting", "seo_optimization", "social_media", "brand_voice"],
    knowledgeBase: ["content_trends", "seo_best_practices", "platform_algorithms", "audience_insights"],
    systemPrompt: `You are a content creation specialist with expertise in copywriting, 
    SEO optimization, and social media strategy. You create engaging, platform-optimized 
    content that drives engagement and conversions while maintaining brand consistency.`,
    customInstructions: [
      "Optimize content for specific platforms and audiences",
      "Include relevant keywords and hashtags",
      "Maintain consistent brand voice and tone",
      "Provide content performance predictions",
    ],
  },
  BUSINESS_ANALYSIS: {
    domain: "business_analysis",
    specializations: ["market_research", "competitive_analysis", "financial_modeling", "strategy_planning"],
    knowledgeBase: ["industry_data", "market_trends", "financial_metrics", "competitive_intelligence"],
    systemPrompt: `You are a business analyst with expertise in market research, competitive 
    analysis, and strategic planning. You provide data-driven insights and recommendations 
    to help businesses make informed decisions and optimize their operations.`,
    customInstructions: [
      "Support recommendations with data and analysis",
      "Consider market trends and competitive landscape",
      "Provide actionable insights and next steps",
      "Include risk assessment and mitigation strategies",
    ],
  },
}

// Specialized Agent Factory
export class SpecializedAgentFactory {
  private static memoryStore: Map<string, AgentMemory> = new Map()

  static createSpecializedAgent(
    domain: keyof typeof SPECIALIZED_AGENT_DOMAINS,
    customizations?: Partial<SpecializedAgentConfig>,
  ): SpecializedAgentConfig {
    const template = SPECIALIZED_AGENT_DOMAINS[domain]

    const agent: SpecializedAgentConfig = {
      id: `${domain}_agent_${Date.now()}`,
      name: `${domain.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Agent`,
      type: "analysis",
      capabilities: template.specializations,
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 4000,
      systemPrompt: template.systemPrompt,
      domain: template.domain,
      specializations: template.specializations,
      knowledgeBase: template.knowledgeBase,
      contextWindow: 8000,
      memoryEnabled: true,
      learningEnabled: true,
      customInstructions: template.customInstructions,
      ...customizations,
    }

    // Initialize memory for the agent
    this.initializeMemory(agent.id)

    return agent
  }

  static initializeMemory(agentId: string) {
    if (!this.memoryStore.has(agentId)) {
      const memory: AgentMemory = {
        agentId,
        interactions: [],
        preferences: {},
        learnings: [],
        context: {},
      }
      this.memoryStore.set(agentId, memory)
    }
  }

  static getMemory(agentId: string): AgentMemory | undefined {
    return this.memoryStore.get(agentId)
  }

  static updateMemory(agentId: string, interaction: AgentInteraction) {
    const memory = this.memoryStore.get(agentId)
    if (memory) {
      memory.interactions.push(interaction)
      // Keep only last 50 interactions to manage memory
      if (memory.interactions.length > 50) {
        memory.interactions = memory.interactions.slice(-50)
      }
      this.memoryStore.set(agentId, memory)
    }
  }

  static async executeWithMemory(agentId: string, input: string, context?: Record<string, any>): Promise<string> {
    const agent = agentRegistry.getAgent(agentId) as SpecializedAgentConfig
    if (!agent) throw new Error(`Specialized agent ${agentId} not found`)

    const memory = this.getMemory(agentId)

    // Build context-aware prompt
    let enhancedPrompt = input

    if (memory && agent.memoryEnabled) {
      const recentInteractions = memory.interactions.slice(-5)
      if (recentInteractions.length > 0) {
        enhancedPrompt = `
Previous context:
${recentInteractions.map((i) => `User: ${i.input}\nAssistant: ${i.output}`).join("\n\n")}

Current request: ${input}

Please consider the previous context when responding.
        `
      }
    }

    // Add custom instructions
    if (agent.customInstructions.length > 0) {
      enhancedPrompt += `\n\nAdditional instructions:\n${agent.customInstructions.join("\n")}`
    }

    const executionId = await agentRegistry.executeAgent(agentId, enhancedPrompt)
    const execution = agentRegistry.getExecution(executionId)

    if (execution?.output && memory) {
      // Store interaction in memory
      const interaction: AgentInteraction = {
        id: `interaction_${Date.now()}`,
        timestamp: new Date(),
        input,
        output: execution.output,
        context: context || {},
      }
      this.updateMemory(agentId, interaction)
    }

    return executionId
  }

  static async trainAgent(agentId: string, trainingData: { input: string; expectedOutput: string }[]) {
    const memory = this.getMemory(agentId)
    if (!memory) return

    // Analyze training data to extract learnings
    const learningPrompt = `
Analyze the following training examples and extract key patterns and learnings:

${trainingData
  .map(
    (data, i) => `
Example ${i + 1}:
Input: ${data.input}
Expected Output: ${data.expectedOutput}
`,
  )
  .join("\n")}

Extract 3-5 key learnings that should guide future responses.
    `

    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: learningPrompt,
      })

      memory.learnings.push(text)
      this.memoryStore.set(agentId, memory)
    } catch (error) {
      console.error("Agent training failed:", error)
    }
  }

  static getAgentInsights(agentId: string) {
    const memory = this.getMemory(agentId)
    if (!memory) return null

    const totalInteractions = memory.interactions.length
    const recentInteractions = memory.interactions.slice(-10)
    const averageResponseLength =
      memory.interactions.reduce((acc, i) => acc + i.output.length, 0) / totalInteractions || 0

    const feedbackStats = memory.interactions.reduce(
      (acc, i) => {
        if (i.feedback) acc[i.feedback]++
        return acc
      },
      { positive: 0, negative: 0, neutral: 0 },
    )

    return {
      totalInteractions,
      recentInteractions: recentInteractions.length,
      averageResponseLength: Math.round(averageResponseLength),
      feedbackStats,
      learnings: memory.learnings.length,
      lastInteraction: memory.interactions[memory.interactions.length - 1]?.timestamp,
    }
  }
}

// Agent Specialization Manager
export class AgentSpecializationManager {
  static async createAgentTeam(
    domains: (keyof typeof SPECIALIZED_AGENT_DOMAINS)[],
    teamName: string,
  ): Promise<SpecializedAgentConfig[]> {
    const team = domains.map((domain) =>
      SpecializedAgentFactory.createSpecializedAgent(domain, {
        name: `${teamName} ${domain.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Agent`,
      }),
    )

    // Register all agents
    team.forEach((agent) => agentRegistry.registerAgent(agent))

    return team
  }

  static async executeTeamTask(
    teamAgentIds: string[],
    task: string,
    executionMode: "parallel" | "sequential" | "collaborative",
  ): Promise<string[]> {
    switch (executionMode) {
      case "parallel":
        return AgentHelper.parallelAgents(teamAgentIds, task)

      case "sequential":
        return AgentHelper.chainAgents(teamAgentIds, task)

      case "collaborative":
        // Collaborative mode: each agent builds on previous responses
        const results: string[] = []
        let collaborativeInput = task

        for (const agentId of teamAgentIds) {
          const executionId = await SpecializedAgentFactory.executeWithMemory(
            agentId,
            `${collaborativeInput}\n\nPrevious team input: ${results.length > 0 ? results[results.length - 1] : "None"}`,
          )
          results.push(executionId)

          const execution = agentRegistry.getExecution(executionId)
          if (execution?.output) {
            collaborativeInput = execution.output
          }
        }

        return results

      default:
        throw new Error(`Unknown execution mode: ${executionMode}`)
    }
  }

  static getTeamInsights(teamAgentIds: string[]) {
    return teamAgentIds.map((agentId) => ({
      agentId,
      agent: agentRegistry.getAgent(agentId),
      insights: SpecializedAgentFactory.getAgentInsights(agentId),
    }))
  }
}
