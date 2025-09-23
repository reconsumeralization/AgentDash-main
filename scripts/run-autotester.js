#!/usr/bin/env node

/**
 * AutoTester Runner
 * Main orchestrator for the complete find -> fix -> lint -> api -> GUI self-loop
 */

const { spawn, execSync } = require('child_process')
const fs = require('fs').promises
const path = require('path')
const chalk = require('chalk')
const ora = require('ora')

class AutoTesterRunner {
  constructor() {
    this.config = {
      phases: [
        { name: 'find', command: 'node bin/autotester.js --find', timeout: 60000 },
        { name: 'fix', command: 'node scripts/self-fix-loop.js', timeout: 300000 },
        { name: 'lint', command: 'node scripts/lint-and-fix.js --all', timeout: 120000 },
        { name: 'api', command: 'npm run test:api', timeout: 180000 },
        { name: 'gui', command: 'npm run test:e2e', timeout: 300000 }
      ],
      maxRetries: 3,
      retryDelay: 5000,
      enableSelfLoop: true,
      generateReport: true
    }
    
    this.results = []
    this.startTime = Date.now()
  }

  async runCompletePipeline() {
    console.log(chalk.blue.bold('\n🚀 Starting Complete AutoTester Pipeline\n'))
    console.log(chalk.cyan('Pipeline: Find → Fix → Lint → API → GUI\n'))
    
    for (const phase of this.config.phases) {
      const result = await this.runPhase(phase)
      this.results.push(result)
      
      if (!result.success && !this.config.enableSelfLoop) {
        console.log(chalk.red(`❌ Phase ${phase.name} failed, stopping pipeline`))
        break
      }
    }
    
    await this.generateReport()
    return this.results
  }

  async runPhase(phase) {
    const spinner = ora(`Running ${phase.name} phase...`).start()
    const startTime = Date.now()
    
    try {
      const output = execSync(phase.command, { 
        encoding: 'utf8',
        timeout: phase.timeout,
        stdio: 'pipe'
      })
      
      const duration = Date.now() - startTime
      spinner.succeed(`${phase.name} phase completed in ${duration}ms`)
      
      return { 
        phase: phase.name, 
        success: true, 
        output, 
        duration,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      const duration = Date.now() - startTime
      spinner.fail(`${phase.name} phase failed in ${duration}ms`)
      
      return { 
        phase: phase.name, 
        success: false, 
        output: error.stdout || error.stderr || error.message, 
        duration,
        timestamp: new Date().toISOString()
      }
    }
  }

  async runSelfLoop() {
    console.log(chalk.blue.bold('\n🔄 Starting Self-Loop Mode\n'))
    
    let iteration = 0
    let maxIterations = 5
    
    while (iteration < maxIterations) {
      iteration++
      console.log(chalk.cyan(`\n🔄 Self-Loop Iteration ${iteration}/${maxIterations}\n`))
      
      const results = await this.runCompletePipeline()
      const failedPhases = results.filter(r => !r.success)
      
      if (failedPhases.length === 0) {
        console.log(chalk.green(`\n🎉 All phases passed! Self-loop completed.`))
        break
      }
      
      console.log(chalk.yellow(`\n⚠️  ${failedPhases.length} phases failed, retrying...`))
      
      if (iteration < maxIterations) {
        console.log(chalk.gray(`⏳ Waiting ${this.config.retryDelay}ms before next iteration...`))
        await this.sleep(this.config.retryDelay)
      }
    }
    
    return this.results
  }

  async runSpecificPhase(phaseName) {
    const phase = this.config.phases.find(p => p.name === phaseName)
    if (!phase) {
      throw new Error(`Phase ${phaseName} not found`)
    }
    
    console.log(chalk.blue.bold(`\n🎯 Running ${phaseName} phase only\n`))
    
    const result = await this.runPhase(phase)
    this.results.push(result)
    
    await this.generateReport()
    return result
  }

  async runParallelPhases(phaseNames) {
    console.log(chalk.blue.bold(`\n⚡ Running phases in parallel: ${phaseNames.join(', ')}\n`))
    
    const phases = this.config.phases.filter(p => phaseNames.includes(p.name))
    const promises = phases.map(phase => this.runPhase(phase))
    
    const results = await Promise.allSettled(promises)
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const phase = phases[i]
      
      if (result.status === 'fulfilled') {
        this.results.push(result.value)
      } else {
        this.results.push({
          phase: phase.name,
          success: false,
          output: result.reason?.message || 'Unknown error',
          duration: 0,
          timestamp: new Date().toISOString()
        })
      }
    }
    
    await this.generateReport()
    return this.results
  }

