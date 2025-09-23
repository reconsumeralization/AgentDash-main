import { agentRegistry } from "./agent-integrators"
import { SpecializedAgentFactory } from "./specialized-agents"

export interface ExecutionPlan {
  id: string
  name: string
  description: string
  stages: ExecutionStage[]
  totalAgents: number
  estimatedDuration: number
  priority: "low" | "medium" | "high"
  createdAt: Date
}

export interface ExecutionStage {
  id: string
  name: string
  agentIds: string[]
  executionMode: "parallel" | "sequential" | "conditional"
  dependencies: string[]
  conditions?: ExecutionCondition[]
  timeout: number
  retryCount: number
}

export interface ExecutionCondition {
  type: "success" | "failure" | "output_contains" | "output_length" | "custom"
  value: any
  action: "continue" | "skip" | "retry" | "abort"
}

export interface ExecutionMetrics {
  planId: string
  startTime: Date
  endTime?: Date
  totalDuration?: number
  stagesCompleted: number
  stagesTotal: number
  agentsExecuted: number
  agentsTotal: number
  successRate: number
  errors: ExecutionError[]
  performance: StagePerformance[]
}

export interface ExecutionError {
  stageId: string
  agentId: string
  error: string
  timestamp: Date
  retryAttempt: number
}

export interface StagePerformance {
  stageId: string
  duration: number
  agentsCount: number
  successCount: number
  failureCount: number
  averageResponseTime: number
}

// Advanced Agent Orchestrator
export class AgentOrchestrator {
  private static executionPlans: Map<string, ExecutionPlan> = new Map()
  private static activeExecutions: Map<string, ExecutionMetrics> = new Map()
  private static executionQueue: string[] = []

  static createExecutionPlan(name: string, description: string, stages: Omit<ExecutionStage, "id">[]): ExecutionPlan {
    const plan: ExecutionPlan = {
      id: `plan_${Date.now()}`,
      name,
      description,
      stages: stages.map((stage, index) => ({
        ...stage,
        id: `stage_${index + 1}`,
      })),
      totalAgents: stages.reduce((acc, stage) => acc + stage.agentIds.length, 0),
      estimatedDuration: stages.reduce((acc, stage) => acc + stage.timeout, 0),
      priority: "medium",
      createdAt: new Date(),
    }

    this.executionPlans.set(plan.id, plan)
    return plan
  }

  static async executePlan(planId: string, input: any): Promise<ExecutionMetrics> {
    const plan = this.executionPlans.get(planId)
    if (!plan) throw new Error(`Execution plan ${planId} not found`)

    const metrics: ExecutionMetrics = {
      planId,
      startTime: new Date(),
      stagesCompleted: 0,
      stagesTotal: plan.stages.length,
      agentsExecuted: 0,
      agentsTotal: plan.totalAgents,
      successRate: 0,
      errors: [],
      performance: [],
    }

    this.activeExecutions.set(planId, metrics)

    try {
      let currentInput = input

      for (const stage of plan.stages) {
        const stageStart = Date.now()

        try {
          // Check dependencies
          await this.waitForDependencies(stage.dependencies)

          // Execute stage based on mode
          const stageResults = await this.executeStage(stage, currentInput)

          // Update metrics
          const stageDuration = Date.now() - stageStart
          const stagePerformance: StagePerformance = {
            stageId: stage.id,
            duration: stageDuration,
            agentsCount: stage.agentIds.length,
            successCount: stageResults.filter((r) => r.success).length,
            failureCount: stageResults.filter((r) => !r.success).length,
            averageResponseTime: stageDuration / stage.agentIds.length,
          }

          metrics.performance.push(stagePerformance)
          metrics.stagesCompleted++
          metrics.agentsExecuted += stage.agentIds.length

          // Process stage results for next stage input
          if (stage.executionMode === "sequential") {
            const lastResult = stageResults[stageResults.length - 1]
            currentInput = lastResult.output || currentInput
          } else {
            // For parallel execution, combine outputs
            const outputs = stageResults.map((r) => r.output).filter(Boolean)
            currentInput = outputs.length > 0 ? outputs.join("\n\n") : currentInput
          }
        } catch (error) {
          const executionError: ExecutionError = {
            stageId: stage.id,
            agentId: "stage_orchestrator",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date(),
            retryAttempt: 0,
          }
          metrics.errors.push(executionError)

          // Handle stage failure based on conditions
          const shouldContinue = this.handleStageFailure(stage, error)
          if (!shouldContinue) break
        }
      }

      metrics.endTime = new Date()
      metrics.totalDuration = metrics.endTime.getTime() - metrics.startTime.getTime()
      metrics.successRate = ((metrics.agentsExecuted - metrics.errors.length) / metrics.agentsExecuted) * 100

      this.activeExecutions.set(planId, metrics)
      return metrics
    } catch (error) {
      metrics.endTime = new Date()
      metrics.totalDuration = metrics.endTime.getTime() - metrics.startTime.getTime()
      this.activeExecutions.set(planId, metrics)
      throw error
    }
  }

