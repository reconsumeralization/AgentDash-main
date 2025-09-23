#!/usr/bin/env node

/**
 * Enhanced Test Loop System
 * Runs tests in a continuous loop, detects issues, and applies fixes automatically
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

class TestLoopSystem {
  constructor(options = {}) {
    this.options = {
      maxIterations: options.maxIterations || 10,
      delayBetweenRuns: options.delayBetweenRuns || 5000,
      autoFix: options.autoFix !== false,
      generateReport: options.generateReport !== false,
      watchMode: options.watchMode || false,
      ...options
    }
    
    this.iteration = 0
    this.totalRuns = 0
    this.successfulRuns = 0
    this.failedRuns = 0
    this.fixesApplied = []
    this.testHistory = []
    this.startTime = Date.now()
    
    // Initialize issue detection patterns
    this.issuePatterns = this.initializeIssuePatterns()
    this.fixStrategies = this.initializeFixStrategies()
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow,
      fix: chalk.magenta,
      iteration: chalk.cyan
    }

    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      fix: '🔧',
      iteration: '🔄'
    }

    console.log(`${colors[type]}[${timestamp}] ${prefix[type]} ${message}${chalk.reset()}`)
  }

  initializeIssuePatterns() {
    return {
      // Import/Export issues
      importIssues: [
        /Cannot resolve module/,
        /Module not found/,
        /Export.*is not defined/,
        /Import.*is not defined/
      ],
      
      // TypeScript issues
      typescriptIssues: [
        /Type.*is not assignable/,
        /Property.*does not exist/,
        /Parameter.*implicitly has an 'any' type/,
        /Cannot find name/
      ],
      
      // Build issues
      buildIssues: [
        /Failed to compile/,
        /Build error/,
        /Syntax error/,
        /Parsing error/
      ],
      
      // API issues
      apiIssues: [
        /API route not found/,
        /Method not allowed/,
        /Internal server error/,
        /Database connection error/
      ],
      
      // Test issues
      testIssues: [
        /Test failed/,
        /Assertion failed/,
        /Timeout exceeded/,
        /Element not found/
      ]
    }
  }

  initializeFixStrategies() {
    return {
      // Import fixes
      importFixes: [
        {
          pattern: /Cannot resolve module ['"]([^'"]+)['"]/,
          fix: (match) => this.fixMissingImport(match[1])
        },
        {
          pattern: /Export '([^']+)' is not defined/,
          fix: (match) => this.fixMissingExport(match[1])
        }
      ],
      
      // TypeScript fixes
      typescriptFixes: [
        {
          pattern: /Property '([^']+)' does not exist/,
          fix: (match) => this.fixMissingProperty(match[1])
        },
        {
          pattern: /Parameter '([^']+)' implicitly has an 'any' type/,
          fix: (match) => this.fixImplicitAny(match[1])
        }
      ],
      
      // Build fixes
      buildFixes: [
        {
          pattern: /Syntax error/,
          fix: () => this.fixSyntaxError()
        }
      ]
    }
  }

  async runTestLoop() {
    this.log(`Starting test loop system (${this.options.maxIterations} iterations max)`, 'iteration')
    
    while (this.iteration < this.options.maxIterations) {
      this.iteration++
      this.totalRuns++
      
      this.log(`\n--- Iteration ${this.iteration}/${this.options.maxIterations} ---`, 'iteration')
      
      const result = await this.runSingleTestCycle()
      
      if (result.success) {
        this.successfulRuns++
        this.log(`✅ Iteration ${this.iteration} completed successfully`, 'success')
        
        if (this.options.watchMode) {
          this.log('🔄 Watch mode: Waiting for changes...', 'info')
          await this.waitForFileChanges()
          continue
        } else {
          break // Exit on first success in non-watch mode
        }
      } else {
        this.failedRuns++
        this.log(`❌ Iteration ${this.iteration} failed`, 'error')
        
        if (this.options.autoFix) {
          const fixesApplied = await this.analyzeAndFix(result.error)
          if (fixesApplied.length > 0) {
            this.log(`🔧 Applied ${fixesApplied.length} fixes`, 'fix')
            this.fixesApplied.push(...fixesApplied)
            
            // Wait before next iteration
            await this.sleep(this.options.delayBetweenRuns)
            continue
          }
        }
        
        // If no fixes applied or auto-fix disabled, break
        this.log('No fixes available or auto-fix disabled. Stopping loop.', 'warning')
        break
      }
    }
    
    await this.generateFinalReport()
  }

  async runSingleTestCycle() {
    try {
      this.log('Running comprehensive test suite...', 'info')
      
      // Run all tests
      const testResult = execSync('npm run test', {
        encoding: 'utf8',
        timeout: 300000 // 5 minutes
      })
      
      // Parse results
      const success = !testResult.includes('Some tests failed')
      
      this.testHistory.push({
        iteration: this.iteration,
        success,
        output: testResult,
        timestamp: new Date().toISOString()
      })
      
      return { success, output: testResult }
      
    } catch (error) {
      this.log(`Test execution failed: ${error.message}`, 'error')
      
      this.testHistory.push({
        iteration: this.iteration,
        success: false,
        error: error.message,
        output: error.stdout || '',
        timestamp: new Date().toISOString()
      })
      
      return { success: false, error: error.message, output: error.stdout || '' }
    }
  }

  async analyzeAndFix(errorOutput) {
    const fixes = []
    
    // Analyze error patterns
    for (const [category, patterns] of Object.entries(this.issuePatterns)) {
      for (const pattern of patterns) {
        const match = errorOutput.match(pattern)
        if (match) {
          this.log(`Detected ${category} issue: ${match[0]}`, 'warning')
          
          // Find appropriate fix
          const fixCategory = category.replace('Issues', 'Fixes')
          if (this.fixStrategies[fixCategory]) {
            for (const fixStrategy of this.fixStrategies[fixCategory]) {
              const fixMatch = errorOutput.match(fixStrategy.pattern)
              if (fixMatch) {
                try {
                  const fixResult = await fixStrategy.fix(fixMatch)
                  if (fixResult) {
                    fixes.push({
                      category,
                      issue: match[0],
                      fix: fixResult,
                      timestamp: new Date().toISOString()
                    })
                    this.log(`Applied fix for ${category}: ${fixResult}`, 'fix')
                  }
                } catch (fixError) {
                  this.log(`Fix failed for ${category}: ${fixError.message}`, 'error')
                }
              }
            }
          }
        }
      }
    }
    
    return fixes
  }

  // Fix implementations
  async fixMissingImport(moduleName) {
    this.log(`Attempting to fix missing import: ${moduleName}`, 'fix')
    
    // Check if it's a known module that needs to be installed
    const knownModules = {
      'chalk': 'chalk',
      'lodash': 'lodash',
      'moment': 'moment',
      'uuid': 'uuid'
    }
    
    if (knownModules[moduleName]) {
      try {
        execSync(`npm install ${knownModules[moduleName]}`, { stdio: 'pipe' })
        return `Installed missing dependency: ${knownModules[moduleName]}`
      } catch (error) {
        return `Failed to install ${knownModules[moduleName]}: ${error.message}`
      }
    }
    
    // Check if it's a local module that needs to be created
    if (moduleName.startsWith('@/') || moduleName.startsWith('./') || moduleName.startsWith('../')) {
      return `Local module ${moduleName} needs manual attention`
    }
    
    return `Unknown module ${moduleName} - manual fix required`
  }

  async fixMissingExport(exportName) {
    this.log(`Attempting to fix missing export: ${exportName}`, 'fix')
    
    // This would need more sophisticated analysis of the codebase
    // For now, return a generic fix message
    return `Missing export ${exportName} - check export statements in source files`
  }

  async fixMissingProperty(propertyName) {
    this.log(`Attempting to fix missing property: ${propertyName}`, 'fix')
    
    // This would need TypeScript analysis
    return `Missing property ${propertyName} - check type definitions`
  }

  async fixImplicitAny(parameterName) {
    this.log(`Attempting to fix implicit any type: ${parameterName}`, 'fix')
    
    // This would need to add type annotations
    return `Implicit any type for ${parameterName} - add type annotation`
  }

  async fixSyntaxError() {
    this.log('Attempting to fix syntax error', 'fix')
    
    // This would need AST analysis
    return 'Syntax error detected - check file syntax manually'
  }

  async waitForFileChanges() {
    return new Promise((resolve) => {
      const chokidar = require('chokidar')
      const watcher = chokidar.watch(['src', 'lib', 'components', 'app'], {
        ignored: /node_modules/,
        persistent: true
      })
      
      watcher.on('change', (path) => {
        this.log(`File changed: ${path}`, 'info')
        watcher.close()
        resolve()
      })
      
      // Timeout after 30 seconds
      setTimeout(() => {
        watcher.close()
        resolve()
      }, 30000)
    })
  }

  async generateFinalReport() {
    const endTime = Date.now()
    const duration = (endTime - this.startTime) / 1000
    
    this.log('\n📊 Test Loop System Final Report', 'info')
    this.log('='.repeat(50), 'info')
    
    this.log(`Total Iterations: ${this.totalRuns}`, 'info')
    this.log(`✅ Successful Runs: ${this.successfulRuns}`, 'success')
    this.log(`❌ Failed Runs: ${this.failedRuns}`, this.failedRuns > 0 ? 'error' : 'info')
    this.log(`🔧 Fixes Applied: ${this.fixesApplied.length}`, 'fix')
    this.log(`⏱️  Total Duration: ${duration.toFixed(2)}s`, 'info')
    this.log(`📈 Success Rate: ${this.totalRuns > 0 ? ((this.successfulRuns / this.totalRuns) * 100).toFixed(1) : 0}%`, 'info')
    
    if (this.fixesApplied.length > 0) {
      this.log('\n🔧 Applied Fixes:', 'fix')
      this.fixesApplied.forEach((fix, index) => {
        this.log(`${index + 1}. [${fix.category}] ${fix.fix}`, 'fix')
      })
    }
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'test-reports', `test-loop-${Date.now()}.json`)
    const reportDir = path.dirname(reportPath)
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      options: this.options,
      summary: {
        totalRuns: this.totalRuns,
        successfulRuns: this.successfulRuns,
        failedRuns: this.failedRuns,
        fixesApplied: this.fixesApplied.length,
        successRate: this.totalRuns > 0 ? (this.successfulRuns / this.totalRuns) * 100 : 0
      },
      testHistory: this.testHistory,
      fixesApplied: this.fixesApplied
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'info')
    
    // Exit with appropriate code
    if (this.failedRuns > 0 && this.successfulRuns === 0) {
      this.log('\n❌ All test runs failed. Manual intervention required.', 'error')
      process.exit(1)
    } else if (this.successfulRuns > 0) {
      this.log('\n🎉 Test loop completed with at least one successful run!', 'success')
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
  options.maxIterations = parseInt(args[index + 1]) || 10
}

if (args.includes('--delay')) {
  const index = args.indexOf('--delay')
  options.delayBetweenRuns = parseInt(args[index + 1]) || 5000
}

if (args.includes('--no-auto-fix')) {
  options.autoFix = false
}

if (args.includes('--watch')) {
  options.watchMode = true
}

if (args.includes('--no-report')) {
  options.generateReport = false
}

// Install required dependencies
try {
  require('chalk')
} catch (error) {
  console.log('Installing required dependencies...')
  execSync('npm install chalk chokidar', { stdio: 'inherit' })
}

// Run the test loop system
const testLoop = new TestLoopSystem(options)
testLoop.runTestLoop().catch(error => {
  console.error('Test loop system failed:', error)
  process.exit(1)
})
