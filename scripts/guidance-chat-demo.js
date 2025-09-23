#!/usr/bin/env node

/**
 * Guidance Chat Interface Demo
 * Demonstrates the AI-powered chat system with virtual file system and visualizations
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'
const API_ENDPOINTS = {
  generate: `${BASE_URL}/api/guidance/generate`,
  filesystem: `${BASE_URL}/api/guidance/filesystem`,
  visualize: `${BASE_URL}/api/guidance/visualize`
}

// Demo scenarios
const demoScenarios = [
  {
    name: "Code Generation with File Management",
    description: "Generate code and automatically save to virtual file system",
    steps: [
      {
        type: "generate",
        request: {
          language: "typescript",
          framework: "Next.js",
          purpose: "Create a secure authentication API with JWT tokens and password hashing",
          requirements: [
            "User registration with email validation",
            "Secure password hashing with bcrypt",
            "JWT token generation and validation",
            "Rate limiting to prevent brute force attacks",
            "Input sanitization and validation"
          ],
          securityLevel: "high",
          accessibility: true,
          testing: true,
          documentation: true
        }
      },
      {
        type: "save_file",
        request: {
          operation: {
            type: "create",
            path: "/generated/auth-api.ts",
            content: "// Generated authentication API code will be saved here"
          }
        }
      }
    ]
  },
  {
    name: "File System Operations",
    description: "Demonstrate virtual file system capabilities",
    steps: [
      {
        type: "create_folder",
        request: {
          operation: {
            type: "create",
            path: "/projects/my-app"
          }
        }
      },
      {
        type: "create_file",
        request: {
          operation: {
            type: "create",
            path: "/projects/my-app/package.json",
            content: JSON.stringify({
              name: "my-app",
              version: "1.0.0",
              dependencies: {
                "react": "^18.0.0",
                "next": "^14.0.0",
                "typescript": "^5.0.0"
              }
            }, null, 2)
          }
        }
      },
      {
        type: "list_files",
        request: {
          operation: {
            type: "list",
            path: "/projects"
          }
        }
      }
    ]
  },
  {
    name: "Security Analysis Visualization",
    description: "Generate security analysis and create visualizations",
    steps: [
      {
        type: "generate",
        request: {
          language: "typescript",
          framework: "Express",
          purpose: "Create a vulnerable API endpoint for security testing",
          requirements: [
            "SQL injection vulnerability",
            "XSS vulnerability",
            "CSRF vulnerability",
            "Insecure direct object reference"
          ],
          securityLevel: "low",
          accessibility: false,
          testing: false,
          documentation: false
        }
      },
      {
        type: "visualize",
        request: {
          type: "security-analysis",
          data: {
            vulnerabilities: [
              { type: "SQL Injection", severity: "high", count: 3 },
              { type: "XSS", severity: "medium", count: 2 },
              { type: "CSRF", severity: "low", count: 1 }
            ],
            securityScore: 25
          },
          config: {
            interactive: true,
            animated: true,
            theme: "light",
            layout: "circular",
            colorScheme: "security"
          }
        }
      }
    ]
  },
  {
    name: "Performance Metrics Visualization",
    description: "Create performance analysis visualizations",
    steps: [
      {
        type: "visualize",
        request: {
          type: "performance-metrics",
          data: {
            loadTime: 1200,
            memoryUsage: 45,
            cpuUsage: 12,
            responseTime: 150,
            throughput: 1000
          },
          config: {
            interactive: true,
            animated: true,
            theme: "dark",
            layout: "grid",
            colorScheme: "performance"
          }
        }
      }
    ]
  },
  {
    name: "Dependency Graph Visualization",
    description: "Visualize project dependencies and relationships",
    steps: [
      {
        type: "visualize",
        request: {
          type: "dependency-graph",
          data: {
            "react": "^18.0.0",
            "next": "^14.0.0",
            "typescript": "^5.0.0",
            "@types/react": "^18.0.0",
            "@types/node": "^20.0.0",
            "tailwindcss": "^3.0.0",
            "lucide-react": "^0.300.0"
          },
          config: {
            interactive: true,
            animated: true,
            theme: "light",
            layout: "force-directed",
            colorScheme: "default"
          }
        }
      }
    ]
  },
  {
    name: "File Tree Visualization",
    description: "Visualize project file structure",
    steps: [
      {
        type: "list_files",
        request: {
          operation: {
            type: "list",
            path: "/",
            recursive: true
          }
        }
      },
      {
        type: "visualize",
        request: {
          type: "file-tree",
          data: [
            {
              id: "root",
              name: "Workspace",
              type: "folder",
              children: [
                {
                  id: "src",
                  name: "src",
                  type: "folder",
                  children: [
                    { id: "app", name: "app", type: "folder", children: [] },
                    { id: "components", name: "components", type: "folder", children: [] },
                    { id: "lib", name: "lib", type: "folder", children: [] }
                  ]
                },
                {
                  id: "public",
                  name: "public",
                  type: "folder",
                  children: [
                    { id: "favicon", name: "favicon.ico", type: "file", size: 1024 },
                    { id: "logo", name: "logo.png", type: "file", size: 2048 }
                  ]
                }
              ]
            }
          ],
          config: {
            interactive: true,
            animated: true,
            theme: "light",
            layout: "hierarchical",
            colorScheme: "default"
          }
        }
      }
    ]
  }
]

class GuidanceChatDemo {
  constructor() {
    this.results = []
    this.startTime = Date.now()
  }

  async run() {
    console.log('🚀 Starting Guidance Chat Interface Demo...\n')
    
    try {
      // Check API health
      await this.checkApiHealth()
      
      // Run demo scenarios
      for (let i = 0; i < demoScenarios.length; i++) {
        const scenario = demoScenarios[i]
        console.log(`\n${'='.repeat(80)}`)
        console.log(`🎯 Scenario ${i + 1}: ${scenario.name}`)
        console.log(`📝 Description: ${scenario.description}`)
        console.log(`${'='.repeat(80)}\n`)
        
        await this.runScenario(scenario)
        
        // Add delay between scenarios
        if (i < demoScenarios.length - 1) {
          console.log('\n⏳ Waiting 2 seconds before next scenario...')
          await this.delay(2000)
        }
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
      const response = await fetch(`${BASE_URL}/api/guidance/generate`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API is healthy')
        console.log(`📊 System: ${data.system || 'Guidance Engine'}`)
        console.log(`🔧 Version: ${data.version || '1.0.0'}`)
        console.log(`📈 Status: ${data.status || 'operational'}`)
        console.log(`🎯 Features: ${data.features?.length || 0} available\n`)
      } else {
        throw new Error(`API health check failed: ${response.status}`)
      }
    } catch (error) {
      throw new Error(`Failed to connect to API: ${error.message}`)
    }
  }

  async runScenario(scenario) {
    const scenarioStartTime = Date.now()
    const scenarioResults = {
      name: scenario.name,
      steps: [],
      success: true,
      totalTime: 0
    }

    try {
      for (let i = 0; i < scenario.steps.length; i++) {
        const step = scenario.steps[i]
        console.log(`📋 Step ${i + 1}: ${step.type}`)
        
        const stepStartTime = Date.now()
        const result = await this.executeStep(step)
        const stepTime = Date.now() - stepStartTime
        
        scenarioResults.steps.push({
          type: step.type,
          success: result.success,
          time: stepTime,
          data: result.data
        })
        
        if (result.success) {
          console.log(`✅ Step ${i + 1} completed in ${stepTime}ms`)
          if (result.data) {
            this.displayStepResult(step.type, result.data)
          }
        } else {
          console.log(`❌ Step ${i + 1} failed: ${result.error}`)
          scenarioResults.success = false
        }
        
        console.log('')
      }
      
      scenarioResults.totalTime = Date.now() - scenarioStartTime
      this.results.push(scenarioResults)
      
      console.log(`🎉 Scenario completed in ${scenarioResults.totalTime}ms`)
      console.log(`📊 Success rate: ${scenarioResults.steps.filter(s => s.success).length}/${scenarioResults.steps.length} steps`)
      
    } catch (error) {
      console.error(`❌ Scenario failed: ${error.message}`)
      scenarioResults.success = false
      scenarioResults.totalTime = Date.now() - scenarioStartTime
      this.results.push(scenarioResults)
    }
  }

  async executeStep(step) {
    try {
      switch (step.type) {
        case 'generate':
          return await this.generateCode(step.request)
        case 'save_file':
        case 'create_file':
        case 'create_folder':
        case 'list_files':
          return await this.fileSystemOperation(step.request)
        case 'visualize':
          return await this.createVisualization(step.request)
        default:
          throw new Error(`Unknown step type: ${step.type}`)
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async generateCode(request) {
    const response = await fetch(API_ENDPOINTS.generate, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Code generation failed: ${errorData.error || response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data }
  }

  async fileSystemOperation(request) {
    const response = await fetch(API_ENDPOINTS.filesystem, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`File system operation failed: ${errorData.error || response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data }
  }

  async createVisualization(request) {
    const response = await fetch(API_ENDPOINTS.visualize, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Visualization creation failed: ${errorData.error || response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data }
  }

  displayStepResult(stepType, data) {
    switch (stepType) {
      case 'generate':
        console.log(`   📝 Generated ${data.code?.length || 0} characters of code`)
        console.log(`   🛡️ Security Score: ${data.securityScore || 0}/100`)
        console.log(`   📊 Quality Score: ${data.qualityScore || 0}/100`)
        console.log(`   ⚡ Performance Score: ${data.performanceScore || 0}/100`)
        if (data.vulnerabilities?.length > 0) {
          console.log(`   🚨 Vulnerabilities: ${data.vulnerabilities.length} found`)
        }
        break
      
      case 'create_file':
      case 'save_file':
        console.log(`   📄 File created: ${data.data?.name || 'Unknown'}`)
        console.log(`   📁 Path: ${data.metadata?.path || 'Unknown'}`)
        if (data.data?.metadata?.securityScore) {
          console.log(`   🛡️ Security Score: ${data.data.metadata.securityScore}/100`)
        }
        break
      
      case 'create_folder':
        console.log(`   📁 Folder created: ${data.data?.name || 'Unknown'}`)
        console.log(`   📁 Path: ${data.metadata?.path || 'Unknown'}`)
        break
      
      case 'list_files':
        console.log(`   📂 Files listed: ${data.data?.files?.length || 0} items`)
        console.log(`   📊 Total files: ${data.data?.totalFiles || 0}`)
        break
      
      case 'visualize':
        console.log(`   🎨 Visualization created: ${data.data?.title || 'Unknown'}`)
        console.log(`   📊 Type: ${data.data?.type || 'Unknown'}`)
        console.log(`   🔢 Data points: ${data.data?.metadata?.dataPoints || 0}`)
        console.log(`   ⚡ Complexity: ${data.data?.metadata?.complexity || 'Unknown'}`)
        console.log(`   🎯 Interactive: ${data.data?.config?.interactive ? 'Yes' : 'No'}`)
        break
    }
  }

  generateSummaryReport() {
    const totalTime = Date.now() - this.startTime
    const successfulScenarios = this.results.filter(r => r.success).length
    const totalSteps = this.results.reduce((sum, r) => sum + r.steps.length, 0)
    const successfulSteps = this.results.reduce((sum, r) => sum + r.steps.filter(s => s.success).length, 0)
    
    console.log('\n' + '='.repeat(80))
    console.log('📊 GUIDANCE CHAT INTERFACE DEMO SUMMARY REPORT')
    console.log('='.repeat(80))
    console.log('')
    console.log(`🎯 Total Scenarios: ${this.results.length}`)
    console.log(`✅ Successful: ${successfulScenarios}`)
    console.log(`❌ Failed: ${this.results.length - successfulScenarios}`)
    console.log('')
    console.log(`📋 Total Steps: ${totalSteps}`)
    console.log(`✅ Successful: ${successfulSteps}`)
    console.log(`❌ Failed: ${totalSteps - successfulSteps}`)
    console.log('')
    console.log(`⏱️ Total Time: ${totalTime}ms`)
    console.log(`📈 Success Rate: ${Math.round((successfulScenarios / this.results.length) * 100)}%`)
    console.log('')
    
    if (this.results.some(r => !r.success)) {
      console.log('❌ FAILED SCENARIOS:')
      this.results.filter(r => !r.success).forEach((scenario, index) => {
        console.log(`   ${index + 1}. ${scenario.name}`)
      })
      console.log('')
    }
    
    console.log('🎉 Demo completed! Guidance Chat Interface demonstrates:')
    console.log('   • AI-powered code generation with security analysis')
    console.log('   • Virtual file system with dynamic file management')
    console.log('   • Interactive visualizations for code analysis')
    console.log('   • Real-time chat interface with context awareness')
    console.log('   • Comprehensive API integration')
    console.log('')
    console.log('🚀 Ready for enterprise-grade development with AI assistance!')
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Run the demo
if (require.main === module) {
  const demo = new GuidanceChatDemo()
  demo.run().catch(console.error)
}

module.exports = GuidanceChatDemo
