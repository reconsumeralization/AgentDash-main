/**
 * Advanced Test Loop System - Next generation test automation
 * Integrates intelligent error analysis and auto-fixing
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const { EnhancedErrorAnalyzer } = require('./enhanced-error-analyzer')
const { IntelligentAutoFixer } = require('./intelligent-auto-fixer')

class AdvancedTestLoop {
  constructor(options = {}) {
    this.options = {
      maxIterations: options.maxIterations || 10,
      autoFix: options.autoFix !== false,
      parallel: options.parallel || false,
      monitoring: options.monitoring || false,
      verbose: options.verbose || false,
      ...options
    }

    this.errorAnalyzer = new EnhancedErrorAnalyzer()
    this.autoFixer = new IntelligentAutoFixer()
    this.iterationCount = 0
    this.results = []
    this.startTime = null
    this.isRunning = false
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      fix: '\x1b[35m',
      reset: '\x1b[0m'
    }

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`)
  }

  async run() {
    this.startTime = new Date()
    this.isRunning = true
    this.log('🚀 Starting Advanced Test Loop System', 'info')
    this.log('=====================================', 'info')

    try {
      while (this.iterationCount < this.options.maxIterations && this.isRunning) {
        this.iterationCount++
        this.log(`\n--- Iteration ${this.iterationCount}/${this.options.maxIterations} ---`, 'info')

        const iterationResult = await this.runIteration()
        this.results.push(iterationResult)

        if (iterationResult.success) {
          this.log(`✅ Iteration ${this.iterationCount} completed successfully`, 'success')
          break
        }

        if (iterationResult.fixable && this.options.autoFix) {
          await this.applyFixes(iterationResult.errors)
        }

        // Small delay between iterations
        await this.sleep(1000)
      }

      await this.generateFinalReport()
    } catch (error) {
      this.log(`❌ Test loop failed: ${error.message}`, 'error')
      throw error
    } finally {
      this.isRunning = false
    }
  }

  async runIteration() {
    const iterationStart = new Date()
    const result = {
      iteration: this.iterationCount,
      startTime: iterationStart.toISOString(),
      success: false,
      errors: [],
      fixes: [],
      duration: 0
    }

    try {
      // Run the test suite
      const testOutput = await this.runTests()
      result.testOutput = testOutput

      if (testOutput.success) {
        result.success = true
        result.duration = Date.now() - iterationStart.getTime()
        return result
      }

      // Analyze errors
      const errors = this.parseErrors(testOutput.output)
      result.errors = errors

      // Check if errors are fixable
      result.fixable = errors.some(error => error.fixable)

    } catch (error) {
      this.log(`❌ Iteration ${this.iterationCount} failed: ${error.message}`, 'error')
      result.errors = [{
        originalError: error.message,
        category: 'system-error',
        severity: 'high',
        fixable: false
      }]
    }

    result.duration = Date.now() - iterationStart.getTime()
    return result
  }

  async runTests() {
    const commands = [
      { name: 'TypeScript Check', cmd: 'npx tsc --noEmit' },
      { name: 'Linting', cmd: 'npm run lint' },
      { name: 'Build', cmd: 'npm run build' },
      { name: 'Tests', cmd: 'npm test' }
    ]

    const results = []
    let overallSuccess = true

    for (const command of commands) {
      try {
        this.log(`Running ${command.name}...`, 'info')
        const output = execSync(command.cmd, { 
          encoding: 'utf8', 
          stdio: 'pipe',
          timeout: 60000 // 1 minute timeout
        })
        
        results.push({
          name: command.name,
          success: true,
          output: output
        })
      } catch (error) {
        results.push({
          name: command.name,
          success: false,
          output: error.stdout || error.message,
          error: error.message
        })
        overallSuccess = false
      }
    }

    return {
      success: overallSuccess,
      output: results.map(r => r.output).join('\n'),
      results
    }
  }

  parseErrors(output) {
    const errors = []
    const lines = output.split('\n')

    for (const line of lines) {
      if (line.trim() === '') continue

      // Try to extract file path and line number
      const fileMatch = line.match(/([^(]+)\((\d+),\d+\)/)
      const filePath = fileMatch ? fileMatch[1].trim() : null
      const lineNumber = fileMatch ? parseInt(fileMatch[2]) : null

      // Analyze the error
      const analysis = this.errorAnalyzer.analyzeError(line, filePath, lineNumber)
      if (analysis.category !== 'unknown') {
        errors.push(analysis)
      }
    }

    return errors
  }

  async applyFixes(errors) {
    this.log(`🔧 Applying fixes for ${errors.length} errors...`, 'fix')

    for (const error of errors) {
      if (!error.fixable || !error.suggestions) continue

      // Try the highest confidence suggestion first
      const sortedSuggestions = error.suggestions.sort((a, b) => b.confidence - a.confidence)
      
      for (const suggestion of sortedSuggestions) {
        if (suggestion.confidence < 0.5) continue // Skip low confidence suggestions

        this.log(`  Applying fix: ${suggestion.description}`, 'fix')
        
        try {
          const fixResult = await this.autoFixer.applyFix(error, suggestion)
          
          if (fixResult.success) {
            this.log(`  ✅ Fix applied successfully: ${fixResult.details.action}`, 'success')
            break
          } else {
            this.log(`  ❌ Fix failed: ${fixResult.details.reason}`, 'error')
          }
        } catch (error) {
          this.log(`  ❌ Fix error: ${error.message}`, 'error')
        }
      }
    }
  }

  async generateFinalReport() {
    const endTime = new Date()
    const totalDuration = endTime.getTime() - this.startTime.getTime()
    
    const report = {
      summary: {
        totalIterations: this.iterationCount,
        successfulIterations: this.results.filter(r => r.success).length,
        totalDuration: totalDuration,
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString()
      },
      errorAnalysis: this.errorAnalyzer.generateReport(),
      fixHistory: this.autoFixer.getFixHistory(),
      iterations: this.results
    }

    // Save report
    const reportPath = path.join(process.cwd(), 'test-reports', `advanced-test-loop-${Date.now()}.json`)
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    this.log('\n📊 Advanced Test Loop Results', 'info')
    this.log('==============================', 'info')
    this.log(`Total Iterations: ${report.summary.totalIterations}`, 'info')
    this.log(`Successful: ${report.summary.successfulIterations}`, 'success')
    this.log(`Failed: ${report.summary.totalIterations - report.summary.successfulIterations}`, 'error')
    this.log(`Duration: ${(totalDuration / 1000).toFixed(2)}s`, 'info')
    this.log(`Success Rate: ${((report.summary.successfulIterations / report.summary.totalIterations) * 100).toFixed(1)}%`, 'info')

    // Show top errors
    const topErrors = report.errorAnalysis.topErrors
    if (topErrors.length > 0) {
      this.log('\n🔍 Top Errors:', 'warning')
      topErrors.forEach((error, index) => {
        this.log(`  ${index + 1}. ${error.error} (${error.count} times)`, 'warning')
      })
    }

    // Show recommendations
    const recommendations = report.errorAnalysis.recommendations
    if (recommendations.length > 0) {
      this.log('\n💡 Recommendations:', 'info')
      recommendations.forEach((rec, index) => {
        this.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.action}: ${rec.description}`, 'info')
      })
    }

    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'info')
    
    return report
  }

  stop() {
    this.isRunning = false
    this.log('🛑 Test loop stopped by user', 'warning')
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      iterationCount: this.iterationCount,
      maxIterations: this.options.maxIterations,
      results: this.results.length,
      successRate: this.results.length > 0 ? 
        this.results.filter(r => r.success).length / this.results.length : 0
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const options = {}

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--max-iterations':
        options.maxIterations = parseInt(args[++i])
        break
      case '--no-auto-fix':
        options.autoFix = false
        break
      case '--verbose':
        options.verbose = true
        break
      case '--parallel':
        options.parallel = true
        break
      case '--monitoring':
        options.monitoring = true
        break
      case '--help':
        console.log(`
Advanced Test Loop System

Usage: node scripts/advanced-test-loop.js [options]

Options:
  --max-iterations <number>  Maximum number of iterations (default: 10)
  --no-auto-fix            Disable automatic fixing
  --verbose                Enable verbose logging
  --parallel               Enable parallel test execution
  --monitoring             Enable monitoring mode
  --help                   Show this help message
        `)
        process.exit(0)
        break
    }
  }

  const testLoop = new AdvancedTestLoop(options)
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    testLoop.stop()
    process.exit(0)
  })

  testLoop.run().catch(error => {
    console.error('Test loop failed:', error)
    process.exit(1)
  })
}

module.exports = { AdvancedTestLoop }
