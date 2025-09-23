#!/usr/bin/env node

/**
 * Simple AutoTester
 * A lightweight version that runs the find -> fix -> lint -> api -> GUI pipeline
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs').promises
const path = require('path')

class SimpleAutoTester {
  constructor() {
    this.results = []
    this.startTime = Date.now()
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      progress: '🔄'
    }[type] || 'ℹ️'
    
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async runCommand(command, description) {
    this.log(`Starting: ${description}`, 'progress')
    const startTime = Date.now()
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000 // 5 minutes timeout
      })
      
      const duration = Date.now() - startTime
      this.log(`Completed: ${description} (${duration}ms)`, 'success')
      
      return { success: true, output, duration }
    } catch (error) {
      const duration = Date.now() - startTime
      this.log(`Failed: ${description} (${duration}ms)`, 'error')
      
      return { 
        success: false, 
        output: error.stdout || error.stderr || error.message, 
        duration 
      }
    }
  }

  async runFindPhase() {
    this.log('🔍 Phase 1: Finding Issues', 'info')
    
    const results = []
    
    // Check for TypeScript errors
    const tsResult = await this.runCommand('npx tsc --noEmit --skipLibCheck', 'TypeScript check')
    results.push({ phase: 'typescript', ...tsResult })
    
    // Check for ESLint issues
    const eslintResult = await this.runCommand('npx eslint . --ext .js,.jsx,.ts,.tsx --format compact', 'ESLint check')
    results.push({ phase: 'eslint', ...eslintResult })
    
    // Check for Prettier issues
    const prettierResult = await this.runCommand('npx prettier --check .', 'Prettier check')
    results.push({ phase: 'prettier', ...prettierResult })
    
    return results
  }

  async runFixPhase() {
    this.log('🔧 Phase 2: Auto-Fixing Issues', 'info')
    
    const results = []
    
    // Fix ESLint issues
    const eslintFix = await this.runCommand('npx eslint . --ext .js,.jsx,.ts,.tsx --fix', 'ESLint auto-fix')
    results.push({ phase: 'eslint-fix', ...eslintFix })
    
    // Fix Prettier issues
    const prettierFix = await this.runCommand('npx prettier --write .', 'Prettier auto-fix')
    results.push({ phase: 'prettier-fix', ...prettierFix })
    
    return results
  }

  async runLintPhase() {
    this.log('🧹 Phase 3: Linting and Formatting', 'info')
    
    const results = []
    
    // Run ESLint
    const eslintResult = await this.runCommand('npx eslint . --ext .js,.jsx,.ts,.tsx', 'ESLint')
    results.push({ phase: 'eslint', ...eslintResult })
    
    // Run Prettier
    const prettierResult = await this.runCommand('npx prettier --check .', 'Prettier')
    results.push({ phase: 'prettier', ...prettierResult })
    
    // Run TypeScript check
    const tsResult = await this.runCommand('npx tsc --noEmit', 'TypeScript')
    results.push({ phase: 'typescript', ...tsResult })
    
    return results
  }

  async runApiPhase() {
    this.log('🌐 Phase 4: API Testing', 'info')
    
    const results = []
    
    // Run unit tests
    const unitResult = await this.runCommand('npm run test:unit', 'Unit tests')
    results.push({ phase: 'unit-tests', ...unitResult })
    
    // Run integration tests
    const integrationResult = await this.runCommand('npm run test:integration', 'Integration tests')
    results.push({ phase: 'integration-tests', ...integrationResult })
    
    return results
  }

  async runGuiPhase() {
    this.log('🖥️ Phase 5: GUI Testing', 'info')
    
    const results = []
    
    // Run E2E tests
    const e2eResult = await this.runCommand('npm run test:e2e', 'E2E tests')
    results.push({ phase: 'e2e-tests', ...e2eResult })
    
    return results
  }

  async runCompletePipeline() {
    this.log('🚀 Starting Complete AutoTester Pipeline', 'info')
    this.log('Pipeline: Find → Fix → Lint → API → GUI', 'info')
    
    const allResults = []
    
    // Phase 1: Find Issues
    const findResults = await this.runFindPhase()
    allResults.push(...findResults)
    
    // Phase 2: Auto-Fix Issues
    const fixResults = await this.runFixPhase()
    allResults.push(...fixResults)
    
    // Phase 3: Lint and Format
    const lintResults = await this.runLintPhase()
    allResults.push(...lintResults)
    
    // Phase 4: API Tests
    const apiResults = await this.runApiPhase()
    allResults.push(...apiResults)
    
    // Phase 5: GUI Tests
    const guiResults = await this.runGuiPhase()
    allResults.push(...guiResults)
    
    await this.generateReport(allResults)
    return allResults
  }

  async generateReport(results) {
    this.log('📊 Generating Report', 'info')
    
    const summary = {
      totalPhases: results.length,
      successfulPhases: results.filter(r => r.success).length,
      failedPhases: results.filter(r => !r.success).length,
      totalDuration: Date.now() - this.startTime,
      results: results,
      timestamp: new Date().toISOString()
    }
    
    this.log(`Total Phases: ${summary.totalPhases}`, 'info')
    this.log(`✅ Successful: ${summary.successfulPhases}`, 'success')
    this.log(`❌ Failed: ${summary.failedPhases}`, summary.failedPhases > 0 ? 'error' : 'info')
    this.log(`⏱️ Total Duration: ${summary.totalDuration}ms`, 'info')
    
    // Detailed results
    this.log('📋 Detailed Results:', 'info')
    
    for (const result of results) {
      const status = result.success ? '✅' : '❌'
      this.log(`${status} ${result.phase}: ${result.duration}ms`, result.success ? 'success' : 'error')
      
      if (!result.success && result.output) {
        this.log(`   Error: ${result.output.substring(0, 200)}...`, 'warning')
      }
    }
    
    // Save report
    const reportPath = 'test-results/simple-autotester-report.json'
    await fs.mkdir('test-results', { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify(summary, null, 2))
    
    this.log(`📄 Report saved to: ${reportPath}`, 'success')
  }

  async runSelfLoop(maxIterations = 3) {
    this.log(`🔄 Starting Self-Loop Mode (max ${maxIterations} iterations)`, 'info')
    
    let iteration = 0
    let allResults = []
    
    while (iteration < maxIterations) {
      iteration++
      this.log(`🔄 Self-Loop Iteration ${iteration}/${maxIterations}`, 'info')
      
      const results = await this.runCompletePipeline()
      allResults.push(...results)
      
      const failedPhases = results.filter(r => !r.success)
      
      if (failedPhases.length === 0) {
        this.log('🎉 All phases passed! Self-loop completed.', 'success')
        break
      }
      
      this.log(`⚠️ ${failedPhases.length} phases failed, retrying...`, 'warning')
      
      if (iteration < maxIterations) {
        this.log('⏳ Waiting 5 seconds before next iteration...', 'info')
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
    
    return allResults
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const tester = new SimpleAutoTester()

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Simple AutoTester

Usage: node scripts/simple-autotester.js [options]

Options:
  --all             Run complete pipeline (default)
  --self-loop       Run self-loop mode
  --find            Run find phase only
  --fix             Run fix phase only
  --lint            Run lint phase only
  --api             Run API phase only
  --gui             Run GUI phase only
  --help, -h        Show this help

Examples:
  node scripts/simple-autotester.js --all
  node scripts/simple-autotester.js --self-loop
  node scripts/simple-autotester.js --find
`)
    return
  }

  if (args.includes('--self-loop')) {
    await tester.runSelfLoop()
  } else if (args.includes('--find')) {
    await tester.runFindPhase()
  } else if (args.includes('--fix')) {
    await tester.runFixPhase()
  } else if (args.includes('--lint')) {
    await tester.runLintPhase()
  } else if (args.includes('--api')) {
    await tester.runApiPhase()
  } else if (args.includes('--gui')) {
    await tester.runGuiPhase()
  } else {
    await tester.runCompletePipeline()
  }
}

// Export for programmatic use
module.exports = SimpleAutoTester

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