  private static async executeStage(
    stage: ExecutionStage,
    input: any,
  ): Promise<Array<{ agentId: string; output?: string; success: boolean }>> {
    const results: Array<{ agentId: string; output?: string; success: boolean }> = []

    switch (stage.executionMode) {
      case "parallel":
        const parallelPromises = stage.agentIds.map(async (agentId) => {
          try {
            const executionId = await SpecializedAgentFactory.executeWithMemory(agentId, input)
            const execution = agentRegistry.getExecution(executionId)
            return {
              agentId,
              output: execution?.output,
              success: execution?.status === "completed",
            }
          } catch (error) {
            return {
              agentId,
              success: false,
            }
          }
        })

        const parallelResults = await Promise.all(parallelPromises)
        results.push(...parallelResults)
        break

      case "sequential":
        let sequentialInput = input
        for (const agentId of stage.agentIds) {
          try {
            const executionId = await SpecializedAgentFactory.executeWithMemory(agentId, sequentialInput)
            const execution = agentRegistry.getExecution(executionId)
            const result = {
              agentId,
              output: execution?.output,
              success: execution?.status === "completed",
            }
            results.push(result)

            if (result.output) {
              sequentialInput = result.output
            }
          } catch (error) {
            results.push({
              agentId,
              success: false,
            })
          }
        }
        break

      case "conditional":
        for (const agentId of stage.agentIds) {
          const shouldExecute = await this.evaluateConditions(stage.conditions || [], input)
          if (shouldExecute) {
            try {
              const executionId = await SpecializedAgentFactory.executeWithMemory(agentId, input)
              const execution = agentRegistry.getExecution(executionId)
              results.push({
                agentId,
                output: execution?.output,
                success: execution?.status === "completed",
              })
            } catch (error) {
              results.push({
                agentId,
                success: false,
              })
            }
          }
        }
        break
    }

    return results
  }

  private static async waitForDependencies(dependencies: string[]): Promise<void> {
    if (dependencies.length === 0) return

    const maxWait = 60000 // 1 minute
    const checkInterval = 1000 // 1 second
    const startTime = Date.now()

    while (Date.now() - startTime < maxWait) {
      const allCompleted = dependencies.every((depId) => {
        const metrics = this.activeExecutions.get(depId)
        return metrics?.endTime !== undefined
      })

      if (allCompleted) return

      await new Promise((resolve) => setTimeout(resolve, checkInterval))
    }

    throw new Error("Dependency timeout")
  }

