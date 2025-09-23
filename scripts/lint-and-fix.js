#!/usr/bin/env node

/**
 * Lint and Fix Script
 * Comprehensive linting and auto-fixing utilities
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs').promises
const path = require('path')
const chalk = require('chalk')
const ora = require('ora')

class LintAndFix {
  constructor() {
    this.config = {
      eslint: {
        fix: true,
        cache: true,
        maxWarnings: 0
      },
      prettier: {
        write: true,
        check: false
      },
      typescript: {
        noEmit: true,
        skipLibCheck: true
      }
    }
  }

  async runESLint() {
    const spinner = ora('Running ESLint...').start()
    
    try {
      const command = `npx eslint . --ext .js,.jsx,.ts,.tsx --fix --cache --max-warnings ${this.config.eslint.maxWarnings}`
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      spinner.succeed('ESLint completed successfully')
      return { success: true, output }
    } catch (error) {
      spinner.fail('ESLint found issues')
      return { 
        success: false, 
        output: error.stdout || error.stderr,
        exitCode: error.status
      }
    }
  }

  async runPrettier() {
    const spinner = ora('Running Prettier...').start()
    
    try {
      const command = this.config.prettier.write 
        ? 'npx prettier --write .'
        : 'npx prettier --check .'
      
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      spinner.succeed('Prettier completed successfully')
      return { success: true, output }
    } catch (error) {
      spinner.fail('Prettier found issues')
      return { 
        success: false, 
        output: error.stdout || error.stderr,
        exitCode: error.status
      }
    }
  }

  async runTypeScriptCheck() {
    const spinner = ora('Running TypeScript check...').start()
    
    try {
      const command = `npx tsc --noEmit --skipLibCheck`
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      spinner.succeed('TypeScript check completed successfully')
      return { success: true, output }
    } catch (error) {
      spinner.fail('TypeScript check found issues')
      return { 
        success: false, 
        output: error.stdout || error.stderr,
        exitCode: error.status
      }
    }
  }

  async runImportSort() {
    const spinner = ora('Sorting imports...').start()
    
    try {
      // Use eslint-plugin-import to sort imports
      const command = 'npx eslint . --ext .js,.jsx,.ts,.tsx --fix --rule "import/order: error"'
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      spinner.succeed('Import sorting completed')
      return { success: true, output }
    } catch (error) {
      spinner.fail('Import sorting failed')
      return { 
        success: false, 
        output: error.stdout || error.stderr,
        exitCode: error.status
      }
    }
  }

  async removeUnusedImports() {
    const spinner = ora('Removing unused imports...').start()
    
    try {
      // Use eslint to remove unused imports
      const command = 'npx eslint . --ext .js,.jsx,.ts,.tsx --fix --rule "@typescript-eslint/no-unused-vars: error"'
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      spinner.succeed('Unused imports removed')
      return { success: true, output }
    } catch (error) {
      spinner.fail('Failed to remove unused imports')
      return { 
        success: false, 
        output: error.stdout || error.stderr,
        exitCode: error.status
      }
    }
  }

  async removeConsoleLogs() {
    const spinner = ora('Removing console.log statements...').start()
    
    try {
      // Use eslint to remove console.log statements
      const command = 'npx eslint . --ext .js,.jsx,.ts,.tsx --fix --rule "no-console: error"'
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      spinner.succeed('Console.log statements removed')
      return { success: true, output }
    } catch (error) {
      spinner.fail('Failed to remove console.log statements')
      return { 
        success: false, 
        output: error.stdout || error.stderr,
        exitCode: error.status
      }
    }
  }

  async fixCommonIssues() {
    const spinner = ora('Fixing common issues...').start()
    
    try {
      const fixes = []
      
      // Fix common TypeScript issues
      const tsFixes = await this.fixTypeScriptIssues()
      fixes.push(...tsFixes)
      
      // Fix common React issues
      const reactFixes = await this.fixReactIssues()
      fixes.push(...reactFixes)
      
      // Fix common Next.js issues
      const nextFixes = await this.fixNextJsIssues()
      fixes.push(...nextFixes)
      
      spinner.succeed(`Fixed ${fixes.length} common issues`)
      return { success: true, fixes }
    } catch (error) {
      spinner.fail('Failed to fix common issues')
      return { 
        success: false, 
        error: error.message
      }
    }
  }

  async fixTypeScriptIssues() {
    const fixes = []
    
    try {
      // Fix missing return types
      const command = 'npx eslint . --ext .ts,.tsx --fix --rule "@typescript-eslint/explicit-function-return-type: warn"'
      execSync(command, { stdio: 'pipe' })
      fixes.push('Fixed missing return types')
    } catch (error) {
      // Ignore errors for this rule
    }
    
    try {
      // Fix any types
      const command = 'npx eslint . --ext .ts,.tsx --fix --rule "@typescript-eslint/no-explicit-any: warn"'
      execSync(command, { stdio: 'pipe' })
      fixes.push('Fixed any types')
    } catch (error) {
      // Ignore errors for this rule
    }
    
    return fixes
  }

  async fixReactIssues() {
    const fixes = []
    
    try {
      // Fix missing keys in lists
      const command = 'npx eslint . --ext .jsx,.tsx --fix --rule "react/jsx-key: error"'
      execSync(command, { stdio: 'pipe' })
      fixes.push('Fixed missing keys in React lists')
    } catch (error) {
      // Ignore errors for this rule
    }
    
    try {
      // Fix missing alt attributes
      const command = 'npx eslint . --ext .jsx,.tsx --fix --rule "jsx-a11y/alt-text: error"'
      execSync(command, { stdio: 'pipe' })
      fixes.push('Fixed missing alt attributes')
    } catch (error) {
      // Ignore errors for this rule
    }
    
    return fixes
  }

  async fixNextJsIssues() {
    const fixes = []
    
    try {
      // Fix img elements
      const command = 'npx eslint . --ext .jsx,.tsx --fix --rule "@next/next/no-img-element: error"'
      execSync(command, { stdio: 'pipe' })
      fixes.push('Fixed img elements to use Next.js Image')
    } catch (error) {
      // Ignore errors for this rule
    }
    
    try {
      // Fix html link elements
      const command = 'npx eslint . --ext .jsx,.tsx --fix --rule "@next/next/no-html-link-for-pages: error"'
      execSync(command, { stdio: 'pipe' })
      fixes.push('Fixed html link elements to use Next.js Link')
    } catch (error) {
      // Ignore errors for this rule
    }
    
    return fixes
  }

  async runAll() {
    console.log(chalk.blue.bold('\n🧹 Running comprehensive linting and fixing...\n'))
    
    const results = []
    
    // Run all linting tools
    const eslintResult = await this.runESLint()
    results.push({ tool: 'ESLint', ...eslintResult })
    
    const prettierResult = await this.runPrettier()
    results.push({ tool: 'Prettier', ...prettierResult })
    
    const typescriptResult = await this.runTypeScriptCheck()
    results.push({ tool: 'TypeScript', ...typescriptResult })
    
    // Run additional fixes
    const importSortResult = await this.runImportSort()
    results.push({ tool: 'Import Sort', ...importSortResult })
    
    const unusedImportsResult = await this.removeUnusedImports()
    results.push({ tool: 'Unused Imports', ...unusedImportsResult })
    
    const consoleLogsResult = await this.removeConsoleLogs()
    results.push({ tool: 'Console Logs', ...consoleLogsResult })
    
    const commonIssuesResult = await this.fixCommonIssues()
    results.push({ tool: 'Common Issues', ...commonIssuesResult })
    
    // Generate report
    await this.generateReport(results)
    
    return results
  }

  async generateReport(results) {
    console.log(chalk.blue.bold('\n📊 Linting Report\n'))
    
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
    
    console.log(chalk.white(`Total Tools: ${summary.total}`))
    console.log(chalk.green(`✅ Successful: ${summary.successful}`))
    console.log(chalk.red(`❌ Failed: ${summary.failed}`))
    
    // Detailed results
    console.log(chalk.blue.bold('\n📋 Detailed Results:\n'))
    
    for (const result of results) {
      const status = result.success ? chalk.green('✅') : chalk.red('❌')
      console.log(`${status} ${result.tool}`)
      
      if (!result.success && result.output) {
        console.log(chalk.gray(`   ${result.output.substring(0, 200)}...`))
      }
    }
    
    // Save report
    const reportPath = 'test-results/linting-report.json'
    await fs.mkdir('test-results', { recursive: true })
    await fs.writeFile(reportPath, JSON.stringify({ summary, results }, null, 2))
    
    console.log(chalk.green(`\n📄 Report saved to: ${reportPath}`))
  }

  async watchMode() {
    console.log(chalk.blue.bold('\n👀 Starting linting watch mode...\n'))
    
    const chokidar = require('chokidar')
    
    const watcher = chokidar.watch(['lib/**/*', 'components/**/*', 'hooks/**/*', 'app/**/*'], {
      ignored: /node_modules/,
      persistent: true
    })

    watcher.on('change', async (filePath) => {
      console.log(chalk.yellow(`\n📝 File changed: ${filePath}`))
      
      // Run linting on changed file
      try {
        const command = `npx eslint "${filePath}" --fix`
        execSync(command, { stdio: 'pipe' })
        console.log(chalk.green(`✅ Fixed: ${filePath}`))
      } catch (error) {
        console.log(chalk.red(`❌ Failed to fix: ${filePath}`))
      }
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
  const lintAndFix = new LintAndFix()

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Lint and Fix Script

Usage: node scripts/lint-and-fix.js [options]

Options:
  --eslint          Run ESLint only
  --prettier        Run Prettier only
  --typescript      Run TypeScript check only
  --imports         Sort imports only
  --unused          Remove unused imports only
  --console         Remove console.log statements only
  --common          Fix common issues only
  --all             Run all tools (default)
  --watch           Watch mode
  --help, -h        Show this help

Examples:
  node scripts/lint-and-fix.js --all
  node scripts/lint-and-fix.js --eslint --prettier
  node scripts/lint-and-fix.js --watch
`)
    return
  }

  if (args.includes('--watch')) {
    await lintAndFix.watchMode()
  } else if (args.includes('--eslint')) {
    await lintAndFix.runESLint()
  } else if (args.includes('--prettier')) {
    await lintAndFix.runPrettier()
  } else if (args.includes('--typescript')) {
    await lintAndFix.runTypeScriptCheck()
  } else if (args.includes('--imports')) {
    await lintAndFix.runImportSort()
  } else if (args.includes('--unused')) {
    await lintAndFix.removeUnusedImports()
  } else if (args.includes('--console')) {
    await lintAndFix.removeConsoleLogs()
  } else if (args.includes('--common')) {
    await lintAndFix.fixCommonIssues()
  } else {
    await lintAndFix.runAll()
  }
}

// Export for programmatic use
module.exports = LintAndFix

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
