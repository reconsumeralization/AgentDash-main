/**
 * 🚀 NATIVE MCP EXTENSIONS DEMO
 * Demonstrates the native MCP extension system capabilities
 */

const BASE_URL = 'http://localhost:3000'

// Demo data
const demoCode = `
function processUserData(userData) {
  // Potential SQL injection vulnerability
  const query = "SELECT * FROM users WHERE id = " + userData.id;
  
  // Potential XSS vulnerability
  document.getElementById('output').innerHTML = userData.name;
  
  // Path traversal vulnerability
  const filePath = "../../../etc/passwd";
  const content = fs.readFileSync(filePath);
  
  return content;
}
`

const demoTree = {
  root: 1,
  nodes: {
    1: { L: 2, R: 3, P: 0 },
    2: { L: 4, R: 0, P: 1 },
    3: { L: 5, R: 6, P: 1 },
    4: { L: 0, R: 0, P: 2 },
    5: { L: 0, R: 0, P: 3 },
    6: { L: 0, R: 0, P: 3 }
  }
}

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`)
    }
    
    return data
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`)
    throw error
  }
}

async function testExtensionRegistry() {
  console.log('\n🔍 Testing Extension Registry...')
  
  try {
    const response = await makeRequest('/api/mcp-extensions')
    
    if (response.success) {
      console.log('✅ Extension registry loaded successfully')
      console.log(`📊 Found ${response.data.extensions.length} extensions`)
      console.log(`🛠️  Found ${response.data.tools.length} tools`)
      
      // Display extensions
      response.data.extensions.forEach(ext => {
        console.log(`  📦 ${ext.name} (${ext.id}) - ${ext.toolCount} tools`)
      })
      
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Failed to load extension registry:', error.message)
    return null
  }
}

async function testCodeAnalysis() {
  console.log('\n🔍 Testing Code Analysis Extension...')
  
  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'code-analysis',
      toolName: 'scan_vulnerabilities',
      params: {
        code: demoCode,
        language: 'javascript',
        scanLevel: 'deep'
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['fileSystem'],
        environment: 'development',
        metadata: {}
      }
    })
    
    if (response.success) {
      console.log('✅ Code analysis completed successfully')
      console.log(`🛡️  Security Score: ${response.data.data.securityScore}/100`)
      console.log(`🚨 Found ${response.data.data.vulnerabilities.length} vulnerabilities`)
      
      response.data.data.vulnerabilities.forEach(vuln => {
        console.log(`  ⚠️  ${vuln.type.toUpperCase()} (${vuln.severity}) - Line ${vuln.line}`)
        console.log(`     ${vuln.description}`)
      })
      
      if (response.data.data.recommendations.length > 0) {
        console.log('💡 Recommendations:')
        response.data.data.recommendations.forEach(rec => {
          console.log(`  • ${rec}`)
        })
      }
      
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Code analysis failed:', error.message)
    return null
  }
}

async function testCodeQuality() {
  console.log('\n🔍 Testing Code Quality Analysis...')
  
  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'code-analysis',
      toolName: 'analyze_quality',
      params: {
        code: demoCode,
        language: 'javascript',
        metrics: ['complexity', 'maintainability', 'readability', 'performance', 'documentation']
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['fileSystem'],
        environment: 'development',
        metadata: {}
      }
    })
    
    if (response.success) {
      console.log('✅ Code quality analysis completed successfully')
      console.log(`📊 Overall Score: ${response.data.data.overallScore.toFixed(1)}/100`)
      
      const metrics = response.data.data.metrics
      console.log('📈 Quality Metrics:')
      Object.entries(metrics).forEach(([metric, score]) => {
        console.log(`  • ${metric}: ${score.toFixed(1)}/100`)
      })
      
      if (response.data.data.issues.length > 0) {
        console.log(`🔧 Found ${response.data.data.issues.length} quality issues:`)
        response.data.data.issues.forEach(issue => {
          console.log(`  • ${issue.type} (${issue.severity}) - Line ${issue.line}: ${issue.message}`)
        })
      }
      
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Code quality analysis failed:', error.message)
    return null
  }
}

async function testAlgorithmicTools() {
  console.log('\n🔍 Testing Algorithmic Tools Extension...')
  
  try {
    // Test skew heap operations
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'algorithmic-tools',
      toolName: 'skew_heap_operations',
      params: {
        operation: 'find_candidates',
        tree: demoTree
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: [],
        environment: 'development',
        metadata: {}
      }
    })
    
    if (response.success) {
      console.log('✅ Skew heap operations completed successfully')
      console.log(`🎯 Found ${response.data.data.candidates.length} candidates`)
      console.log(`📋 Candidates: [${response.data.data.candidates.join(', ')}]`)
      console.log(`📝 Result: ${response.data.data.result}`)
      
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Algorithmic tools test failed:', error.message)
    return null
  }
}

