#!/usr/bin/env node

/**
 * 🛡️ SECURITY AUDIT SCRIPT
 * Comprehensive system integrity check
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { execSync } = require('child_process');

class SecurityAuditor {
  constructor() {
    this.suspiciousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /document\.write/gi,
      /innerHTML\s*=/gi,
      /outerHTML\s*=/gi,
      /\.src\s*=/gi,
      /\.href\s*=/gi,
      /window\.location/gi,
      /XMLHttpRequest/gi,
      /fetch\s*\(/gi,
      /require\s*\(/gi,
      /import\s*\(/gi,
      /process\.env/gi,
      /fs\./gi,
      /child_process/gi,
      /exec\s*\(/gi,
      /spawn\s*\(/gi
    ];

    this.suspiciousFiles = [];
    this.modifiedFiles = [];
    this.checksumMismatches = [];
  }

  // Check for suspicious code patterns
  scanForSuspiciousCode(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];

      this.suspiciousPatterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            pattern: pattern.toString(),
            matches: matches.length,
            lines: this.getLineNumbers(content, pattern)
          });
        }
      });

      if (issues.length > 0) {
        this.suspiciousFiles.push({
          file: filePath,
          issues: issues
        });
      }
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error.message);
    }
  }

  // Get line numbers where pattern matches
  getLineNumbers(content, pattern) {
    const lines = content.split('\n');
    const lineNumbers = [];
    
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        lineNumbers.push(index + 1);
      }
    });
    
    return lineNumbers;
  }

  // Check file modification times
  checkRecentModifications() {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    this.walkDirectory('.', (filePath) => {
      try {
        const stats = fs.statSync(filePath);
        if (stats.mtime > cutoffTime) {
          this.modifiedFiles.push({
            file: filePath,
            modified: stats.mtime,
            size: stats.size
          });
        }
      } catch (error) {
        // Skip files we can't access
      }
    });
  }

  // Generate file checksums
  generateChecksum(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  }

  // Check for unauthorized environment variables
  checkEnvironmentVariables() {
    const suspiciousEnvVars = [
      'NODE_ENV',
      'API_KEY',
      'SECRET',
      'TOKEN',
      'PASSWORD',
      'DATABASE_URL',
      'REDIS_URL',
      'MONGODB_URI'
    ];

    const envIssues = [];
    
    suspiciousEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        envIssues.push({
          variable: envVar,
          value: process.env[envVar].substring(0, 10) + '...' // Partial value for security
        });
      }
    });

    return envIssues;
  }

  // Check package.json for suspicious dependencies
  checkDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const suspiciousDeps = [];
      
      // Check for known malicious packages
      const maliciousPackages = [
        'event-stream',
        'flatmap-stream',
        'eslint-scope',
        'getcookies',
        'crossenv'
      ];

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      Object.keys(allDeps).forEach(dep => {
        if (maliciousPackages.includes(dep)) {
          suspiciousDeps.push({
            package: dep,
            version: allDeps[dep],
            risk: 'HIGH'
          });
        }
      });

      return suspiciousDeps;
    } catch (error) {
      return [{ error: 'Could not read package.json' }];
    }
  }

  // Walk directory recursively
  walkDirectory(dir, callback) {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          this.walkDirectory(filePath, callback);
        } else if (stat.isFile() && this.isCodeFile(file)) {
          callback(filePath);
        }
      });
    } catch (error) {
      // Skip directories we can't access
    }
  }

  // Check if file is a code file
  isCodeFile(filename) {
    const codeExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.html', '.css'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  // Run comprehensive security audit
  async runAudit() {
    console.log('🛡️ Starting Security Audit...\n');

    // 1. Scan for suspicious code
    console.log('📋 Scanning for suspicious code patterns...');
    this.walkDirectory('.', (filePath) => {
      this.scanForSuspiciousCode(filePath);
    });

    // 2. Check recent modifications
    console.log('📅 Checking recent file modifications...');
    this.checkRecentModifications();

    // 3. Check environment variables
    console.log('🔐 Checking environment variables...');
    const envIssues = this.checkEnvironmentVariables();

    // 4. Check dependencies
    console.log('📦 Checking dependencies...');
    const depIssues = this.checkDependencies();

    // 5. Generate report
    this.generateReport(envIssues, depIssues);
  }

  // Generate security report
  generateReport(envIssues, depIssues) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        suspiciousFiles: this.suspiciousFiles.length,
        modifiedFiles: this.modifiedFiles.length,
        environmentIssues: envIssues.length,
        dependencyIssues: depIssues.length
      },
      details: {
        suspiciousFiles: this.suspiciousFiles,
        modifiedFiles: this.modifiedFiles,
        environmentIssues: envIssues,
        dependencyIssues: depIssues
      }
    };

    // Save report
    fs.writeFileSync('security-audit-report.json', JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n🚨 SECURITY AUDIT SUMMARY');
    console.log('========================');
    console.log(`Suspicious files found: ${this.suspiciousFiles.length}`);
    console.log(`Recently modified files: ${this.modifiedFiles.length}`);
    console.log(`Environment issues: ${envIssues.length}`);
    console.log(`Dependency issues: ${depIssues.length}`);

    if (this.suspiciousFiles.length > 0) {
      console.log('\n⚠️ SUSPICIOUS FILES:');
      this.suspiciousFiles.forEach(file => {
        console.log(`  - ${file.file}`);
        file.issues.forEach(issue => {
          console.log(`    Pattern: ${issue.pattern}`);
          console.log(`    Matches: ${issue.matches}`);
        });
      });
    }

    if (depIssues.length > 0) {
      console.log('\n⚠️ DEPENDENCY ISSUES:');
      depIssues.forEach(dep => {
        console.log(`  - ${dep.package}: ${dep.version} (${dep.risk})`);
      });
    }

    console.log('\n📄 Full report saved to: security-audit-report.json');
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = SecurityAuditor;
