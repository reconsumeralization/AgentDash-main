#!/usr/bin/env node

/**
 * Security Intelligence Demo
 * 
 * This script demonstrates the MSRC CVRF API integration and
 * intelligent fuzzing campaign generation capabilities.
 */

const https = require('https')
const http = require('http')

// Configuration for the demo
const DEMO_CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiEndpoint: '/api/security-intelligence',
  timeframe: '30d',
  severity: 'Critical'
}

class SecurityIntelligenceDemo {
  constructor() {
    this.isRunning = false
    this.results = {
      vulnerabilities: [],
      analysis: null,
      campaigns: [],
      cacheStats: null
    }
  }

  /**
   * Start the security intelligence demo
   */
  async start() {
    console.log('🔒 Starting Security Intelligence Demo...')
    console.log('📋 Configuration:')
    console.log(`   Base URL: ${DEMO_CONFIG.baseUrl}`)
    console.log(`   Timeframe: ${DEMO_CONFIG.timeframe}`)
    console.log(`   Severity Filter: ${DEMO_CONFIG.severity}`)
    console.log('')

    this.isRunning = true

    try {
      // Step 1: Fetch security updates
      await this.fetchSecurityUpdates()
      
      // Step 2: Get vulnerability analysis
      await this.getVulnerabilityAnalysis()
      
      // Step 3: Generate fuzzing campaigns
      await this.generateFuzzingCampaigns()
      
      // Step 4: Get cache statistics
      await this.getCacheStats()
      
      // Step 5: Demonstrate real-time monitoring
      await this.demonstrateRealTimeMonitoring()
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message)
    } finally {
      this.isRunning = false
      this.showFinalResults()
    }
  }

  /**
   * Fetch security updates from MSRC
   */
  async fetchSecurityUpdates() {
    console.log('🔍 Fetching security updates from MSRC CVRF API...')
    
    try {
      const response = await this.makeRequest(`${DEMO_CONFIG.apiEndpoint}?action=updates&timeframe=${DEMO_CONFIG.timeframe}&severity=${DEMO_CONFIG.severity}`)
      const data = await response.json()
      
      if (data.success) {
        this.results.vulnerabilities = data.data
        console.log(`✅ Found ${data.count} ${DEMO_CONFIG.severity} vulnerabilities`)
        
        // Show sample vulnerabilities
        if (data.data.length > 0) {
          console.log('📋 Sample vulnerabilities:')
          data.data.slice(0, 3).forEach((vuln, index) => {
            console.log(`   ${index + 1}. ${vuln.alias}: ${vuln.document_title}`)
            console.log(`      Severity: ${vuln.severity}`)
            console.log(`      Released: ${new Date(vuln.current_release_date).toLocaleDateString()}`)
          })
        }
      } else {
        throw new Error(data.error || 'Failed to fetch security updates')
      }
    } catch (error) {
      console.error('❌ Failed to fetch security updates:', error.message)
      console.log('💡 This might be because:')
      console.log('   1. The development server is not running (run "npm run dev")')
      console.log('   2. The MSRC API is temporarily unavailable')
      console.log('   3. Network connectivity issues')
      console.log('')
      console.log('🔄 Continuing with mock data for demonstration...')
      
      // Use mock data for demonstration
      this.results.vulnerabilities = this.getMockVulnerabilities()
      console.log(`✅ Using mock data: Found ${this.results.vulnerabilities.length} ${DEMO_CONFIG.severity} vulnerabilities`)
    }
  }

  /**
   * Get mock vulnerability data for demonstration
   */
  getMockVulnerabilities() {
    return [
      {
        alias: 'CVE-2024-0001',
        document_title: 'Critical Security Update for Windows',
        severity: 'Critical',
        current_release_date: new Date().toISOString(),
        document_tracking: {
          identification: {
            id: '2024-Jan',
            alias: 'CVE-2024-0001'
          }
        }
      },
      {
        alias: 'CVE-2024-0002',
        document_title: 'Important Security Update for Office',
        severity: 'Critical',
        current_release_date: new Date(Date.now() - 86400000).toISOString(),
        document_tracking: {
          identification: {
            id: '2024-Jan',
            alias: 'CVE-2024-0002'
          }
        }
      },
      {
        alias: 'CVE-2024-0003',
        document_title: 'Critical Security Update for Edge',
        severity: 'Critical',
        current_release_date: new Date(Date.now() - 172800000).toISOString(),
        document_tracking: {
          identification: {
            id: '2024-Jan',
            alias: 'CVE-2024-0003'
          }
        }
      }
    ]
  }

  /**
   * Get vulnerability analysis
   */
  async getVulnerabilityAnalysis() {
    console.log('📊 Analyzing vulnerability patterns...')
    
    try {
      const response = await this.makeRequest(`${DEMO_CONFIG.apiEndpoint}?action=analysis&timeframe=${DEMO_CONFIG.timeframe}`)
      const data = await response.json()
      
      if (data.success) {
        this.results.analysis = data.data
        console.log('✅ Vulnerability analysis completed')
        
        // Show analysis results
        console.log('📈 Analysis Results:')
        console.log(`   Total Vulnerabilities: ${data.totalVulnerabilities}`)
        console.log(`   Severity Distribution:`)
        Object.entries(data.data.severityDistribution).forEach(([severity, count]) => {
          console.log(`     ${severity}: ${count}`)
        })
        
        console.log(`   Top Products:`)
        data.data.commonProducts.slice(0, 3).forEach(product => {
          console.log(`     ${product.product}: ${product.count} vulnerabilities`)
        })
        
        console.log(`   Top Vulnerability Types:`)
        data.data.commonVulnerabilityTypes.slice(0, 3).forEach(type => {
          console.log(`     ${type.type}: ${type.count} occurrences`)
        })
      } else {
        throw new Error(data.error || 'Failed to analyze vulnerabilities')
      }
    } catch (error) {
      console.error('❌ Failed to analyze vulnerabilities:', error.message)
      console.log('🔄 Using mock analysis data...')
      
      // Use mock analysis data
      this.results.analysis = {
        totalVulnerabilities: this.results.vulnerabilities.length,
        severityDistribution: { Critical: this.results.vulnerabilities.length },
        commonProducts: [
          { product: 'Windows', count: this.results.vulnerabilities.length },
          { product: 'Office', count: Math.floor(this.results.vulnerabilities.length * 0.7) },
          { product: 'Edge', count: Math.floor(this.results.vulnerabilities.length * 0.5) }
        ],
        commonVulnerabilityTypes: [
          { type: 'Remote Code Execution', count: this.results.vulnerabilities.length },
          { type: 'Privilege Escalation', count: Math.floor(this.results.vulnerabilities.length * 0.8) },
          { type: 'Information Disclosure', count: Math.floor(this.results.vulnerabilities.length * 0.6) }
        ],
        analysisDate: new Date().toISOString()
      }
      console.log('✅ Mock vulnerability analysis completed')
    }
  }

  /**
   * Generate intelligent fuzzing campaigns
   */
  async generateFuzzingCampaigns() {
    console.log('🎯 Generating intelligent fuzzing campaigns...')
    
    try {
      const response = await this.makeRequest(`${DEMO_CONFIG.apiEndpoint}?action=campaigns`)
      const data = await response.json()
      
      if (data.success) {
        this.results.campaigns = data.data
        console.log(`✅ Generated ${data.count} fuzzing campaigns`)
        
        // Show campaign details
        console.log('🚀 Fuzzing Campaigns:')
        data.data.forEach((campaign, index) => {
          console.log(`   ${index + 1}. ${campaign.name}`)
          console.log(`      Priority: ${campaign.priority}`)
          console.log(`      Targets: ${campaign.targets.length} vulnerabilities`)
          console.log(`      Duration: ${campaign.estimatedDuration} minutes`)
          console.log(`      Vulnerability Types: ${campaign.vulnerabilityTypes.join(', ')}`)
          console.log(`      Success Criteria:`)
          campaign.successCriteria.forEach(criteria => {
            console.log(`        - ${criteria}`)
          })
        })
      } else {
        throw new Error(data.error || 'Failed to generate fuzzing campaigns')
      }
    } catch (error) {
      console.error('❌ Failed to generate fuzzing campaigns:', error.message)
      console.log('🔄 Using mock campaign data...')
      
      // Use mock campaign data
      this.results.campaigns = [
        {
          name: 'Critical Windows RCE Campaign',
          priority: 'High',
          targets: this.results.vulnerabilities.slice(0, 2),
          estimatedDuration: 45,
          vulnerabilityTypes: ['Remote Code Execution', 'Privilege Escalation'],
          successCriteria: [
            'Identify exploitable RCE vectors',
            'Test privilege escalation paths',
            'Validate security patches'
          ]
        },
        {
          name: 'Office Document Processing Campaign',
          priority: 'Medium',
          targets: this.results.vulnerabilities.slice(1, 3),
          estimatedDuration: 30,
          vulnerabilityTypes: ['Information Disclosure', 'Code Injection'],
          successCriteria: [
            'Test document parsing vulnerabilities',
            'Validate input sanitization',
            'Check for information leaks'
          ]
        }
      ]
      console.log(`✅ Generated ${this.results.campaigns.length} mock fuzzing campaigns`)
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    console.log('💾 Retrieving cache statistics...')
    
    try {
      const response = await this.makeRequest(`${DEMO_CONFIG.apiEndpoint}?action=cache-stats`)
      const data = await response.json()
      
      if (data.success) {
        this.results.cacheStats = data.data
        console.log('✅ Cache statistics retrieved')
        console.log(`   Cache Size: ${data.data.size} entries`)
        console.log(`   Cached Keys: ${data.data.keys.join(', ')}`)
      } else {
        throw new Error(data.error || 'Failed to get cache stats')
      }
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error.message)
      console.log('🔄 Using mock cache data...')
      
      // Use mock cache data
      this.results.cacheStats = {
        size: 15,
        keys: ['vulnerabilities_30d', 'analysis_critical', 'campaigns_high_priority', 'monitoring_alerts'],
        lastUpdated: new Date().toISOString()
      }
      console.log('✅ Mock cache statistics retrieved')
    }
  }

  /**
   * Demonstrate real-time monitoring
   */
  async demonstrateRealTimeMonitoring() {
    console.log('🔄 Demonstrating real-time monitoring...')
    
    try {
      const response = await this.makeRequest(`${DEMO_CONFIG.apiEndpoint}?action=monitor`)
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Real-time monitoring demonstration completed')
        console.log(`   Message: ${data.message}`)
      } else {
        throw new Error(data.error || 'Failed to demonstrate monitoring')
      }
    } catch (error) {
      console.error('❌ Failed to demonstrate monitoring:', error.message)
      console.log('🔄 Using mock monitoring data...')
      console.log('✅ Mock real-time monitoring demonstration completed')
      console.log('   Message: Real-time monitoring is active with mock data')
    }
  }

  /**
   * Make HTTP request
   */
  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const fullUrl = `${DEMO_CONFIG.baseUrl}${url}`
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: url,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Security-Intelligence-Demo/1.0'
        }
      }

      const req = http.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            if (res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`))
              return
            }
            const response = JSON.parse(data)
            resolve({ json: () => Promise.resolve(response) })
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}. Raw data: ${data}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}. Make sure the server is running on ${DEMO_CONFIG.baseUrl}`))
      })

      req.end()
    })
  }

  /**
   * Show final results
   */
  showFinalResults() {
    console.log('')
    console.log('🎯 Security Intelligence Demo Complete!')
    console.log('=' * 50)
    console.log(`🔍 Vulnerabilities Found: ${this.results.vulnerabilities.length}`)
    console.log(`📊 Analysis Completed: ${this.results.analysis ? 'Yes' : 'No'}`)
    console.log(`🚀 Campaigns Generated: ${this.results.campaigns.length}`)
    console.log(`💾 Cache Entries: ${this.results.cacheStats?.size || 0}`)
    console.log('')

    // Show key insights
    console.log('💡 Key Insights:')
    if (this.results.analysis) {
      const topSeverity = Object.entries(this.results.analysis.severityDistribution)
        .sort(([,a], [,b]) => b - a)[0]
      console.log(`   Most Common Severity: ${topSeverity[0]} (${topSeverity[1]} vulnerabilities)`)
      
      const topProduct = this.results.analysis.commonProducts[0]
      console.log(`   Most Affected Product: ${topProduct.product} (${topProduct.count} vulnerabilities)`)
      
      const topVulnType = this.results.analysis.commonVulnerabilityTypes[0]
      console.log(`   Most Common Vulnerability Type: ${topVulnType.type} (${topVulnType.count} occurrences)`)
    }
    console.log('')

    // Show campaign priorities
    if (this.results.campaigns.length > 0) {
      console.log('🎯 Campaign Priorities:')
      const priorities = this.results.campaigns.reduce((acc, campaign) => {
        acc[campaign.priority] = (acc[campaign.priority] || 0) + 1
        return acc
      }, {})
      
      Object.entries(priorities).forEach(([priority, count]) => {
        console.log(`   ${priority}: ${count} campaigns`)
      })
    }
    console.log('')

    // Show recommendations
    console.log('📋 Recommendations:')
    console.log('   1. Run high-priority fuzzing campaigns immediately')
    console.log('   2. Monitor for new critical vulnerabilities daily')
    console.log('   3. Integrate with CI/CD pipeline for continuous security testing')
    console.log('   4. Set up automated alerts for new high-severity issues')
    console.log('   5. Regularly update vulnerability intelligence cache')
    console.log('')

    // Show next steps
    console.log('🚀 Next Steps:')
    console.log('   1. Access the Security Intelligence Dashboard at /security-intelligence')
    console.log('   2. Configure automated fuzzing triggers')
    console.log('   3. Set up real-time vulnerability monitoring')
    console.log('   4. Integrate with existing security tools')
    console.log('   5. Train security team on new intelligence features')
    console.log('')
  }
}

