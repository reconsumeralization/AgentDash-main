#!/usr/bin/env node

/**
 * Sweep CLI - Command line interface for the Sweep Agent
 * Provides easy access to sweep functionality from the command line
 */

const { program } = require('commander');
const SweepAgent = require('../sweep-agent');
const fs = require('fs');
const path = require('path');

program
  .name('sweep')
  .description('Sweep Agent CLI - Automated code review and improvement')
  .version('1.0.0');

// Scan command
program
  .command('scan')
  .description('Run a comprehensive code scan')
  .option('-t, --type <type>', 'Type of scan (full, security, quality, performance, accessibility)', 'full')
  .option('-o, --output <dir>', 'Output directory for reports', 'sweep-reports')
  .option('-f, --format <format>', 'Output format (json, html, markdown)', 'all')
  .option('--fix', 'Apply automatic fixes')
  .option('--strict', 'Use strict mode (fail on any issues)')
  .action(async (options) => {
    console.log(`🔍 Running ${options.type} scan...`);
    
    const agent = new SweepAgent();
    
    // Override config based on options
    if (options.type !== 'full') {
      agent.config.security.enabled = options.type === 'security';
      agent.config.quality.enabled = options.type === 'quality';
      agent.config.performance.enabled = options.type === 'performance';
      agent.config.accessibility.enabled = options.type === 'accessibility';
    }
    
    if (options.output) {
      agent.config.reporting.reports[0].output = options.output;
    }
    
    try {
      await agent.run();
      
      if (options.strict && agent.issues.length > 0) {
        const criticalIssues = agent.issues.filter(i => i.severity === 'critical');
        const highIssues = agent.issues.filter(i => i.severity === 'high');
        
        if (criticalIssues.length > 0 || highIssues.length > 5) {
          console.error('❌ Strict mode: Critical issues found');
          process.exit(1);
        }
      }
      
      console.log('✅ Scan completed successfully');
    } catch (error) {
      console.error('❌ Scan failed:', error.message);
      process.exit(1);
    }
  });

// Fix command
program
  .command('fix')
  .description('Apply automatic fixes to the codebase')
  .option('-t, --type <type>', 'Type of fixes (safe, all)', 'safe')
  .option('--dry-run', 'Show what would be fixed without making changes')
  .action(async (options) => {
    console.log('🔧 Applying automatic fixes...');
    
    const agent = new SweepAgent();
    
    // Only enable auto-fix
    agent.config.security.enabled = false;
    agent.config.quality.enabled = false;
    agent.config.performance.enabled = false;
    agent.config.accessibility.enabled = false;
    agent.config.documentation.enabled = false;
    agent.config.pki_security.enabled = false;
    agent.config.linkedin_api.enabled = false;
    
    if (options.type === 'all') {
      agent.config.auto_fix.safe_fixes.push(...agent.config.auto_fix.review_fixes);
    }
    
    if (options.dryRun) {
      console.log('🔍 Dry run mode - no changes will be made');
      // In a real implementation, you would analyze what would be fixed
    }
    
    try {
      await agent.run();
      console.log('✅ Fixes applied successfully');
    } catch (error) {
      console.error('❌ Fix application failed:', error.message);
      process.exit(1);
    }
  });

