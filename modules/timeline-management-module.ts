/**
 * Timeline Management Module
 * Coordinates development schedules, dependencies, and critical path analysis
 */

export interface TimelineMilestone {
  id: string
  name: string
  description: string
  phase: 'foundation' | 'integration' | 'optimization' | 'launch'
  plannedDate: Date
  actualDate?: Date
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'blocked' | 'at_risk'
  dependencies: string[] // milestone IDs that must complete first
  deliverables: string[]
  owner: string // company or person responsible
  riskLevel: 'low' | 'medium' | 'high'
  blockers: string[]
}

export interface TimelineDependency {
  id: string
  fromMilestone: string
  toMilestone: string
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish'
  lag: number // days
  description: string
}

export interface ResourceAllocation {
  id: string
  resourceType: 'developer' | 'designer' | 'infrastructure' | 'testing' | 'security'
  resourceName: string
  allocatedTo: string[] // milestone IDs
  startDate: Date
  endDate: Date
  utilization: number // percentage
  cost: number
}

export interface CriticalPath {
  milestones: string[]
  totalDuration: number // days
  slack: Record<string, number> // days of flexibility per milestone
  bottlenecks: Array<{
    milestone: string
    delay: number
    impact: string
  }>
}

export interface TimelineAnalysis {
  overallProgress: number
  onTimeMilestones: number
  delayedMilestones: number
  criticalPathDelay: number
  resourceConflicts: Array<{
    resource: string
    conflicts: Array<{
      milestoneA: string
      milestoneB: string
      overlap: number
    }>
  }>
  recommendations: string[]
}

export interface TimelineManagementModuleInterface {
  // Milestone Management
  createMilestone(milestone: Omit<TimelineMilestone, 'id'>): Promise<string>
  updateMilestone(id: string, updates: Partial<TimelineMilestone>): Promise<void>
  getMilestone(id: string): Promise<TimelineMilestone | null>
  getMilestonesByPhase(phase: string): Promise<TimelineMilestone[]>

  // Dependency Management
  addDependency(dependency: Omit<TimelineDependency, 'id'>): Promise<string>
  getDependencies(): Promise<TimelineDependency[]>
  validateDependencies(): Promise<{
    isValid: boolean
    cycles: string[][]
    warnings: string[]
  }>

  // Resource Management
  allocateResource(allocation: Omit<ResourceAllocation, 'id'>): Promise<string>
  getResourceAllocations(): Promise<ResourceAllocation[]>
  checkResourceConflicts(): Promise<{
    conflicts: Array<{
      resource: string
      milestoneA: string
      milestoneB: string
      overlapDays: number
    }>
  }>

  // Critical Path Analysis
  calculateCriticalPath(): Promise<CriticalPath>
  identifyBottlenecks(): Promise<{
    bottlenecks: Array<{
      milestone: string
      delay: number
      impact: string
      mitigation: string
    }>
  }>

  // Timeline Analysis
  analyzeTimeline(): Promise<TimelineAnalysis>
  getProgressReport(): Promise<{
    phase: string
    completed: number
    total: number
    percentage: number
    status: 'on_track' | 'at_risk' | 'delayed'
  }[]>

  // Scheduling
  rescheduleMilestone(milestoneId: string, newDate: Date): Promise<{
    affectedMilestones: string[]
    newCriticalPath: CriticalPath
    warnings: string[]
  }>
}

// Data Flow: Timeline Management Module
// Input: Product timelines from Product Specification Module
// Input: Integration requirements from Integration Architecture Module
// Output: Scheduling to Infrastructure Module
// Output: Progress reports to Communication Module
// Output: Resource allocation to all modules

export class TimelineManagementModule implements TimelineManagementModuleInterface {
  private milestones = new Map<string, TimelineMilestone>()
  private dependencies = new Map<string, TimelineDependency>()
  private resources = new Map<string, ResourceAllocation>()

