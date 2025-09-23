#!/usr/bin/env node

/**
 * 🚀 GUIDANCE ENGINE DEMO
 * Demonstrates the superior capabilities of the Guidance Engine
 */

const fetch = require('node-fetch')

// Demo configuration
const DEMO_CONFIG = {
  baseUrl: 'http://localhost:3000',
  examples: [
    {
      name: 'Secure Authentication API',
      request: {
        language: 'typescript',
        framework: 'Next.js',
        purpose: 'Create a secure user authentication API with JWT tokens, password hashing, and rate limiting',
        requirements: [
          'User registration with email validation',
          'Secure password hashing with bcrypt',
          'JWT token generation and validation',
          'Rate limiting to prevent brute force attacks',
          'Input sanitization and validation',
          'Comprehensive error handling',
          'Audit logging for security events'
        ],
        securityLevel: 'high',
        accessibility: true,
        testing: true,
        documentation: true
      }
    },
    {
      name: 'E-commerce Product API',
      request: {
        language: 'typescript',
        framework: 'Express',
        purpose: 'Build a scalable e-commerce product management API with search, filtering, and inventory tracking',
        requirements: [
          'CRUD operations for products',
          'Advanced search with filters',
          'Inventory management',
          'Image upload and processing',
          'Category management',
          'Price calculation with discounts',
          'API versioning and pagination'
        ],
        securityLevel: 'medium',
        accessibility: true,
        testing: true,
        documentation: true
      }
    },
    {
      name: 'Real-time Chat System',
      request: {
        language: 'typescript',
        framework: 'Socket.io',
        purpose: 'Develop a real-time chat application with WebSocket connections, message persistence, and user presence',
        requirements: [
          'Real-time messaging with WebSockets',
          'Message persistence in database',
          'User presence and typing indicators',
          'Private and group chat rooms',
          'Message encryption',
          'File sharing capabilities',
          'Message search and history'
        ],
        securityLevel: 'high',
        accessibility: true,
        testing: true,
        documentation: true
      }
    }
  ]
}

class GuidanceDemo {
  constructor() {
    this.results = []
  }