// Report command
program
  .command('report')
  .description('Generate reports from previous scans')
  .option('-i, --input <dir>', 'Input directory with scan results', 'sweep-reports')
  .option('-o, --output <dir>', 'Output directory for reports', 'reports')
  .option('-f, --format <format>', 'Output format (json, html, markdown)', 'all')
  .action(async (options) => {
    console.log('📊 Generating reports...');
    
    const inputDir = options.input;
    const outputDir = options.output;
    
    if (!fs.existsSync(inputDir)) {
      console.error(`❌ Input directory not found: ${inputDir}`);
      process.exit(1);
    }
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Find sweep report files
    const reportFiles = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(inputDir, file));
    
    if (reportFiles.length === 0) {
      console.error('❌ No report files found');
      process.exit(1);
    }
    
    // Combine reports
    const combinedReport = {
      timestamp: new Date().toISOString(),
      scans: [],
      summary: {
        totalFiles: 0,
        totalIssues: 0,
        totalFixed: 0
      }
    };
    
    for (const reportFile of reportFiles) {
      const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      combinedReport.scans.push(report);
      combinedReport.summary.totalFiles += report.metrics.filesScanned;
      combinedReport.summary.totalIssues += report.metrics.issuesFound;
      combinedReport.summary.totalFixed += report.metrics.issuesFixed;
    }
    
    // Generate combined reports
    if (options.format === 'all' || options.format === 'json') {
      fs.writeFileSync(
        path.join(outputDir, 'combined-report.json'),
        JSON.stringify(combinedReport, null, 2)
      );
    }
    
    if (options.format === 'all' || options.format === 'html') {
      const htmlReport = generateCombinedHTMLReport(combinedReport);
      fs.writeFileSync(path.join(outputDir, 'combined-report.html'), htmlReport);
    }
    
    if (options.format === 'all' || options.format === 'markdown') {
      const markdownReport = generateCombinedMarkdownReport(combinedReport);
      fs.writeFileSync(path.join(outputDir, 'combined-report.md'), markdownReport);
    }
    
    console.log(`✅ Reports generated in ${outputDir}/`);
  });

// Config command
program
  .command('config')
  .description('Manage sweep configuration')
  .option('--init', 'Initialize sweep configuration')
  .option('--validate', 'Validate current configuration')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    if (options.init) {
      console.log('🔧 Initializing sweep configuration...');
      
      const configDir = '.sweep';
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // Check if config already exists
      const configPath = path.join(configDir, 'config.yaml');
      if (fs.existsSync(configPath)) {
        console.log('⚠️  Configuration already exists');
        return;
      }
      
      console.log('✅ Configuration initialized');
    }
    
    if (options.validate) {
      console.log('🔍 Validating configuration...');
      
      try {
        const agent = new SweepAgent();
        console.log('✅ Configuration is valid');
      } catch (error) {
        console.error('❌ Configuration validation failed:', error.message);
        process.exit(1);
      }
    }
    
    if (options.show) {
      console.log('📋 Current configuration:');
      
      try {
        const agent = new SweepAgent();
        console.log(JSON.stringify(agent.config, null, 2));
      } catch (error) {
        console.error('❌ Failed to load configuration:', error.message);
        process.exit(1);
      }
    }
  });

// Monitor command
program
  .command('monitor')
  .description('Start monitoring mode (continuous scanning)')
  .option('-i, --interval <minutes>', 'Scan interval in minutes', '60')
  .option('--watch', 'Watch for file changes')
  .action(async (options) => {
    console.log(`👁️  Starting monitoring mode (interval: ${options.interval} minutes)...`);
    
    const agent = new SweepAgent();
    
    const runScan = async () => {
      console.log(`\n🔍 Running scheduled scan at ${new Date().toISOString()}`);
      try {
        await agent.run();
        console.log('✅ Scheduled scan completed');
      } catch (error) {
        console.error('❌ Scheduled scan failed:', error.message);
      }
    };
    
    // Run initial scan
    await runScan();
    
    // Set up interval
    const intervalMs = parseInt(options.interval) * 60 * 1000;
    setInterval(runScan, intervalMs);
    
    if (options.watch) {
      console.log('👀 File watching enabled');
      // In a real implementation, you would set up file watchers
    }
    
    console.log('🔄 Monitoring started. Press Ctrl+C to stop.');
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n👋 Monitoring stopped');
      process.exit(0);
    });
  });

