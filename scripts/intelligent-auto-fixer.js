/**
 * Intelligent Auto-Fixer - Automatically applies fixes based on error analysis
 * Uses machine learning-like patterns to fix common issues
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class IntelligentAutoFixer {
  constructor() {
    this.fixHistory = []
    this.successRate = {}
    this.fixStrategies = this.initializeFixStrategies()
  }

  initializeFixStrategies() {
    return {
      'install-package': this.installPackage.bind(this),
      'fix-import-path': this.fixImportPath.bind(this),
      'add-type-assertion': this.addTypeAssertion.bind(this),
      'add-missing-properties': this.addMissingProperties.bind(this),
      'remove-invalid-property': this.removeInvalidProperty.bind(this),
      'add-import': this.addImport.bind(this),
      'declare-variable': this.declareVariable.bind(this),
      'fix-variable-name': this.fixVariableName.bind(this),
      'create-missing-file': this.createMissingFile.bind(this)
    }
  }

  async applyFix(errorAnalysis, suggestion) {
    const fixId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fixAttempt = {
      id: fixId,
      timestamp: new Date().toISOString(),
      errorAnalysis,
      suggestion,
      status: 'pending',
      success: false,
      details: null
    }

    try {
      const strategy = this.fixStrategies[suggestion.type]
      if (!strategy) {
        throw new Error(`Unknown fix strategy: ${suggestion.type}`)
      }

      fixAttempt.status = 'applying'
      const result = await strategy(errorAnalysis, suggestion)
      
      fixAttempt.status = 'completed'
      fixAttempt.success = result.success
      fixAttempt.details = result

      // Update success rate
      this.updateSuccessRate(suggestion.type, result.success)

    } catch (error) {
      fixAttempt.status = 'failed'
      fixAttempt.success = false
      fixAttempt.details = { error: error.message }
    }

    this.fixHistory.push(fixAttempt)
    return fixAttempt
  }

  async installPackage(errorAnalysis, suggestion) {
    try {
      const packageName = errorAnalysis.match?.[1] || suggestion.description.match(/Install missing package: (.+)/)?.[1]
      if (!packageName) {
        return { success: false, reason: 'Could not determine package name' }
      }

      // Try different package name variations
      const variations = [
        packageName,
        packageName.replace(/^@/, ''),
        packageName.replace(/^@types\//, ''),
        `@types/${packageName}`
      ]

      for (const pkg of variations) {
        try {
          execSync(`npm install ${pkg}`, { stdio: 'pipe' })
          return { 
            success: true, 
            action: `Installed package: ${pkg}`,
            packageName: pkg
          }
        } catch (error) {
          // Try next variation
          continue
        }
      }

      return { success: false, reason: 'Package installation failed for all variations' }
    } catch (error) {
      return { success: false, reason: error.message }
    }
  }

  async fixImportPath(errorAnalysis, suggestion) {
    try {
      const filePath = errorAnalysis.filePath
      if (!filePath || !fs.existsSync(filePath)) {
        return { success: false, reason: 'File not found' }
      }

      const content = fs.readFileSync(filePath, 'utf8')
      const moduleName = errorAnalysis.match?.[1]
      
      if (!moduleName) {
        return { success: false, reason: 'Could not determine module name' }
      }

      // Try common import path fixes
      const possiblePaths = [
        `./${moduleName}`,
        `../${moduleName}`,
        `@/${moduleName}`,
        `@/lib/${moduleName}`,
        `@/components/${moduleName}`,
        `@/utils/${moduleName}`
      ]

      for (const newPath of possiblePaths) {
        const newImport = content.replace(
          new RegExp(`from ['"]${moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`),
          `from '${newPath}'`
        )

        if (newImport !== content) {
          fs.writeFileSync(filePath, newImport)
          return { 
            success: true, 
            action: `Updated import path to: ${newPath}`,
            oldPath: moduleName,
            newPath
          }
        }
      }

      return { success: false, reason: 'No suitable import path found' }
    } catch (error) {
      return { success: false, reason: error.message }
    }
  }

  async addTypeAssertion(errorAnalysis, suggestion) {
    try {
      const filePath = errorAnalysis.filePath
      if (!filePath || !fs.existsSync(filePath)) {
        return { success: false, reason: 'File not found' }
      }

      const content = fs.readFileSync(filePath, 'utf8')
      const lineNumber = errorAnalysis.lineNumber
      
      if (!lineNumber) {
        return { success: false, reason: 'Line number not available' }
      }

      const lines = content.split('\n')
      const targetLine = lines[lineNumber - 1]
      
      if (!targetLine) {
        return { success: false, reason: 'Target line not found' }
      }

      // Extract the variable and type from the error
      const typeMatch = errorAnalysis.originalError.match(/Type '([^']+)' is not assignable to type '([^']+)'/)
      if (!typeMatch) {
        return { success: false, reason: 'Could not extract type information' }
      }

      const expectedType = typeMatch[2]
      
      // Add type assertion
      const fixedLine = targetLine.replace(
        /(\w+)(\s*[=;])/,
        `$1 as ${expectedType}$2`
      )

      if (fixedLine !== targetLine) {
        lines[lineNumber - 1] = fixedLine
        fs.writeFileSync(filePath, lines.join('\n'))
        return { 
          success: true, 
          action: `Added type assertion: as ${expectedType}`,
          line: lineNumber
        }
      }

      return { success: false, reason: 'Could not apply type assertion' }
    } catch (error) {
      return { success: false, reason: error.message }
    }
  }

  async addMissingProperties(errorAnalysis, suggestion) {
    try {
      const filePath = errorAnalysis.filePath
      if (!filePath || !fs.existsSync(filePath)) {
        return { success: false, reason: 'File not found' }
      }

      const content = fs.readFileSync(filePath, 'utf8')
      const missingProps = errorAnalysis.match?.[3]
      
      if (!missingProps) {
        return { success: false, reason: 'Could not determine missing properties' }
      }

      const properties = missingProps.split(', ').map(prop => prop.trim())
      const lineNumber = errorAnalysis.lineNumber
      
      if (!lineNumber) {
        return { success: false, reason: 'Line number not available' }
      }

      const lines = content.split('\n')
      const targetLine = lines[lineNumber - 1]
      
      // Find the object literal and add missing properties
      const objectMatch = targetLine.match(/(\s*)(\{[^}]*\})/)
      if (!objectMatch) {
        return { success: false, reason: 'Could not find object literal' }
      }

      const indent = objectMatch[1]
      const objectContent = objectMatch[2]
      
      // Add missing properties with default values
      const newProperties = properties.map(prop => {
        const defaultValue = this.getDefaultValueForProperty(prop)
        return `${indent}  ${prop}: ${defaultValue}`
      }).join(',\n')

      const newObjectContent = objectContent.replace(
        /(\{)([^}]*)(\})/,
        `$1\n${newProperties},\n${indent}$3`
      )

      lines[lineNumber - 1] = targetLine.replace(objectMatch[2], newObjectContent)
      fs.writeFileSync(filePath, lines.join('\n'))

      return { 
        success: true, 
        action: `Added missing properties: ${properties.join(', ')}`,
        properties
      }
    } catch (error) {
      return { success: false, reason: error.message }
    }
  }

  async removeInvalidProperty(errorAnalysis, suggestion) {
    try {
      const filePath = errorAnalysis.filePath
      if (!filePath || !fs.existsSync(filePath)) {
        return { success: false, reason: 'File not found' }
      }

      const content = fs.readFileSync(filePath, 'utf8')
      const propertyName = errorAnalysis.match?.[1]
      
      if (!propertyName) {
        return { success: false, reason: 'Could not determine property name' }
      }

      // Remove the invalid property
      const newContent = content.replace(
        new RegExp(`\\s*${propertyName}:\\s*[^,}\\n]+[,]?\\s*`, 'g'),
        ''
      )

      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent)
        return { 
          success: true, 
          action: `Removed invalid property: ${propertyName}`,
          propertyName
        }
      }

      return { success: false, reason: 'Property not found or could not be removed' }
    } catch (error) {
      return { success: false, reason: error.message }
    }
  }

  async addImport(errorAnalysis, suggestion) {
    try {
      const filePath = errorAnalysis.filePath
      if (!filePath || !fs.existsSync(filePath)) {
        return { success: false, reason: 'File not found' }
      }

      const content = fs.readFileSync(filePath, 'utf8')
      const variableName = errorAnalysis.match?.[1]
      
      if (!variableName) {
        return { success: false, reason: 'Could not determine variable name' }
      }

      // Try to find the appropriate import
      const importPath = this.findImportPath(variableName, filePath)
      if (!importPath) {
        return { success: false, reason: 'Could not determine import path' }
      }

      // Add import at the top of the file
      const lines = content.split('\n')
      const importLine = `import { ${variableName} } from '${importPath}'`
      
      // Find the best place to insert the import
      let insertIndex = 0
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertIndex = i + 1
        } else if (lines[i].trim() === '' && insertIndex > 0) {
          break
        }
      }

      lines.splice(insertIndex, 0, importLine)
      fs.writeFileSync(filePath, lines.join('\n'))

      return { 
        success: true, 
        action: `Added import: ${importLine}`,
        importPath,
        variableName
      }
    } catch (error) {
      return { success: false, reason: error.message }
    }
  }

  async declareVariable(errorAnalysis, suggestion) {
    try {
      const filePath = errorAnalysis.filePath
      if (!filePath || !fs.existsSync(filePath)) {
        return { success: false, reason: 'File not found' }
      }

      const content = fs.readFileSync(filePath, 'utf8')
      const variableName = errorAnalysis.match?.[1]
      
      if (!variableName) {
        return { success: false, reason: 'Could not determine variable name' }
      }

      // Add variable declaration
      const lines = content.split('\n')
      const lineNumber = errorAnalysis.lineNumber
      
      if (!lineNumber) {
        return { success: false, reason: 'Line number not available' }
      }

      const declaration = `let ${variableName}: any;`
      lines.splice(lineNumber - 1, 0, declaration)
      fs.writeFileSync(filePath, lines.join('\n'))

      return { 
        success: true, 
        action: `Added variable declaration: ${declaration}`,
        variableName
      }
    } catch (error) {
      return { success: false, reason: error.message }
    }
  }

  async fixVariableName(errorAnalysis, suggestion) {
    // This is a complex fix that requires understanding context
    return { success: false, reason: 'Variable name fixing requires manual review' }
  }

  async createMissingFile(errorAnalysis, suggestion) {
    try {
      const moduleName = errorAnalysis.match?.[1]
      if (!moduleName) {
        return { success: false, reason: 'Could not determine module name' }
      }

      // Try to create a basic module file
      const possiblePaths = [
        `lib/${moduleName}.ts`,
        `components/${moduleName}.tsx`,
        `utils/${moduleName}.ts`,
        `types/${moduleName}.ts`
      ]

      for (const filePath of possiblePaths) {
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }

        if (!fs.existsSync(filePath)) {
          const content = this.generateModuleContent(moduleName, filePath)
          fs.writeFileSync(filePath, content)
          return { 
            success: true, 
            action: `Created missing file: ${filePath}`,
            filePath,
            content
          }
        }
      }

      return { success: false, reason: 'Could not create file in any expected location' }
    } catch (error) {
      return { success: false, reason: error.message }
    }
  }

  getDefaultValueForProperty(propertyName) {
    const defaults = {
      'id': "'generated-id'",
      'name': "'Unnamed'",
      'description': "'No description'",
      'status': "'active'",
      'created_at': 'new Date().toISOString()',
      'updated_at': 'new Date().toISOString()',
      'enabled': 'true',
      'visible': 'true',
      'required': 'false'
    }

    return defaults[propertyName] || 'null'
  }

  findImportPath(variableName, filePath) {
    // Simple heuristic to find import paths
    const commonPaths = [
      '@/lib',
      '@/components',
      '@/utils',
      '@/types',
      '@/hooks'
    ]

    // Try to find the variable in common directories
    for (const basePath of commonPaths) {
      const possibleFiles = [
        `${basePath}/${variableName.toLowerCase()}`,
        `${basePath}/${variableName}`,
        `${basePath}/index`
      ]

      for (const possibleFile of possibleFiles) {
        if (fs.existsSync(possibleFile + '.ts') || fs.existsSync(possibleFile + '.tsx')) {
          return possibleFile
        }
      }
    }

    return null
  }

  generateModuleContent(moduleName, filePath) {
    const extension = path.extname(filePath)
    const isComponent = extension === '.tsx'
    
    if (isComponent) {
      return `import React from 'react'

interface ${moduleName}Props {
  // Add props here
}

export function ${moduleName}({ }: ${moduleName}Props) {
  return (
    <div>
      {/* ${moduleName} component */}
    </div>
  )
}
`
    } else {
      return `// ${moduleName} module

export interface ${moduleName} {
  // Add interface properties here
}

export function ${moduleName.toLowerCase()}() {
  // Add implementation here
}
`
    }
  }

  updateSuccessRate(fixType, success) {
    if (!this.successRate[fixType]) {
      this.successRate[fixType] = { attempts: 0, successes: 0 }
    }
    
    this.successRate[fixType].attempts++
    if (success) {
      this.successRate[fixType].successes++
    }
  }

  getSuccessRate(fixType) {
    const stats = this.successRate[fixType]
    if (!stats || stats.attempts === 0) return 0
    return stats.successes / stats.attempts
  }

  getFixHistory() {
    return this.fixHistory
  }

  getRecentFixes(limit = 10) {
    return this.fixHistory.slice(-limit)
  }

  clearHistory() {
    this.fixHistory = []
    this.successRate = {}
  }
}

module.exports = { IntelligentAutoFixer }
