# 🚀 AgentDash AutoTester System

A comprehensive automated testing and fixing system that implements a **find → fix → lint → api → GUI self-loop** for continuous code quality improvement.

## 🎯 Overview

The AutoTester system provides:
- **Automated Issue Detection**: Finds code quality issues, bugs, and inconsistencies
- **Auto-Fixing**: Automatically fixes common issues without human intervention
- **Comprehensive Linting**: ESLint, Prettier, TypeScript checking with auto-fix
- **API Testing**: Complete API test suite for LinkedIn and Office 365 integrations
- **GUI Testing**: End-to-end testing with Playwright
- **Self-Looping**: Autoregressive system that continuously improves code quality

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Find Issues   │───▶│   Auto-Fix      │───▶│   Lint & Format │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Tests     │◀───│   Self-Loop     │───▶│   GUI Tests     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Complete Pipeline
```bash
npm run autotest:pipeline
```

### 3. Run Self-Loop Mode
```bash
npm run autotest:self-loop
```

### 4. Run Individual Components
```bash
# Find issues only
npm run autotest:find

# Auto-fix issues
npm run autotest:fix

# Lint and format
npm run autotest:lint

# API tests only
npm run autotest:api

# GUI tests only
npm run autotest:gui
```

## 📋 Available Commands

### AutoTester Commands
```bash
# Main AutoTester
npm run autotest                    # Run basic autotester
npm run autotest:all               # Run all tests
npm run autotest:pipeline          # Run complete pipeline
npm run autotest:self-loop         # Run self-loop mode
npm run autotest:parallel          # Run API and GUI tests in parallel

# Individual phases
npm run autotest:find              # Find issues only
npm run autotest:fix               # Auto-fix issues only
npm run autotest:lint              # Lint and format only
npm run autotest:api               # API tests only
npm run autotest:gui               # GUI tests only

# Watch mode
npm run autotest:watch             # Watch for file changes
```

### Linting Commands
```bash
npm run lint:fix                   # Run all linting tools
npm run lint:watch                 # Watch mode for linting
```

### Self-Fix Commands
```bash
npm run self-fix                   # Run self-fix loop
npm run self-fix:watch             # Watch mode for self-fixing
```

## 🔧 Configuration

### AutoTester Configuration
The system is configured through the `CONFIG` object in `bin/autotester.js`:

```javascript
const CONFIG = {
  tests: {
    unit: { pattern: '**/*.test.{ts,tsx}', timeout: 30000 },
    integration: { pattern: '**/*.integration.test.{ts,tsx}', timeout: 60000 },
    e2e: { pattern: '**/*.e2e.test.{ts,tsx}', timeout: 120000 },
    api: { pattern: '**/*.api.test.{ts,tsx}', timeout: 45000 },
    gui: { pattern: '**/*.gui.test.{ts,tsx}', timeout: 90000 }
  },
  autoFix: {
    maxIterations: 5,
    retryDelay: 2000,
    enableSelfLoop: true,
    fixableIssues: ['eslint', 'prettier', 'typescript', 'imports', 'unused-vars', 'console-logs']
  }
}
```

### ESLint Configuration
Located in `.eslintrc.js`:
- TypeScript support
- React/Next.js rules
- Accessibility rules
- Security rules
- Performance rules

### Prettier Configuration
Located in `.prettierrc`:
- Consistent code formatting
- TypeScript/JSX support
- File-specific overrides

## 🧪 Testing Frameworks

### API Testing Framework
Located in `tests/api/api-test-framework.ts`:
- **LinkedIn API Tests**: Profile, campaigns, lead generation, analytics
- **Office 365 API Tests**: User management, calendar, files, teams
- **Performance Testing**: Response time, load testing, benchmarking
- **Security Testing**: Headers, SQL injection, rate limiting
- **Error Handling**: Network errors, timeouts, server errors

### GUI Testing Framework
Located in `tests/gui/gui-test-framework.ts`:
- **Dashboard Tests**: Widgets, navigation, performance
- **Campaign Tests**: CRUD operations, analytics, bulk operations
- **Analytics Tests**: Date filtering, data export, charts
- **Settings Tests**: Profile, security, API keys
- **Accessibility Testing**: WCAG compliance, keyboard navigation
- **Visual Regression**: Screenshot comparison, responsive design

## 🔄 Self-Loop System

The self-loop system continuously improves code quality:

1. **Detection**: Scans code for issues
2. **Classification**: Categorizes issues by type and severity
3. **Fixing**: Applies automated fixes where possible
4. **Validation**: Verifies fixes don't introduce new issues
5. **Iteration**: Repeats until no more fixable issues remain

### Fixable Issue Types
- **ESLint Issues**: Code style, best practices
- **Prettier Issues**: Code formatting
- **TypeScript Issues**: Type errors, unused variables
- **Import Issues**: Unused imports, import ordering
- **Console Logs**: Development console statements
- **Security Issues**: Potential vulnerabilities
- **Performance Issues**: Inefficient code patterns

## 📊 Reporting

