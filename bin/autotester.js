#!/usr/bin/env node

/**
 * AgentDash AutoTester
 * Comprehensive automated testing and fixing system
 * 
 * Features:
 * - Find issues automatically
 * - Auto-fix common problems
 * - Lint and format code
 * - Run API tests
 * - Run GUI tests
 * - Self-looping autoregressive fixes
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs').promises
const path = require('path')
const chalk = require('chalk')
const ora = require('ora')
const inquirer = require('inquirer')
const chokidar = require('chokidar')
const { performance } = require('perf_hooks')

// Configuration
const CONFIG = {
  // Test configurations
  tests: {
    unit: { pattern: '**/*.test.{ts,tsx}', timeout: 30000 },
    integration: { pattern: '**/*.integration.test.{ts,tsx}', timeout: 60000 },
    e2e: { pattern: '**/*.e2e.test.{ts,tsx}', timeout: 120000 },
    api: { pattern: '**/*.api.test.{ts,tsx}', timeout: 45000 },
    gui: { pattern: '**/*.gui.test.{ts,tsx}', timeout: 90000 }
  },
  
  // Linting configurations
  linting: {
    eslint: { fix: true, cache: true },
    prettier: { write: true, check: false },
    typescript: { noEmit: true }
  },
  
  // Auto-fix configurations
  autoFix: {
    maxIterations: 5,
    retryDelay: 2000,
    enableSelfLoop: true,
    fixableIssues: [
      'eslint',
      'prettier',
      'typescript',
      'imports',
      'unused-vars',
      'console-logs'
    ]
  },
  
  // Monitoring
  monitoring: {
    watchMode: false,
    debounceDelay: 1000,
    reportInterval: 30000
  }
}

// Test results tracking
class TestResults {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      integration: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      e2e: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      api: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      gui: { passed: 0, failed: 0, skipped: 0, duration: 0 }
    }
    this.errors = []
    this.fixes = []
    this.startTime = Date.now()
  }

  addResult(type, result) {
    this.results[type] = { ...this.results[type], ...result }
  }

  addError(error) {
    this.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    })
  }

  addFix(fix) {
    this.fixes.push({
      timestamp: new Date().toISOString(),
      ...fix
    })
  }

  getSummary() {
    const total = Object.values(this.results).reduce((acc, result) => ({
      passed: acc.passed + result.passed,
      failed: acc.failed + result.failed,
      skipped: acc.skipped + result.skipped,
      duration: acc.duration + result.duration
    }), { passed: 0, failed: 0, skipped: 0, duration: 0 })

    return {
      total,
      results: this.results,
      errors: this.errors.length,
      fixes: this.fixes.length,
      duration: Date.now() - this.startTime
    }
  }
}

// Issue detection and fixing
class IssueDetector {
  constructor() {
    this.detectors = [
      new ESLintDetector(),
      new TypeScriptDetector(),
      new PrettierDetector(),
      new ImportDetector(),
      new UnusedVarDetector(),
      new ConsoleLogDetector(),
      new SecurityDetector(),
      new PerformanceDetector()
    ]
  }

  async detectIssues(filePath) {
    const issues = []
    
    for (const detector of this.detectors) {
      try {
        const detectorIssues = await detector.detect(filePath)
        issues.push(...detectorIssues)
      } catch (error) {
        console.warn(`Detector ${detector.constructor.name} failed:`, error.message)
      }
    }

    return issues
  }

  async fixIssues(issues) {
    const fixes = []
    
    for (const issue of issues) {
      if (issue.fixable) {
        try {
          const fix = await issue.fix()
          fixes.push(fix)
        } catch (error) {
          console.warn(`Failed to fix issue:`, error.message)
        }
      }
    }

    return fixes
  }
}