  async createMilestone(milestone: Omit<TimelineMilestone, 'id'>): Promise<string> {
    const id = `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.milestones.set(id, { ...milestone, id })
    return id
  }

  async updateMilestone(id: string, updates: Partial<TimelineMilestone>): Promise<void> {
    const existing = this.milestones.get(id)
    if (existing) {
      this.milestones.set(id, { ...existing, ...updates })
    }
  }

  async getMilestone(id: string): Promise<TimelineMilestone | null> {
    return this.milestones.get(id) || null
  }

  async getMilestonesByPhase(phase: string): Promise<TimelineMilestone[]> {
    return Array.from(this.milestones.values())
      .filter(milestone => milestone.phase === phase)
  }

  async addDependency(dependency: Omit<TimelineDependency, 'id'>): Promise<string> {
    const id = `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.dependencies.set(id, { ...dependency, id })
    return id
  }

  async getDependencies(): Promise<TimelineDependency[]> {
    return Array.from(this.dependencies.values())
  }

  async validateDependencies(): Promise<{
    isValid: boolean
    cycles: string[][]
    warnings: string[]
  }> {
    const cycles: string[][] = []
    const warnings: string[] = []

    // Simple cycle detection (basic implementation)
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (milestoneId: string): boolean => {
      if (recursionStack.has(milestoneId)) return true
      if (visited.has(milestoneId)) return false

      visited.add(milestoneId)
      recursionStack.add(milestoneId)

      // Check dependencies
      const deps = Array.from(this.dependencies.values())
        .filter(dep => dep.fromMilestone === milestoneId)

      for (const dep of deps) {
        if (hasCycle(dep.toMilestone)) {
          cycles.push([milestoneId, dep.toMilestone])
          return true
        }
      }

      recursionStack.delete(milestoneId)
      return false
    }

    // Check all milestones for cycles
    for (const milestoneId of this.milestones.keys()) {
      if (hasCycle(milestoneId)) {
        break
      }
    }

    return {
      isValid: cycles.length === 0,
      cycles,
      warnings
    }
  }