async function testSortingAlgorithm() {
  console.log('\n🔍 Testing Sorting Algorithm...')
  
  try {
    const testArray = [64, 34, 25, 12, 22, 11, 90, 5, 77, 30]
    
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'algorithmic-tools',
      toolName: 'sort_array',
      params: {
        array: testArray,
        algorithm: 'quicksort'
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: [],
        environment: 'development',
        metadata: {}
      }
    })
    
    if (response.success) {
      console.log('✅ Sorting algorithm completed successfully')
      console.log(`📊 Original array: [${testArray.join(', ')}]`)
      console.log(`📊 Sorted array: [${response.data.data.sortedArray.join(', ')}]`)
      console.log(`🔄 Comparisons: ${response.data.data.comparisons}`)
      console.log(`🔄 Swaps: ${response.data.data.swaps}`)
      console.log(`⚡ Algorithm: ${response.data.data.algorithm}`)
      
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Sorting algorithm test failed:', error.message)
    return null
  }
}

async function testDevelopmentTools() {
  console.log('\n🔍 Testing Development Tools Extension...')
  
  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'development-tools',
      toolName: 'generate_code',
      params: {
        type: 'function',
        language: 'typescript',
        description: 'A function that calculates the factorial of a number',
        options: {
          includeTests: true,
          includeDocumentation: true
        }
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['fileSystem', 'development'],
        environment: 'development',
        metadata: {}
      }
    })
    
    if (response.success) {
      console.log('✅ Code generation completed successfully')
      console.log('🔍 Debug - Response structure:', JSON.stringify(response.data, null, 2))
      console.log('📝 Generated Code:')
      console.log(response.data.data.code)
      
      if (response.data.data.tests) {
        console.log('\n🧪 Generated Tests:')
        console.log(response.data.data.tests)
      }
      
      if (response.data.data.documentation) {
        console.log('\n📚 Generated Documentation:')
        console.log(response.data.data.documentation)
      }
      
      if (response.data.data.suggestions && response.data.data.suggestions.length > 0) {
        console.log('\n💡 Suggestions:')
        response.data.data.suggestions.forEach(suggestion => {
          console.log(`  • ${suggestion}`)
        })
      }
      
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Development tools test failed:', error.message)
    return null
  }
}

async function testPerformanceProfiling() {
  console.log('\n🔍 Testing Performance Profiling...')
  
  try {
    const testCode = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function optimizedFibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}
`
    
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'development-tools',
      toolName: 'profile_performance',
      params: {
        code: testCode,
        language: 'javascript',
        iterations: 1000
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['fileSystem', 'development'],
        environment: 'development',
        metadata: {}
      }
    })
    
    if (response.success) {
      console.log('✅ Performance profiling completed successfully')
      console.log(`⏱️  Execution Time: ${response.data.data.executionTime}ms`)
      console.log(`💾 Memory Usage: ${response.data.data.memoryUsage} bytes`)
      
      if (response.data.data.bottlenecks.length > 0) {
        console.log('🚨 Bottlenecks Detected:')
        response.data.data.bottlenecks.forEach(bottleneck => {
          console.log(`  • ${bottleneck}`)
        })
      }
      
      if (response.data.data.recommendations.length > 0) {
        console.log('💡 Performance Recommendations:')
        response.data.data.recommendations.forEach(rec => {
          console.log(`  • ${rec}`)
        })
      }
      
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Performance profiling test failed:', error.message)
    return null
  }
}

async function runAllTests() {
  console.log('🚀 Starting Native MCP Extensions Demo')
  console.log('=' .repeat(50))
  
  const results = {
    registry: false,
    codeAnalysis: false,
    codeQuality: false,
    algorithmicTools: false,
    sorting: false,
    developmentTools: false,
    performance: false
  }
  
  try {
    // Test extension registry
    const registryData = await testExtensionRegistry()
    results.registry = !!registryData
    
    // Test code analysis
    const codeAnalysisResult = await testCodeAnalysis()
    results.codeAnalysis = !!codeAnalysisResult
    
    // Test code quality
    const codeQualityResult = await testCodeQuality()
    results.codeQuality = !!codeQualityResult
    
    // Test algorithmic tools
    const algorithmicResult = await testAlgorithmicTools()
    results.algorithmicTools = !!algorithmicResult
    
    // Test sorting
    const sortingResult = await testSortingAlgorithm()
    results.sorting = !!sortingResult
    
    // Test development tools
    const devToolsResult = await testDevelopmentTools()
    results.developmentTools = !!devToolsResult
    
    // Test performance profiling
    const performanceResult = await testPerformanceProfiling()
    results.performance = !!performanceResult
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message)
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50))
  console.log('📊 DEMO SUMMARY')
  console.log('=' .repeat(50))
  
  const totalTests = Object.keys(results).length
  const passedTests = Object.values(results).filter(Boolean).length
  
  console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`)
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  console.log('\n📋 Test Results:')
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌'
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    console.log(`  ${status} ${testName}`)
  })
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Native MCP Extensions are working perfectly!')
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.')
  }
  
  console.log('\n🔗 Access the MCP Extensions UI at: http://localhost:3000/mcp-extensions')
}

// Run the demo
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  runAllTests,
  testExtensionRegistry,
  testCodeAnalysis,
  testCodeQuality,
  testAlgorithmicTools,
  testSortingAlgorithm,
  testDevelopmentTools,
  testPerformanceProfiling
}
