/**
 * Product Specification Module
 * Manages product definitions, requirements, and technical specifications
 */

export interface ProductSpec {
  id: string
  companyId: string
  companyName: string
  productName: string
  version: string
  category: 'authentication' | 'encryption' | 'access_control' | 'analytics' | 'auditing' | 'infrastructure'
  description: string

  apis: {
    restEndpoints: string[]
    webhooks: string[]
    sdkLanguages: string[]
    authentication: 'api_key' | 'jwt' | 'oauth' | 'custom'
  }

  dataFormats: ('JSON' | 'Protobuf' | 'XML' | 'Binary' | 'Custom')[]
  securityRequirements: string[]

  performance: {
    latencyMs: number
    throughputRps: number
    availability: string // e.g., "99.9%"
    scalability: 'horizontal' | 'vertical' | 'both'
  }

  integrationPoints: {
    provides: string[] // services this product provides
    dependsOn: string[] // services this product needs
    optional: string[] // optional integrations
  }

  development: {
    currentStatus: 'planning' | 'development' | 'testing' | 'production'
    mvpTimeline: string
    productionTimeline: string
    fullFeatureTimeline: string
    blockers: string[]
    dependencies: string[] // other product IDs
  }

  testing: {
    unitTests: boolean
    integrationTests: boolean
    securityAudit: boolean
    performanceTests: boolean
    lastTestDate?: Date
    testCoverage?: number
  }

  createdAt: Date
  updatedAt: Date
}

export interface ProductValidationResult {
  productId: string
  isValid: boolean
  errors: string[]
  warnings: string[]
  score: number // 0-100
}

export interface ProductCompatibility {
  productA: string
  productB: string
  compatibilityScore: number
  issues: string[]
  recommendations: string[]
  integrationComplexity: 'low' | 'medium' | 'high'
}

export interface ProductSpecificationModuleInterface {
  // Product Management
  createProduct(spec: Omit<ProductSpec, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>
  updateProduct(id: string, updates: Partial<ProductSpec>): Promise<void>
  getProduct(id: string): Promise<ProductSpec | null>
  getProductsByCompany(companyId: string): Promise<ProductSpec[]>
  getProductsByCategory(category: string): Promise<ProductSpec[]>

  // Validation
  validateProduct(spec: ProductSpec): Promise<ProductValidationResult>
  validateAllProducts(): Promise<ProductValidationResult[]>

  // Compatibility Analysis
  checkCompatibility(productA: string, productB: string): Promise<ProductCompatibility>
  getCompatibilityMatrix(): Promise<ProductCompatibility[][]>

  // Dependencies
  getDependencyGraph(): Promise<{
    nodes: { id: string; label: string; category: string }[]
    edges: { from: string; to: string; type: 'depends' | 'provides' | 'optional' }[]
  }>

  // Analytics
  getSpecificationMetrics(): Promise<{
    totalProducts: number
    categories: Record<string, number>
    averageCompleteness: number
    validationPassRate: number
  }>
}

// Data Flow: Product Specification Module
// Input: Company information from Communication Module
// Output: Product specs to Integration Architecture Module
// Output: Timelines to Timeline Management Module
// Output: Dependencies to Testing Module

export class ProductSpecificationModule implements ProductSpecificationModuleInterface {
  private products = new Map<string, ProductSpec>()

  async createProduct(spec: Omit<ProductSpec, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()
    this.products.set(id, { ...spec, id, createdAt: now, updatedAt: now })
    return id
  }

  async updateProduct(id: string, updates: Partial<ProductSpec>): Promise<void> {
    const existing = this.products.get(id)
    if (existing) {
      this.products.set(id, { ...existing, ...updates, updatedAt: new Date() })
    }
  }

  async getProduct(id: string): Promise<ProductSpec | null> {
    return this.products.get(id) || null
  }

  async getProductsByCompany(companyId: string): Promise<ProductSpec[]> {
    return Array.from(this.products.values())
      .filter(product => product.companyId === companyId)
  }

  async getProductsByCategory(category: string): Promise<ProductSpec[]> {
    return Array.from(this.products.values())
      .filter(product => product.category === category)
  }