  private static async evaluateConditions(conditions: ExecutionCondition[], context: any): Promise<boolean> {
    if (conditions.length === 0) return true

    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, context)
      if (!result) return false
    }

    return true
  }

  private static async evaluateCondition(condition: ExecutionCondition, context: any): Promise<boolean> {
    switch (condition.type) {
      case "success":
        return context.success === condition.value
      case "failure":
        return context.success !== condition.value
      case "output_contains":
        return context.output?.includes(condition.value) || false
      case "output_length":
        return (context.output?.length || 0) >= condition.value
      case "custom":
        // Custom condition evaluation would be implemented here
        return true
      default:
        return true
    }
  }

  private static handleStageFailure(stage: ExecutionStage, error: any): boolean {
    // Implement retry logic and failure handling
    return false // For now, stop on failure
  }

  static getExecutionPlan(planId: string): ExecutionPlan | undefined {
    return this.executionPlans.get(planId)
  }

  static getAllExecutionPlans(): ExecutionPlan[] {
    return Array.from(this.executionPlans.values())
  }

  static getExecutionMetrics(planId: string): ExecutionMetrics | undefined {
    return this.activeExecutions.get(planId)
  }

  static getActiveExecutions(): ExecutionMetrics[] {
    return Array.from(this.activeExecutions.values()).filter((m) => !m.endTime)
  }

  static cancelExecution(planId: string): boolean {
    const metrics = this.activeExecutions.get(planId)
    if (metrics && !metrics.endTime) {
      metrics.endTime = new Date()
      metrics.totalDuration = metrics.endTime.getTime() - metrics.startTime.getTime()
      this.activeExecutions.set(planId, metrics)
      return true
    }
    return false
  }

  // Predefined execution patterns
  static createParallelAnalysisPattern(agentIds: string[]): ExecutionPlan {
    return this.createExecutionPlan(
      "Parallel Analysis",
      "Execute multiple agents in parallel for comprehensive analysis",
      [
        {
          name: "Parallel Analysis Stage",
          agentIds,
          executionMode: "parallel",
          dependencies: [],
          timeout: 30000,
          retryCount: 1,
        },
      ],
    )
  }

  static createSequentialWorkflowPattern(agentIds: string[]): ExecutionPlan {
    return this.createExecutionPlan("Sequential Workflow", "Execute agents in sequence, passing output to next agent", [
      {
        name: "Sequential Processing Stage",
        agentIds,
        executionMode: "sequential",
        dependencies: [],
        timeout: 60000,
        retryCount: 2,
      },
    ])
  }

  static createHybridPattern(parallelAgentIds: string[], sequentialAgentIds: string[]): ExecutionPlan {
    return this.createExecutionPlan("Hybrid Execution", "Parallel analysis followed by sequential processing", [
      {
        name: "Parallel Analysis",
        agentIds: parallelAgentIds,
        executionMode: "parallel",
        dependencies: [],
        timeout: 30000,
        retryCount: 1,
      },
      {
        name: "Sequential Processing",
        agentIds: sequentialAgentIds,
        executionMode: "sequential",
        dependencies: ["stage_1"],
        timeout: 45000,
        retryCount: 2,
      },
    ])
  }
}

// Execution Queue Manager
export class ExecutionQueueManager {
  private static queue: Array<{ planId: string; input: any; priority: number }> = []
  private static isProcessing = false
  private static maxConcurrent = 3

  static addToQueue(planId: string, input: any, priority = 1) {
    this.queue.push({ planId, input, priority })
    this.queue.sort((a, b) => b.priority - a.priority) // Higher priority first

    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  private static async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false
      return
    }

    this.isProcessing = true
    const activeExecutions = AgentOrchestrator.getActiveExecutions()

    if (activeExecutions.length < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift()
      if (item) {
        try {
          await AgentOrchestrator.executePlan(item.planId, item.input)
        } catch (error) {
          console.error(`Execution failed for plan ${item.planId}:`, error)
        }
      }
    }

    // Continue processing after a delay
    setTimeout(() => this.processQueue(), 1000)
  }

  static getQueueStatus() {
    return {
      queueLength: this.queue.length,
      activeExecutions: AgentOrchestrator.getActiveExecutions().length,
      isProcessing: this.isProcessing,
    }
  }

  static clearQueue() {
    this.queue = []
  }
}
