# 🔍 Sweep Agent - Automated Code Review System

Sweep Agent is an automated code review and improvement system designed specifically for the AgentDash project. It provides comprehensive analysis of code quality, security vulnerabilities, performance issues, and accessibility compliance.

## 🚀 Features

### Core Capabilities
- **🔒 Security Scanning**: Detect hardcoded secrets, SQL injection, XSS vulnerabilities
- **📊 Code Quality**: ESLint integration, TypeScript checking, unused imports
- **⚡ Performance Analysis**: Bundle size monitoring, inefficient loops detection
- **♿ Accessibility**: Missing alt text, ARIA labels, color contrast checks
- **📚 Documentation**: JSDoc validation, README checks
- **🔐 PKI Security**: Weak key sizes, hardcoded certificates, validation checks
- **💼 LinkedIn API**: Token security, error handling, rate limiting

### Automation Features
- **🤖 Automatic Fixes**: Safe code improvements (formatting, imports, etc.)
- **📊 Comprehensive Reports**: JSON, HTML, and Markdown output formats
- **🔄 Continuous Monitoring**: Scheduled scans and file watching
- **📢 Smart Notifications**: GitHub issues, Slack integration, email alerts
- **🎯 Quality Gates**: Configurable thresholds for deployment blocking

## 📁 Project Structure

```
.sweep/
├── config.yaml              # Main configuration file

bin/
├── sweep-cli.js             # Command-line interface

.github/workflows/
├── sweep-agent.yml          # GitHub Actions workflow

sweep-agent.js               # Main sweep agent implementation
```

## 🛠 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Configuration
```bash
npm run sweep config --init
```

### 3. Validate Configuration
```bash
npm run sweep config --validate
```

## 🎯 Usage

### Command Line Interface

#### Basic Scanning
```bash
# Run full scan
npm run sweep:scan

# Run specific scan types
npm run sweep:security
npm run sweep:quality
npm run sweep:performance

# Scan with automatic fixes
npm run sweep:scan --fix

# Strict mode (fail on critical issues)
npm run sweep:scan --strict
```

#### Automatic Fixes
```bash
# Apply safe fixes only
npm run sweep:fix

# Apply all fixes (including review fixes)
npm run sweep:fix --type all

# Dry run (show what would be fixed)
npm run sweep:fix --dry-run
```

#### Monitoring
```bash
# Start continuous monitoring (60-minute intervals)
npm run sweep:monitor

# Custom interval (30 minutes)
npm run sweep:monitor --interval 30

# Watch for file changes
npm run sweep:monitor --watch
```

#### Reports
```bash
# Generate reports from previous scans
npm run sweep:report

# Custom output format
npm run sweep:report --format html

# Specify input/output directories
npm run sweep:report --input sweep-reports --output reports
```

### Configuration Management
```bash
# Show current configuration
npm run sweep config --show

# Validate configuration
npm run sweep config --validate

# Initialize new configuration
npm run sweep config --init
```

## ⚙️ Configuration

The sweep agent is configured via `.sweep/config.yaml`. Key configuration sections:

### Basic Settings
```yaml
project_name: "AgentDash"
repository: "reconsumeralization/agentdash-dashboard"
description: "AI-powered dashboard with PKI automation"
```

### Code Analysis
```yaml
code_analysis:
  languages: [typescript, javascript, python, yaml, json, markdown]
  include_patterns: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
  exclude_patterns: ["node_modules/**", ".next/**", "dist/**"]
```

### Security Rules
```yaml
security:
  enabled: true
  rules:
    - name: "hardcoded-secrets"
      severity: "critical"
      pattern: "(password|secret|key|token)\\s*[:=]\\s*['\"][^'\"]+['\"]"
```

### Quality Rules
```yaml
quality:
  typescript:
    - name: "no-any-type"
      severity: "warning"
      pattern: ":\\s*any\\b"
    - name: "console-statements"
      severity: "warning"
      pattern: "console\\.(log|warn|error|debug)"
```

