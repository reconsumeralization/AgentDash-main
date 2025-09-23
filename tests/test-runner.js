#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all API and UI tests with detailed reporting
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class TestRunner {
  constructor() {
    this.results = {
      api: { passed: 0, failed: 0, total: 0 },
      ui: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 }
    }
    this.startTime = Date.now()
    this.reports = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    }

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`)
  }

  async runAPITests() {
    this.log('🚀 Starting API Tests...', 'info')

    try {
      // Install Playwright browsers if not already installed
      try {
        execSync('npx playwright install --yes', { stdio: 'pipe' })
      } catch (error) {
        this.log('Playwright browsers already installed', 'warning')
      }

      // Start the dev server
      this.log('Starting development server...', 'info')
      const serverProcess = spawn('npm', ['run', 'dev'], {
        detached: true,
        stdio: 'pipe'
      })

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 5000))

      // Run API tests
      this.log('Running API endpoint tests...', 'info')
      const apiResult = execSync('npx playwright test tests/api-endpoints.spec.ts --reporter=json', {
        encoding: 'utf8',
        timeout: 300000 // 5 minutes timeout
      })

      const apiReport = JSON.parse(apiResult)
      this.results.api = {
        passed: apiReport.stats.expected,
        failed: apiReport.stats.unexpected,
        total: apiReport.stats.tests
      }

      this.reports.push({
        type: 'API Tests',
        results: apiReport,
        timestamp: new Date().toISOString()
      })

      this.log(`✅ API Tests completed: ${this.results.api.passed}/${this.results.api.total} passed`, 'success')

      // Stop server
      try {
        process.kill(-serverProcess.pid)
      } catch (error) {
        // Server might already be stopped
      }

    } catch (error) {
      this.log(`❌ API Tests failed: ${error.message}`, 'error')
      this.results.api.failed = this.results.api.total || 1
    }
  }

  async runUITests() {
    this.log('🎨 Starting UI Tests...', 'info')

    try {
      // Start the dev server
      this.log('Starting development server...', 'info')
      const serverProcess = spawn('npm', ['run', 'dev'], {
        detached: true,
        stdio: 'pipe'
      })

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 5000))

      // Run UI tests
      this.log('Running UI dashboard tests...', 'info')
      const uiResult = execSync('npx playwright test tests/ui-dashboard.spec.ts --reporter=json', {
        encoding: 'utf8',
        timeout: 300000 // 5 minutes timeout
      })

      const uiReport = JSON.parse(uiResult)
      this.results.ui = {
        passed: uiReport.stats.expected,
        failed: uiReport.stats.unexpected,
        total: uiReport.stats.tests
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
      this.results.ui.failed = this.results.ui.total || 1
    }
  }

  async runIntegrationTests() {
    this.log('🔗 Starting Integration Tests...', 'info')

    try {
      // Run the existing integration test
      const integrationResult = execSync('node scripts/integration-test.js', {
        encoding: 'utf8',
        timeout: 120000 // 2 minutes timeout
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
            total: parseInt(match[1])
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
      this.results.integration.failed = 1
      this.results.integration.total = 1
    }
  }

  async runAllTests() {
    this.log('🎯 Running Complete Test Suite', 'info')
    this.log('================================', 'info')

    await this.runAPITests()
    await this.runUITests()
    await this.runIntegrationTests()

    this.generateReport()
  }

  generateReport() {
    const endTime = Date.now()
    const duration = (endTime - this.startTime) / 1000

    this.log('\n📊 Test Suite Results Summary', 'info')
    this.log('='.repeat(50), 'info')

    const totalTests = this.results.api.total + this.results.ui.total + this.results.integration.total
    const totalPassed = this.results.api.passed + this.results.ui.passed + this.results.integration.passed
    const totalFailed = this.results.api.failed + this.results.ui.failed + this.results.integration.failed

    this.log(`Total Tests: ${totalTests}`, 'info')
    this.log(`✅ Passed: ${totalPassed}`, 'success')
    this.log(`❌ Failed: ${totalFailed}`, totalFailed > 0 ? 'error' : 'info')
    this.log(`⏱️  Duration: ${duration.toFixed(2)}s`, 'info')
    this.log(`📈 Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`, 'info')

    this.log('\n📋 Detailed Results:', 'info')
    this.log(`API Tests: ${this.results.api.passed}/${this.results.api.total} passed`, this.results.api.failed > 0 ? 'error' : 'success')
    this.log(`UI Tests: ${this.results.ui.passed}/${this.results.ui.total} passed`, this.results.ui.failed > 0 ? 'error' : 'success')
    this.log(`Integration Tests: ${this.results.integration.passed}/${this.results.integration.total} passed`, this.results.integration.failed > 0 ? 'error' : 'success')

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'test-reports', `test-run-${Date.now()}.json`)
    const reportDir = path.dirname(reportPath)

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      duration,
      results: this.results,
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

  async runAPITestsOnly() {
    await this.runAPITests()
    this.generateReport()
  }

  async runUITestsOnly() {
    await this.runUITests()
    this.generateReport()
  }

  async runIntegrationTestsOnly() {
    await this.runIntegrationTests()
    this.generateReport()
  }
}

// CLI interface
const args = process.argv.slice(2)
const testRunner = new TestRunner()

if (args.includes('--api-only')) {
  testRunner.runAPITestsOnly()
} else if (args.includes('--ui-only')) {
  testRunner.runUITestsOnly()
} else if (args.includes('--integration-only')) {
  testRunner.runIntegrationTestsOnly()
} else {
  testRunner.runAllTests()
}
