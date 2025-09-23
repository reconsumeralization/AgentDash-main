import { NextRequest, NextResponse } from 'next/server'
import { VulnerabilityPrioritizationEngine, defaultPrioritizationConfig } from '@/lib/vulnerability-prioritization-engine'

const prioritizationEngine = new VulnerabilityPrioritizationEngine(defaultPrioritizationConfig)

// Mock vulnerability data - in production, this would come from your database
const mockVulnerabilities = [
  {
    id: 'vuln-001',
    title: 'SQL Injection in User Authentication',
    description: 'Critical SQL injection vulnerability in the user authentication endpoint that could lead to complete database compromise.',
    severity: 'Critical' as const,
    type: 'sql-injection' as const,
    cwe: 'CWE-89',
    owasp: 'A03:2021 – Injection',
    cvss: 9.8,
    discovered: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-20'),
    status: 'open' as const,
    assignee: 'security-team',
    reporter: 'external-researcher',
    vrpScope: {
      inScope: true,
      scopeReason: 'Authentication system is in VRP scope',
      businessImpact: 'critical' as const,
      userImpact: 'critical' as const,
      dataExposure: true,
      systemAccess: true,
      financialImpact: 1000000
    },
    remediation: {
      complexity: 'moderate' as const,
      estimatedHours: 16,
      requiresDowntime: false,
      dependencies: ['database-migration', 'code-review'],
      testingRequired: true,
      rollbackPlan: true,
      externalDependencies: []
    },
    attackVector: {
      exploitability: 'easy' as const,
      attackComplexity: 'low' as const,
      privilegesRequired: 'none' as const,
      userInteraction: 'none' as const,
      scope: 'unchanged' as const,
      confidentiality: 'high' as const,
      integrity: 'high' as const,
      availability: 'high' as const,
      attackVector: 'network' as const,
      attackSurface: 'public' as const
    },
    tags: ['authentication', 'database', 'critical'],
    affectedSystems: ['auth-service', 'user-database'],
    references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-0001'],
    proofOfConcept: 'SELECT * FROM users WHERE username = \'admin\' OR \'1\'=\'1\'',
    remediationSteps: [
      'Implement parameterized queries',
      'Add input validation',
      'Enable SQL injection protection',
      'Conduct security testing'
    ]
  },
  {
    id: 'vuln-002',
    title: 'Cross-Site Scripting (XSS) in Profile Editor',
    description: 'Stored XSS vulnerability in the user profile editor that could allow attackers to execute malicious scripts.',
    severity: 'High' as const,
    type: 'xss' as const,
    cwe: 'CWE-79',
    owasp: 'A03:2021 – Injection',
    cvss: 7.2,
    discovered: new Date('2024-01-18'),
    lastUpdated: new Date('2024-01-22'),
    status: 'in-progress' as const,
    assignee: 'frontend-team',
    reporter: 'internal-scan',
    vrpScope: {
      inScope: true,
      scopeReason: 'User-facing application in VRP scope',
      businessImpact: 'high' as const,
      userImpact: 'high' as const,
      dataExposure: false,
      systemAccess: false,
      financialImpact: 250000
    },
    remediation: {
      complexity: 'simple' as const,
      estimatedHours: 8,
      requiresDowntime: false,
      dependencies: ['frontend-deployment'],
      testingRequired: true,
      rollbackPlan: true,
      externalDependencies: []
    },
    attackVector: {
      exploitability: 'moderate' as const,
      attackComplexity: 'low' as const,
      privilegesRequired: 'low' as const,
      userInteraction: 'required' as const,
      scope: 'unchanged' as const,
      confidentiality: 'low' as const,
      integrity: 'high' as const,
      availability: 'none' as const,
      attackVector: 'network' as const,
      attackSurface: 'authenticated' as const
    },
    tags: ['frontend', 'xss', 'user-input'],
    affectedSystems: ['profile-service', 'web-frontend'],
    references: ['https://owasp.org/www-community/attacks/xss/'],
    proofOfConcept: '<script>alert("XSS")</script>',
    remediationSteps: [
      'Implement output encoding',
      'Add Content Security Policy',
      'Validate and sanitize user input',
      'Update frontend framework'
    ]
  },
  {
    id: 'vuln-003',
    title: 'Hardcoded API Keys in Configuration',
    description: 'Hardcoded API keys found in configuration files that could be exposed in version control.',
    severity: 'Medium' as const,
    type: 'hardcoded-secrets' as const,
    cwe: 'CWE-798',
    owasp: 'A07:2021 – Identification and Authentication Failures',
    cvss: 5.3,
    discovered: new Date('2024-01-20'),
    lastUpdated: new Date('2024-01-25'),
    status: 'open' as const,
    assignee: 'devops-team',
    reporter: 'security-scan',
    vrpScope: {
      inScope: false,
      scopeReason: 'Configuration management not in VRP scope',
      businessImpact: 'medium' as const,
      userImpact: 'low' as const,
      dataExposure: true,
      systemAccess: false,
      financialImpact: 50000
    },
    remediation: {
      complexity: 'trivial' as const,
      estimatedHours: 2,
      requiresDowntime: false,
      dependencies: ['secrets-management'],
      testingRequired: false,
      rollbackPlan: false,
      externalDependencies: ['vault-service']
    },
    attackVector: {
      exploitability: 'easy' as const,
      attackComplexity: 'low' as const,
      privilegesRequired: 'none' as const,
      userInteraction: 'none' as const,
      scope: 'unchanged' as const,
      confidentiality: 'high' as const,
      integrity: 'none' as const,
      availability: 'none' as const,
      attackVector: 'local' as const,
      attackSurface: 'internal' as const
    },
    tags: ['secrets', 'configuration', 'devops'],
    affectedSystems: ['config-service', 'api-gateway'],
    references: ['https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_credentials'],
    remediationSteps: [
      'Move secrets to secure vault',
      'Implement environment variables',
      'Add secrets scanning to CI/CD',
      'Rotate compromised keys'
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')
    const vrpScope = searchParams.get('vrpScope')
    const sortBy = searchParams.get('sortBy') || 'priority'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Calculate priority scores for all vulnerabilities
    const vulnerabilitiesWithScores = mockVulnerabilities.map(vuln => 
      prioritizationEngine.calculatePriorityScore(vuln)
    )
    
    // Apply filters
    let filteredVulnerabilities = vulnerabilitiesWithScores
    
    if (severity && severity !== 'all') {
      filteredVulnerabilities = filteredVulnerabilities.filter(v => v.severity === severity)
    }
    
    if (status && status !== 'all') {
      filteredVulnerabilities = filteredVulnerabilities.filter(v => v.status === status)
    }
    
    if (vrpScope && vrpScope !== 'all') {
      const inScope = vrpScope === 'in-scope'
      filteredVulnerabilities = filteredVulnerabilities.filter(v => v.vrpScope.inScope === inScope)
    }
    
    // Apply sorting
    if (sortBy === 'priority') {
      filteredVulnerabilities = prioritizationEngine.sortByPriority(filteredVulnerabilities)
    } else if (sortBy === 'severity') {
      const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'Info': 0 }
      filteredVulnerabilities.sort((a, b) => {
        const comparison = severityOrder[a.severity] - severityOrder[b.severity]
        return sortOrder === 'asc' ? comparison : -comparison
      })
    } else if (sortBy === 'discovered') {
      filteredVulnerabilities.sort((a, b) => {
        const comparison = a.discovered.getTime() - b.discovered.getTime()
        return sortOrder === 'asc' ? comparison : -comparison
      })
    } else if (sortBy === 'cvss') {
      filteredVulnerabilities.sort((a, b) => {
        const comparison = (a.cvss || 0) - (b.cvss || 0)
        return sortOrder === 'asc' ? comparison : -comparison
      })
    }
    
    // Apply pagination
    const paginatedVulnerabilities = filteredVulnerabilities.slice(offset, offset + limit)
    
    // Generate summary statistics
    const summary = {
      total: vulnerabilitiesWithScores.length,
      filtered: filteredVulnerabilities.length,
      critical: vulnerabilitiesWithScores.filter(v => v.severity === 'Critical').length,
      high: vulnerabilitiesWithScores.filter(v => v.severity === 'High').length,
      medium: vulnerabilitiesWithScores.filter(v => v.severity === 'Medium').length,
      low: vulnerabilitiesWithScores.filter(v => v.severity === 'Low').length,
      info: vulnerabilitiesWithScores.filter(v => v.severity === 'Info').length,
      inScope: vulnerabilitiesWithScores.filter(v => v.vrpScope.inScope).length,
      outOfScope: vulnerabilitiesWithScores.filter(v => !v.vrpScope.inScope).length,
      avgPriorityScore: vulnerabilitiesWithScores.length > 0 
        ? Math.round(vulnerabilitiesWithScores.reduce((sum, v) => sum + v.priorityScore, 0) / vulnerabilitiesWithScores.length)
        : 0
    }
    
    return NextResponse.json({
      vulnerabilities: paginatedVulnerabilities,
      summary,
      pagination: {
        limit,
        offset,
        total: filteredVulnerabilities.length,
        hasMore: offset + limit < filteredVulnerabilities.length
      }
    })
    
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vulnerabilities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real implementation, you would save the vulnerability to your database
    // For now, we'll just return the calculated priority score
    
    const vulnerability = prioritizationEngine.calculatePriorityScore(body)
    
    return NextResponse.json({
      vulnerability,
      message: 'Vulnerability created successfully'
    })
    
  } catch (error) {
    console.error('Error creating vulnerability:', error)
    return NextResponse.json(
      { error: 'Failed to create vulnerability' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    // In a real implementation, you would update the vulnerability in your database
    // For now, we'll just recalculate the priority score
    
    const vulnerability = prioritizationEngine.calculatePriorityScore(updateData)
    
    return NextResponse.json({
      vulnerability,
      message: 'Vulnerability updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating vulnerability:', error)
    return NextResponse.json(
      { error: 'Failed to update vulnerability' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Vulnerability ID is required' },
        { status: 400 }
      )
    }
    
    // In a real implementation, you would delete the vulnerability from your database
    // For now, we'll just return a success message
    
    return NextResponse.json({
      message: 'Vulnerability deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting vulnerability:', error)
    return NextResponse.json(
      { error: 'Failed to delete vulnerability' },
      { status: 500 }
    )
  }
}