  async validateProduct(spec: ProductSpec): Promise<ProductValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Required field validation
    if (!spec.apis.restEndpoints.length) {
      errors.push('At least one REST endpoint required')
    }

    if (!spec.dataFormats.length) {
      errors.push('At least one data format required')
    }

    if (spec.performance.latencyMs > 1000) {
      warnings.push('High latency may impact user experience')
    }

    // Calculate validation score
    const totalChecks = 10
    const passedChecks = totalChecks - errors.length - Math.floor(warnings.length / 2)
    const score = Math.round((passedChecks / totalChecks) * 100)

    return {
      productId: spec.id,
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    }
  }

  async validateAllProducts(): Promise<ProductValidationResult[]> {
    const results: ProductValidationResult[] = []
    for (const product of this.products.values()) {
      results.push(await this.validateProduct(product))
    }
    return results
  }

  async checkCompatibility(productA: string, productB: string): Promise<ProductCompatibility> {
    const prodA = this.products.get(productA)
    const prodB = this.products.get(productB)

    if (!prodA || !prodB) {
      throw new Error('Product not found')
    }

    // Simple compatibility checking logic
    const issues: string[] = []
    const recommendations: string[] = []

    // Check API compatibility
    if (prodA.apis.authentication !== prodB.apis.authentication) {
      issues.push('Different authentication methods may require adapter')
      recommendations.push('Implement authentication adapter layer')
    }

    // Check data format compatibility
    const commonFormats = prodA.dataFormats.filter(format =>
      prodB.dataFormats.includes(format)
    )
    if (commonFormats.length === 0) {
      issues.push('No common data formats')
      recommendations.push('Add JSON as common format')
    }

    const compatibilityScore = issues.length === 0 ? 95 :
                              issues.length === 1 ? 75 : 50

    return {
      productA,
      productB,
      compatibilityScore,
      issues,
      recommendations,
      integrationComplexity: issues.length > 1 ? 'high' :
                           issues.length === 1 ? 'medium' : 'low'
    }
  }

  async getCompatibilityMatrix(): Promise<ProductCompatibility[][]> {
    const productIds = Array.from(this.products.keys())
    const matrix: ProductCompatibility[][] = []

    for (const idA of productIds) {
      const row: ProductCompatibility[] = []
      for (const idB of productIds) {
        if (idA === idB) {
          row.push({
            productA: idA,
            productB: idB,
            compatibilityScore: 100,
            issues: [],
            recommendations: [],
            integrationComplexity: 'low'
          })
        } else {
          row.push(await this.checkCompatibility(idA, idB))
        }
      }
      matrix.push(row)
    }

    return matrix
  }

  async getDependencyGraph(): Promise<{
    nodes: { id: string; label: string; category: string }[]
    edges: { from: string; to: string; type: 'depends' | 'provides' | 'optional' }[]
  }> {
    const nodes = Array.from(this.products.values()).map(product => ({
      id: product.id,
      label: product.productName,
      category: product.category
    }))

    const edges: { from: string; to: string; type: 'depends' | 'provides' | 'optional' }[] = []

    for (const product of this.products.values()) {
      // Add dependency edges
      product.integrationPoints.dependsOn.forEach(depId => {
        edges.push({ from: product.id, to: depId, type: 'depends' })
      })

      // Add provides edges (reverse direction for visualization)
      product.integrationPoints.provides.forEach(provId => {
        edges.push({ from: provId, to: product.id, type: 'provides' })
      })
    }

    return { nodes, edges }
  }

  async getSpecificationMetrics(): Promise<{
    totalProducts: number
    categories: Record<string, number>
    averageCompleteness: number
    validationPassRate: number
  }> {
    const products = Array.from(this.products.values())
    const validations = await this.validateAllProducts()

    const categories = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageCompleteness = validations.reduce((acc, v) => acc + v.score, 0) / validations.length
    const validationPassRate = validations.filter(v => v.isValid).length / validations.length

    return {
      totalProducts: products.length,
      categories,
      averageCompleteness: Math.round(averageCompleteness),
      validationPassRate: Math.round(validationPassRate * 100) / 100
    }
  }
}
