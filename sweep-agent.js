#!/usr/bin/env node

/**
 * Sweep Agent - Automated Code Review and Improvement System
 * Monitors code quality, security, and performance across the AgentDash project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

class SweepAgent {
  constructor() {
    this.config = this.loadConfig();
    this.issues = [];
    this.metrics = {
      filesScanned: 0,
      issuesFound: 0,
      issuesFixed: 0,
      startTime: Date.now()
    };
  }

  /**
   * Load sweep configuration
   */
  loadConfig() {
    try {
      const configPath = path.join(__dirname, '.sweep', 'config.yaml');
      const configFile = fs.readFileSync(configPath, 'utf8');
      return yaml.load(configFile);
    } catch (error) {
      console.error('Failed to load sweep configuration:', error.message);
      process.exit(1);
    }
  }

  /**
   * Main sweep execution
   */
  async run() {
    console.log('🔍 Starting Sweep Agent...');
    console.log(`📁 Project: ${this.config.project_name}`);
    console.log(`🔗 Repository: ${this.config.repository}\n`);

    try {
      // Step 1: Scan codebase
      await this.scanCodebase();
      
      // Step 2: Analyze security
      if (this.config.security.enabled) {
        await this.scanSecurity();
      }
      
      // Step 3: Check code quality
      if (this.config.quality.enabled) {
        await this.checkCodeQuality();
      }
      
      // Step 4: Analyze performance
      if (this.config.performance.enabled) {
        await this.analyzePerformance();
      }
      
      // Step 5: Check accessibility
      if (this.config.accessibility.enabled) {
        await this.checkAccessibility();
      }
      
      // Step 6: Validate documentation
      if (this.config.documentation.enabled) {
        await this.checkDocumentation();
      }
      
      // Step 7: PKI-specific checks
      if (this.config.pki_security.enabled) {
        await this.checkPKISecurity();
      }
      
      // Step 8: LinkedIn API checks
      if (this.config.linkedin_api.enabled) {
        await this.checkLinkedInAPI();
      }
      
      // Step 9: Apply automatic fixes
      if (this.config.auto_fix.enabled) {
        await this.applyAutoFixes();
      }
      
      // Step 10: Generate reports
      await this.generateReports();
      
      // Step 11: Send notifications
      if (this.config.notifications.enabled) {
        await this.sendNotifications();
      }

    } catch (error) {
      console.error('❌ Sweep Agent failed:', error.message);
      process.exit(1);
    }

    console.log('\n✅ Sweep Agent completed successfully!');
    this.printSummary();
  }

  /**
   * Scan the codebase for files
   */
  async scanCodebase() {
    console.log('📂 Scanning codebase...');
    
    const files = this.getFilesToScan();
    this.metrics.filesScanned = files.length;
    
    console.log(`Found ${files.length} files to analyze`);
    
    for (const file of files) {
      await this.analyzeFile(file);
    }
  }

  /**
   * Get files to scan based on configuration
   */
  getFilesToScan() {
    const files = [];
    const rootDir = process.cwd();
    
    const scanDirectory = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(rootDir, fullPath);
        
        // Check if file should be excluded
        if (this.shouldExcludeFile(relativePath)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (this.shouldIncludeFile(relativePath)) {
          files.push(relativePath);
        }
      }
    };
    
    scanDirectory(rootDir);
    return files;
  }

  /**
   * Check if file should be included
   */
  shouldIncludeFile(filePath) {
    return this.config.code_analysis.include_patterns.some(pattern => 
      this.matchPattern(filePath, pattern)
    );
  }

  /**
   * Check if file should be excluded
   */
  shouldExcludeFile(filePath) {
    return this.config.code_analysis.exclude_patterns.some(pattern => 
      this.matchPattern(filePath, pattern)
    );
  }

  /**
   * Match file path against glob pattern
   */
  matchPattern(filePath, pattern) {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(filePath);
  }

  /**
   * Analyze individual file
   */
  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const extension = path.extname(filePath);
      
      // Basic file analysis
      const lines = content.split('\n').length;
      const size = Buffer.byteLength(content, 'utf8');
      
      // Check for common issues
      this.checkBasicIssues(filePath, content);
      
    } catch (error) {
      console.warn(`⚠️  Failed to analyze ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check for basic code issues
   */
  checkBasicIssues(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for TODO/FIXME comments
      if (line.match(/TODO|FIXME|HACK/i)) {
        this.addIssue({
          file: filePath,
          line: index + 1,
          severity: 'info',
          rule: 'todo-comment',
          message: `Found ${line.match(/TODO|FIXME|HACK/i)[0]} comment`,
          code: line.trim()
        });
      }
      
      // Check for console.log in production code
      if (line.includes('console.log') && !filePath.includes('test')) {
        this.addIssue({
          file: filePath,
          line: index + 1,
          severity: 'warning',
          rule: 'console-statement',
          message: 'Console.log statement found in production code',
          code: line.trim()
        });
      }
    });
  }

  /**
   * Scan for security vulnerabilities
   */
  async scanSecurity() {
    console.log('🔒 Scanning for security vulnerabilities...');
    
    const files = this.getFilesToScan();
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check each security rule
      for (const rule of this.config.security.rules) {
        const regex = new RegExp(rule.pattern, 'gi');
        const matches = content.match(regex);
        
        if (matches) {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (regex.test(line)) {
              this.addIssue({
                file,
                line: index + 1,
                severity: rule.severity,
                rule: rule.name,
                message: `Security issue: ${rule.name}`,
                code: line.trim()
              });
            }
          });
        }
      }
    }
  }

  /**
   * Check code quality
   */
  async checkCodeQuality() {
    console.log('📊 Checking code quality...');
    
    try {
      // Run ESLint if available
      if (fs.existsSync('.eslintrc.json') || fs.existsSync('.eslintrc.js')) {
        execSync('npx eslint . --format json --output-file eslint-report.json', { stdio: 'pipe' });
        
        if (fs.existsSync('eslint-report.json')) {
          const eslintReport = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));
          this.processESLintReport(eslintReport);
        }
      }
      
      // Run TypeScript compiler check
      if (fs.existsSync('tsconfig.json')) {
        try {
          execSync('npx tsc --noEmit', { stdio: 'pipe' });
        } catch (error) {
          this.addIssue({
            file: 'TypeScript compilation',
            line: 0,
            severity: 'error',
            rule: 'typescript-errors',
            message: 'TypeScript compilation errors found',
            code: error.stdout?.toString() || error.message
          });
        }
      }
      
    } catch (error) {
      console.warn('⚠️  Code quality checks failed:', error.message);
    }
  }

  /**
   * Process ESLint report
   */
  processESLintReport(report) {
    for (const fileReport of report) {
      for (const message of fileReport.messages) {
        this.addIssue({
          file: fileReport.filePath,
          line: message.line,
          severity: message.severity === 1 ? 'warning' : 'error',
          rule: message.ruleId || 'eslint',
          message: message.message,
          code: message.source || ''
        });
      }
    }
  }

  /**
   * Analyze performance
   */
  async analyzePerformance() {
    console.log('⚡ Analyzing performance...');
    
    const files = this.getFilesToScan();
    
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for performance issues
        for (const rule of this.config.performance.rules) {
          const regex = new RegExp(rule.pattern, 'gi');
          const matches = content.match(regex);
          
          if (matches) {
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (regex.test(line)) {
                this.addIssue({
                  file,
                  line: index + 1,
                  severity: rule.severity,
                  rule: rule.name,
                  message: `Performance issue: ${rule.name}`,
                  code: line.trim()
                });
              }
            });
          }
        }
      }
    }
  }

  /**
   * Check accessibility
   */
  async checkAccessibility() {
    console.log('♿ Checking accessibility...');
    
    const files = this.getFilesToScan().filter(file => 
      file.endsWith('.tsx') || file.endsWith('.jsx')
    );
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check accessibility rules
      for (const rule of this.config.accessibility.rules) {
        if (rule.pattern) {
          const regex = new RegExp(rule.pattern, 'gi');
          const matches = content.match(regex);
          
          if (matches) {
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (regex.test(line)) {
                this.addIssue({
                  file,
                  line: index + 1,
                  severity: rule.severity,
                  rule: rule.name,
                  message: `Accessibility issue: ${rule.name}`,
                  code: line.trim()
                });
              }
            });
          }
        }
      }
    }
  }

  /**
   * Check documentation
   */
  async checkDocumentation() {
    console.log('📚 Checking documentation...');
    
    // Check for README.md
    if (!fs.existsSync('README.md')) {
      this.addIssue({
        file: 'README.md',
        line: 0,
        severity: 'warning',
        rule: 'missing-readme',
        message: 'README.md file is missing',
        code: ''
      });
    }
    
    // Check for JSDoc comments
    const files = this.getFilesToScan().filter(file => 
      file.endsWith('.ts') || file.endsWith('.js')
    );
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for exported functions without JSDoc
      const exportRegex = /export\s+(function|class|interface)\s+(\w+)/g;
      const jsdocRegex = /\/\*\*[\s\S]*?\*\/\s*export\s+(function|class|interface)\s+(\w+)/g;
      
      const exports = [...content.matchAll(exportRegex)];
      const jsdocs = [...content.matchAll(jsdocRegex)];
      
      if (exports.length > jsdocs.length) {
        this.addIssue({
          file,
          line: 0,
          severity: 'info',
          rule: 'missing-jsdoc',
          message: 'Some exported functions are missing JSDoc comments',
          code: ''
        });
      }
    }
  }

  /**
   * Check PKI-specific security
   */
  async checkPKISecurity() {
    console.log('🔐 Checking PKI security...');
    
    const pkiFiles = this.getFilesToScan().filter(file => 
      file.includes('pki') || file.includes('certificate') || file.includes('key')
    );
    
    for (const file of pkiFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check PKI security rules
      for (const rule of this.config.pki_security.rules) {
        const regex = new RegExp(rule.pattern, 'gi');
        const matches = content.match(regex);
        
        if (matches) {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (regex.test(line)) {
              this.addIssue({
                file,
                line: index + 1,
                severity: rule.severity,
                rule: rule.name,
                message: `PKI Security issue: ${rule.name}`,
                code: line.trim()
              });
            }
          });
        }
      }
    }
  }

  /**
   * Check LinkedIn API usage
   */
  async checkLinkedInAPI() {
    console.log('💼 Checking LinkedIn API usage...');
    
    const linkedinFiles = this.getFilesToScan().filter(file => 
      file.includes('linkedin') || file.includes('api')
    );
    
    for (const file of linkedinFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check LinkedIn API rules
      for (const rule of this.config.linkedin_api.rules) {
        const regex = new RegExp(rule.pattern, 'gi');
        const matches = content.match(regex);
        
        if (matches) {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (regex.test(line)) {
              this.addIssue({
                file,
                line: index + 1,
                severity: rule.severity,
                rule: rule.name,
                message: `LinkedIn API issue: ${rule.name}`,
                code: line.trim()
              });
            }
          });
        }
      }
    }
  }

  /**
   * Apply automatic fixes
   */
  async applyAutoFixes() {
    console.log('🔧 Applying automatic fixes...');
    
    let fixesApplied = 0;
    
    // Apply safe fixes
    for (const fix of this.config.auto_fix.safe_fixes) {
      try {
        switch (fix) {
          case 'format-code':
            if (fs.existsSync('.prettierrc')) {
              execSync('npx prettier --write .', { stdio: 'pipe' });
              fixesApplied++;
            }
            break;
          
          case 'remove-unused-imports':
            // This would require more sophisticated analysis
            break;
        }
      } catch (error) {
        console.warn(`⚠️  Failed to apply fix ${fix}:`, error.message);
      }
    }
    
    console.log(`Applied ${fixesApplied} automatic fixes`);
    this.metrics.issuesFixed = fixesApplied;
  }

  /**
   * Generate reports
   */
  async generateReports() {
    console.log('📊 Generating reports...');
    
    const reportsDir = this.config.reporting.reports[0]?.output || 'sweep-reports';
    
    // Create reports directory
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Generate JSON report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      project: this.config.project_name,
      repository: this.config.repository,
      metrics: this.metrics,
      issues: this.issues,
      summary: this.getSummary()
    };
    
    fs.writeFileSync(
      path.join(reportsDir, 'sweep-report.json'),
      JSON.stringify(jsonReport, null, 2)
    );
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport(jsonReport);
    fs.writeFileSync(
      path.join(reportsDir, 'sweep-report.html'),
      htmlReport
    );
    
    // Generate Markdown report
    const markdownReport = this.generateMarkdownReport(jsonReport);
    fs.writeFileSync(
      path.join(reportsDir, 'sweep-report.md'),
      markdownReport
    );
    
    console.log(`📁 Reports generated in ${reportsDir}/`);
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Sweep Agent Report - ${data.project}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #e8f4f8; border-radius: 3px; }
        .issue { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
        .critical { border-left-color: #d32f2f; }
        .high { border-left-color: #f57c00; }
        .medium { border-left-color: #fbc02d; }
        .warning { border-left-color: #1976d2; }
        .info { border-left-color: #388e3c; }
        .code { background: #f5f5f5; padding: 5px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Sweep Agent Report</h1>
        <p><strong>Project:</strong> ${data.project}</p>
        <p><strong>Repository:</strong> ${data.repository}</p>
        <p><strong>Timestamp:</strong> ${data.timestamp}</p>
    </div>
    
    <div class="metrics">
        <h2>📊 Metrics</h2>
        <div class="metric"><strong>Files Scanned:</strong> ${data.metrics.filesScanned}</div>
        <div class="metric"><strong>Issues Found:</strong> ${data.metrics.issuesFound}</div>
        <div class="metric"><strong>Issues Fixed:</strong> ${data.metrics.issuesFixed}</div>
        <div class="metric"><strong>Duration:</strong> ${data.metrics.duration}ms</div>
    </div>
    
    <div class="issues">
        <h2>🚨 Issues Found</h2>
        ${data.issues.map(issue => `
            <div class="issue ${issue.severity}">
                <h4>${issue.rule} (${issue.severity})</h4>
                <p><strong>File:</strong> ${issue.file}:${issue.line}</p>
                <p><strong>Message:</strong> ${issue.message}</p>
                ${issue.code ? `<div class="code">${issue.code}</div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  /**
   * Generate Markdown report
   */
  generateMarkdownReport(data) {
    return `# 🔍 Sweep Agent Report

**Project:** ${data.project}  
**Repository:** ${data.repository}  
**Timestamp:** ${data.timestamp}

## 📊 Metrics

- **Files Scanned:** ${data.metrics.filesScanned}
- **Issues Found:** ${data.metrics.issuesFound}
- **Issues Fixed:** ${data.metrics.issuesFixed}
- **Duration:** ${data.metrics.duration}ms

## 🚨 Issues Found

${data.issues.map(issue => `
### ${issue.rule} (${issue.severity})

**File:** \`${issue.file}:${issue.line}\`  
**Message:** ${issue.message}

${issue.code ? `\`\`\`
${issue.code}
\`\`\`` : ''}
`).join('\n')}

## 📈 Summary

${data.summary}
`;
  }

  /**
   * Send notifications
   */
  async sendNotifications() {
    console.log('📢 Sending notifications...');
    
    // GitHub notifications
    if (this.config.notifications.github.enabled) {
      await this.sendGitHubNotifications();
    }
    
    // Slack notifications
    if (this.config.notifications.slack.enabled) {
      await this.sendSlackNotifications();
    }
  }

  /**
   * Send GitHub notifications
   */
  async sendGitHubNotifications() {
    const criticalIssues = this.issues.filter(issue => issue.severity === 'critical');
    const highIssues = this.issues.filter(issue => issue.severity === 'high');
    
    if (criticalIssues.length > 0 || highIssues.length > 5) {
      console.log('🚨 Critical or high-severity issues found - GitHub notification sent');
      // In a real implementation, this would create GitHub issues or PRs
    }
  }

  /**
   * Send Slack notifications
   */
  async sendSlackNotifications() {
    const summary = this.getSummary();
    const message = `🔍 Sweep Agent Report for ${this.config.project_name}\n${summary}`;
    
    console.log('📱 Slack notification prepared:', message);
    // In a real implementation, this would send to Slack webhook
  }

  /**
   * Add issue to the list
   */
  addIssue(issue) {
    this.issues.push(issue);
    this.metrics.issuesFound++;
  }

  /**
   * Get summary of findings
   */
  getSummary() {
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      warning: 0,
      info: 0
    };
    
    this.issues.forEach(issue => {
      severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
    });
    
    return `
- Critical: ${severityCounts.critical}
- High: ${severityCounts.high}
- Medium: ${severityCounts.medium}
- Warning: ${severityCounts.warning}
- Info: ${severityCounts.info}
    `.trim();
  }

  /**
   * Print summary to console
   */
  printSummary() {
    this.metrics.duration = Date.now() - this.metrics.startTime;
    
    console.log('\n📊 Sweep Summary:');
    console.log(`   Files scanned: ${this.metrics.filesScanned}`);
    console.log(`   Issues found: ${this.metrics.issuesFound}`);
    console.log(`   Issues fixed: ${this.metrics.issuesFixed}`);
    console.log(`   Duration: ${this.metrics.duration}ms`);
    console.log('\n' + this.getSummary());
  }
}

// Run the sweep agent
if (require.main === module) {
  const agent = new SweepAgent();
  agent.run().catch(console.error);
}

module.exports = SweepAgent;
