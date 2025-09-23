#!/usr/bin/env node

/**
 * Automated Test Runner
 * Orchestrates the entire test loop system with intelligent issue detection and fixing
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class AutomatedTestRunner {
  constructor(options = {}) {
    this.options = {
      maxIterations: options.maxIterations || 5,
      delayBetweenRuns: options.delayBetweenRuns || 3000,
      enableAutoFix: options.enableAutoFix !== false,
      enableMonitoring: options.enableMonitoring !== false,
      parallelTests: options.parallelTests || false,
      generateReports: options.generateReports !== false,
      ...options
    }
    
    this.iteration = 0
    this.totalRuns = 0
    this.successfulRuns = 0
    this.failedRuns = 0
    this.issues = []
    this.fixes = []
    this.startTime = Date.now()
    this.monitoringProcess = null
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      fix: '\x1b[35m',
      iteration: '\x1b[34m',
      reset: '\x1b[0m'
    }

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`)
  }

  async start() {
    this.log('🚀 Starting Automated Test Runner', 'info')
    this.log('================================', 'info')
    
    // Create test reports directory
    this.ensureReportsDirectory()
    
    // Start monitoring dashboard if enabled
    if (this.options.enableMonitoring) {
      await this.startMonitoring()
    }
    
    // Run the main test loop
    await this.runTestLoop()
    
    // Generate final report
    await this.generateFinalReport()
    
    // Stop monitoring
    if (this.monitoringProcess) {
      this.stopMonitoring()
    }
  }

  ensureReportsDirectory() {
    const reportsDir = path.join(process.cwd(), 'test-reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
      this.log('Created test-reports directory', 'info')
    }
  }

  async startMonitoring() {
    this.log('Starting monitoring dashboard...', 'info')
    
    try {
      this.monitoringProcess = spawn('node', ['scripts/test-monitoring-dashboard.js'], {
        detached: true,
        stdio: 'pipe'
      })
      
      // Wait for dashboard to start
      await new Promise(resolve => setTimeout(resolve, 2000))
      this.log('Monitoring dashboard started at http://localhost:3001', 'success')
    } catch (error) {
      this.log(`Failed to start monitoring: ${error.message}`, 'warning')
    }
  }

  stopMonitoring() {
    if (this.monitoringProcess) {
      try {
        process.kill(this.monitoringProcess.pid)
        this.log('Monitoring dashboard stopped', 'info')
      } catch (error) {
        this.log(`Error stopping monitoring: ${error.message}`, 'warning')
      }
    }
  }

  async runTestLoop() {
    while (this.iteration < this.options.maxIterations) {
      this.iteration++
      this.totalRuns++
      
      this.log(`\n--- Iteration ${this.iteration}/${this.options.maxIterations} ---`, 'iteration')
      
      const result = await this.runTestCycle()
      
      if (result.success) {
        this.successfulRuns++
        this.log(`✅ Iteration ${this.iteration} completed successfully`, 'success')
        
        // If we have a successful run, we can exit (unless in continuous mode)
        if (!this.options.continuousMode) {
          break
        }
      } else {
        this.failedRuns++
        this.log(`❌ Iteration ${this.iteration} failed`, 'error')
        
        // Analyze issues and apply fixes
        if (this.options.enableAutoFix) {
          const fixesApplied = await this.analyzeAndFixIssues(result.error, result.output)
          if (fixesApplied.length > 0) {
            this.log(`🔧 Applied ${fixesApplied.length} fixes`, 'fix')
            this.fixes.push(...fixesApplied)
            
            // Wait before next iteration
            await this.sleep(this.options.delayBetweenRuns)
            continue
          }
        }
        
        // If no fixes applied or auto-fix disabled, break
        this.log('No fixes available or auto-fix disabled. Stopping loop.', 'warning')
        break
      }
      
      // Wait between iterations
      if (this.iteration < this.options.maxIterations) {
        await this.sleep(this.options.delayBetweenRuns)
      }
    }
  }

  async runTestCycle() {
    try {
      this.log('Running enhanced test suite...', 'info')
      
      // Run the enhanced test runner
      const testResult = execSync('npm run test:enhanced', {
        encoding: 'utf8',
        timeout: 300000 // 5 minutes
      })
      
      return { success: true, output: testResult }
      
    } catch (error) {
      this.log(`Test execution failed: ${error.message}`, 'error')
      return { 
        success: false, 
        error: error.message, 
        output: error.stdout || '',
        stderr: error.stderr || ''
      }
    }
  }

  async analyzeAndFixIssues(errorMessage, output) {
    const fixes = []
    
    // Analyze error patterns
    const issues = this.detectIssues(errorMessage, output)
    this.issues.push(...issues)
    
    // Apply fixes for each issue
    for (const issue of issues) {
      try {
        const fix = await this.applyFix(issue)
        if (fix) {
          fixes.push(fix)
        }
      } catch (fixError) {
        this.log(`Fix failed for ${issue.type}: ${fixError.message}`, 'error')
      }
    }
    
    return fixes
  }

  detectIssues(errorMessage, output) {
    const issues = []
    const fullOutput = `${errorMessage}\n${output}`
    
    // Import/Export issues
    if (fullOutput.includes('Cannot resolve module') || fullOutput.includes('Module not found')) {
      issues.push({
        type: 'import',
        severity: 'high',
        message: 'Missing module or incorrect import path',
        suggestion: 'Check import paths and install missing dependencies',
        details: fullOutput
      })
    }
    
    // TypeScript issues
    if (fullOutput.includes('Type') && fullOutput.includes('is not assignable')) {
      issues.push({
        type: 'typescript',
        severity: 'medium',
        message: 'TypeScript type error',
        suggestion: 'Check type definitions and fix type mismatches',
        details: fullOutput
      })
    }
    
    // Build issues
    if (fullOutput.includes('Failed to compile') || fullOutput.includes('Build error')) {
      issues.push({
        type: 'build',
        severity: 'high',
        message: 'Build compilation error',
        suggestion: 'Fix compilation errors and syntax issues',
        details: fullOutput
      })
    }
    
    // Test issues
    if (fullOutput.includes('Test failed') || fullOutput.includes('Assertion failed')) {
      issues.push({
        type: 'test',
        severity: 'medium',
        message: 'Test assertion failure',
        suggestion: 'Review test expectations and fix test logic',
        details: fullOutput
      })
    }
    
    return issues
  }

  async applyFix(issue) {
    this.log(`Applying fix for ${issue.type}: ${issue.message}`, 'fix')
    
    switch (issue.type) {
      case 'import':
        return this.fixImportIssue(issue)
      case 'typescript':
        return this.fixTypeScriptIssue(issue)
      case 'build':
        return this.fixBuildIssue(issue)
      case 'test':
        return this.fixTestIssue(issue)
      default:
        return null
    }
  }

  async fixImportIssue(issue) {
    // Extract module name from error
    const moduleMatch = issue.details.match(/Cannot resolve module ['"]([^'"]+)['"]/)
    if (moduleMatch) {
      const moduleName = moduleMatch[1]
      
      // Check if it's a known dependency
      const knownDeps = {
        'chalk': 'chalk',
        'lodash': 'lodash',
        'moment': 'moment',
        'uuid': 'uuid',
        'fs-extra': 'fs-extra'
      }
      
      if (knownDeps[moduleName]) {
        try {
          execSync(`npm install ${knownDeps[moduleName]}`, { stdio: 'pipe' })
          return {
            type: 'import',
            description: `Installed missing dependency: ${knownDeps[moduleName]}`,
            applied: true,
            timestamp: new Date().toISOString()
          }
        } catch (error) {
          return {
            type: 'import',
            description: `Failed to install ${knownDeps[moduleName]}: ${error.message}`,
            applied: false,
            timestamp: new Date().toISOString()
          }
        }
      }
    }
    
    return {
      type: 'import',
      description: 'Import issue requires manual attention',
      applied: false,
      timestamp: new Date().toISOString()
    }
  }

  async fixTypeScriptIssue(issue) {
    // TypeScript issues usually require manual intervention
    return {
      type: 'typescript',
      description: 'TypeScript issue requires manual review and fix',
      applied: false,
      timestamp: new Date().toISOString()
    }
  }

  async fixBuildIssue(issue) {
    // Try to fix common build issues
    try {
      // Clear Next.js cache
      execSync('rm -rf .next', { stdio: 'pipe' })
      
      // Reinstall node_modules if package.json changed
      if (this.shouldReinstallDependencies()) {
        execSync('rm -rf node_modules package-lock.json', { stdio: 'pipe' })
        execSync('npm install', { stdio: 'pipe' })
      }
      
      return {
        type: 'build',
        description: 'Cleared build cache and reinstalled dependencies',
        applied: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        type: 'build',
        description: `Build fix failed: ${error.message}`,
        applied: false,
        timestamp: new Date().toISOString()
      }
    }
  }

  async fixTestIssue(issue) {
    // Test issues usually require manual intervention
    return {
      type: 'test',
      description: 'Test issue requires manual review and fix',
      applied: false,
      timestamp: new Date().toISOString()
    }
  }

  shouldReinstallDependencies() {
    // Check if package.json was recently modified
    try {
      const stats = fs.statSync('package.json')
      const now = Date.now()
      const modified = stats.mtime.getTime()
      return (now - modified) < 60000 // Modified in last minute
    } catch (error) {
      return false
    }
  }

  async generateFinalReport() {
    const endTime = Date.now()
    const duration = (endTime - this.startTime) / 1000
    
    this.log('\n📊 Automated Test Runner Final Report', 'info')
    this.log('='.repeat(50), 'info')
    
    this.log(`Total Iterations: ${this.totalRuns}`, 'info')
    this.log(`✅ Successful Runs: ${this.successfulRuns}`, 'success')
    this.log(`❌ Failed Runs: ${this.failedRuns}`, this.failedRuns > 0 ? 'error' : 'info')
    this.log(`🔧 Issues Found: ${this.issues.length}`, this.issues.length > 0 ? 'warning' : 'info')
    this.log(`🔧 Fixes Applied: ${this.fixes.length}`, 'fix')
    this.log(`⏱️  Total Duration: ${duration.toFixed(2)}s`, 'info')
    this.log(`📈 Success Rate: ${this.totalRuns > 0 ? ((this.successfulRuns / this.totalRuns) * 100).toFixed(1) : 0}%`, 'info')
    
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
        this.log(`   Applied: ${fix.applied ? 'Yes' : 'No'}`, fix.applied ? 'success' : 'error')
      })
    }
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'test-reports', `automated-test-run-${Date.now()}.json`)
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      options: this.options,
      summary: {
        totalRuns: this.totalRuns,
        successfulRuns: this.successfulRuns,
        failedRuns: this.failedRuns,
        issuesFound: this.issues.length,
        fixesApplied: this.fixes.length,
        successRate: this.totalRuns > 0 ? (this.successfulRuns / this.totalRuns) * 100 : 0
      },
      issues: this.issues,
      fixes: this.fixes
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'info')
    
    // Exit with appropriate code
    if (this.failedRuns > 0 && this.successfulRuns === 0) {
      this.log('\n❌ All test runs failed. Manual intervention required.', 'error')
      process.exit(1)
    } else if (this.successfulRuns > 0) {
      this.log('\n🎉 Automated test runner completed with at least one successful run!', 'success')
      process.exit(0)
    } else {
      this.log('\n⚠️  No test runs completed successfully.', 'warning')
      process.exit(1)
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI interface
const args = process.argv.slice(2)
const options = {}

// Parse command line arguments
if (args.includes('--max-iterations')) {
  const index = args.indexOf('--max-iterations')
  options.maxIterations = parseInt(args[index + 1]) || 5
}

if (args.includes('--delay')) {
  const index = args.indexOf('--delay')
  options.delayBetweenRuns = parseInt(args[index + 1]) || 3000
}

if (args.includes('--no-auto-fix')) {
  options.enableAutoFix = false
}

if (args.includes('--no-monitoring')) {
  options.enableMonitoring = false
}

if (args.includes('--continuous')) {
  options.continuousMode = true
}

if (args.includes('--parallel')) {
  options.parallelTests = true
}

// Install required dependencies if needed
try {
  require('chalk')
} catch (error) {
  console.log('Installing required dependencies...')
  execSync('npm install chalk', { stdio: 'inherit' })
}

// Run the automated test runner
const runner = new AutomatedTestRunner(options)
runner.start().catch(error => {
  console.error('Automated test runner failed:', error)
  process.exit(1)
})