  async run() {
    console.log('🚀 Starting Guidance Engine Demo...\n')
    
    try {
      // Check if API is available
      await this.checkApiHealth()
      
      // Run all examples
      for (const example of DEMO_CONFIG.examples) {
        await this.runExample(example)
        console.log('\n' + '='.repeat(80) + '\n')
      }
      
      // Generate summary report
      this.generateSummaryReport()
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message)
      process.exit(1)
    }
  }

  async checkApiHealth() {
    console.log('🔍 Checking API health...')
    
    try {
      const response = await fetch(`${DEMO_CONFIG.baseUrl}/api/guidance/generate`, {
        method: 'GET'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API is healthy')
        console.log(`📊 System: ${data.data.system}`)
        console.log(`🔧 Version: ${data.data.version}`)
        console.log(`📈 Status: ${data.data.status}`)
        console.log(`🎯 Features: ${data.data.features.length} available\n`)
      } else {
        throw new Error(`API health check failed: ${response.status}`)
      }
    } catch (error) {
      throw new Error(`Cannot connect to API at ${DEMO_CONFIG.baseUrl}. Make sure the server is running.`)
    }
  }

  async runExample(example) {
    console.log(`🎯 Running Example: ${example.name}`)
    console.log(`📝 Purpose: ${example.request.purpose}`)
    console.log(`🔧 Language: ${example.request.language}`)
    console.log(`🛡️ Security Level: ${example.request.securityLevel}`)
    console.log(`📋 Requirements: ${example.request.requirements.length} items\n`)
    
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${DEMO_CONFIG.baseUrl}/api/guidance/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(example.request)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API request failed: ${errorData.error}`)
      }
      
      const result = await response.json()
      const processingTime = Date.now() - startTime
      
      // Store results for summary
      this.results.push({
        name: example.name,
        success: true,
        processingTime,
        metrics: result.data ? {
          securityScore: result.data.security.score,
          qualityScore: result.data.quality.maintainabilityIndex,
          performanceScore: result.data.performance.score,
          vulnerabilities: result.data.security.vulnerabilities.length,
          improvements: result.data.improvements.length,
          alternatives: result.data.alternatives.length,
          linesOfCode: result.data.quality.linesOfCode
        } : null
      })
      
      // Display results
      this.displayResults(example.name, result.data, processingTime)
      
    } catch (error) {
      console.error(`❌ Example "${example.name}" failed:`, error.message)
      this.results.push({
        name: example.name,
        success: false,
        error: error.message
      })
    }
  }

  displayResults(name, data, processingTime) {
    console.log('✅ Code Generation Successful!')
    console.log(`⏱️ Processing Time: ${processingTime}ms\n`)
    
    // Security Analysis
    console.log('🛡️ SECURITY ANALYSIS:')
    console.log(`   Score: ${data.security.score}/100`)
    console.log(`   Risk Level: ${data.security.riskLevel.toUpperCase()}`)
    console.log(`   Vulnerabilities: ${data.security.vulnerabilities.length}`)
    if (data.security.vulnerabilities.length > 0) {
      data.security.vulnerabilities.forEach((vuln, i) => {
        console.log(`     ${i + 1}. ${vuln.type} (${vuln.severity}): ${vuln.description}`)
      })
    }
    console.log(`   Recommendations: ${data.security.recommendations.length}\n`)
    
    // Quality Metrics
    console.log('📊 QUALITY METRICS:')
    console.log(`   Maintainability Index: ${data.quality.maintainabilityIndex}/100`)
    console.log(`   Cyclomatic Complexity: ${data.quality.cyclomaticComplexity}`)
    console.log(`   Lines of Code: ${data.quality.linesOfCode}`)
    console.log(`   Test Coverage: ${data.quality.testCoverage || 0}%`)
    console.log(`   Documentation Coverage: ${data.quality.documentationCoverage || 0}%\n`)
    
    // Performance Analysis
    console.log('⚡ PERFORMANCE ANALYSIS:')
    console.log(`   Score: ${data.performance.score}/100`)
    console.log(`   Estimated Latency: ${data.performance.estimatedLatency}ms`)
    console.log(`   Memory Usage: ${Math.round(data.performance.memoryUsage / 1024)}KB`)
    console.log(`   Bottlenecks: ${data.performance.bottlenecks.length}`)
    console.log(`   Optimizations: ${data.performance.optimizations.length}\n`)
    
    // Code Statistics
    console.log('📝 CODE STATISTICS:')
    console.log(`   Generated Code Length: ${data.code.length} characters`)
    console.log(`   Dependencies: ${data.dependencies.length}`)
    console.log(`   Improvement Suggestions: ${data.improvements.length}`)
    console.log(`   Alternative Implementations: ${data.alternatives.length}`)
    
    if (data.tests) {
      console.log(`   Test Code Length: ${data.tests.length} characters`)
    }
    
    console.log(`   Documentation Length: ${data.documentation.length} characters\n`)
    
    // Show sample of generated code
    console.log('💻 GENERATED CODE SAMPLE:')
    const codeLines = data.code.split('\n')
    const sampleLines = codeLines.slice(0, 10)
    sampleLines.forEach((line, i) => {
      console.log(`   ${String(i + 1).padStart(2, ' ')}: ${line}`)
    })
    if (codeLines.length > 10) {
      console.log(`   ... and ${codeLines.length - 10} more lines`)
    }
    console.log()
  }

  generateSummaryReport() {
    console.log('📊 GUIDANCE ENGINE DEMO SUMMARY REPORT')
    console.log('=' .repeat(50))
    
    const successful = this.results.filter(r => r.success)
    const failed = this.results.filter(r => !r.success)
    
    console.log(`\n🎯 Total Examples: ${this.results.length}`)
    console.log(`✅ Successful: ${successful.length}`)
    console.log(`❌ Failed: ${failed.length}`)
    
    if (successful.length > 0) {
      const avgProcessingTime = successful.reduce((sum, r) => sum + r.processingTime, 0) / successful.length
      const avgSecurityScore = successful.reduce((sum, r) => sum + r.metrics.securityScore, 0) / successful.length
      const avgQualityScore = successful.reduce((sum, r) => sum + r.metrics.qualityScore, 0) / successful.length
      const avgPerformanceScore = successful.reduce((sum, r) => sum + r.metrics.performanceScore, 0) / successful.length
      const totalVulnerabilities = successful.reduce((sum, r) => sum + r.metrics.vulnerabilities, 0)
      const totalImprovements = successful.reduce((sum, r) => sum + r.metrics.improvements, 0)
      const totalAlternatives = successful.reduce((sum, r) => sum + r.metrics.alternatives, 0)
      const totalLinesOfCode = successful.reduce((sum, r) => sum + r.metrics.linesOfCode, 0)
      
      console.log(`\n📈 AVERAGE METRICS:`)
      console.log(`   Processing Time: ${Math.round(avgProcessingTime)}ms`)
      console.log(`   Security Score: ${Math.round(avgSecurityScore)}/100`)
      console.log(`   Quality Score: ${Math.round(avgQualityScore)}/100`)
      console.log(`   Performance Score: ${Math.round(avgPerformanceScore)}/100`)
      
      console.log(`\n🔍 TOTAL ANALYSIS:`)
      console.log(`   Vulnerabilities Found: ${totalVulnerabilities}`)
      console.log(`   Improvement Suggestions: ${totalImprovements}`)
      console.log(`   Alternative Implementations: ${totalAlternatives}`)
      console.log(`   Total Lines of Code: ${totalLinesOfCode}`)
      
      console.log(`\n🏆 QUALITY ASSESSMENT:`)
      if (avgSecurityScore >= 90) {
        console.log(`   🛡️ Security: EXCELLENT (${Math.round(avgSecurityScore)}/100)`)
      } else if (avgSecurityScore >= 70) {
        console.log(`   🛡️ Security: GOOD (${Math.round(avgSecurityScore)}/100)`)
      } else {
        console.log(`   🛡️ Security: NEEDS IMPROVEMENT (${Math.round(avgSecurityScore)}/100)`)
      }
      
      if (avgQualityScore >= 90) {
        console.log(`   📊 Quality: EXCELLENT (${Math.round(avgQualityScore)}/100)`)
      } else if (avgQualityScore >= 70) {
        console.log(`   📊 Quality: GOOD (${Math.round(avgQualityScore)}/100)`)
      } else {
        console.log(`   📊 Quality: NEEDS IMPROVEMENT (${Math.round(avgQualityScore)}/100)`)
      }
      
      if (avgPerformanceScore >= 90) {
        console.log(`   ⚡ Performance: EXCELLENT (${Math.round(avgPerformanceScore)}/100)`)
      } else if (avgPerformanceScore >= 70) {
        console.log(`   ⚡ Performance: GOOD (${Math.round(avgPerformanceScore)}/100)`)
      } else {
        console.log(`   ⚡ Performance: NEEDS IMPROVEMENT (${Math.round(avgPerformanceScore)}/100)`)
      }
    }
    
    if (failed.length > 0) {
      console.log(`\n❌ FAILED EXAMPLES:`)
      failed.forEach(result => {
        console.log(`   • ${result.name}: ${result.error}`)
      })
    }
    
    console.log(`\n🎉 Demo completed! Guidance Engine demonstrates superior code generation capabilities.`)
    console.log(`🚀 Ready for enterprise-grade development!`)
  }
}

// Run the demo
if (require.main === module) {
  const demo = new GuidanceDemo()
  demo.run().catch(console.error)
}

module.exports = { GuidanceDemo }