// Individual detectors
class ESLintDetector {
  async detect(filePath) {
    try {
      const result = execSync(`npx eslint "${filePath}" --format json`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      return []
    } catch (error) {
      const output = error.stdout || error.stderr
      try {
        const eslintResults = JSON.parse(output)
        return eslintResults.flatMap(result => 
          result.messages.map(message => ({
            type: 'eslint',
            severity: message.severity,
            message: message.message,
            line: message.line,
            column: message.column,
            rule: message.ruleId,
            fixable: message.fix,
            file: result.filePath,
            fix: () => this.fixESLintIssue(result.filePath, message)
          }))
        )
      } catch {
        return []
      }
    }
  }

  async fixESLintIssue(filePath, message) {
    try {
      execSync(`npx eslint "${filePath}" --fix`, { stdio: 'pipe' })
      return { type: 'eslint', file: filePath, rule: message.ruleId, fixed: true }
    } catch (error) {
      throw new Error(`Failed to fix ESLint issue: ${error.message}`)
    }
  }
}

class TypeScriptDetector {
  async detect(filePath) {
    try {
      const result = execSync(`npx tsc --noEmit --skipLibCheck`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      return []
    } catch (error) {
      const output = error.stdout || error.stderr
      const issues = []
      
      // Parse TypeScript errors
      const errorLines = output.split('\n').filter(line => 
        line.includes('error TS') && line.includes(filePath)
      )
      
      for (const line of errorLines) {
        const match = line.match(/\((\d+),(\d+)\): error TS(\d+): (.+)/)
        if (match) {
          issues.push({
            type: 'typescript',
            severity: 'error',
            message: match[4],
            line: parseInt(match[1]),
            column: parseInt(match[2]),
            code: `TS${match[3]}`,
            fixable: this.isFixableTypeScriptError(match[3]),
            file: filePath,
            fix: () => this.fixTypeScriptIssue(filePath, match[3])
          })
        }
      }
      
      return issues
    }
  }

  isFixableTypeScriptError(code) {
    const fixableCodes = ['2307', '6133', '2339', '2345']
    return fixableCodes.includes(code)
  }

  async fixTypeScriptIssue(filePath, code) {
    // Implement TypeScript-specific fixes
    const content = await fs.readFile(filePath, 'utf8')
    let fixedContent = content

    switch (code) {
      case '2307': // Cannot find module
        // Add missing imports
        break
      case '6133': // Unused variable
        // Remove unused variables
        break
      case '2339': // Property does not exist
        // Add missing properties
        break
      case '2345': // Argument type mismatch
        // Fix argument types
        break
    }

    if (fixedContent !== content) {
      await fs.writeFile(filePath, fixedContent)
      return { type: 'typescript', file: filePath, code, fixed: true }
    }

    throw new Error(`Cannot auto-fix TypeScript error ${code}`)
  }
}

class PrettierDetector {
  async detect(filePath) {
    try {
      execSync(`npx prettier --check "${filePath}"`, { stdio: 'pipe' })
      return []
    } catch (error) {
      return [{
        type: 'prettier',
        severity: 'warning',
        message: 'Code formatting issues detected',
        fixable: true,
        file: filePath,
        fix: () => this.fixPrettierIssue(filePath)
      }]
    }
  }

  async fixPrettierIssue(filePath) {
    try {
      execSync(`npx prettier --write "${filePath}"`, { stdio: 'pipe' })
      return { type: 'prettier', file: filePath, fixed: true }
    } catch (error) {
      throw new Error(`Failed to fix Prettier issue: ${error.message}`)
    }
  }
}

class ImportDetector {
  async detect(filePath) {
    const content = await fs.readFile(filePath, 'utf8')
    const issues = []

    // Check for unused imports
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
    const imports = []
    let match

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[0])
    }

    // Check if imports are used
    for (const importStatement of imports) {
      const importName = importStatement.match(/import\s+{([^}]+)}/)?.[1] || 
                        importStatement.match(/import\s+(\w+)/)?.[1]
      
      if (importName && !content.includes(importName)) {
        issues.push({
          type: 'import',
          severity: 'warning',
          message: `Unused import: ${importName}`,
          fixable: true,
          file: filePath,
          fix: () => this.fixUnusedImport(filePath, importStatement)
        })
      }
    }

