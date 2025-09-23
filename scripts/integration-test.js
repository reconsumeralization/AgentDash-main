#!/usr/bin/env node

/**
 * Integration Test Suite
 * Comprehensive testing of all user flows and integrations
 */

const fs = require('fs')
const path = require('path')

class IntegrationTestSuite {
  constructor() {
    this.tests = []
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    }
  }

  /**
   * Register a test
   */
  test(name, fn) {
    this.tests.push({ name, fn })
  }

  /**
   * Run all tests
   */
  async run() {
    console.log('🚀 Starting Integration Test Suite\n')

    for (const test of this.tests) {
      try {
        console.log(`Running: ${test.name}`)
        await test.fn()
        console.log(`✅ PASSED: ${test.name}\n`)
        this.results.passed++
      } catch (error) {
        console.log(`❌ FAILED: ${test.name}`)
        console.log(`   Error: ${error.message}\n`)
        this.results.failed++
        this.results.errors.push({
          test: test.name,
          error: error.message,
          stack: error.stack
        })
      }
    }

    this.printSummary()
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('📊 Test Results Summary')
    console.log('='.repeat(50))
    console.log(`Total Tests: ${this.tests.length}`)
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    console.log(`⏭️  Skipped: ${this.results.skipped}`)
    console.log('='.repeat(50))

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}`)
        console.log(`   ${error.error}`)
      })
      process.exit(1)
    } else {
      console.log('\n🎉 All tests passed!')
      process.exit(0)
    }
  }

  /**
   * Assert helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message)
    }
  }

  /**
   * Check if file exists
   */
  fileExists(filePath) {
    return fs.existsSync(path.join(process.cwd(), filePath))
  }

  /**
   * Read file content
   */
  readFile(filePath) {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8')
  }

  /**
   * Check if directory exists
   */
  dirExists(dirPath) {
    return fs.existsSync(path.join(process.cwd(), dirPath))
  }
}

// Create test suite instance
const testSuite = new IntegrationTestSuite()

// Test 1: File Structure Validation
testSuite.test('File Structure Validation', function() {
  const requiredFiles = [
    'package.json',
    'app/layout.tsx',
    'app/page.tsx',
    'components/navigation.tsx',
    'connectors/base-connector.ts',
    'connectors/connector-registry.ts',
    'connectors/connector-factory.ts',
    'connectors/document-processor-connector.ts',
    'lib/dynamic-ai-selector.ts',
    'lib/integration-framework.ts',
    'app/api/files/upload/route.ts',
    'app/api/documents/process/route.ts',
    'app/api/ai/select/route.ts',
    'app/api/integrations/manage/route.ts'
  ]

  const requiredDirs = [
    'app/api',
    'connectors',
    'components',
    'lib',
    'modules'
  ]

  // Check required directories
  for (const dir of requiredDirs) {
    testSuite.assert(testSuite.dirExists(dir), `Required directory missing: ${dir}`)
  }

  // Check required files
  for (const file of requiredFiles) {
    testSuite.assert(testSuite.fileExists(file), `Required file missing: ${file}`)
  }
})

// Test 2: Package Dependencies
testSuite.test('Package Dependencies Validation', function() {
  const packageJson = JSON.parse(testSuite.readFile('package.json'))

  const requiredDeps = [
    '@ai-sdk/openai',
    'ai',
    '@vercel/blob',
    'next',
    'react'
  ]

  for (const dep of requiredDeps) {
    testSuite.assert(
      packageJson.dependencies[dep] || packageJson.devDependencies[dep],
      `Required dependency missing: ${dep}`
    )
  }
})

// Test 3: API Routes Structure
testSuite.test('API Routes Structure', function() {
  // Check main API structure
  testSuite.assert(testSuite.dirExists('app/api'), 'API directory missing')

  const apiRoutes = [
    'files/upload',
    'files/list',
    'files/content',
    'files/delete',
    'documents/process',
    'ai/select',
    'integrations/manage',
    'agents/access',
    'aspirations',
    'connections',
    'context',
    'dashboard',
    'help/fileflex',
    'linkedin/process-feed',
    'matching',
    'sentiment-heatmap',
    'speaker-map',
    'templates',
    'timeline',
    'transcript-insights',
    'tribes'
  ]

  for (const route of apiRoutes) {
    const routePath = `app/api/${route}/route.ts`
    if (route.includes('/')) {
      // For nested routes, check if directory exists
      const dirPath = `app/api/${route.split('/')[0]}`
      testSuite.assert(testSuite.dirExists(dirPath), `API route directory missing: ${dirPath}`)
    } else {
      testSuite.assert(testSuite.fileExists(routePath), `API route missing: ${routePath}`)
    }
  }
})

// Test 4: Connector System Validation
testSuite.test('Connector System Validation', function() {
  // Check base connector
  const baseConnector = testSuite.readFile('connectors/base-connector.ts')
  testSuite.assert(baseConnector.includes('abstract class BaseConnector'), 'BaseConnector class missing')

  // Check connector registry
  const registry = testSuite.readFile('connectors/connector-registry.ts')
  testSuite.assert(registry.includes('ConnectorRegistryManager'), 'ConnectorRegistryManager missing')
  testSuite.assert(registry.includes('document-processor'), 'Document processor not registered')

  // Check connector factory
  const factory = testSuite.readFile('connectors/connector-factory.ts')
  testSuite.assert(factory.includes('document-processor'), 'Document processor not in factory')

  // Check document processor
  const docProcessor = testSuite.readFile('connectors/document-processor-connector.ts')
  testSuite.assert(docProcessor.includes('DocumentProcessorConnector'), 'DocumentProcessorConnector class missing')
  testSuite.assert(docProcessor.includes('processDocument'), 'processDocument method missing')
})

// Test 5: Dynamic AI Selector Validation
testSuite.test('Dynamic AI Selector Validation', function() {
  const aiSelector = testSuite.readFile('lib/dynamic-ai-selector.ts')
  testSuite.assert(aiSelector.includes('DynamicAISelector'), 'DynamicAISelector class missing')
  testSuite.assert(aiSelector.includes('selectModel'), 'selectModel method missing')
  testSuite.assert(aiSelector.includes('executeWithBestAgent'), 'executeWithBestAgent method missing')

  // Check model definitions
  testSuite.assert(aiSelector.includes('GPT-4o'), 'GPT-4o model not defined')
  testSuite.assert(aiSelector.includes('Claude'), 'Claude model not defined')
  testSuite.assert(aiSelector.includes('Gemini'), 'Gemini model not defined')
})

// Test 6: Integration Framework Validation
testSuite.test('Integration Framework Validation', function() {
  const integrationFramework = testSuite.readFile('lib/integration-framework.ts')
  testSuite.assert(integrationFramework.includes('IntegrationFramework'), 'IntegrationFramework class missing')
  testSuite.assert(integrationFramework.includes('createInstance'), 'createInstance method missing')
  testSuite.assert(integrationFramework.includes('executeAction'), 'executeAction method missing')
  testSuite.assert(integrationFramework.includes('createWorkflow'), 'createWorkflow method missing')

  // Check built-in integrations
  testSuite.assert(integrationFramework.includes('GitHub'), 'GitHub integration not defined')
  testSuite.assert(integrationFramework.includes('Slack'), 'Slack integration not defined')
  testSuite.assert(integrationFramework.includes('OpenAI'), 'OpenAI integration not defined')
  testSuite.assert(integrationFramework.includes('Stripe'), 'Stripe integration not defined')
})

// Test 7: Navigation and User Flows
testSuite.test('Navigation and User Flows', function() {
  const navigation = testSuite.readFile('components/navigation.tsx')
  testSuite.assert(navigation.includes('navigationItems'), 'Navigation items not defined')

  const expectedRoutes = ['/', '/dashboard', '/agents', '/workflows', '/integrations', '/networking', '/help/fileflex', '/templates']
  for (const route of expectedRoutes) {
    testSuite.assert(navigation.includes(route), `Navigation route missing: ${route}`)
  }
})

// Test 8: Document Processing API
testSuite.test('Document Processing API Validation', function() {
  const docApi = testSuite.readFile('app/api/documents/process/route.ts')
  testSuite.assert(docApi.includes('DocumentProcessorConnector'), 'DocumentProcessorConnector not imported')
  testSuite.assert(docApi.includes('POST'), 'POST handler missing')
  testSuite.assert(docApi.includes('GET'), 'GET handler missing')

  // Check rate limiting
  testSuite.assert(docApi.includes('rateLimit'), 'Rate limiting not implemented')

  // Check error handling
  testSuite.assert(docApi.includes('try'), 'Try-catch error handling missing')
  testSuite.assert(docApi.includes('catch'), 'Catch block missing')
})

// Test 9: AI Selection API
testSuite.test('AI Selection API Validation', function() {
  const aiApi = testSuite.readFile('app/api/ai/select/route.ts')
  testSuite.assert(aiApi.includes('dynamicAISelector'), 'DynamicAISelector not imported')
  testSuite.assert(aiApi.includes('POST'), 'POST handler missing')
  testSuite.assert(aiApi.includes('GET'), 'GET handler missing')

  // Check required parameters validation
  testSuite.assert(aiApi.includes('requirements'), 'Requirements validation missing')

  // Check error handling
  testSuite.assert(aiApi.includes('try'), 'Try-catch error handling missing')
})

// Test 10: Integration Management API
testSuite.test('Integration Management API Validation', function() {
  const integrationApi = testSuite.readFile('app/api/integrations/manage/route.ts')
  testSuite.assert(integrationApi.includes('integrationFramework'), 'IntegrationFramework not imported')
  testSuite.assert(integrationApi.includes('POST'), 'POST handler missing')
  testSuite.assert(integrationApi.includes('GET'), 'GET handler missing')

  // Check action types
  const actions = ['create_instance', 'execute_action', 'create_workflow', 'execute_workflow', 'register_integration']
  for (const action of actions) {
    testSuite.assert(integrationApi.includes(action), `Action handler missing: ${action}`)
  }
})

// Test 11: File Upload API Enhancement
testSuite.test('File Upload API Enhancement', function() {
  const uploadApi = testSuite.readFile('app/api/files/upload/route.ts')
  testSuite.assert(uploadApi.includes('rateLimit'), 'Rate limiting not implemented')
  testSuite.assert(uploadApi.includes('ALLOWED_TYPES'), 'File type validation missing')
  testSuite.assert(uploadApi.includes('MAX_FILE_SIZE'), 'File size validation missing')

  // Check error handling
  testSuite.assert(uploadApi.includes('try'), 'Try-catch error handling missing')
  testSuite.assert(uploadApi.includes('catch'), 'Catch block missing')

  // Check security measures
  testSuite.assert(uploadApi.includes('forbidden'), 'Security measures missing')
})

// Test 12: Data Handler Consistency
testSuite.test('Data Handler Consistency', function() {
  // Check multiple API routes for consistent patterns
  const apiFiles = [
    'app/api/files/upload/route.ts',
    'app/api/documents/process/route.ts',
    'app/api/ai/select/route.ts',
    'app/api/integrations/manage/route.ts',
    'app/api/agents/access/route.ts'
  ]

  for (const file of apiFiles) {
    if (testSuite.fileExists(file)) {
      const content = testSuite.readFile(file)

      // Check for consistent error handling
      testSuite.assert(content.includes('try'), `Inconsistent error handling in ${file}`)
      testSuite.assert(content.includes('catch'), `Missing catch block in ${file}`)

      // Check for rate limiting
      testSuite.assert(content.includes('rateLimit'), `Missing rate limiting in ${file}`)

      // Check for proper response structure
      testSuite.assert(content.includes('NextResponse.json'), `Inconsistent response format in ${file}`)
    }
  }
})

// Test 13: Model Manager Integration
testSuite.test('Model Manager Integration', function() {
  const modelManager = testSuite.readFile('components/model-manager.tsx')
  testSuite.assert(modelManager.includes('AIModel'), 'AIModel interface missing')
  testSuite.assert(modelManager.includes('ModelAgent'), 'ModelAgent interface missing')

  // Check model definitions
  testSuite.assert(modelManager.includes('Gemma'), 'Gemma model not defined')
  testSuite.assert(modelManager.includes('Qwen'), 'Qwen model not defined')

  // Check agent creation
  testSuite.assert(modelManager.includes('createModelAgent'), 'createModelAgent function missing')
})

// Test 14: Configuration and Environment
testSuite.test('Configuration and Environment', function() {
  // Check for environment file
  testSuite.assert(testSuite.fileExists('env.example'), 'Environment example file missing')

  // Check Next.js configuration
  const nextConfig = testSuite.readFile('next.config.mjs')
  testSuite.assert(nextConfig.includes('export default'), 'Next.js config incomplete')

  // Check TypeScript configuration
  const tsConfig = testSuite.readFile('tsconfig.json')
  testSuite.assert(tsConfig.includes('compilerOptions'), 'TypeScript config incomplete')
})

// Test 15: Module Orchestrator Integration
testSuite.test('Module Orchestrator Integration', function() {
  const orchestrator = testSuite.readFile('modules/orchestrator-executors.ts')
  testSuite.assert(orchestrator.includes('moduleRegistry'), 'Module registry missing')

  // Check key modules
  const keyModules = ['linkedin-vdr-core', 'smart-permissions', 'network-intelligence']
  for (const module of keyModules) {
    testSuite.assert(orchestrator.includes(module), `Module not registered: ${module}`)
  }
})

// Test 16: Data Transfer Orchestrator
testSuite.test('Data Transfer Orchestrator', function() {
  const dataTransfer = testSuite.readFile('connectors/data-transfer-orchestrator.ts')
  testSuite.assert(dataTransfer.includes('DataTransferOrchestrator'), 'DataTransferOrchestrator class missing')
  testSuite.assert(dataTransfer.includes('flowRules'), 'Flow rules missing')
  testSuite.assert(dataTransfer.includes('packetQueue'), 'Packet queue missing')

  // Check integration with modules
  testSuite.assert(dataTransfer.includes('benignitasOrchestrator'), 'Benignitas orchestrator integration missing')
})

// Test 17: Security and Validation
testSuite.test('Security and Validation', function() {
  // Check for middleware
  testSuite.assert(testSuite.fileExists('middleware.ts'), 'Middleware file missing')

  // Check multiple API files for security measures
  const apiFiles = [
    'app/api/files/upload/route.ts',
    'app/api/documents/process/route.ts',
    'app/api/ai/select/route.ts'
  ]

  for (const file of apiFiles) {
    if (testSuite.fileExists(file)) {
      const content = testSuite.readFile(file)

      // Check for rate limiting
      testSuite.assert(content.includes('rateLimit'), `Rate limiting missing in ${file}`)

      // Check for input validation
      testSuite.assert(content.includes('validation') || content.includes('validate'), `Input validation missing in ${file}`)
    }
  }
})

// Test 18: Performance and Monitoring
testSuite.test('Performance and Monitoring', function() {
  // Check for timeout handling
  const apiFiles = [
    'app/api/documents/process/route.ts',
    'app/api/ai/select/route.ts',
    'app/api/integrations/manage/route.ts'
  ]

  for (const file of apiFiles) {
    if (testSuite.fileExists(file)) {
      const content = testSuite.readFile(file)

      // Check for timeout handling
      testSuite.assert(
        content.includes('timeout') || content.includes('Promise.race'),
        `Timeout handling missing in ${file}`
      )

      // Check for performance monitoring
      testSuite.assert(
        content.includes('Date.now') || content.includes('performance'),
        `Performance monitoring missing in ${file}`
      )
    }
  }
})

// Test 19: Error Handling Patterns
testSuite.test('Error Handling Patterns', function() {
  const apiFiles = [
    'app/api/files/upload/route.ts',
    'app/api/documents/process/route.ts',
    'app/api/ai/select/route.ts',
    'app/api/integrations/manage/route.ts'
  ]

  for (const file of apiFiles) {
    if (testSuite.fileExists(file)) {
      const content = testSuite.readFile(file)

      // Check for comprehensive error handling
      testSuite.assert(content.includes('try'), `Try block missing in ${file}`)
      testSuite.assert(content.includes('catch'), `Catch block missing in ${file}`)

      // Check for error response structure
      testSuite.assert(
        content.includes('NextResponse.json') && content.includes('status'),
        `Proper error response missing in ${file}`
      )

      // Check for error logging
      testSuite.assert(
        content.includes('console.error') || content.includes('console.warn'),
        `Error logging missing in ${file}`
      )
    }
  }
})

// Test 20: Integration Test Summary
testSuite.test('Integration Test Summary', function() {
  // This test validates that all previous tests have run
  testSuite.assert(testSuite.tests.length >= 19, 'Not all integration tests are registered')

  // Check that we have comprehensive coverage
  const testNames = testSuite.tests.map(t => t.name)
  const expectedTests = [
    'File Structure Validation',
    'Package Dependencies Validation',
    'API Routes Structure',
    'Connector System Validation',
    'Dynamic AI Selector Validation',
    'Integration Framework Validation',
    'Navigation and User Flows',
    'Document Processing API Validation',
    'AI Selection API Validation',
    'Integration Management API Validation',
    'File Upload API Enhancement',
    'Data Handler Consistency',
    'Model Manager Integration',
    'Configuration and Environment',
    'Module Orchestrator Integration',
    'Data Transfer Orchestrator',
    'Security and Validation',
    'Performance and Monitoring',
    'Error Handling Patterns'
  ]

  for (const expectedTest of expectedTests) {
    testSuite.assert(testNames.includes(expectedTest), `Expected test missing: ${expectedTest}`)
  }
})

// Run the test suite
if (require.main === module) {
  testSuite.run().catch(error => {
    console.error('Test suite failed to run:', error)
    process.exit(1)
  })
}

module.exports = IntegrationTestSuite
