/**
 * Integration Architecture Module
 * Defines how components connect and interact within FortKnox platform
 */

export interface IntegrationPoint {
  id: string
  name: string
  type: 'api' | 'webhook' | 'event' | 'data_flow' | 'shared_service'
  protocol: 'REST' | 'GraphQL' | 'WebSocket' | 'MessageQueue' | 'Database'
  sourceComponent: string
  targetComponent: string
  dataFormat: string
  authentication: string
  rateLimit?: number // requests per second
  sla: {
    latency: number // ms
    availability: string // e.g., "99.9%"
    throughput: number // rps
  }
  errorHandling: {
    retryPolicy: 'none' | 'linear' | 'exponential'
    circuitBreaker: boolean
    fallback: boolean
  }
}

export interface ServiceContract {
  id: string
  serviceName: string
  version: string
  endpoints: {
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    description: string
    requestSchema: any
    responseSchema: any
  }[]
  events: {
    name: string
    payload: any
    description: string
  }[]
  dataModels: Record<string, any>
}

export interface DataFlow {
  id: string
  name: string
  source: string
  destination: string
  dataType: 'user_data' | 'security_events' | 'audit_logs' | 'analytics' | 'configuration'
  volume: 'low' | 'medium' | 'high' | 'very_high'
  frequency: 'real_time' | 'batch' | 'hourly' | 'daily'
  transformation?: string
  encryption: boolean
  retention: string // e.g., "7 years", "90 days"
}

export interface IntegrationTest {
  id: string
  name: string
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security'
  components: string[]
  testCase: {
    setup: any
    input: any
    expectedOutput: any
    assertions: string[]
  }
  status: 'pending' | 'running' | 'passed' | 'failed'
  lastRun?: Date
  duration?: number
  errorMessage?: string
}

export interface FortKnoxArchitecture {
  components: {
    id: string
    name: string
    type: 'authentication' | 'encryption' | 'access_control' | 'auditing' | 'analytics' | 'infrastructure'
    status: 'planned' | 'developing' | 'testing' | 'production'
    owner: string // company name
  }[]
  integrationPoints: IntegrationPoint[]
  dataFlows: DataFlow[]
  sharedServices: {
    id: string
    name: string
    type: 'api_gateway' | 'service_mesh' | 'data_lake' | 'monitoring' | 'security'
    provider: string
    status: 'planned' | 'provisioning' | 'active'
  }[]
}

export interface IntegrationArchitectureModuleInterface {
  // Architecture Definition
  defineArchitecture(arch: FortKnoxArchitecture): Promise<void>
  getArchitecture(): Promise<FortKnoxArchitecture>
  updateComponent(componentId: string, updates: Partial<FortKnoxArchitecture['components'][0]>): Promise<void>

  // Integration Points
  addIntegrationPoint(point: Omit<IntegrationPoint, 'id'>): Promise<string>
  getIntegrationPoints(): Promise<IntegrationPoint[]>
  validateIntegrationPoint(point: IntegrationPoint): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }>

  // Service Contracts
  defineServiceContract(contract: Omit<ServiceContract, 'id'>): Promise<string>
  getServiceContract(serviceName: string, version: string): Promise<ServiceContract | null>

  // Data Flows
  defineDataFlow(flow: Omit<DataFlow, 'id'>): Promise<string>
  getDataFlows(): Promise<DataFlow[]>
  analyzeDataFlowConflicts(): Promise<{
    conflicts: Array<{
      flowA: string
      flowB: string
      issue: string
      severity: 'low' | 'medium' | 'high'
    }>
  }>

  // Testing
  createIntegrationTest(test: Omit<IntegrationTest, 'id' | 'status'>): Promise<string>
  runIntegrationTest(testId: string): Promise<IntegrationTest>
  getTestResults(): Promise<IntegrationTest[]>

  // Validation
  validateArchitecture(): Promise<{
    isValid: boolean
    issues: Array<{
      type: 'error' | 'warning'
      component: string
      message: string
      suggestion: string
    }>
    coverage: number // percentage of integration points tested
  }>
}

// Data Flow: Integration Architecture Module
// Input: Product specs from Product Specification Module
// Input: Requirements from Communication Module
// Output: Integration specs to Infrastructure Module
// Output: Test cases to Testing Module
// Output: Timelines to Timeline Management Module

export class IntegrationArchitectureModule implements IntegrationArchitectureModuleInterface {
  private architecture: FortKnoxArchitecture | null = null
  private serviceContracts = new Map<string, ServiceContract>()
  private integrationTests = new Map<string, IntegrationTest>()

  async defineArchitecture(arch: FortKnoxArchitecture): Promise<void> {
    this.architecture = arch
  }

  async getArchitecture(): Promise<FortKnoxArchitecture> {
    if (!this.architecture) {
      throw new Error('Architecture not defined')
    }
    return this.architecture
  }

  async updateComponent(componentId: string, updates: Partial<FortKnoxArchitecture['components'][0]>): Promise<void> {
    if (!this.architecture) return

    const component = this.architecture.components.find(c => c.id === componentId)
    if (component) {
      Object.assign(component, updates)
    }
  }

  async addIntegrationPoint(point: Omit<IntegrationPoint, 'id'>): Promise<string> {
    if (!this.architecture) {
      throw new Error('Architecture must be defined before adding integration points')
    }

    const id = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const integrationPoint: IntegrationPoint = { ...point, id }
    this.architecture.integrationPoints.push(integrationPoint)
    return id
  }