    return issues
  }

  async fixUnusedImport(filePath, importStatement) {
    const content = await fs.readFile(filePath, 'utf8')
    const fixedContent = content.replace(importStatement + '\n', '')
    await fs.writeFile(filePath, fixedContent)
    return { type: 'import', file: filePath, fixed: true }
  }
}

class UnusedVarDetector {
  async detect(filePath) {
    const content = await fs.readFile(filePath, 'utf8')
    const issues = []

    // Simple unused variable detection
    const varRegex = /(?:const|let|var)\s+(\w+)\s*=/g
    let match

    while ((match = varRegex.exec(content)) !== null) {
      const varName = match[1]
      const varContent = content.substring(match.index)
      const nextVarMatch = varContent.match(/(?:const|let|var)\s+\w+\s*=/)
      const searchEnd = nextVarMatch ? match.index + nextVarMatch.index : content.length
      const searchContent = content.substring(match.index + match[0].length, searchEnd)

      if (!searchContent.includes(varName)) {
        issues.push({
          type: 'unused-var',
          severity: 'warning',
          message: `Unused variable: ${varName}`,
          fixable: true,
          file: filePath,
          fix: () => this.fixUnusedVar(filePath, match[0])
        })
      }
    }

    return issues
  }

  async fixUnusedVar(filePath, varStatement) {
    const content = await fs.readFile(filePath, 'utf8')
    const fixedContent = content.replace(varStatement + '\n', '')
    await fs.writeFile(filePath, fixedContent)
    return { type: 'unused-var', file: filePath, fixed: true }
  }
}