  async generateReport() {
    console.log(chalk.blue.bold('\n📊 Generating AutoTester Report\n'))
    
    const summary = {
      totalPhases: this.results.length,
      successfulPhases: this.results.filter(r => r.success).length,
      failedPhases: this.results.filter(r => !r.success).length,
      totalDuration: Date.now() - this.startTime,
      results: this.results,
      timestamp: new Date().toISOString()
    }
    
    console.log(chalk.white(`Total Phases: ${summary.totalPhases}`))
    console.log(chalk.green(`✅ Successful: ${summary.successfulPhases}`))
    console.log(chalk.red(`❌ Failed: ${summary.failedPhases}`))
    console.log(chalk.blue(`⏱️  Total Duration: ${summary.totalDuration}ms`))
    
    // Detailed results
    console.log(chalk.blue.bold('\n📋 Detailed Results:\n'))
    
    for (const result of this.results) {
      const status = result.success ? chalk.green('✅') : chalk.red('❌')
      console.log(`${status} ${result.phase}: ${result.duration}ms`)
      
      if (!result.success && result.output) {
        console.log(chalk.gray(`   ${result.output.substring(0, 200)}...`))
      }
    }
    
    // Save report
    const reportPath = 'test-results/autotester-pipeline-report.json'
    await fs.mkdir('test-results', { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify(summary, null, 2))
    
    console.log(chalk.green(`\n📄 Report saved to: ${reportPath}`))
    
    // Generate HTML report
    await this.generateHTMLReport(summary)
  }

  async generateHTMLReport(summary) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoTester Pipeline Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { padding: 20px; border-radius: 8px; text-align: center; }
        .success { background-color: #d4edda; color: #155724; }
        .failure { background-color: #f8d7da; color: #721c24; }
        .info { background-color: #d1ecf1; color: #0c5460; }
        .results { margin-top: 30px; }
        .result-item { padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid; }
        .result-success { background-color: #d4edda; border-left-color: #28a745; }
        .result-failure { background-color: #f8d7da; border-left-color: #dc3545; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 AutoTester Pipeline Report</h1>
            <p class="timestamp">Generated: ${summary.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card info">
                <h3>Total Phases</h3>
                <p style="font-size: 2em; margin: 0;">${summary.totalPhases}</p>
            </div>
            <div class="summary-card success">
                <h3>Successful</h3>
                <p style="font-size: 2em; margin: 0;">${summary.successfulPhases}</p>
            </div>
            <div class="summary-card failure">
                <h3>Failed</h3>
                <p style="font-size: 2em; margin: 0;">${summary.failedPhases}</p>
            </div>
            <div class="summary-card info">
                <h3>Duration</h3>
                <p style="font-size: 2em; margin: 0;">${Math.round(summary.totalDuration / 1000)}s</p>
            </div>
        </div>
        
        <div class="results">
            <h2>Phase Results</h2>
            ${summary.results.map(result => `
                <div class="result-item ${result.success ? 'result-success' : 'result-failure'}">
                    <h3>${result.success ? '✅' : '❌'} ${result.phase}</h3>
                    <p><strong>Duration:</strong> ${result.duration}ms</p>
                    <p><strong>Timestamp:</strong> ${result.timestamp}</p>
                    ${!result.success ? `<p><strong>Error:</strong> ${result.output.substring(0, 500)}...</p>` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`
    
    const htmlPath = 'test-results/autotester-pipeline-report.html'
    await fs.writeFile(htmlPath, html)
    console.log(chalk.green(`📄 HTML report saved to: ${htmlPath}`))
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const runner = new AutoTesterRunner()

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
AutoTester Runner

Usage: node scripts/run-autotester.js [options]

Options:
  --all             Run complete pipeline (default)
  --self-loop       Run self-loop mode
  --find            Run find phase only
  --fix             Run fix phase only
  --lint            Run lint phase only
  --api             Run API phase only
  --gui             Run GUI phase only
  --parallel        Run specified phases in parallel
  --help, -h        Show this help

Examples:
  node scripts/run-autotester.js --all
  node scripts/run-autotester.js --self-loop
  node scripts/run-autotester.js --find --fix --lint
  node scripts/run-autotester.js --parallel --api --gui
`)
    return
  }

  if (args.includes('--self-loop')) {
    await runner.runSelfLoop()
  } else if (args.includes('--parallel')) {
    const phases = args.filter(arg => ['find', 'fix', 'lint', 'api', 'gui'].includes(arg))
    if (phases.length === 0) {
      console.log(chalk.red('No phases specified for parallel execution'))
      return
    }
    await runner.runParallelPhases(phases)
  } else if (args.includes('--find')) {
    await runner.runSpecificPhase('find')
  } else if (args.includes('--fix')) {
    await runner.runSpecificPhase('fix')
  } else if (args.includes('--lint')) {
    await runner.runSpecificPhase('lint')
  } else if (args.includes('--api')) {
    await runner.runSpecificPhase('api')
  } else if (args.includes('--gui')) {
    await runner.runSpecificPhase('gui')
  } else {
    await runner.runCompletePipeline()
  }
}

// Export for programmatic use
module.exports = AutoTesterRunner

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
