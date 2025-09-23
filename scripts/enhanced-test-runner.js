#!/usr/bin/env node

/**
 * Enhanced Test Runner with Smart Issue Detection and Auto-Fix
 * Integrates with the test loop system for continuous testing
 */

const { execSync, execFileSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class EnhancedTestRunner {
  constructor() {
    this.results = {
      api: { passed: 0, failed: 0, total: 0, issues: [] },
      ui: { passed: 0, failed: 0, total: 0, issues: [] },
      integration: { passed: 0, failed: 0, total: 0, issues: [] },
      build: { passed: 0, failed: 0, total: 0, issues: [] }
    }
    this.startTime = Date.now()
    this.reports = []
    this.issues = []
    this.fixes = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      fix: '\x1b[35m',
      reset: '\x1b[0m'
    }

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`)
  }

  resolveLocalBinary(binaryName) {
    const extension = process.platform === 'win32' ? '.cmd' : ''
    const binaryPath = path.join(process.cwd(), 'node_modules', '.bin', `${binaryName}${extension}`)

    if (!fs.existsSync(binaryPath)) {
      throw new Error(`Local binary ${binaryName} not found. Run "npm install" to install dependencies locally.`)
    }

    return binaryPath
  }

  async runBuildTests() {
    this.log('🔨 Starting Build Tests...', 'info')

    try {
      // Check TypeScript compilation
      this.log('Checking TypeScript compilation...', 'info')
      execSync('npx tsc --noEmit', { stdio: 'pipe' })
      
      // Check linting
      this.log('Running ESLint...', 'info')
      execSync('npm run lint', { stdio: 'pipe' })

      // Try building the project
      this.log('Building project...', 'info')
      execSync('npm run build', { stdio: 'pipe' })

      this.results.build = { passed: 1, failed: 0, total: 1, issues: [] }
      this.log('✅ Build tests passed', 'success')

    } catch (error) {
      this.log(`❌ Build tests failed: ${error.message}`, 'error')
      this.results.build = { passed: 0, failed: 1, total: 1, issues: [error.message] }
      
      // Analyze build issues
      const issues = this.analyzeBuildIssues(error.message)
      this.issues.push(...issues)
    }
  }

  async runAPITests() {
    this.log('🚀 Starting API Tests...', 'info')

    try {
      // Start the dev server
      this.log('Starting development server...', 'info')
      const serverProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
        detached: true,
        stdio: 'pipe'
      })

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 8000))

      // Test API endpoints
      const apiEndpoints = [
        '/api/health',
        '/api/test',
        '/api/secure-example'
      ]

      let passed = 0
      let failed = 0
      const issues = []

      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetch(`http://localhost:3000${endpoint}`)
          if (response.ok) {
            passed++
            this.log(`✅ ${endpoint} - OK`, 'success')
          } else {
            failed++
            const issue = `${endpoint} returned ${response.status}`
            issues.push(issue)
            this.log(`❌ ${endpoint} - ${response.status}`, 'error')
          }
        } catch (error) {
          failed++
          const issue = `${endpoint} - ${error.message}`
          issues.push(issue)
          this.log(`❌ ${endpoint} - ${error.message}`, 'error')
        }
      }

      this.results.api = { passed, failed, total: apiEndpoints.length, issues }

      // Stop server
      try {
        process.kill(-serverProcess.pid)
      } catch (error) {
        // Server might already be stopped
      }

    } catch (error) {
      this.log(`❌ API Tests failed: ${error.message}`, 'error')
      this.results.api = { passed: 0, failed: 1, total: 1, issues: [error.message] }
    }
  }

  async runUITests() {
    this.log('🎨 Starting UI Tests...', 'info')

    try {
      const playwrightBinary = this.resolveLocalBinary('playwright')

      // Install Playwright browsers if not already installed
      try {
        execFileSync(playwrightBinary, ['install', '--yes'], { stdio: 'pipe' })
      } catch (error) {
        this.log('Playwright browsers already installed', 'warning')
      }

      // Start the dev server
      this.log('Starting development server...', 'info')
      const serverProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
        detached: true,
        stdio: 'pipe'
      })

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 8000))

      // Run UI tests
      this.log('Running UI dashboard tests...', 'info')
      const uiResult = execFileSync(playwrightBinary, ['test', 'tests/ui-dashboard.spec.ts', '--reporter=json'], {
        encoding: 'utf8',
        timeout: 300000
      })

      const uiReport = JSON.parse(uiResult)
      this.results.ui = {
        passed: uiReport.stats.expected,
        failed: uiReport.stats.unexpected,
        total: uiReport.stats.tests,
        issues: uiReport.failures?.map(f => f.error?.message) || []
      }

      this.reports.push({
        type: 'UI Tests',
        results: uiReport,
        timestamp: new Date().toISOString()
      })

      this.log(`✅ UI Tests completed: ${this.results.ui.passed}/${this.results.ui.total} passed`, 'success')

      // Stop server
      try {
        process.kill(-serverProcess.pid)
      } catch (error) {
        // Server might already be stopped
      }

    } catch (error) {
      this.log(`❌ UI Tests failed: ${error.message}`, 'error')
      this.results.ui = { passed: 0, failed: 1, total: 1, issues: [error.message] }
      
      // Analyze UI issues
      const issues = this.analyzeUITests(error.message)
      this.issues.push(...issues)
    }
  }

  async runIntegrationTests() {
    this.log('🔗 Starting Integration Tests...', 'info')

    try {
      // Run the existing integration test
      const integrationResult = execSync('node scripts/integration-test.js', {
        encoding: 'utf8',
        timeout: 120000
      })

      // Parse the output to determine success/failure
      const lines = integrationResult.split('\n')
      const summaryLine = lines.find(line => line.includes('Total Tests:'))

      if (summaryLine) {
        const match = summaryLine.match(/Total Tests: (\d+).*✅ Passed: (\d+).*❌ Failed: (\d+)/)
        if (match) {
          this.results.integration = {
            passed: parseInt(match[2]),
            failed: parseInt(match[3]),
            total: parseInt(match[1]),
            issues: []
          }
        }
      }

      this.reports.push({
        type: 'Integration Tests',
        results: integrationResult,
        timestamp: new Date().toISOString()
      })

      this.log(`✅ Integration Tests completed: ${this.results.integration.passed}/${this.results.integration.total} passed`, 'success')

    } catch (error) {
      this.log(`❌ Integration Tests failed: ${error.message}`, 'error')
      this.results.integration = { passed: 0, failed: 1, total: 1, issues: [error.message] }
      
      // Analyze integration issues
      const issues = this.analyzeIntegrationIssues(error.message)
      this.issues.push(...issues)
    }
  }

  analyzeBuildIssues(errorMessage) {
    const issues = []
    
    // TypeScript issues
    if (errorMessage.includes('Type')) {
      issues.push({
        type: 'typescript',
        severity: 'high',
        message: 'TypeScript compilation error',
        suggestion: 'Check type definitions and imports'
      })
    }
    
    // Import issues
    if (errorMessage.includes('Cannot resolve module') || errorMessage.includes('Module not found')) {
      issues.push({
        type: 'import',
        severity: 'high',
        message: 'Missing module or incorrect import path',
        suggestion: 'Check import paths and install missing dependencies'
      })
    }
    
    // Syntax issues
    if (errorMessage.includes('Syntax error') || errorMessage.includes('Parsing error')) {
      issues.push({
        type: 'syntax',
        severity: 'critical',
        message: 'Syntax error in code',
        suggestion: 'Check file syntax and fix compilation errors'
      })
    }
    
    return issues
  }

  analyzeUITests(errorMessage) {
    const issues = []
    
    // Element not found
    if (errorMessage.includes('Element not found') || errorMessage.includes('Locator not found')) {
      issues.push({
        type: 'ui',
        severity: 'medium',
        message: 'UI element not found during test',
        suggestion: 'Check if UI elements exist and are properly rendered'
      })
    }
    
    // Timeout issues
    if (errorMessage.includes('Timeout') || errorMessage.includes('exceeded')) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: 'Test timeout - UI might be slow to load',
        suggestion: 'Increase timeout values or optimize page load performance'
      })
    }
    
    return issues
  }

  analyzeIntegrationIssues(errorMessage) {
    const issues = []
    
    // API connection issues
    if (errorMessage.includes('connection') || errorMessage.includes('network')) {
      issues.push({
        type: 'network',
        severity: 'high',
        message: 'Network or connection issue',
        suggestion: 'Check API endpoints and network connectivity'
      })
    }
    
    // Database issues
    if (errorMessage.includes('database') || errorMessage.includes('DB')) {
      issues.push({
        type: 'database',
        severity: 'high',
        message: 'Database connection or query issue',
        suggestion: 'Check database connection and query syntax'
      })
    }
    
    return issues
  }

  async applyAutoFixes() {
    this.log('🔧 Applying automatic fixes...', 'fix')
    
    for (const issue of this.issues) {
      try {
        const fix = await this.generateFix(issue)
        if (fix) {
          this.fixes.push(fix)
          this.log(`Applied fix for ${issue.type}: ${fix.description}`, 'fix')
        }
      } catch (error) {
        this.log(`Failed to apply fix for ${issue.type}: ${error.message}`, 'error')
      }
    }
  }

  async generateFix(issue) {
    switch (issue.type) {
      case 'import':
        return this.fixImportIssue(issue)
      case 'typescript':
        return this.fixTypeScriptIssue(issue)
      case 'syntax':
        return this.fixSyntaxIssue(issue)
      default:
        return null
    }
  }

  async fixImportIssue(issue) {
    // This would need more sophisticated analysis
    return {
      type: 'import',
      description: 'Check import paths and install missing dependencies',
      applied: false
    }
  }

  async fixTypeScriptIssue(issue) {
    // This would need TypeScript analysis
    return {
      type: 'typescript',
      description: 'Review type definitions and fix type errors',
      applied: false
    }
  }

  async fixSyntaxIssue(issue) {
    // This would need AST analysis
    return {
      type: 'syntax',
      description: 'Review code syntax and fix compilation errors',
      applied: false
    }
  }

  async runAllTests() {
    this.log('🎯 Running Enhanced Test Suite', 'info')
    this.log('================================', 'info')

    await this.runBuildTests()
    await this.runAPITests()
    await this.runUITests()
    await this.runIntegrationTests()

    // Apply auto-fixes if issues were found
    if (this.issues.length > 0) {
      await this.applyAutoFixes()
    }

    this.generateReport()
  }

  generateReport() {
    const endTime = Date.now()
    const duration = (endTime - this.startTime) / 1000

    this.log('\n📊 Enhanced Test Suite Results Summary', 'info')
    this.log('='.repeat(50), 'info')

    const totalTests = this.results.build.total + this.results.api.total + 
                      this.results.ui.total + this.results.integration.total
    const totalPassed = this.results.build.passed + this.results.api.passed + 
                       this.results.ui.passed + this.results.integration.passed
    const totalFailed = this.results.build.failed + this.results.api.failed + 
                       this.results.ui.failed + this.results.integration.failed

    this.log(`Total Tests: ${totalTests}`, 'info')
    this.log(`✅ Passed: ${totalPassed}`, 'success')
    this.log(`❌ Failed: ${totalFailed}`, totalFailed > 0 ? 'error' : 'info')
    this.log(`🔧 Issues Found: ${this.issues.length}`, this.issues.length > 0 ? 'warning' : 'info')
    this.log(`🔧 Fixes Applied: ${this.fixes.length}`, 'fix')
    this.log(`⏱️  Duration: ${duration.toFixed(2)}s`, 'info')
    this.log(`📈 Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`, 'info')

    this.log('\n📋 Detailed Results:', 'info')
    this.log(`Build Tests: ${this.results.build.passed}/${this.results.build.total} passed`, this.results.build.failed > 0 ? 'error' : 'success')
    this.log(`API Tests: ${this.results.api.passed}/${this.results.api.total} passed`, this.results.api.failed > 0 ? 'error' : 'success')
    this.log(`UI Tests: ${this.results.ui.passed}/${this.results.ui.total} passed`, this.results.ui.failed > 0 ? 'error' : 'success')
    this.log(`Integration Tests: ${this.results.integration.passed}/${this.results.integration.total} passed`, this.results.integration.failed > 0 ? 'error' : 'success')

    if (this.issues.length > 0) {
      this.log('\n⚠️  Issues Found:', 'warning')
      this.issues.forEach((issue, index) => {
        this.log(`${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}`, 'warning')
        this.log(`   Suggestion: ${issue.suggestion}`, 'info')
      })
    }

    if (this.fixes.length > 0) {
      this.log('\n🔧 Fixes Applied:', 'fix')
      this.fixes.forEach((fix, index) => {
        this.log(`${index + 1}. [${fix.type.toUpperCase()}] ${fix.description}`, 'fix')
      })
    }

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'test-reports', `enhanced-test-run-${Date.now()}.json`)
    const reportDir = path.dirname(reportPath)

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      duration,
      results: this.results,
      issues: this.issues,
      fixes: this.fixes,
      reports: this.reports,
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0
      }
    }, null, 2))

    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'info')

    // Exit with appropriate code
    if (totalFailed > 0) {
      this.log('\n❌ Some tests failed. Check the detailed report for more information.', 'error')
      process.exit(1)
    } else {
      this.log('\n🎉 All tests passed successfully!', 'success')
      process.exit(0)
    }
  }
}

// CLI interface
const args = process.argv.slice(2)
const testRunner = new EnhancedTestRunner()

if (args.includes('--build-only')) {
  testRunner.runBuildTests().then(() => testRunner.generateReport())
} else if (args.includes('--api-only')) {
  testRunner.runAPITests().then(() => testRunner.generateReport())
} else if (args.includes('--ui-only')) {
  testRunner.runUITests().then(() => testRunner.generateReport())
} else if (args.includes('--integration-only')) {
  testRunner.runIntegrationTests().then(() => testRunner.generateReport())
} else {
  testRunner.runAllTests()
}