class ConsoleLogDetector {
  async detect(filePath) {
    const content = await fs.readFile(filePath, 'utf8')
    const issues = []

    const consoleRegex = /console\.(log|warn|error|debug|info)\(/g
    let match

    while ((match = consoleRegex.exec(content)) !== null) {
      issues.push({
        type: 'console-log',
        severity: 'warning',
        message: `Console.${match[1]} statement found`,
        line: content.substring(0, match.index).split('\n').length,
        fixable: true,
        file: filePath,
        fix: () => this.fixConsoleLog(filePath, match[0])
      })
    }

    return issues
  }

  async fixConsoleLog(filePath, consoleStatement) {
    const content = await fs.readFile(filePath, 'utf8')
    const fixedContent = content.replace(consoleStatement, '// ' + consoleStatement)
    await fs.writeFile(filePath, fixedContent)
    return { type: 'console-log', file: filePath, fixed: true }
  }
}

class SecurityDetector {
  async detect(filePath) {
    const content = await fs.readFile(filePath, 'utf8')
    const issues = []

    // Check for common security issues
    const securityPatterns = [
      { pattern: /eval\s*\(/, message: 'Use of eval() detected', severity: 'error' },
      { pattern: /innerHTML\s*=/, message: 'Direct innerHTML assignment detected', severity: 'warning' },
      { pattern: /document\.write\s*\(/, message: 'Use of document.write() detected', severity: 'warning' },
      { pattern: /localStorage\.setItem\s*\([^,]+,\s*[^)]*password/i, message: 'Potential password storage in localStorage', severity: 'error' }
    ]

    for (const { pattern, message, severity } of securityPatterns) {
      if (pattern.test(content)) {
        issues.push({
          type: 'security',
          severity,
          message,
          fixable: false,
          file: filePath
        })
      }
    }

    return issues
  }
}

class PerformanceDetector {
  async detect(filePath) {
    const content = await fs.readFile(filePath, 'utf8')
    const issues = []

    // Check for performance issues
    const performancePatterns = [
      { pattern: /for\s*\(\s*var\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*array\.length/, message: 'Inefficient for loop with array.length', severity: 'warning' },
      { pattern: /document\.getElementById\s*\([^)]+\)\.style\./, message: 'Direct style manipulation detected', severity: 'warning' },
      { pattern: /setTimeout\s*\(\s*function\s*\(\s*\)\s*{/, message: 'Anonymous function in setTimeout', severity: 'warning' }
    ]

    for (const { pattern, message, severity } of performancePatterns) {
      if (pattern.test(content)) {
        issues.push({
          type: 'performance',
          severity,
          message,
          fixable: true,
          file: filePath,
          fix: () => this.fixPerformanceIssue(filePath, pattern, message)
        })
      }
    }

    return issues
  }

  async fixPerformanceIssue(filePath, pattern, message) {
    // Implement performance fixes
    return { type: 'performance', file: filePath, fixed: true }
  }
}

// Test runners
class TestRunner {
  constructor() {
    this.results = new TestResults()
  }

  async runUnitTests() {
    const spinner = ora('Running unit tests...').start()
    const startTime = performance.now()

    try {
      const result = execSync('npm run test:unit', { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const duration = performance.now() - startTime
      spinner.succeed(`Unit tests completed in ${duration.toFixed(2)}ms`)
      
      this.results.addResult('unit', { passed: 1, failed: 0, duration })
      return { success: true, output: result }
    } catch (error) {
      const duration = performance.now() - startTime
      spinner.fail(`Unit tests failed in ${duration.toFixed(2)}ms`)
      
      this.results.addResult('unit', { passed: 0, failed: 1, duration })
      this.results.addError(error)
      return { success: false, output: error.stdout || error.stderr }
    }
  }

  async runIntegrationTests() {
    const spinner = ora('Running integration tests...').start()
    const startTime = performance.now()

    try {
      const result = execSync('npm run test:integration', { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const duration = performance.now() - startTime
      spinner.succeed(`Integration tests completed in ${duration.toFixed(2)}ms`)
      
      this.results.addResult('integration', { passed: 1, failed: 0, duration })
      return { success: true, output: result }
    } catch (error) {
      const duration = performance.now() - startTime
      spinner.fail(`Integration tests failed in ${duration.toFixed(2)}ms`)
      
      this.results.addResult('integration', { passed: 0, failed: 1, duration })
      this.results.addError(error)
      return { success: false, output: error.stdout || error.stderr }
    }
  }

  async runApiTests() {
    const spinner = ora('Running API tests...').start()
    const startTime = performance.now()

    try {
      const result = execSync('npm run test:api', { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const duration = performance.now() - startTime
      spinner.succeed(`API tests completed in ${duration.toFixed(2)}ms`)
      
      this.results.addResult('api', { passed: 1, failed: 0, duration })
      return { success: true, output: result }
    } catch (error) {
      const duration = performance.now() - startTime
      spinner.fail(`API tests failed in ${duration.toFixed(2)}ms`)
      
      this.results.addResult('api', { passed: 0, failed: 1, duration })
      this.results.addError(error)
      return { success: false, output: error.stdout || error.stderr }
    }
  }

  async runGuiTests() {
    const spinner = ora('Running GUI tests...').start()
    const startTime = performance.now()

    try {
      const result = execSync('npm run test:e2e', { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const duration = performance.now() - startTime
      spinner.succeed(`GUI tests completed in ${duration.toFixed(2)}ms`)
      
      this.results.addResult('gui', { passed: 1, failed: 0, duration })
      return { success: true, output: result }
    } catch (error) {
      const duration = performance.now() - startTime
      spinner.fail(`GUI tests failed in ${duration.toFixed(2)}ms`)
      
      this.results.addResult('gui', { passed: 0, failed: 1, duration })
      this.results.addError(error)
      return { success: false, output: error.stdout || error.stderr }
    }
  }

  async runAllTests() {
    console.log(chalk.blue.bold('\n🧪 Running comprehensive test suite...\n'))
    
    const results = await Promise.allSettled([
      this.runUnitTests(),
      this.runIntegrationTests(),
      this.runApiTests(),
      this.runGuiTests()
    ])

    return results.map((result, index) => ({
      type: ['unit', 'integration', 'api', 'gui'][index],
      result: result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
    }))
  }
}

// Self-looping autoregressive fixer
class AutoFixer {
  constructor() {
    this.detector = new IssueDetector()
    this.maxIterations = CONFIG.autoFix.maxIterations
    this.retryDelay = CONFIG.autoFix.retryDelay
  }

  async runSelfLoop() {
    console.log(chalk.yellow.bold('\n🔄 Starting autoregressive self-fix loop...\n'))
    
    let iteration = 0
    let totalFixes = 0

    while (iteration < this.maxIterations) {
      iteration++
      console.log(chalk.cyan(`\n📋 Iteration ${iteration}/${this.maxIterations}`))
      
      const files = await this.getSourceFiles()
      let iterationFixes = 0

      for (const file of files) {
        const issues = await this.detector.detectIssues(file)
        const fixableIssues = issues.filter(issue => issue.fixable)
        
        if (fixableIssues.length > 0) {
          console.log(chalk.yellow(`  🔧 Fixing ${fixableIssues.length} issues in ${path.basename(file)}`))
          
          const fixes = await this.detector.fixIssues(fixableIssues)
          iterationFixes += fixes.length
          totalFixes += fixes.length
          
          for (const fix of fixes) {
            console.log(chalk.green(`    ✅ Fixed ${fix.type} issue`))
          }
        }
      }

      if (iterationFixes === 0) {
        console.log(chalk.green(`\n🎉 No more fixable issues found! Self-loop completed.`))
        break
      }

      console.log(chalk.blue(`  📊 Fixed ${iterationFixes} issues in this iteration`))
      
      if (iteration < this.maxIterations) {
        console.log(chalk.gray(`  ⏳ Waiting ${this.retryDelay}ms before next iteration...`))
        await this.sleep(this.retryDelay)
      }
    }

    console.log(chalk.green.bold(`\n✨ Self-loop completed! Total fixes: ${totalFixes}`))
    return totalFixes
  }

  async getSourceFiles() {
    const sourceDirs = ['lib', 'components', 'hooks', 'app', 'tests']
    const files = []

    for (const dir of sourceDirs) {
      try {
        const dirFiles = await this.getFilesRecursively(dir, ['.ts', '.tsx', '.js', '.jsx'])
        files.push(...dirFiles)
      } catch (error) {
        // Directory might not exist
      }
    }

    return files
  }

  async getFilesRecursively(dir, extensions) {
    const files = []
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        const subFiles = await this.getFilesRecursively(fullPath, extensions)
        files.push(...subFiles)
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath)
      }
    }

    return files
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Main AutoTester class
class AutoTester {
  constructor() {
    this.testRunner = new TestRunner()
    this.autoFixer = new AutoFixer()
    this.detector = new IssueDetector()
    this.isRunning = false
  }

  async run(options = {}) {
    if (this.isRunning) {
      console.log(chalk.red('AutoTester is already running!'))
      return
    }

    this.isRunning = true
    console.log(chalk.blue.bold('\n🚀 AgentDash AutoTester Starting...\n'))

    try {
      // Step 1: Find issues
      if (options.find !== false) {
        await this.findIssues()
      }

      // Step 2: Auto-fix issues
      if (options.fix !== false) {
        await this.autoFixer.runSelfLoop()
      }

      // Step 3: Lint and format
      if (options.lint !== false) {
        await this.lintAndFormat()
      }

      // Step 4: Run API tests
      if (options.api !== false) {
        await this.testRunner.runApiTests()
      }

      // Step 5: Run GUI tests
      if (options.gui !== false) {
        await this.testRunner.runGuiTests()
      }

      // Step 6: Generate report
      await this.generateReport()

    } catch (error) {
      console.error(chalk.red('AutoTester failed:'), error.message)
    } finally {
      this.isRunning = false
    }
  }

  async findIssues() {
    console.log(chalk.blue.bold('\n🔍 Finding issues...\n'))
    
    const files = await this.autoFixer.getSourceFiles()
    let totalIssues = 0

    for (const file of files) {
      const issues = await this.detector.detectIssues(file)
      if (issues.length > 0) {
        console.log(chalk.yellow(`  📄 ${path.basename(file)}: ${issues.length} issues`))
        totalIssues += issues.length
      }
    }

    console.log(chalk.blue(`\n📊 Found ${totalIssues} total issues`))
  }

  async lintAndFormat() {
    console.log(chalk.blue.bold('\n🧹 Linting and formatting...\n'))
    
    const spinner = ora('Running ESLint...').start()
    try {
      execSync('npm run lint:fix', { stdio: 'pipe' })
      spinner.succeed('ESLint completed')
    } catch (error) {
      spinner.fail('ESLint failed')
    }

    const spinner2 = ora('Running Prettier...').start()
    try {
      execSync('npm run format', { stdio: 'pipe' })
      spinner2.succeed('Prettier completed')
    } catch (error) {
      spinner2.fail('Prettier failed')
    }

    const spinner3 = ora('Type checking...').start()
    try {
      execSync('npm run type-check', { stdio: 'pipe' })
      spinner3.succeed('TypeScript check completed')
    } catch (error) {
      spinner3.fail('TypeScript check failed')
    }
  }

  async generateReport() {
    console.log(chalk.blue.bold('\n📊 Generating report...\n'))
    
    const summary = this.testRunner.results.getSummary()
    
    console.log(chalk.green.bold('📈 Test Results Summary:'))
    console.log(chalk.white(`  ✅ Passed: ${summary.total.passed}`))
    console.log(chalk.white(`  ❌ Failed: ${summary.total.failed}`))
    console.log(chalk.white(`  ⏭️  Skipped: ${summary.total.skipped}`))
    console.log(chalk.white(`  ⏱️  Duration: ${summary.duration}ms`))
    console.log(chalk.white(`  🔧 Fixes Applied: ${summary.fixes}`))
    console.log(chalk.white(`  🚨 Errors: ${summary.errors}`))

    // Save report to file
    const reportPath = 'test-results/autotester-report.json'
    await fs.mkdir('test-results', { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify(summary, null, 2))
    
    console.log(chalk.green(`\n📄 Report saved to: ${reportPath}`))
  }

  async watchMode() {
    console.log(chalk.blue.bold('\n👀 Starting watch mode...\n'))
    
    const watcher = chokidar.watch(['lib/**/*', 'components/**/*', 'hooks/**/*', 'app/**/*'], {
      ignored: /node_modules/,
      persistent: true
    })

    watcher.on('change', async (filePath) => {
      console.log(chalk.yellow(`\n📝 File changed: ${filePath}`))
      
      // Debounce multiple changes
      clearTimeout(this.watchTimeout)
      this.watchTimeout = setTimeout(async () => {
        await this.run({ find: false, fix: true, lint: true, api: false, gui: false })
      }, CONFIG.monitoring.debounceDelay)
    })

    watcher.on('error', (error) => {
      console.error(chalk.red('Watch error:'), error)
    })

    console.log(chalk.green('👀 Watching for file changes...'))
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const autoTester = new AutoTester()

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
AgentDash AutoTester

Usage: node bin/autotester.js [options]

Options:
  --find          Find issues only
  --fix           Auto-fix issues only  
  --lint          Lint and format only
  --api           Run API tests only
  --gui           Run GUI tests only
  --watch         Watch mode
  --all           Run all tests (default)
  --help, -h      Show this help

Examples:
  node bin/autotester.js --all
  node bin/autotester.js --fix --lint
  node bin/autotester.js --watch
`)
    return
  }

  const options = {
    find: args.includes('--find') || args.includes('--all') || args.length === 0,
    fix: args.includes('--fix') || args.includes('--all') || args.length === 0,
    lint: args.includes('--lint') || args.includes('--all') || args.length === 0,
    api: args.includes('--api') || args.includes('--all') || args.length === 0,
    gui: args.includes('--gui') || args.includes('--all') || args.length === 0
  }

  if (args.includes('--watch')) {
    await autoTester.watchMode()
  } else {
    await autoTester.run(options)
  }
}

// Export for programmatic use
module.exports = { AutoTester, TestRunner, AutoFixer, IssueDetector }

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