### PKI Security Rules
```yaml
pki_security:
  enabled: true
  rules:
    - name: "weak-key-sizes"
      severity: "critical"
      pattern: "(rsa|ecdsa).*bits\\s*[:=]\\s*(1024|1536)"
    - name: "hardcoded-certificates"
      severity: "critical"
      pattern: "-----BEGIN CERTIFICATE-----"
```

### LinkedIn API Rules
```yaml
linkedin_api:
  enabled: true
  rules:
    - name: "hardcoded-tokens"
      severity: "critical"
      pattern: "(access_token|client_secret)\\s*[:=]\\s*['\"][^'\"]+['\"]"
    - name: "missing-error-handling"
      severity: "warning"
      pattern: "linkedin.*api.*(?!catch|error)"
```

## 🔄 GitHub Actions Integration

The sweep agent integrates with GitHub Actions for automated scanning:

### Trigger Events
- **Push to main/develop**: Full security and quality scans
- **Pull Requests**: Code review and quality checks
- **Scheduled**: Daily comprehensive scans at 2 AM UTC
- **Manual**: Workflow dispatch with scan type selection

### Quality Gates
- **Critical Issues**: 0 allowed (blocks deployment)
- **High Issues**: 5 maximum (blocks deployment)
- **Medium Issues**: 20 maximum (warns)
- **Low Issues**: 50 maximum (warns)

### Automatic Actions
- **Issue Creation**: Critical security issues automatically create GitHub issues
- **PR Comments**: Scan results posted as PR comments
- **Artifact Upload**: Reports saved as workflow artifacts
- **Deployment Blocking**: Failed quality gates prevent deployment

## 📊 Report Formats

### JSON Report
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "project": "AgentDash",
  "repository": "reconsumeralization/agentdash-dashboard",
  "metrics": {
    "filesScanned": 150,
    "issuesFound": 12,
    "issuesFixed": 3
  },
  "issues": [
    {
      "file": "lib/pki/keyGeneration.ts",
      "line": 45,
      "severity": "warning",
      "rule": "console-statement",
      "message": "Console.log statement found in production code",
      "code": "console.log('Generated key pair')"
    }
  ]
}
```

### HTML Report
Interactive web-based report with:
- Executive summary dashboard
- Detailed issue listings
- Code snippets and context
- Severity-based color coding
- Exportable results

### Markdown Report
GitHub-friendly markdown format for:
- README integration
- Documentation embedding
- Version control tracking
- Team collaboration

## 🚨 Issue Severity Levels

### Critical 🚨
- Hardcoded secrets or API keys
- SQL injection vulnerabilities
- XSS vulnerabilities
- Weak cryptographic keys
- Missing input validation

### High ⚠️
- Security misconfigurations
- Performance bottlenecks
- Memory leaks
- Missing error handling
- Accessibility violations

### Medium ⚡
- Code quality issues
- Inefficient algorithms
- Missing documentation
- Unused imports
- Console statements

### Warning 💡
- Style violations
- Minor optimizations
- Code organization
- Naming conventions
- Type annotations

### Info ℹ️
- TODO comments
- Documentation suggestions
- Best practice recommendations
- Code style improvements
- Refactoring opportunities

## 🔧 Automatic Fixes

### Safe Fixes (Automatically Applied)
- **Code Formatting**: Prettier integration
- **Import Cleanup**: Remove unused imports
- **Semicolon Addition**: Missing semicolons
- **Indentation**: Fix inconsistent spacing

### Review Fixes (Require Manual Approval)
- **Error Handling**: Add try-catch blocks
- **Type Annotations**: Improve TypeScript types
- **Import Optimization**: Reorganize imports
- **JSDoc Addition**: Add documentation comments

## 📈 Monitoring & Metrics

### Key Metrics Tracked
- **Files Scanned**: Total number of files analyzed
- **Issues Found**: Total issues discovered
- **Issues Fixed**: Automatic fixes applied
- **Scan Duration**: Time taken for analysis
- **Coverage**: Percentage of codebase covered

### Performance Metrics
- **Average Response Time**: API call performance
- **Bundle Size**: JavaScript bundle analysis
- **Memory Usage**: Runtime memory consumption
- **Load Time**: Page load performance

### Security Metrics
- **Vulnerabilities**: Security issues found
- **Compliance**: Policy adherence
- **Dependencies**: Package vulnerability scan
- **Secrets**: Exposed credentials detected

## 🔔 Notifications

### GitHub Integration
- **Issue Creation**: Critical issues → GitHub issues
- **PR Comments**: Scan results in pull requests
- **Commit Status**: Build status updates
- **Workflow Notifications**: Action results

### Slack Integration (Optional)
```yaml
notifications:
  slack:
    enabled: true
    webhook_url: "${SLACK_WEBHOOK_URL}"
    channel: "#code-reviews"