// Demo scenarios
const DEMO_SCENARIOS = [
  {
    name: 'Critical Vulnerability Analysis',
    description: 'Focus on critical and important vulnerabilities',
    config: {
      timeframe: '30d',
      severity: 'Critical'
    }
  },
  {
    name: 'Recent Threat Intelligence',
    description: 'Analyze vulnerabilities from the last 7 days',
    config: {
      timeframe: '7d',
      severity: null
    }
  },
  {
    name: 'Comprehensive Security Assessment',
    description: 'Full analysis of all vulnerabilities in the last 90 days',
    config: {
      timeframe: '90d',
      severity: null
    }
  }
]

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const scenario = args[0] || 'default'

  console.log('🔒 Security Intelligence Demo')
  console.log('MSRC CVRF API Integration for Vulnerability Intelligence')
  console.log('')

  if (scenario === 'list') {
    console.log('Available demo scenarios:')
    DEMO_SCENARIOS.forEach((scenario, index) => {
      console.log(`   ${index + 1}. ${scenario.name}`)
      console.log(`      ${scenario.description}`)
    })
    return
  }

  const demo = new SecurityIntelligenceDemo()

  // Handle Ctrl+C gracefully
  process.on('SIGINT', async () => {
    console.log('')
    console.log('⏹️ Demo stopped by user')
    process.exit(0)
  })

  try {
    await demo.start()
  } catch (error) {
    console.error('❌ Demo failed:', error.message)
    process.exit(1)
  }
}

// Run the demo
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { SecurityIntelligenceDemo, DEMO_SCENARIOS }
