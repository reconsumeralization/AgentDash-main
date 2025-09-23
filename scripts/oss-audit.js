#!/usr/bin/env node

/**
 * 🔍 OPEN SOURCE SOFTWARE (OSS) AUDIT SCRIPT
 * Comprehensive analysis of all dependencies and their licenses
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class OSSAuditor {
  constructor() {
    this.dependencies = [];
    this.licenseInfo = {};
    this.attributionData = {};
    this.auditResults = {
      timestamp: new Date().toISOString(),
      totalDependencies: 0,
      licenseTypes: {},
      complianceIssues: [],
      attributionRequired: [],
      summary: {}
    };
  }

  // Get all dependencies from package.json
  async getDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      this.dependencies = Object.entries(allDeps).map(([name, version]) => ({
        name,
        version: version.replace(/[\^~]/, ''), // Remove version prefixes
        type: packageJson.dependencies[name] ? 'dependency' : 'devDependency'
      }));

      this.auditResults.totalDependencies = this.dependencies.length;
      console.log(`📦 Found ${this.dependencies.length} dependencies to audit`);
      
      return this.dependencies;
    } catch (error) {
      console.error('Error reading package.json:', error.message);
      return [];
    }
  }

  // Get license information for a package
  async getPackageLicense(packageName) {
    try {
      // Try to get license from package.json in node_modules
      const packagePath = path.join('node_modules', packageName, 'package.json');
      
      if (fs.existsSync(packagePath)) {
        const packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        return {
          name: packageName,
          version: packageInfo.version,
          license: packageInfo.license || packageInfo.licenses || 'Unknown',
          author: packageInfo.author,
          homepage: packageInfo.homepage,
          repository: packageInfo.repository,
          description: packageInfo.description,
          licenseFile: this.findLicenseFile(packageName)
        };
      }
      
      return {
        name: packageName,
        license: 'Unknown',
        error: 'Package not found in node_modules'
      };
    } catch (error) {
      return {
        name: packageName,
        license: 'Unknown',
        error: error.message
      };
    }
  }

  // Find license file in package directory
  findLicenseFile(packageName) {
    const packageDir = path.join('node_modules', packageName);
    const licenseFiles = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'LICENSE-MIT', 'LICENSE-APACHE'];
    
    for (const file of licenseFiles) {
      const filePath = path.join(packageDir, file);
      if (fs.existsSync(filePath)) {
        return file;
      }
    }
    
    return null;
  }

  // Categorize licenses by type
  categorizeLicense(license) {
    const licenseStr = typeof license === 'string' ? license : JSON.stringify(license);
    
    if (licenseStr.includes('MIT')) return 'MIT';
    if (licenseStr.includes('Apache')) return 'Apache-2.0';
    if (licenseStr.includes('BSD')) return 'BSD';
    if (licenseStr.includes('GPL')) return 'GPL';
    if (licenseStr.includes('LGPL')) return 'LGPL';
    if (licenseStr.includes('ISC')) return 'ISC';
    if (licenseStr.includes('Unlicense')) return 'Unlicense';
    if (licenseStr.includes('Public Domain')) return 'Public Domain';
    
    return 'Other';
  }

  // Check for copyleft licenses that require attribution
  requiresAttribution(license) {
    const copyleftLicenses = ['GPL', 'LGPL', 'AGPL', 'MPL'];
    const licenseStr = typeof license === 'string' ? license : JSON.stringify(license);
    
    return copyleftLicenses.some(copyleft => licenseStr.includes(copyleft));
  }

  // Check for commercial use restrictions
  hasCommercialRestrictions(license) {
    const restrictiveLicenses = ['CC-BY-NC', 'Non-commercial', 'Personal use only'];
    const licenseStr = typeof license === 'string' ? license : JSON.stringify(license);
    
    return restrictiveLicenses.some(restrictive => licenseStr.includes(restrictive));
  }

  // Generate attribution text for a package
  generateAttribution(packageInfo) {
    const { name, version, license, author, homepage, repository } = packageInfo;
    
    let attribution = `## ${name} v${version}\n`;
    attribution += `**License:** ${license}\n`;
    
    if (author) {
      attribution += `**Author:** ${typeof author === 'string' ? author : author.name || 'Unknown'}\n`;
    }
    
    if (homepage) {
      attribution += `**Homepage:** ${homepage}\n`;
    }
    
    if (repository) {
      const repoUrl = typeof repository === 'string' ? repository : repository.url;
      attribution += `**Repository:** ${repoUrl}\n`;
    }
    
    attribution += '\n';
    
    return attribution;
  }

  // Audit all dependencies
  async auditDependencies() {
    console.log('🔍 Starting OSS audit...\n');
    
    for (const dep of this.dependencies) {
      console.log(`📋 Auditing ${dep.name}...`);
      
      const packageInfo = await this.getPackageLicense(dep.name);
      this.licenseInfo[dep.name] = packageInfo;
      
      // Categorize license
      const licenseType = this.categorizeLicense(packageInfo.license);
      this.auditResults.licenseTypes[licenseType] = (this.auditResults.licenseTypes[licenseType] || 0) + 1;
      
      // Check for compliance issues
      if (this.requiresAttribution(packageInfo.license)) {
        this.auditResults.attributionRequired.push(packageInfo);
      }
      
      if (this.hasCommercialRestrictions(packageInfo.license)) {
        this.auditResults.complianceIssues.push({
          package: dep.name,
          issue: 'Commercial use restrictions',
          license: packageInfo.license
        });
      }
      
      if (packageInfo.license === 'Unknown') {
        this.auditResults.complianceIssues.push({
          package: dep.name,
          issue: 'Unknown license',
          license: packageInfo.license
        });
      }
    }
  }

  // Generate comprehensive attribution file
  generateAttributionFile() {
    let attributionContent = `# Open Source Software Attribution

This project uses the following open source software:

## Summary
- **Total Dependencies:** ${this.auditResults.totalDependencies}
- **License Types:** ${Object.keys(this.auditResults.licenseTypes).join(', ')}
- **Attribution Required:** ${this.auditResults.attributionRequired.length} packages

## Dependencies by License Type

`;

    // Group by license type
    const byLicense = {};
    Object.values(this.licenseInfo).forEach(pkg => {
      const licenseType = this.categorizeLicense(pkg.license);
      if (!byLicense[licenseType]) {
        byLicense[licenseType] = [];
      }
      byLicense[licenseType].push(pkg);
    });

    // Generate sections for each license type
    Object.entries(byLicense).forEach(([licenseType, packages]) => {
      attributionContent += `### ${licenseType} License (${packages.length} packages)\n\n`;
      
      packages.forEach(pkg => {
        attributionContent += this.generateAttribution(pkg);
      });
    });

    // Add special section for packages requiring attribution
    if (this.auditResults.attributionRequired.length > 0) {
      attributionContent += `## Packages Requiring Special Attribution

The following packages have copyleft licenses that require special attention:

`;
      
      this.auditResults.attributionRequired.forEach(pkg => {
        attributionContent += this.generateAttribution(pkg);
      });
    }

    return attributionContent;
  }

  // Generate license compliance report
  generateComplianceReport() {
    let report = `# OSS License Compliance Report

Generated: ${this.auditResults.timestamp}

## Summary
- **Total Dependencies:** ${this.auditResults.totalDependencies}
- **License Types:** ${Object.keys(this.auditResults.licenseTypes).length}
- **Compliance Issues:** ${this.auditResults.complianceIssues.length}
- **Attribution Required:** ${this.auditResults.attributionRequired.length}

## License Distribution
`;

    Object.entries(this.auditResults.licenseTypes).forEach(([license, count]) => {
      report += `- **${license}:** ${count} packages\n`;
    });

    if (this.auditResults.complianceIssues.length > 0) {
      report += `\n## Compliance Issues\n\n`;
      
      this.auditResults.complianceIssues.forEach(issue => {
        report += `### ${issue.package}\n`;
        report += `- **Issue:** ${issue.issue}\n`;
        report += `- **License:** ${issue.license}\n\n`;
      });
    }

    if (this.auditResults.attributionRequired.length > 0) {
      report += `\n## Packages Requiring Attribution\n\n`;
      
      this.auditResults.attributionRequired.forEach(pkg => {
        report += `- **${pkg.name}** (${pkg.license})\n`;
      });
    }

    return report;
  }

  // Save all audit results
  async saveResults() {
    // Save detailed audit data
    fs.writeFileSync('oss-audit-results.json', JSON.stringify({
      ...this.auditResults,
      dependencies: this.licenseInfo
    }, null, 2));

    // Save attribution file
    const attributionContent = this.generateAttributionFile();
    fs.writeFileSync('OSS_ATTRIBUTION.md', attributionContent);

    // Save compliance report
    const complianceReport = this.generateComplianceReport();
    fs.writeFileSync('OSS_COMPLIANCE_REPORT.md', complianceReport);

    // Save simplified credits file
    const creditsContent = this.generateCreditsFile();
    fs.writeFileSync('CREDITS.md', creditsContent);

    console.log('\n📄 Files generated:');
    console.log('- oss-audit-results.json (detailed data)');
    console.log('- OSS_ATTRIBUTION.md (comprehensive attribution)');
    console.log('- OSS_COMPLIANCE_REPORT.md (compliance analysis)');
    console.log('- CREDITS.md (simplified credits)');
  }

  // Generate simplified credits file
  generateCreditsFile() {
    let credits = `# Credits

This project uses the following open source libraries:

`;

    // Group by major categories
    const categories = {
      'UI Components': ['@radix-ui', 'lucide-react', 'cmdk', 'vaul'],
      'React Framework': ['react', 'react-dom', 'next'],
      'Styling': ['tailwindcss', 'clsx', 'tailwind-merge', 'class-variance-authority'],
      'Forms & Validation': ['react-hook-form', '@hookform/resolvers', 'zod'],
      'AI & ML': ['@ai-sdk', 'ai'],
      'Blockchain': ['@solana', '@coral-protocol'],
      'Database': ['@supabase'],
      'Utilities': ['date-fns', 'recharts', 'embla-carousel-react']
    };

    Object.entries(categories).forEach(([category, prefixes]) => {
      const packages = Object.values(this.licenseInfo).filter(pkg => 
        prefixes.some(prefix => pkg.name.startsWith(prefix))
      );

      if (packages.length > 0) {
        credits += `## ${category}\n\n`;
        packages.forEach(pkg => {
          credits += `- **${pkg.name}** - ${pkg.license}\n`;
        });
        credits += '\n';
      }
    });

    // Add uncategorized packages
    const categorized = new Set();
    Object.values(categories).flat().forEach(prefix => {
      Object.values(this.licenseInfo).forEach(pkg => {
        if (pkg.name.startsWith(prefix)) {
          categorized.add(pkg.name);
        }
      });
    });

    const uncategorized = Object.values(this.licenseInfo).filter(pkg => !categorized.has(pkg.name));
    if (uncategorized.length > 0) {
      credits += `## Other Libraries\n\n`;
      uncategorized.forEach(pkg => {
        credits += `- **${pkg.name}** - ${pkg.license}\n`;
      });
    }

    return credits;
  }

  // Run complete audit
  async runAudit() {
    console.log('🔍 Open Source Software Audit\n');
    console.log('============================\n');

    try {
      // 1. Get dependencies
      await this.getDependencies();
      
      // 2. Audit each dependency
      await this.auditDependencies();
      
      // 3. Save results
      await this.saveResults();
      
      // 4. Print summary
      console.log('\n✅ OSS Audit Complete!');
      console.log('=====================');
      console.log(`Total dependencies: ${this.auditResults.totalDependencies}`);
      console.log(`License types: ${Object.keys(this.auditResults.licenseTypes).join(', ')}`);
      console.log(`Compliance issues: ${this.auditResults.complianceIssues.length}`);
      console.log(`Attribution required: ${this.auditResults.attributionRequired.length}`);

      if (this.auditResults.complianceIssues.length > 0) {
        console.log('\n⚠️  Compliance Issues Found:');
        this.auditResults.complianceIssues.forEach(issue => {
          console.log(`  - ${issue.package}: ${issue.issue}`);
        });
      }

    } catch (error) {
      console.error('❌ Audit failed:', error.message);
    }
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new OSSAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = OSSAuditor;
