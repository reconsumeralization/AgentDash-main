/**
 * MSRC CVRF API Client
 * 
 * This client provides access to Microsoft Security Response Center's
 * Common Vulnerability Reporting Framework (CVRF) API for security
 * intelligence and vulnerability data.
 * 
 * Based on OpenAPI 3.0.1 specification for MSRC CVRF API v3
 */

export interface CVRFDocument {
  id: string
  title: string
  type: string
  publisher: {
    contact_details: string
    issuing_authority: string
  }
  document_tracking: {
    identification: {
      id: string
      alias: string
    }
    status: string
    version: string
    initial_release_date: string
    current_release_date: string
    generator: {
      engine: string
      date: string
    }
  }
  document_notes?: Array<{
    title: string
    audience: string
    type: string
    ordinal: string
    note: string
  }>
  document_distribution?: {
    text: string
  }
  aggregate_severity?: {
    text: string
    namespace: string
  }
  acknowledgments?: Array<{
    name: string
    organization: string
    description: string
    url: string[]
  }>
  product_tree?: {
    branch?: Array<{
      type: string
      name: string
      product: Array<{
        product_id: string
        name: string
        product_identification_helper?: Array<{
          type: string
      value: string
        }>
      }>
    }>
    full_product_names?: Array<{
      product_id: string
      cpe: string
      name: string
    }>
    product_groups?: Array<{
      group_id: string
      description: string
      product_id: string[]
    }>
    relationships?: Array<{
      product_reference: string
      relation_type: string
      relates_to_product_reference: string
      full_product_name: Array<{
        product_id: string
        cpe: string
        name: string
      }>
    }>
  }
  vulnerabilities?: Array<{
    ordinal: string
    title: string
    id: string
    notes?: Array<{
      title: string
      audience: string
      type: string
      ordinal: string
      note: string
    }>
    discovery_date?: string
    release_date?: string
    involvements?: Array<{
      party: string
      status: string
      description?: string
    }>
    cvss_score_sets?: Array<{
      score_set_id: string
      base_score: string
      temporal_score?: string
      environmental_score?: string
      vector: string
      temporal_vector?: string
      environmental_vector?: string
    }>
    product_statuses?: Array<{
      product_id: string[]
      type: string
    }>
    product_statuses_notes?: Array<{
      title: string
      audience: string
      type: string
      ordinal: string
      note: string
    }>
    threats?: Array<{
      type: string
      description: string
      product_id: string[]
      group_id?: string[]
      date: string
    }>
    remediations?: Array<{
      type: string
      description: string
      product_id: string[]
      group_id?: string[]
      date: string
      url?: string
      supercedence?: string
      restart_required?: string
      sub_restart_required?: string
      supercedence_eula?: string
      supercedence_lfp?: string
    }>
    references?: Array<{
      type: string
      url: string
      description: string
    }>
    acknowledgments?: Array<{
      name: string
      organization: string
      description: string
      url: string[]
    }>
  }>
}

export interface SecurityUpdate {
  id: string
  alias: string
  document_title: string
  severity: string
  initial_release_date: string
  current_release_date: string
  cvrf_url: string
}

export interface MSRCAPIConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

export class MSRCCVRFClient {
  private config: MSRCAPIConfig
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout: number = 300000 // 5 minutes

  constructor(config?: Partial<MSRCAPIConfig>) {
    this.config = {
      baseUrl: 'https://api.msrc.microsoft.com/cvrf/v3.0',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    }
  }