  async allocateResource(allocation: Omit<ResourceAllocation, 'id'>): Promise<string> {
    const id = `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.resources.set(id, { ...allocation, id })
    return id
  }

  async getResourceAllocations(): Promise<ResourceAllocation[]> {
    return Array.from(this.resources.values())
  }

  async checkResourceConflicts(): Promise<{
    conflicts: Array<{
      resource: string
      milestoneA: string
      milestoneB: string
      overlapDays: number
    }>
  }> {
    const conflicts: Array<{
      resource: string
      milestoneA: string
      milestoneB: string
      overlapDays: number
    }> = []

    const allocations = Array.from(this.resources.values())

    // Check for overlapping resource allocations
    for (const allocA of allocations) {
      for (const allocB of allocations) {
        if (allocA.id === allocB.id || allocA.resourceName !== allocB.resourceName) continue

        // Check for date overlap
        const overlap = this.calculateOverlap(allocA.startDate, allocA.endDate, allocB.startDate, allocB.endDate)
        if (overlap > 0) {
          conflicts.push({
            resource: allocA.resourceName,
            milestoneA: allocA.allocatedTo[0] || 'unknown',
            milestoneB: allocB.allocatedTo[0] || 'unknown',
            overlapDays: Math.ceil(overlap / (1000 * 60 * 60 * 24))
          })
        }
      }
    }

    return { conflicts }
  }

  private calculateOverlap(startA: Date, endA: Date, startB: Date, endB: Date): number {
    const maxStart = new Date(Math.max(startA.getTime(), startB.getTime()))
    const minEnd = new Date(Math.min(endA.getTime(), endB.getTime()))
    return Math.max(0, minEnd.getTime() - maxStart.getTime())
  }

  async calculateCriticalPath(): Promise<CriticalPath> {
    // Simplified critical path calculation
    const allMilestones = Array.from(this.milestones.values())
    const completedMilestones = allMilestones.filter(m => m.status === 'completed')
    const pendingMilestones = allMilestones.filter(m => m.status !== 'completed')

    // Find milestones with no dependencies (starting points)
    const startMilestones = pendingMilestones.filter(milestone =>
      !Array.from(this.dependencies.values()).some(dep => dep.toMilestone === milestone.id)
    )

    // Simple path calculation (in production, use proper CPM algorithm)
    const criticalPathMilestones = startMilestones.map(m => m.id)
    let totalDuration = 0

    // Calculate slack (simplified)
    const slack: Record<string, number> = {}
    for (const milestone of allMilestones) {
      const planned = milestone.plannedDate.getTime()
      const actual = milestone.actualDate?.getTime() || planned
      slack[milestone.id] = Math.max(0, (actual - planned) / (1000 * 60 * 60 * 24))
    }

    return {
      milestones: criticalPathMilestones,
      totalDuration,
      slack,
      bottlenecks: [] // Would be calculated based on dependencies
    }
  }

  async identifyBottlenecks(): Promise<{
    bottlenecks: Array<{
      milestone: string
      delay: number
      impact: string
      mitigation: string
    }>
  }> {
    const bottlenecks: Array<{
      milestone: string
      delay: number
      impact: string
      mitigation: string
    }> = []

    const milestones = Array.from(this.milestones.values())

    for (const milestone of milestones) {
      if (milestone.status === 'delayed' && milestone.riskLevel === 'high') {
        const delay = milestone.actualDate ?
          (milestone.actualDate.getTime() - milestone.plannedDate.getTime()) / (1000 * 60 * 60 * 24) :
          0

        bottlenecks.push({
          milestone: milestone.id,
          delay: Math.ceil(delay),
          impact: `Blocks ${milestone.dependencies.length} dependent milestones`,
          mitigation: `Allocate additional ${milestone.owner} resources`
        })
      }
    }

    return { bottlenecks }
  }

  async analyzeTimeline(): Promise<TimelineAnalysis> {
    const milestones = Array.from(this.milestones.values())
    const totalMilestones = milestones.length
    const completedMilestones = milestones.filter(m => m.status === 'completed').length
    const delayedMilestones = milestones.filter(m => m.status === 'delayed').length

    // Calculate resource conflicts
    const resourceConflicts = await this.checkResourceConflicts()

    // Calculate critical path
    const criticalPath = await this.calculateCriticalPath()

    return {
      overallProgress: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
      onTimeMilestones: completedMilestones - delayedMilestones,
      delayedMilestones,
      criticalPathDelay: criticalPath.totalDuration,
      resourceConflicts: resourceConflicts.conflicts.map(conflict => ({
        resource: conflict.resource,
        conflicts: [{
          milestoneA: conflict.milestoneA,
          milestoneB: conflict.milestoneB,
          overlap: conflict.overlapDays
        }]
      })),
      recommendations: [
        'Allocate additional developers to delayed milestones',
        'Reevaluate critical path dependencies',
        'Consider parallel development for independent components'
      ]
    }
  }

  async getProgressReport(): Promise<{
    phase: string
    completed: number
    total: number
    percentage: number
    status: 'on_track' | 'at_risk' | 'delayed'
  }[]> {
    const phases = ['foundation', 'integration', 'optimization', 'launch']
    const reports = []

    for (const phase of phases) {
      const phaseMilestones = await this.getMilestonesByPhase(phase)
      const completed = phaseMilestones.filter(m => m.status === 'completed').length
      const total = phaseMilestones.length
      const percentage = total > 0 ? (completed / total) * 100 : 0

      let status: 'on_track' | 'at_risk' | 'delayed' = 'on_track'
      const delayedCount = phaseMilestones.filter(m => m.status === 'delayed').length
      const atRiskCount = phaseMilestones.filter(m => m.status === 'at_risk').length

      if (delayedCount > total * 0.2) status = 'delayed'
      else if (atRiskCount > total * 0.3) status = 'at_risk'

      reports.push({
        phase,
        completed,
        total,
        percentage: Math.round(percentage),
        status
      })
    }

    return reports
  }

  async rescheduleMilestone(milestoneId: string, newDate: Date): Promise<{
    affectedMilestones: string[]
    newCriticalPath: CriticalPath
    warnings: string[]
  }> {
    const milestone = this.milestones.get(milestoneId)
    if (!milestone) {
      throw new Error('Milestone not found')
    }

    // Update milestone date
    milestone.plannedDate = newDate
    milestone.status = 'pending'

    // Find affected milestones (those that depend on this one)
    const affectedMilestones: string[] = []
    const warnings: string[] = []

    // Simple dependency check (in production, use proper graph traversal)
    for (const dep of this.dependencies.values()) {
      if (dep.fromMilestone === milestoneId) {
        affectedMilestones.push(dep.toMilestone)
        warnings.push(`Milestone ${dep.toMilestone} may need rescheduling`)
      }
    }

    const newCriticalPath = await this.calculateCriticalPath()

    return {
      affectedMilestones,
      newCriticalPath,
      warnings
    }
  }
}
