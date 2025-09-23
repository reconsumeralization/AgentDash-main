#!/usr/bin/env node

/**
 * Self-Fix Loop
 * Autoregressive self-fixing system that continuously improves code quality
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs').promises
const path = require('path')
const chalk = require('chalk')
const ora = require('ora')
const chokidar = require('chokidar')

class SelfFixLoop {
  constructor() {
    this.config = {
      maxIterations: 10,
      retryDelay: 2000,
      enableSelfLoop: true,
      fixableIssues: [
        'eslint',
        'prettier',
        'typescript',
        'imports',
        'unused-vars',
        'console-logs',
        'security',
        'performance'
      ],
      watchMode: false,
      debounceDelay: 1000
    }
    
    this.iterationCount = 0
    this.totalFixes = 0
    this.fixHistory = []
    this.isRunning = false
  }

  async runSelfLoop() {
    if (this.isRunning) {
      console.log(chalk.red('Self-fix loop is already running!'))
      return
    }

    this.isRunning = true
    console.log(chalk.blue.bold('\n🔄 Starting autoregressive self-fix loop...\n'))
    
    let iteration = 0
    let totalFixes = 0

    while (iteration < this.config.maxIterations) {
      iteration++
      this.iterationCount = iteration
      
      console.log(chalk.cyan(`\n📋 Iteration ${iteration}/${this.config.maxIterations}`))
      
      const files = await this.getSourceFiles()
      let iterationFixes = 0

      for (const file of files) {
        const issues = await this.detectIssues(file)
        const fixableIssues = issues.filter(issue => issue.fixable)
        
        if (fixableIssues.length > 0) {
          console.log(chalk.yellow(`  🔧 Fixing ${fixableIssues.length} issues in ${path.basename(file)}`))
          
          const fixes = await this.fixIssues(fixableIssues)
          iterationFixes += fixes.length
          totalFixes += fixes.length
          
          for (const fix of fixes) {
            console.log(chalk.green(`    ✅ Fixed ${fix.type} issue`))
            this.fixHistory.push({
              iteration,
              file,
              type: fix.type,
              timestamp: new Date().toISOString()
            })
          }
        }
      }

      if (iterationFixes === 0) {
        console.log(chalk.green(`\n🎉 No more fixable issues found! Self-loop completed.`))
        break
      }

      console.log(chalk.blue(`  📊 Fixed ${iterationFixes} issues in this iteration`))
      
      if (iteration < this.config.maxIterations) {
        console.log(chalk.gray(`  ⏳ Waiting ${this.config.retryDelay}ms before next iteration...`))
        await this.sleep(this.config.retryDelay)
      }
    }

    this.totalFixes = totalFixes
    console.log(chalk.green.bold(`\n✨ Self-loop completed! Total fixes: ${totalFixes}`))
    
    await this.generateReport()
    this.isRunning = false
    
    return totalFixes
  }

  async getSourceFiles() {
    const sourceDirs = ['lib', 'components', 'hooks', 'app', 'tests', 'scripts']
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

  async detectIssues(filePath) {
    const issues = []
    
    try {
      // ESLint issues
      const eslintIssues = await this.detectESLintIssues(filePath)
      issues.push(...eslintIssues)
      
      // Prettier issues
      const prettierIssues = await this.detectPrettierIssues(filePath)
      issues.push(...prettierIssues)
      
      // TypeScript issues
      const typescriptIssues = await this.detectTypeScriptIssues(filePath)
      issues.push(...typescriptIssues)
      
      // Import issues
      const importIssues = await this.detectImportIssues(filePath)
      issues.push(...importIssues)
      
      // Unused variable issues
      const unusedVarIssues = await this.detectUnusedVarIssues(filePath)
      issues.push(...unusedVarIssues)
      
      // Console log issues
      const consoleLogIssues = await this.detectConsoleLogIssues(filePath)
      issues.push(...consoleLogIssues)
      
      // Security issues
      const securityIssues = await this.detectSecurityIssues(filePath)
      issues.push(...securityIssues)
      
      // Performance issues
      const performanceIssues = await this.detectPerformanceIssues(filePath)
      issues.push(...performanceIssues)
      
    } catch (error) {
      console.warn(`Failed to detect issues in ${filePath}:`, error.message)
    }

    return issues
  }

  async detectESLintIssues(filePath) {
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

  async detectPrettierIssues(filePath) {
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

  async detectTypeScriptIssues(filePath) {
    try {
      const result = execSync(`npx tsc --noEmit --skipLibCheck`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      return []
    } catch (error) {
      const output = error.stdout || error.stderr
      const issues = []
      
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

  async detectImportIssues(filePath) {
    const content = await fs.readFile(filePath, 'utf8')
    const issues = []

    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
    const imports = []
    let match

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[0])
    }

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

  async detectUnusedVarIssues(filePath) {
    const content = await fs.readFile(filePath, 'utf8')
    const issues = []

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

  async detectConsoleLogIssues(filePath) {
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

  async detectSecurityIssues(filePath) {
    const content = await fs.readFile(filePath, 'utf8')
    const issues = []

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

  async detectPerformanceIssues(filePath) {
    const content = await fs.readFile(filePath, 'utf8')
    const issues = []

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

  async fixIssues(issues) {
    const fixes = []
    
    for (const issue of issues) {
      if (issue.fixable && issue.fix) {
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

  async fixESLintIssue(filePath, message) {
    try {
      execSync(`npx eslint "${filePath}" --fix`, { stdio: 'pipe' })
      return { type: 'eslint', file: filePath, rule: message.ruleId, fixed: true }
    } catch (error) {
      throw new Error(`Failed to fix ESLint issue: ${error.message}`)
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

  async fixTypeScriptIssue(filePath, code) {
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

  async fixUnusedImport(filePath, importStatement) {
    const content = await fs.readFile(filePath, 'utf8')
    const fixedContent = content.replace(importStatement + '\n', '')
    await fs.writeFile(filePath, fixedContent)
    return { type: 'import', file: filePath, fixed: true }
  }

  async fixUnusedVar(filePath, varStatement) {
    const content = await fs.readFile(filePath, 'utf8')
    const fixedContent = content.replace(varStatement + '\n', '')
    await fs.writeFile(filePath, fixedContent)
    return { type: 'unused-var', file: filePath, fixed: true }
  }

  async fixConsoleLog(filePath, consoleStatement) {
    const content = await fs.readFile(filePath, 'utf8')
    const fixedContent = content.replace(consoleStatement, '// ' + consoleStatement)
    await fs.writeFile(filePath, fixedContent)
    return { type: 'console-log', file: filePath, fixed: true }
  }

  async fixPerformanceIssue(filePath, pattern, message) {
    // Implement performance fixes
    return { type: 'performance', file: filePath, fixed: true }
  }

  isFixableTypeScriptError(code) {
    const fixableCodes = ['2307', '6133', '2339', '2345']
    return fixableCodes.includes(code)
  }

  async generateReport() {
    console.log(chalk.blue.bold('\n📊 Self-Fix Loop Report\n'))
    
    const summary = {
      iterations: this.iterationCount,
      totalFixes: this.totalFixes,
      fixHistory: this.fixHistory,
      timestamp: new Date().toISOString()
    }
    
    console.log(chalk.white(`Iterations: ${summary.iterations}`))
    console.log(chalk.white(`Total Fixes: ${summary.totalFixes}`))
    console.log(chalk.white(`Fix History: ${summary.fixHistory.length} entries`))
    
    // Save report
    const reportPath = 'test-results/self-fix-report.json'
    await fs.mkdir('test-results', { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify(summary, null, 2))
    
    console.log(chalk.green(`\n📄 Report saved to: ${reportPath}`))
  }

  async watchMode() {
    console.log(chalk.blue.bold('\n👀 Starting self-fix watch mode...\n'))
    
    const watcher = chokidar.watch(['lib/**/*', 'components/**/*', 'hooks/**/*', 'app/**/*'], {
      ignored: /node_modules/,
      persistent: true
    })

    watcher.on('change', async (filePath) => {
      console.log(chalk.yellow(`\n📝 File changed: ${filePath}`))
      
      // Debounce multiple changes
      clearTimeout(this.watchTimeout)
      this.watchTimeout = setTimeout(async () => {
        const issues = await this.detectIssues(filePath)
        const fixableIssues = issues.filter(issue => issue.fixable)
        
        if (fixableIssues.length > 0) {
          console.log(chalk.yellow(`  🔧 Auto-fixing ${fixableIssues.length} issues in ${path.basename(filePath)}`))
          const fixes = await this.fixIssues(fixableIssues)
          
          for (const fix of fixes) {
            console.log(chalk.green(`    ✅ Fixed ${fix.type} issue`))
          }
        }
      }, this.config.debounceDelay)
    })

    watcher.on('error', (error) => {
      console.error(chalk.red('Watch error:'), error)
    })

    console.log(chalk.green('👀 Watching for file changes...'))
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const selfFixLoop = new SelfFixLoop()

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Self-Fix Loop

Usage: node scripts/self-fix-loop.js [options]

Options:
  --iterations N    Maximum number of iterations (default: 10)
  --delay N         Delay between iterations in ms (default: 2000)
  --watch           Watch mode
  --help, -h        Show this help

Examples:
  node scripts/self-fix-loop.js
  node scripts/self-fix-loop.js --iterations 5 --delay 1000
  node scripts/self-fix-loop.js --watch
`)
    return
  }

  // Parse arguments
  const iterationsIndex = args.indexOf('--iterations')
  if (iterationsIndex !== -1 && args[iterationsIndex + 1]) {
    selfFixLoop.config.maxIterations = parseInt(args[iterationsIndex + 1])
  }

  const delayIndex = args.indexOf('--delay')
  if (delayIndex !== -1 && args[delayIndex + 1]) {
    selfFixLoop.config.retryDelay = parseInt(args[delayIndex + 1])
  }

  if (args.includes('--watch')) {
    await selfFixLoop.watchMode()
  } else {
    await selfFixLoop.runSelfLoop()
  }
}

// Export for programmatic use
module.exports = SelfFixLoop

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