  /**
   * Get all security update summaries
   */
  async getSecurityUpdates(options?: {
    $filter?: string
    $orderby?: string
    $top?: number
    $skip?: number
    $count?: boolean
  }): Promise<SecurityUpdate[]> {
    const cacheKey = `updates_${JSON.stringify(options)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const params = new URLSearchParams()
      if (options?.$filter) params.append('$filter', options.$filter)
      if (options?.$orderby) params.append('$orderby', options.$orderby)
      if (options?.$top) params.append('$top', options.$top.toString())
      if (options?.$skip) params.append('$skip', options.$skip.toString())
      if (options?.$count) params.append('$count', options.$count.toString())

      const url = `${this.config.baseUrl}/updates?${params.toString()}`
      const response = await this.makeRequest(url)
      
      const data = await response.json()
      this.setCachedData(cacheKey, data.value || data)
      return data.value || data
    } catch (error) {
      console.error('Failed to fetch security updates:', error)
      throw error
    }
  }

  /**
   * Get security update by ID
   */
  async getSecurityUpdateById(id: string): Promise<SecurityUpdate> {
    const cacheKey = `update_${id}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const url = `${this.config.baseUrl}/updates/${id}`
      const response = await this.makeRequest(url)
      const data = await response.json()
      
      this.setCachedData(cacheKey, data)
      return data
    } catch (error) {
      console.error(`Failed to fetch security update ${id}:`, error)
      throw error
    }
  }

  /**
   * Get CVRF document by ID
   */
  async getCVRFDocument(id: string): Promise<CVRFDocument> {
    const cacheKey = `cvrf_${id}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const url = `${this.config.baseUrl}/cvrf/${id}`
      const response = await this.makeRequest(url)
      const data = await response.json()
      
      this.setCachedData(cacheKey, data)
      return data
    } catch (error) {
      console.error(`Failed to fetch CVRF document ${id}:`, error)
      throw error
    }
  }

  /**
   * Get CSAF document by ID
   */
  async getCSAFDocument(id: string): Promise<any> {
    const cacheKey = `csaf_${id}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const url = `${this.config.baseUrl}/csaf/${id}`
      const response = await this.makeRequest(url)
      const data = await response.json()
      
      this.setCachedData(cacheKey, data)
      return data
    } catch (error) {
      console.error(`Failed to fetch CSAF document ${id}:`, error)
      throw error
    }
  }

  /**
   * Search for vulnerabilities by CVE ID
   */
  async searchByCVE(cveId: string): Promise<SecurityUpdate[]> {
    try {
      const updates = await this.getSecurityUpdates({
        $filter: `contains(alias, '${cveId}')`
      })
      return updates
    } catch (error) {
      console.error(`Failed to search for CVE ${cveId}:`, error)
      throw error
    }
  }

  /**
   * Get recent security updates
   */
  async getRecentUpdates(days: number = 30): Promise<SecurityUpdate[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const isoDate = cutoffDate.toISOString()

    try {
      const updates = await this.getSecurityUpdates({
        $filter: `current_release_date ge ${isoDate}`,
        $orderby: 'current_release_date desc'
      })
      return updates
    } catch (error) {
      console.error(`Failed to fetch recent updates:`, error)
      throw error
    }
  }

  /**
   * Get high severity vulnerabilities
   */
  async getHighSeverityVulnerabilities(): Promise<SecurityUpdate[]> {
    try {
      const updates = await this.getSecurityUpdates({
        $filter: "severity eq 'Critical' or severity eq 'Important'",
        $orderby: 'current_release_date desc'
      })
      return updates
    } catch (error) {
      console.error('Failed to fetch high severity vulnerabilities:', error)
      throw error
    }
  }

  /**
   * Get vulnerabilities by year
   */
  async getVulnerabilitiesByYear(year: number): Promise<SecurityUpdate[]> {
    try {
      const updates = await this.getSecurityUpdates({
        $filter: `contains(alias, '${year}')`,
        $orderby: 'current_release_date desc'
      })
      return updates
    } catch (error) {
      console.error(`Failed to fetch vulnerabilities for year ${year}:`, error)
      throw error
    }
  }

  /**
   * Analyze vulnerability patterns for fuzzing
   */
  async analyzeVulnerabilityPatterns(updates: SecurityUpdate[]): Promise<{
    commonProducts: Array<{ product: string; count: number }>
    commonVulnerabilityTypes: Array<{ type: string; count: number }>
    severityDistribution: Record<string, number>
    monthlyTrends: Array<{ month: string; count: number }>
  }> {
    const analysis = {
      commonProducts: [] as Array<{ product: string; count: number }>,
      commonVulnerabilityTypes: [] as Array<{ type: string; count: number }>,
      severityDistribution: {} as Record<string, number>,
      monthlyTrends: [] as Array<{ month: string; count: number }>
    }

    // Analyze severity distribution
    updates.forEach(update => {
      analysis.severityDistribution[update.severity] = 
        (analysis.severityDistribution[update.severity] || 0) + 1
    })

    // Analyze monthly trends
    const monthlyCounts: Record<string, number> = {}
    updates.forEach(update => {
      const month = update.current_release_date.substring(0, 7) // YYYY-MM
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1
    })

    analysis.monthlyTrends = Object.entries(monthlyCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return analysis
  }

  /**
   * Generate fuzzing targets based on vulnerability data
   */
  async generateFuzzingTargets(updates: SecurityUpdate[]): Promise<Array<{
    target: string
    priority: 'high' | 'medium' | 'low'
    vulnerabilityTypes: string[]
    affectedProducts: string[]
    cvssScore?: number
  }>> {
    const targets: Array<{
      target: string
      priority: 'high' | 'medium' | 'low'
      vulnerabilityTypes: string[]
      affectedProducts: string[]
      cvssScore?: number
    }> = []

    for (const update of updates) {
      // Determine priority based on severity
      let priority: 'high' | 'medium' | 'low' = 'low'
      if (update.severity === 'Critical') priority = 'high'
      else if (update.severity === 'Important') priority = 'medium'

      // Extract vulnerability types from title
      const vulnerabilityTypes = this.extractVulnerabilityTypes(update.document_title)
      
      // Extract affected products
      const affectedProducts = this.extractAffectedProducts(update.document_title)

      targets.push({
        target: update.id,
        priority,
        vulnerabilityTypes,
        affectedProducts,
        cvssScore: this.extractCVSSScore(update.document_title)
      })
    }

    return targets.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * Extract vulnerability types from document title
   */
  private extractVulnerabilityTypes(title: string): string[] {
    const types: string[] = []
    const commonTypes = [
      'Remote Code Execution',
      'Elevation of Privilege',
      'Information Disclosure',
      'Denial of Service',
      'Spoofing',
      'Cross-Site Scripting',
      'Buffer Overflow',
      'SQL Injection',
      'Memory Corruption',
      'Integer Overflow'
    ]

    commonTypes.forEach(type => {
      if (title.toLowerCase().includes(type.toLowerCase())) {
        types.push(type)
      }
    })

    return types
  }

  /**
   * Extract affected products from document title
   */
  private extractAffectedProducts(title: string): string[] {
    const products: string[] = []
    const commonProducts = [
      'Windows',
      'Office',
      'Edge',
      'Internet Explorer',
      'Visual Studio',
      'SQL Server',
      'Exchange',
      'SharePoint',
      'Azure',
      'PowerShell'
    ]

    commonProducts.forEach(product => {
      if (title.includes(product)) {
        products.push(product)
      }
    })

    return products
  }

  /**
   * Extract CVSS score from document title
   */
  private extractCVSSScore(title: string): number | undefined {
    const cvssMatch = title.match(/CVSS:(\d+\.\d+)/i)
    return cvssMatch ? parseFloat(cvssMatch[1]) : undefined
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest(url: string): Promise<Response> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AI-Platform-Security-Fuzzer/1.0'
          }
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return response
      } catch (error) {
        lastError = error as Error
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * attempt)
        }
      }
    }

    throw lastError || new Error('Request failed after all retry attempts')
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get cached data
   */
  private getCachedData(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  /**
   * Set cached data
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

/**
 * Security Intelligence Service
 * 
 * Combines MSRC CVRF data with fuzzing intelligence
 */
export class SecurityIntelligenceService {
  private msrcClient: MSRCCVRFClient
  private fuzzingEngine: any // Reference to our fuzzing engine

  constructor(msrcClient: MSRCCVRFClient, fuzzingEngine?: any) {
    this.msrcClient = msrcClient
    this.fuzzingEngine = fuzzingEngine
  }

  /**
   * Generate intelligent fuzzing campaigns based on MSRC data
   */
  async generateIntelligentFuzzingCampaigns(): Promise<Array<{
    name: string
    description: string
    targets: string[]
    priority: 'high' | 'medium' | 'low'
    vulnerabilityTypes: string[]
    estimatedDuration: number
    successCriteria: string[]
  }>> {
    try {
      // Get recent high-severity vulnerabilities
      const recentUpdates = await this.msrcClient.getRecentUpdates(90)
      const highSeverityUpdates = recentUpdates.filter(
        update => update.severity === 'Critical' || update.severity === 'Important'
      )

      // Analyze patterns
      const analysis = await this.msrcClient.analyzeVulnerabilityPatterns(highSeverityUpdates)
      const fuzzingTargets = await this.msrcClient.generateFuzzingTargets(highSeverityUpdates)

      // Generate campaigns
      const campaigns = []

      // High-priority campaign for critical vulnerabilities
      const criticalTargets = fuzzingTargets.filter(t => t.priority === 'high')
      if (criticalTargets.length > 0) {
        campaigns.push({
          name: 'Critical Vulnerability Fuzzing',
          description: 'High-priority fuzzing campaign targeting critical vulnerabilities from MSRC',
          targets: criticalTargets.map(t => t.target),
          priority: 'high' as const,
          vulnerabilityTypes: [...new Set(criticalTargets.flatMap(t => t.vulnerabilityTypes))],
          estimatedDuration: 120, // 2 hours
          successCriteria: [
            'Identify buffer overflow vulnerabilities',
            'Detect memory corruption issues',
            'Find injection vulnerabilities'
          ]
        })
      }

      // Medium-priority campaign for important vulnerabilities
      const importantTargets = fuzzingTargets.filter(t => t.priority === 'medium')
      if (importantTargets.length > 0) {
        campaigns.push({
          name: 'Important Vulnerability Fuzzing',
          description: 'Medium-priority fuzzing campaign targeting important vulnerabilities',
          targets: importantTargets.map(t => t.target),
          priority: 'medium' as const,
          vulnerabilityTypes: [...new Set(importantTargets.flatMap(t => t.vulnerabilityTypes))],
          estimatedDuration: 60, // 1 hour
          successCriteria: [
            'Identify privilege escalation vectors',
            'Detect information disclosure issues',
            'Find denial of service vulnerabilities'
          ]
        })
      }

      return campaigns
    } catch (error) {
      console.error('Failed to generate intelligent fuzzing campaigns:', error)
      throw error
    }
  }

  /**
   * Monitor for new vulnerabilities and trigger fuzzing
   */
  async monitorAndTriggerFuzzing(): Promise<void> {
    try {
      const recentUpdates = await this.msrcClient.getRecentUpdates(1) // Last 24 hours
      
      if (recentUpdates.length > 0) {
        console.log(`🚨 New vulnerabilities detected: ${recentUpdates.length}`)
        
        // Generate immediate fuzzing campaign for new vulnerabilities
        const immediateCampaign = {
          name: 'Immediate Response Fuzzing',
          description: 'Emergency fuzzing campaign for newly discovered vulnerabilities',
          targets: recentUpdates.map(u => u.id),
          priority: 'high' as const,
          vulnerabilityTypes: ['Unknown'],
          estimatedDuration: 30,
          successCriteria: ['Identify exploit vectors', 'Detect attack patterns']
        }

        // Trigger fuzzing if engine is available
        if (this.fuzzingEngine) {
          console.log('🎯 Triggering immediate fuzzing campaign...')
          // Implementation would depend on fuzzing engine interface
        }
      }
    } catch (error) {
      console.error('Failed to monitor and trigger fuzzing:', error)
    }
  }
}