### Test Reports
- **JSON Reports**: Machine-readable test results
- **HTML Reports**: Human-readable dashboard
- **Console Output**: Real-time progress and results

### Report Locations
```
test-results/
├── autotester-report.json          # Main test results
├── autotester-pipeline-report.json # Pipeline results
├── autotester-pipeline-report.html # HTML dashboard
├── self-fix-report.json           # Self-fix results
├── linting-report.json            # Linting results
└── screenshots/                   # GUI test screenshots
```

## 🎛️ Advanced Usage

### Custom Issue Detectors
Create custom detectors by extending the `IssueDetector` class:

```javascript
class CustomDetector {
  async detect(filePath) {
    // Custom detection logic
    return issues
  }
}
```

### Custom Fix Strategies
Implement custom fixes by extending the `AutoFixer` class:

```javascript
class CustomFixer {
  async fix(issue) {
    // Custom fix logic
    return fixResult
  }
}
```

### Parallel Execution
Run multiple phases in parallel for faster execution:

```bash
node scripts/run-autotester.js --parallel --api --gui
```

### Watch Mode
Monitor file changes and auto-fix issues:

```bash
npm run autotest:watch
```

## 🔍 Issue Detection

### ESLint Issues
- Code style violations
- Best practice violations
- Potential bugs
- Accessibility issues

### TypeScript Issues
- Type errors
- Unused variables
- Missing imports
- Interface violations

### Security Issues
- XSS vulnerabilities
- SQL injection risks
- Insecure data handling
- Missing security headers

### Performance Issues
- Inefficient loops
- Memory leaks
- Slow API calls
- Unoptimized renders

## 🛠️ Troubleshooting

### Common Issues

#### 1. ESLint Configuration Errors
```bash
# Reset ESLint cache
npx eslint --cache-location .eslintcache --clear-cache

# Check configuration
npx eslint --print-config file.js
```

#### 2. TypeScript Compilation Errors
```bash
# Check TypeScript configuration
npx tsc --showConfig

# Clear TypeScript cache
rm -rf node_modules/.cache/tsconfig.tsbuildinfo
```

#### 3. Test Failures
```bash
# Run tests with verbose output
npm run test:verbose

# Clear test cache
npm run test:clear-cache
```

#### 4. GUI Test Issues
```bash
# Install Playwright browsers
npx playwright install

# Run GUI tests in headed mode
npx playwright test --headed
```

### Debug Mode
Enable debug mode for detailed logging:

```bash
DEBUG=autotester* npm run autotest:pipeline
```

## 📈 Performance Optimization

### Test Performance
- **Parallel Execution**: Run tests concurrently
- **Test Caching**: Cache test results
- **Selective Testing**: Run only changed tests
- **Resource Management**: Optimize memory usage

### Fix Performance
- **Incremental Fixing**: Fix issues in batches
- **Smart Detection**: Skip unchanged files
- **Caching**: Cache detection results
- **Debouncing**: Batch file changes

## 🔒 Security Considerations

### API Testing Security
- **Token Management**: Secure API key handling
- **Rate Limiting**: Respect API limits
- **Data Privacy**: No sensitive data in tests
- **Network Security**: HTTPS only

### Code Security
- **Input Validation**: Sanitize all inputs
- **Output Encoding**: Prevent XSS
- **Dependency Scanning**: Check for vulnerabilities
- **Secret Detection**: Prevent credential leaks

## 🤝 Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow naming convention: `*.test.ts` or `*.test.tsx`
3. Use existing test utilities and frameworks
4. Add to appropriate test suite

### Adding New Fixes
1. Extend `IssueDetector` class
2. Implement detection logic
3. Add fix strategy
4. Test thoroughly

### Reporting Issues
1. Check existing issues
2. Provide detailed reproduction steps
3. Include system information
4. Attach relevant logs

## 📚 Additional Resources

### Documentation
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Playwright Testing](https://playwright.dev/docs/intro)

### Best Practices
- [Testing Best Practices](https://testingjavascript.com/)
- [Code Quality Guidelines](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Security Guidelines](https://owasp.org/www-project-top-ten/)

## 🎉 Success Metrics

### Code Quality Metrics
- **Test Coverage**: > 80%
- **ESLint Issues**: 0 errors, < 10 warnings
- **TypeScript Errors**: 0
- **Security Issues**: 0 high/critical

### Performance Metrics
- **Test Execution Time**: < 5 minutes
- **Fix Iteration Time**: < 2 minutes
- **API Response Time**: < 2 seconds
- **GUI Load Time**: < 3 seconds

### Reliability Metrics
- **Test Success Rate**: > 95%
- **Fix Success Rate**: > 90%
- **False Positive Rate**: < 5%
- **System Uptime**: > 99%

---

## 🚀 Getting Started

Ready to start? Run the complete pipeline:

```bash
npm run autotest:pipeline
```

This will execute the full **find → fix → lint → api → GUI** self-loop and provide comprehensive reports on your code quality and test results.

For continuous improvement, use the self-loop mode:

```bash
npm run autotest:self-loop
```

Happy testing! 🎯