  async getIntegrationPoints(): Promise<IntegrationPoint[]> {
    return this.architecture?.integrationPoints || []
  }

  async validateIntegrationPoint(point: IntegrationPoint): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate source and target exist
    const components = this.architecture?.components || []
    const sourceExists = components.some(c => c.id === point.sourceComponent)
    const targetExists = components.some(c => c.id === point.targetComponent)

    if (!sourceExists) errors.push(`Source component ${point.sourceComponent} not found`)
    if (!targetExists) errors.push(`Target component ${point.targetComponent} not found`)

    // Validate SLA requirements
    if (point.sla.latency > 1000) {
      warnings.push('High latency requirement may impact performance')
    }

    // Validate rate limits
    if (point.rateLimit && point.rateLimit > 1000) {
      warnings.push('High rate limit may require special infrastructure')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  async defineServiceContract(contract: Omit<ServiceContract, 'id'>): Promise<string> {
    const id = `contract_${contract.serviceName}_${contract.version}`
    this.serviceContracts.set(id, { ...contract, id })
    return id
  }

  async getServiceContract(serviceName: string, version: string): Promise<ServiceContract | null> {
    const id = `contract_${serviceName}_${version}`
    return this.serviceContracts.get(id) || null
  }

  async defineDataFlow(flow: Omit<DataFlow, 'id'>): Promise<string> {
    if (!this.architecture) {
      throw new Error('Architecture must be defined before adding data flows')
    }

    const id = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const dataFlow: DataFlow = { ...flow, id }
    this.architecture.dataFlows.push(dataFlow)
    return id
  }

  async getDataFlows(): Promise<DataFlow[]> {
    return this.architecture?.dataFlows || []
  }

  async analyzeDataFlowConflicts(): Promise<{
    conflicts: Array<{
      flowA: string
      flowB: string
      issue: string
      severity: 'low' | 'medium' | 'high'
    }>
  }> {
    const flows = this.architecture?.dataFlows || []
    const conflicts: Array<{
      flowA: string
      flowB: string
      issue: string
      severity: 'low' | 'medium' | 'high'
    }> = []

    // Check for conflicting data flows
    for (let i = 0; i < flows.length; i++) {
      for (let j = i + 1; j < flows.length; j++) {
        const flowA = flows[i]
        const flowB = flows[j]

        // Check if flows go to same destination with different data types
        if (flowA.destination === flowB.destination &&
            flowA.dataType !== flowB.dataType) {
          conflicts.push({
            flowA: flowA.id,
            flowB: flowB.id,
            issue: `Conflicting data types to ${flowA.destination}`,
            severity: 'medium'
          })
        }
      }
    }

    return { conflicts }
  }

  async createIntegrationTest(test: Omit<IntegrationTest, 'id' | 'status'>): Promise<string> {
    const id = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.integrationTests.set(id, { ...test, id, status: 'pending' })
    return id
  }

  async runIntegrationTest(testId: string): Promise<IntegrationTest> {
    const test = this.integrationTests.get(testId)
    if (!test) {
      throw new Error('Test not found')
    }

    // Update test status
    test.status = 'running'
    test.lastRun = new Date()

    // Simulate test execution
    setTimeout(() => {
      test.status = Math.random() > 0.1 ? 'passed' : 'failed'
      test.duration = Math.random() * 10000 + 1000 // 1-11 seconds
      if (test.status === 'failed') {
        test.errorMessage = 'Mock test failure'
      }
    }, 2000)

    return test
  }

  async getTestResults(): Promise<IntegrationTest[]> {
    return Array.from(this.integrationTests.values())
  }

  async validateArchitecture(): Promise<{
    isValid: boolean
    issues: Array<{
      type: 'error' | 'warning'
      component: string
      message: string
      suggestion: string
    }>
    coverage: number
  }> {
    const issues: Array<{
      type: 'error' | 'warning'
      component: string
      message: string
      suggestion: string
    }> = []

    if (!this.architecture) {
      return {
        isValid: false,
        issues: [{
          type: 'error',
          component: 'architecture',
          message: 'Architecture not defined',
          suggestion: 'Define architecture before validation'
        }],
        coverage: 0
      }
    }

    const { components, integrationPoints, dataFlows } = this.architecture

    // Check for orphaned integration points
    for (const point of integrationPoints) {
      const sourceExists = components.some(c => c.id === point.sourceComponent)
      const targetExists = components.some(c => c.id === point.targetComponent)

      if (!sourceExists) {
        issues.push({
          type: 'error',
          component: point.id,
          message: `Source component ${point.sourceComponent} not found`,
          suggestion: 'Remove or update integration point'
        })
      }

      if (!targetExists) {
        issues.push({
          type: 'error',
          component: point.id,
          message: `Target component ${point.targetComponent} not found`,
          suggestion: 'Remove or update integration point'
        })
      }
    }

    // Calculate test coverage
    const totalIntegrationPoints = integrationPoints.length
    const testedPoints = integrationPoints.filter(point =>
      Array.from(this.integrationTests.values()).some(test =>
        test.components.includes(point.sourceComponent) &&
        test.components.includes(point.targetComponent)
      )
    ).length

    const coverage = totalIntegrationPoints > 0 ?
      (testedPoints / totalIntegrationPoints) * 100 : 0

    return {
      isValid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      coverage: Math.round(coverage)
    }
  }
}
