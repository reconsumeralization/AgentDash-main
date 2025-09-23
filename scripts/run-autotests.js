#!/usr/bin/env node

/**
 * Automated Test Runner Script
 * Orchestrates the complete testing pipeline
 */

const { spawn, execSync } = require('child_process')
const fs = require('fs').promises
const path = require('path')
const chalk = require('chalk')

class AutoTestRunner {
  constructor() {
    this.config = {
      testSuites: [
        { name: 'unit', command: 'npm run test:unit', timeout: 30000 },
        { name: 'integration', command: 'npm run test:integration', timeout: 60000 },
        { name: 'api', command: 'npm run test:api', timeout: 45000 },
        { name: 'e2e', command: 'npm run test:e2e', timeout: 120000 },
        { name: 'lint', command: 'npm run lint', timeout: 15000 },
        { name: 'type-check', command: 'npm run type-check', timeout: 20000 }
      ],
      parallel: true,
      retryFailed: true,
      maxRetries: 2
    }
  }

  async runAllTests() {
    console.log(chalk.blue.bold('\n🚀 Starting Automated Test Suite\n'))
    
    const results = []
    
    if (this.config.parallel) {
      results.push(...await this.runTestsInParallel())
    } else {
      results.push(...await this.runTestsSequentially())
    }

    await this.generateReport(results)
    return results
  }

  async runTestsInParallel() {
    console.log(chalk.cyan('🔄 Running tests in parallel...\n'))
    
    const promises = this.config.testSuites.map(suite => this.runTestSuite(suite))
    const results = await Promise.allSettled(promises)
    
    return results.map((result, index) => ({
      suite: this.config.testSuites[index].name,
      success: result.status === 'fulfilled' && result.value.success,
      output: result.status === 'fulfilled' ? result.value.output : result.reason?.message,
      duration: result.status === 'fulfilled' ? result.value.duration : 0
    }))
  }

  async runTestsSequentially() {
    console.log(chalk.cyan('🔄 Running tests sequentially...\n'))
    
    const results = []
    
    for (const suite of this.config.testSuites) {
      const result = await this.runTestSuite(suite)
      results.push({
        suite: suite.name,
        success: result.success,
        output: result.output,
        duration: result.duration
      })
      
      if (!result.success && !this.config.retryFailed) {
        console.log(chalk.red(`❌ ${suite.name} failed, stopping execution`))
        break
      }
    }
    
    return results
  }

  async runTestSuite(suite) {
    const startTime = Date.now()
    console.log(chalk.yellow(`🧪 Running ${suite.name} tests...`))
    
    try {
      const output = execSync(suite.command, { 
        encoding: 'utf8',
        timeout: suite.timeout,
        stdio: 'pipe'
      })
      
      const duration = Date.now() - startTime
      console.log(chalk.green(`✅ ${suite.name} completed in ${duration}ms`))
      
      return { success: true, output, duration }
    } catch (error) {
      const duration = Date.now() - startTime
      console.log(chalk.red(`❌ ${suite.name} failed in ${duration}ms`))
      
      return { 
        success: false, 
        output: error.stdout || error.stderr || error.message, 
        duration 
      }
    }
  }

  async generateReport(results) {
    console.log(chalk.blue.bold('\n📊 Test Results Report\n'))
    
    const summary = {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0)
    }

    console.log(chalk.white(`Total Suites: ${summary.total}`))
    console.log(chalk.green(`✅ Passed: ${summary.passed}`))
    console.log(chalk.red(`❌ Failed: ${summary.failed}`))
    console.log(chalk.blue(`⏱️  Total Duration: ${summary.totalDuration}ms`))

    // Detailed results
    console.log(chalk.blue.bold('\n📋 Detailed Results:\n'))
    
    for (const result of results) {
      const status = result.success ? chalk.green('✅') : chalk.red('❌')
      console.log(`${status} ${result.suite}: ${result.duration}ms`)
      
      if (!result.success && result.output) {
        console.log(chalk.gray(`   Error: ${result.output.substring(0, 200)}...`))
      }
    }

    // Save report
    const reportPath = 'test-results/autotest-report.json'
    await fs.mkdir('test-results', { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify({ summary, results }, null, 2))
    
    console.log(chalk.green(`\n📄 Report saved to: ${reportPath}`))
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new AutoTestRunner()
  runner.runAllTests().catch(console.error)
}

module.exports = AutoTestRunner
