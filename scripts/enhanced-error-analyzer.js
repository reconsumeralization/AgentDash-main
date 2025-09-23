/**
 * Enhanced Error Analyzer - Advanced error detection and analysis
 * Provides intelligent error categorization and fix suggestions
 */

const fs = require('fs')
const path = require('path')

class EnhancedErrorAnalyzer {
  constructor() {
    this.errorPatterns = this.initializeErrorPatterns()
    this.fixStrategies = this.initializeFixStrategies()
    this.errorHistory = []
  }

  initializeErrorPatterns() {
    return {
      // TypeScript Errors
      typescript: {
        'TS2307': {
          pattern: /Cannot find module ['"]([^'"]+)['"]/,
          category: 'missing-module',
          severity: 'high',
          description: 'Missing module or incorrect import path'
        },
        'TS2322': {
          pattern: /Type '([^']+)' is not assignable to type '([^']+)'/,
          category: 'type-mismatch',
          severity: 'medium',
          description: 'Type assignment mismatch'
        },
        'TS2740': {
          pattern: /Type '([^']+)' is missing the following properties from type '([^']+)': ([^.]+)/,
          category: 'missing-properties',
          severity: 'medium',
          description: 'Object missing required properties'
        },
        'TS2593': {
          pattern: /Cannot find name '([^']+)'/,
          category: 'undefined-variable',
          severity: 'high',
          description: 'Undefined variable or function'
        },
        'TS2353': {
          pattern: /Object literal may only specify known properties, and '([^']+)' does not exist/,
          category: 'invalid-property',
          severity: 'medium',
          description: 'Invalid object property'
        }
      },
      
      // Build Errors
      build: {
        'ENOENT': {
          pattern: /ENOENT: no such file or directory/,
          category: 'missing-file',
          severity: 'high',
          description: 'File or directory not found'
        },
        'EACCES': {
          pattern: /EACCES: permission denied/,
          category: 'permission-denied',
          severity: 'high',
          description: 'Permission denied'
        }
      },

      // Runtime Errors
      runtime: {
        'ReferenceError': {
          pattern: /ReferenceError: ([^ ]+) is not defined/,
          category: 'undefined-reference',
          severity: 'high',
          description: 'Undefined reference error'
        },
        'TypeError': {
          pattern: /TypeError: Cannot read property '([^']+)' of undefined/,
          category: 'undefined-property',
          severity: 'medium',
          description: 'Trying to access property of undefined'
        }
      }
    }
  }

  initializeFixStrategies() {
    return {
      'missing-module': {
        priority: 1,
        autoFix: true,
        strategies: [
          'install-package',
          'fix-import-path',
          'create-missing-file'
        ]
      },
      'type-mismatch': {
        priority: 2,
        autoFix: true,
        strategies: [
          'add-type-assertion',
          'fix-type-definition',
          'update-variable-type'
        ]
      },
      'missing-properties': {
        priority: 2,
        autoFix: true,
        strategies: [
          'add-missing-properties',
          'make-properties-optional',
          'fix-interface-definition'
        ]
      },
      'undefined-variable': {
        priority: 1,
        autoFix: true,
        strategies: [
          'add-import',
          'declare-variable',
          'fix-variable-name'
        ]
      },
      'invalid-property': {
        priority: 3,
        autoFix: true,
        strategies: [
          'remove-invalid-property',
          'fix-property-name',
          'update-interface'
        ]
      }
    }
  }

  analyzeError(errorMessage, filePath = null, lineNumber = null) {
    const analysis = {
      originalError: errorMessage,
      filePath,
      lineNumber,
      timestamp: new Date().toISOString(),
      category: 'unknown',
      severity: 'medium',
      fixable: false,
      suggestions: [],
      confidence: 0
    }

    // Try to match against known patterns
    for (const [errorType, patterns] of Object.entries(this.errorPatterns)) {
      for (const [code, pattern] of Object.entries(patterns)) {
        const match = errorMessage.match(pattern.pattern)
        if (match) {
          analysis.category = pattern.category
          analysis.severity = pattern.severity
          analysis.description = pattern.description
          analysis.errorCode = code
          analysis.match = match
          analysis.confidence = 0.9

          // Get fix strategies
          const fixStrategy = this.fixStrategies[pattern.category]
          if (fixStrategy) {
            analysis.fixable = fixStrategy.autoFix
            analysis.priority = fixStrategy.priority
            analysis.suggestions = this.generateFixSuggestions(pattern.category, match, filePath)
          }

          break
        }
      }
      if (analysis.category !== 'unknown') break
    }

    // Fallback analysis for unmatched errors
    if (analysis.category === 'unknown') {
      analysis = this.fallbackAnalysis(errorMessage, filePath)
    }

    this.errorHistory.push(analysis)
    return analysis
  }

  generateFixSuggestions(category, match, filePath) {
    const suggestions = []
    
    switch (category) {
      case 'missing-module':
        const moduleName = match[1]
        suggestions.push({
          type: 'install-package',
          description: `Install missing package: ${moduleName}`,
          command: `npm install ${moduleName}`,
          confidence: 0.8
        })
        suggestions.push({
          type: 'fix-import-path',
          description: `Check import path for ${moduleName}`,
          action: 'manual-review',
          confidence: 0.6
        })
        break

      case 'type-mismatch':
        suggestions.push({
          type: 'add-type-assertion',
          description: 'Add type assertion to resolve mismatch',
          action: 'add-type-assertion',
          confidence: 0.7
        })
        break

      case 'missing-properties':
        const missingProps = match[3]
        suggestions.push({
          type: 'add-missing-properties',
          description: `Add missing properties: ${missingProps}`,
          action: 'add-properties',
          confidence: 0.8
        })
        break

      case 'undefined-variable':
        const variableName = match[1]
        suggestions.push({
          type: 'add-import',
          description: `Add import for ${variableName}`,
          action: 'add-import',
          confidence: 0.7
        })
        break

      case 'invalid-property':
        const propertyName = match[1]
        suggestions.push({
          type: 'remove-invalid-property',
          description: `Remove invalid property: ${propertyName}`,
          action: 'remove-property',
          confidence: 0.9
        })
        break
    }

    return suggestions
  }

  fallbackAnalysis(errorMessage, filePath) {
    return {
      originalError: errorMessage,
      filePath,
      timestamp: new Date().toISOString(),
      category: 'unknown',
      severity: 'medium',
      fixable: false,
      suggestions: [{
        type: 'manual-review',
        description: 'Requires manual review',
        action: 'manual-review',
        confidence: 0.3
      }],
      confidence: 0.3
    }
  }

  getErrorTrends() {
    const trends = {
      totalErrors: this.errorHistory.length,
      errorCategories: {},
      fixableErrors: 0,
      highSeverityErrors: 0,
      recentTrend: 'stable'
    }

    this.errorHistory.forEach(error => {
      // Count by category
      trends.errorCategories[error.category] = (trends.errorCategories[error.category] || 0) + 1
      
      // Count fixable errors
      if (error.fixable) trends.fixableErrors++
      
      // Count high severity errors
      if (error.severity === 'high') trends.highSeverityErrors++
    })

    // Calculate recent trend (last 10 errors vs previous 10)
    const recent = this.errorHistory.slice(-10)
    const previous = this.errorHistory.slice(-20, -10)
    
    if (recent.length > 0 && previous.length > 0) {
      const recentAvg = recent.length / recent.length
      const previousAvg = previous.length / previous.length
      
      if (recentAvg > previousAvg * 1.2) trends.recentTrend = 'increasing'
      else if (recentAvg < previousAvg * 0.8) trends.recentTrend = 'decreasing'
    }

    return trends
  }

  generateReport() {
    const trends = this.getErrorTrends()
    const report = {
      timestamp: new Date().toISOString(),
      summary: trends,
      topErrors: this.getTopErrors(),
      recommendations: this.generateRecommendations(),
      fixableErrors: this.getFixableErrors()
    }

    return report
  }

  getTopErrors() {
    const errorCounts = {}
    this.errorHistory.forEach(error => {
      const key = `${error.category}:${error.description}`
      errorCounts[key] = (errorCounts[key] || 0) + 1
    })

    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }))
  }

  generateRecommendations() {
    const recommendations = []
    const trends = this.getErrorTrends()

    if (trends.fixableErrors > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Apply auto-fixes',
        description: `${trends.fixableErrors} errors can be automatically fixed`
      })
    }

    if (trends.highSeverityErrors > 0) {
      recommendations.push({
        priority: 'critical',
        action: 'Address high-severity errors',
        description: `${trends.highSeverityErrors} high-severity errors need immediate attention`
      })
    }

    if (trends.recentTrend === 'increasing') {
      recommendations.push({
        priority: 'medium',
        action: 'Investigate error trend',
        description: 'Error count is increasing - review recent changes'
      })
    }

    return recommendations
  }

  getFixableErrors() {
    return this.errorHistory.filter(error => error.fixable)
  }

  clearHistory() {
    this.errorHistory = []
  }
}

module.exports = { EnhancedErrorAnalyzer }