```

### Email Notifications (Optional)
```yaml
notifications:
  email:
    enabled: true
    recipients: ["dev@company.com"]
```

## 🎯 Best Practices

### Development Workflow
1. **Pre-commit**: Run quick quality checks
2. **Pull Request**: Full security and quality scan
3. **Merge**: Quality gate validation
4. **Deploy**: Monitoring and alerting

### Configuration Management
- **Environment-specific**: Different rules for dev/prod
- **Team Consensus**: Agreed-upon quality standards
- **Regular Updates**: Keep rules current with best practices
- **Documentation**: Document custom rules and exceptions

### Issue Resolution
1. **Critical**: Fix immediately, block deployment
2. **High**: Fix within sprint, monitor closely
3. **Medium**: Plan for next iteration
4. **Warning**: Address during refactoring
5. **Info**: Consider for future improvements

## 🔍 Troubleshooting

### Common Issues

#### Configuration Errors
```bash
# Validate configuration
npm run sweep config --validate

# Show current config
npm run sweep config --show
```

#### Scan Failures
```bash
# Run with verbose output
npm run sweep:scan --verbose

# Check specific scan type
npm run sweep:security
```

#### Report Generation Issues
```bash
# Check input directory
ls -la sweep-reports/

# Generate specific format
npm run sweep:report --format json
```

### Performance Issues
- **Large Codebases**: Use exclude patterns
- **Slow Scans**: Reduce scan frequency
- **Memory Usage**: Limit concurrent scans
- **Network Issues**: Use local tools when possible

## 📚 Integration Examples

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
npm run sweep:scan --strict --type quality
if [ $? -ne 0 ]; then
  echo "Quality check failed. Please fix issues before committing."
  exit 1
fi
```

### Package.json Scripts
```json
{
  "scripts": {
    "precommit": "npm run sweep:scan --type quality",
    "prepush": "npm run sweep:scan --strict",
    "sweep:ci": "npm run sweep:scan --strict --type security,quality"
  }
}
```

### CI/CD Integration
```yaml
# .github/workflows/quality.yml
- name: Quality Gate
  run: npm run sweep:scan --strict
  if: github.ref == 'refs/heads/main'
```

## 🆘 Support & Contributing

### Getting Help
- **Documentation**: Check this README first
- **Issues**: GitHub issues for bugs and features
- **Discussions**: GitHub discussions for questions
- **Community**: Join our developer community

### Contributing
1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development
```bash
# Clone repository
git clone https://github.com/reconsumeralization/agentdash-dashboard.git

# Install dependencies
npm install

# Run tests
npm test

# Run sweep agent
npm run sweep:scan
```

---

## 🎉 Getting Started

1. **Install**: `npm install`
2. **Configure**: `npm run sweep config --init`
3. **Scan**: `npm run sweep:scan`
4. **Monitor**: `npm run sweep:monitor`
5. **Integrate**: Set up GitHub Actions workflow

**Happy coding with confidence!** 🚀