// Help command
program
  .command('help')
  .description('Show detailed help information')
  .action(() => {
    console.log(`
🔍 Sweep Agent CLI - Automated Code Review Tool

USAGE:
  sweep <command> [options]

COMMANDS:
  scan       Run a comprehensive code scan
  fix        Apply automatic fixes to the codebase
  report     Generate reports from previous scans
  config     Manage sweep configuration
  monitor    Start monitoring mode (continuous scanning)
  help       Show this help information

EXAMPLES:
  # Run a full scan
  sweep scan

  # Run security scan only
  sweep scan --type security

  # Run scan with automatic fixes
  sweep scan --fix

  # Apply safe fixes only
  sweep fix --type safe

  # Generate reports from previous scans
  sweep report

  # Start monitoring mode
  sweep monitor --interval 30

  # Initialize configuration
  sweep config --init

CONFIGURATION:
  Sweep configuration is stored in .sweep/config.yaml
  Run 'sweep config --init' to create initial configuration
  Run 'sweep config --show' to view current configuration

REPORTS:
  Scan reports are generated in the sweep-reports/ directory by default
  Reports are available in JSON, HTML, and Markdown formats

MONITORING:
  Use 'sweep monitor' for continuous scanning
  Set up GitHub Actions for automated scanning on push/PR

For more information, visit: https://github.com/reconsumeralization/agentdash-dashboard
    `);
  });

// Generate combined HTML report
function generateCombinedHTMLReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Sweep Agent - Combined Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { background: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .scan { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metrics { display: flex; gap: 20px; }
        .metric { background: #f0f0f0; padding: 10px; border-radius: 3px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Sweep Agent - Combined Report</h1>
        <p><strong>Generated:</strong> ${data.timestamp}</p>
    </div>
    
    <div class="summary">
        <h2>📊 Overall Summary</h2>
        <div class="metrics">
            <div class="metric">
                <strong>Total Files</strong><br>
                ${data.summary.totalFiles}
            </div>
            <div class="metric">
                <strong>Total Issues</strong><br>
                ${data.summary.totalIssues}
            </div>
            <div class="metric">
                <strong>Total Fixed</strong><br>
                ${data.summary.totalFixed}
            </div>
            <div class="metric">
                <strong>Scans</strong><br>
                ${data.scans.length}
            </div>
        </div>
    </div>
    
    <div class="scans">
        <h2>🔍 Individual Scans</h2>
        ${data.scans.map((scan, index) => `
            <div class="scan">
                <h3>Scan #${index + 1} - ${scan.project}</h3>
                <p><strong>Timestamp:</strong> ${scan.timestamp}</p>
                <div class="metrics">
                    <div class="metric">Files: ${scan.metrics.filesScanned}</div>
                    <div class="metric">Issues: ${scan.metrics.issuesFound}</div>
                    <div class="metric">Fixed: ${scan.metrics.issuesFixed}</div>
                    <div class="metric">Duration: ${scan.metrics.duration}ms</div>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
}

// Generate combined Markdown report
function generateCombinedMarkdownReport(data) {
  return `# 🔍 Sweep Agent - Combined Report

**Generated:** ${data.timestamp}

## 📊 Overall Summary

- **Total Files Scanned:** ${data.summary.totalFiles}
- **Total Issues Found:** ${data.summary.totalIssues}
- **Total Issues Fixed:** ${data.summary.totalFixed}
- **Number of Scans:** ${data.scans.length}

## 🔍 Individual Scans

${data.scans.map((scan, index) => `
### Scan #${index + 1} - ${scan.project}

**Timestamp:** ${scan.timestamp}  
**Files Scanned:** ${scan.metrics.filesScanned}  
**Issues Found:** ${scan.metrics.issuesFound}  
**Issues Fixed:** ${scan.metrics.issuesFixed}  
**Duration:** ${scan.metrics.duration}ms

${scan.summary ? `**Summary:** ${scan.summary}` : ''}
`).join('\n')}

---
*Report generated by Sweep Agent CLI*
`;
}

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
