import { generateText, generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import type { z } from "zod"

// Agent Integration Types
export interface AgentConfig {
  id: string
  name: string
  type: "coding" | "design" | "analysis" | "generation" | "workflow"
  capabilities: string[]
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  tools?: AgentTool[]
}

export interface AgentTool {
  name: string
  description: string
  parameters: Record<string, any>
  execute: (params: any) => Promise<any>
}

export interface AgentExecution {
  id: string
  agentId: string
  status: "pending" | "running" | "completed" | "failed"
  input: any
  output?: any
  error?: string
  startTime: Date
  endTime?: Date
  dependencies?: string[]
}

// Agent Registry
class AgentRegistry {
  private agents: Map<string, AgentConfig> = new Map()
  private executions: Map<string, AgentExecution> = new Map()

  registerAgent(config: AgentConfig) {
    this.agents.set(config.id, config)
  }

  getAgent(id: string): AgentConfig | undefined {
    return this.agents.get(id)
  }

  getAllAgents(): AgentConfig[] {
    return Array.from(this.agents.values())
  }

  getAgentsByType(type: AgentConfig["type"]): AgentConfig[] {
    return this.getAllAgents().filter((agent) => agent.type === type)
  }

  async executeAgent(agentId: string, input: any, dependencies?: string[]): Promise<string> {
    const agent = this.getAgent(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const execution: AgentExecution = {
      id: executionId,
      agentId,
      status: "pending",
      input,
      startTime: new Date(),
      dependencies,
    }

    this.executions.set(executionId, execution)

    try {
      // Wait for dependencies if any
      if (dependencies?.length) {
        await this.waitForDependencies(dependencies)
      }

      execution.status = "running"
      this.executions.set(executionId, execution)

      const { text } = await generateText({
        model: openai(agent.model),
        temperature: agent.temperature,
        system: agent.systemPrompt,
        prompt: typeof input === "string" ? input : JSON.stringify(input),
      })

      execution.output = text
      execution.status = "completed"
      execution.endTime = new Date()
      this.executions.set(executionId, execution)

      return executionId
    } catch (error) {
      execution.error = error instanceof Error ? error.message : "Unknown error"
      execution.status = "failed"
      execution.endTime = new Date()
      this.executions.set(executionId, execution)
      throw error
    }
  }

  private async waitForDependencies(dependencies: string[]): Promise<void> {
    const checkInterval = 100
    const maxWait = 30000 // 30 seconds

    const startTime = Date.now()
    while (Date.now() - startTime < maxWait) {
      const allCompleted = dependencies.every((depId) => {
        const execution = this.executions.get(depId)
        return execution?.status === "completed"
      })

      if (allCompleted) return

      await new Promise((resolve) => setTimeout(resolve, checkInterval))
    }

    throw new Error("Dependency timeout")
  }

  getExecution(id: string): AgentExecution | undefined {
    return this.executions.get(id)
  }

  getExecutionsByAgent(agentId: string): AgentExecution[] {
    return Array.from(this.executions.values()).filter((exec) => exec.agentId === agentId)
  }
}

export const agentRegistry = new AgentRegistry()

// Agent Helpers
export class AgentHelper {
  static async generateStructuredOutput<T>(prompt: string, schema: z.ZodSchema<T>, model = "gpt-4o-mini"): Promise<T> {
    const { object } = await generateObject({
      model: openai(model),
      schema,
      prompt,
    })
    return object
  }

  static async chainAgents(agentIds: string[], input: any): Promise<string[]> {
    const results: string[] = []
    let currentInput = input

    for (const agentId of agentIds) {
      const executionId = await agentRegistry.executeAgent(agentId, currentInput)
      const execution = agentRegistry.getExecution(executionId)
      if (execution?.output) {
        currentInput = execution.output
        results.push(executionId)
      }
    }

    return results
  }

  static async parallelAgents(agentIds: string[], input: any): Promise<string[]> {
    const promises = agentIds.map((agentId) => agentRegistry.executeAgent(agentId, input))
    return Promise.all(promises)
  }

  static createAgentFromTemplate(template: Partial<AgentConfig>, overrides: Partial<AgentConfig>): AgentConfig {
    return {
      id: `agent_${Date.now()}`,
      name: "Custom Agent",
      type: "generation",
      capabilities: [],
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: "You are a helpful AI assistant.",
      ...template,
      ...overrides,
    }
  }
}

// Predefined Agent Templates
export const AGENT_TEMPLATES = {
  CODING_AGENT: {
    type: "coding" as const,
    capabilities: ["code-generation", "debugging", "refactoring", "testing"],
    model: "gpt-4o",
    temperature: 0.3,
    systemPrompt: `You are an expert software developer. You write clean, efficient, and well-documented code. 
    You follow best practices and modern development patterns. Always explain your code choices.`,
  },
  DESIGN_AGENT: {
    type: "design" as const,
    capabilities: ["ui-design", "ux-analysis", "color-theory", "typography"],
    model: "gpt-4o",
    temperature: 0.8,
    systemPrompt: `You are a creative UI/UX designer. You create beautiful, user-friendly interfaces 
    with attention to accessibility, modern design principles, and user experience.`,
  },
  ANALYSIS_AGENT: {
    type: "analysis" as const,
    capabilities: ["data-analysis", "pattern-recognition", "insights", "reporting"],
    model: "gpt-4o",
    temperature: 0.4,
    systemPrompt: `You are a data analyst. You examine data, identify patterns, generate insights, 
    and create clear, actionable reports with visualizations.`,
  },
  WORKFLOW_AGENT: {
    type: "workflow" as const,
    capabilities: ["process-optimization", "automation", "integration", "orchestration"],
    model: "gpt-4o",
    temperature: 0.5,
    systemPrompt: `You are a workflow optimization expert. You design efficient processes, 
    automate repetitive tasks, and integrate systems for maximum productivity.`,
  },
}
