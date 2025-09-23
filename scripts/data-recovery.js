#!/usr/bin/env node

/**
 * 🔄 DATA RECOVERY SCRIPT
 * Restore clean data from verified sources
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DataRecovery {
  constructor() {
    this.cleanSources = {
      git: {
        enabled: true,
        lastCleanCommit: null,
        backupBranch: 'clean-backup'
      },
      backups: {
        enabled: false,
        locations: []
      }
    };
    
    this.recoveryLog = [];
  }

  // Log recovery actions
  log(action, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      details
    };
    this.recoveryLog.push(entry);
    console.log(`[${entry.timestamp}] ${action}: ${details}`);
  }

  // Check git status and find last clean commit
  async checkGitStatus() {
    try {
      this.log('GIT_CHECK', 'Checking git repository status');
      
      // Get current branch
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      this.log('GIT_BRANCH', `Current branch: ${currentBranch}`);

      // Get recent commits
      const commits = execSync('git log --oneline -10', { encoding: 'utf8' });
      this.log('GIT_COMMITS', `Recent commits:\n${commits}`);

      // Check for uncommitted changes
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        this.log('GIT_WARNING', 'Uncommitted changes detected');
        console.log('Uncommitted files:', status);
      }

      return {
        currentBranch,
        hasUncommittedChanges: !!status.trim(),
        recentCommits: commits.split('\n').filter(line => line.trim())
      };
    } catch (error) {
      this.log('GIT_ERROR', `Git check failed: ${error.message}`);
      return null;
    }
  }

  // Create clean backup branch
  async createCleanBackup() {
    try {
      this.log('BACKUP_CREATE', 'Creating clean backup branch');
      
      // Check if backup branch exists
      try {
        execSync(`git show-ref --verify --quiet refs/heads/${this.cleanSources.git.backupBranch}`);
        this.log('BACKUP_EXISTS', 'Clean backup branch already exists');
      } catch {
        // Create new backup branch from current HEAD
        execSync(`git checkout -b ${this.cleanSources.git.backupBranch}`);
        this.log('BACKUP_CREATED', `Created backup branch: ${this.cleanSources.git.backupBranch}`);
      }

      return true;
    } catch (error) {
      this.log('BACKUP_ERROR', `Failed to create backup: ${error.message}`);
      return false;
    }
  }

  // Identify clean commit point
  async findCleanCommit() {
    try {
      this.log('CLEAN_COMMIT', 'Searching for last known clean commit');
      
      // Look for commits with security-related messages
      const securityCommits = execSync('git log --grep="security" --grep="fix" --grep="clean" --oneline -20', { encoding: 'utf8' });
      
      if (securityCommits.trim()) {
        const commits = securityCommits.split('\n').filter(line => line.trim());
        this.log('CLEAN_COMMITS_FOUND', `Found ${commits.length} potential clean commits`);
        
        // Use the most recent one
        const lastCleanCommit = commits[0].split(' ')[0];
        this.cleanSources.git.lastCleanCommit = lastCleanCommit;
        this.log('CLEAN_COMMIT_SET', `Set clean commit to: ${lastCleanCommit}`);
        
        return lastCleanCommit;
      } else {
        this.log('CLEAN_COMMIT_WARNING', 'No obvious clean commits found');
        return null;
      }
    } catch (error) {
      this.log('CLEAN_COMMIT_ERROR', `Failed to find clean commit: ${error.message}`);
      return null;
    }
  }

  // Restore from clean commit
  async restoreFromCleanCommit(commitHash) {
    try {
      this.log('RESTORE_START', `Starting restore from commit: ${commitHash}`);
      
      // Create recovery branch
      const recoveryBranch = `recovery-${Date.now()}`;
      execSync(`git checkout -b ${recoveryBranch}`);
      this.log('RECOVERY_BRANCH', `Created recovery branch: ${recoveryBranch}`);

      // Reset to clean commit
      execSync(`git reset --hard ${commitHash}`);
      this.log('RESET_COMPLETE', `Reset to clean commit: ${commitHash}`);

      // Verify the restore
      const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      this.log('VERIFY_RESTORE', `Current commit after restore: ${currentCommit}`);

      return {
        success: true,
        recoveryBranch,
        restoredCommit: currentCommit
      };
    } catch (error) {
      this.log('RESTORE_ERROR', `Restore failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify file integrity
  async verifyFileIntegrity() {
    try {
      this.log('INTEGRITY_CHECK', 'Verifying file integrity');
      
      const criticalFiles = [
        'package.json',
        'package-lock.json',
        '.env',
        '.env.local',
        'next.config.js',
        'next.config.mjs'
      ];

      const integrityReport = {
        timestamp: new Date().toISOString(),
        files: {}
      };

      criticalFiles.forEach(file => {
        try {
          if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            const content = fs.readFileSync(file, 'utf8');
            
            integrityReport.files[file] = {
              exists: true,
              size: stats.size,
              modified: stats.mtime,
              hasContent: content.length > 0,
              suspiciousPatterns: this.checkForSuspiciousPatterns(content)
            };
          } else {
            integrityReport.files[file] = {
              exists: false
            };
          }
        } catch (error) {
          integrityReport.files[file] = {
            error: error.message
          };
        }
      });

      // Save integrity report
      fs.writeFileSync('integrity-report.json', JSON.stringify(integrityReport, null, 2));
      this.log('INTEGRITY_REPORT', 'File integrity report saved');

      return integrityReport;
    } catch (error) {
      this.log('INTEGRITY_ERROR', `Integrity check failed: ${error.message}`);
      return null;
    }
  }

  // Check for suspicious patterns in file content
  checkForSuspiciousPatterns(content) {
    const suspiciousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /document\.write/gi,
      /innerHTML\s*=/gi,
      /process\.env/gi,
      /require\s*\(/gi,
      /import\s*\(/gi
    ];

    const found = [];
    suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        found.push(pattern.toString());
      }
    });

    return found;
  }

  // Clean and reinstall dependencies
  async cleanDependencies() {
    try {
      this.log('DEPS_CLEAN', 'Cleaning and reinstalling dependencies');
      
      // Remove node_modules and package-lock.json
      if (fs.existsSync('node_modules')) {
        execSync('rm -rf node_modules');
        this.log('DEPS_REMOVED', 'Removed node_modules directory');
      }

      if (fs.existsSync('package-lock.json')) {
        fs.unlinkSync('package-lock.json');
        this.log('LOCK_REMOVED', 'Removed package-lock.json');
      }

      // Reinstall dependencies
      execSync('npm install', { stdio: 'inherit' });
      this.log('DEPS_INSTALLED', 'Dependencies reinstalled');

      return true;
    } catch (error) {
      this.log('DEPS_ERROR', `Dependency cleanup failed: ${error.message}`);
      return false;
    }
  }

  // Run complete recovery process
  async runRecovery() {
    console.log('🔄 Starting Data Recovery Process...\n');

    try {
      // 1. Check git status
      const gitStatus = await this.checkGitStatus();
      if (!gitStatus) {
        throw new Error('Git repository not available');
      }

      // 2. Create clean backup
      await this.createCleanBackup();

      // 3. Find clean commit
      const cleanCommit = await this.findCleanCommit();
      if (!cleanCommit) {
        this.log('RECOVERY_WARNING', 'No clean commit found - manual intervention required');
        return;
      }

      // 4. Restore from clean commit
      const restoreResult = await this.restoreFromCleanCommit(cleanCommit);
      if (!restoreResult.success) {
        throw new Error(`Restore failed: ${restoreResult.error}`);
      }

      // 5. Verify file integrity
      await this.verifyFileIntegrity();

      // 6. Clean dependencies
      await this.cleanDependencies();

      // 7. Save recovery log
      fs.writeFileSync('recovery-log.json', JSON.stringify(this.recoveryLog, null, 2));

      console.log('\n✅ RECOVERY COMPLETE');
      console.log('==================');
      console.log(`Recovery branch: ${restoreResult.recoveryBranch}`);
      console.log(`Restored to commit: ${restoreResult.restoredCommit}`);
      console.log('Recovery log saved to: recovery-log.json');
      console.log('Integrity report saved to: integrity-report.json');

    } catch (error) {
      this.log('RECOVERY_FAILED', `Recovery process failed: ${error.message}`);
      console.error('❌ Recovery failed:', error.message);
    }
  }
}

// Run recovery if called directly
if (require.main === module) {
  const recovery = new DataRecovery();
  recovery.runRecovery().catch(console.error);
}

module.exports = DataRecovery;
