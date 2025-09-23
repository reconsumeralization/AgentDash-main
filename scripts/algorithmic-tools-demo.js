#!/usr/bin/env node

/**
 * 🧮 ALGORITHMIC TOOLS DEMO
 * Demonstrates the advanced algorithmic MCP tools for competitive programming
 */

const BASE_URL = 'http://localhost:3000'

async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `${BASE_URL}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url)
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.error || 'Unknown error'}`)
    }
    
    return result
  } catch (error) {
    console.error(`Request failed: ${error.message}`)
    throw error
  }
}

async function testSkewHeapOperations() {
  console.log('\n🌳 Testing Skew Heap Operations...')

  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'advanced-algorithmic-tools',
      toolName: 'skew_heap_operations',
      params: {
        n: 4,
        couriers: [
          { from: 1, to: 2 },
          { from: 2, to: 3 },
          { from: 3, to: 4 },
          { from: 1, to: 4 }
        ]
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['algorithmic'],
        environment: 'development',
        metadata: {}
      }
    })

    if (response.success) {
      console.log('✅ Skew heap operations completed successfully')
      console.log('🔍 Debug - Full response:', JSON.stringify(response, null, 2))
      console.log('📊 Results:', response.data?.results)
      console.log('🔗 Total connected pairs:', response.data?.totalConnectedPairs)
      console.log('⚡ Algorithm:', response.data?.algorithm)
      console.log('📈 Complexity:', response.data?.complexity)
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Skew heap operations test failed:', error.message)
    return null
  }
}

async function testBipartiteMatching() {
  console.log('\n🎯 Testing Bipartite Matching...')

  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'advanced-algorithmic-tools',
      toolName: 'bipartite_matching',
      params: {
        cats: [
          { id: 1, pot: 1, likes: [1, 2, 3] },
          { id: 2, pot: 1, likes: [2, 3, 4] },
          { id: 3, pot: 2, likes: [1, 3, 5] },
          { id: 4, pot: 2, likes: [2, 4, 5] }
        ],
        numPots: 5
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['algorithmic'],
        environment: 'development',
        metadata: {}
      }
    })

    if (response.success) {
      console.log('✅ Bipartite matching completed successfully')
      console.log('🎯 Feasible:', response.data.isFeasible)
      console.log('📝 Explanation:', response.data.explanation)
      console.log('⚡ Algorithm:', response.data.algorithm)
      console.log('📈 Complexity:', response.data.complexity)
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Bipartite matching test failed:', error.message)
    return null
  }
}

async function testDigitCountingDP() {
  console.log('\n🔢 Testing Digit Counting DP...')

  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'advanced-algorithmic-tools',
      toolName: 'digit_counting_dp',
      params: {
        maxScore: 100,
        scores: [3, 7, 11]
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['algorithmic'],
        environment: 'development',
        metadata: {}
      }
    })

    if (response.success) {
      console.log('✅ Digit counting DP completed successfully')
      console.log('🔢 Digit counts:', response.data.digitCounts)
      console.log('📝 Explanation:', response.data.explanation)
      console.log('⚡ Algorithm:', response.data.algorithm)
      console.log('📈 Complexity:', response.data.complexity)
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Digit counting DP test failed:', error.message)
    return null
  }
}

async function testInteractiveOptimization() {
  console.log('\n🎮 Testing Interactive Optimization...')

  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'advanced-algorithmic-tools',
      toolName: 'interactive_optimization',
      params: {
        n: 5,
        initialK: 3
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['algorithmic'],
        environment: 'development',
        metadata: {}
      }
    })

    if (response.success) {
      console.log('✅ Interactive optimization completed successfully')
      console.log('🎮 Strategy phases:', response.data.strategy.totalPhases)
      console.log('📊 Estimated moves:', response.data.strategy.estimatedTotalMoves)
      console.log('🎯 Success probability:', response.data.strategy.successProbability)
      console.log('⚡ Algorithm:', response.data.algorithm)
      console.log('📈 Complexity:', response.data.complexity)
      
      response.data.strategy.phases.forEach((phase, index) => {
        console.log(`  Phase ${phase.phase}: ${phase.description} (${phase.moves} moves)`)
      })
      
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Interactive optimization test failed:', error.message)
    return null
  }
}

async function testSubsetSumOdds() {
  console.log('\n🎲 Testing Subset Sum of Odds...')

  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'advanced-algorithmic-tools',
      toolName: 'subset_sum_odds',
      params: {
        n: 4,
        targetHeight: 15
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['algorithmic'],
        environment: 'development',
        metadata: {}
      }
    })

    if (response.success) {
      console.log('✅ Subset sum of odds completed successfully')
      console.log('🎲 Possible:', response.data.possible)
      
      if (response.data.possible) {
        console.log('📊 Heights:', response.data.heights)
        console.log('🏗️ Construction:', response.data.construction)
        console.log('✅ Verification:', response.data.verification)
      } else {
        console.log('❌ Reason:', response.data.reason)
      }
      
      console.log('⚡ Algorithm:', response.data.algorithm)
      console.log('📈 Complexity:', response.data.complexity)
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Subset sum of odds test failed:', error.message)
    return null
  }
}

async function testImpossibleCase() {
  console.log('\n🚫 Testing Impossible Case...')

  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'advanced-algorithmic-tools',
      toolName: 'subset_sum_odds',
      params: {
        n: 4,
        targetHeight: 14 // N² - 2 = 16 - 2 = 14 (impossible for N ≥ 3)
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['algorithmic'],
        environment: 'development',
        metadata: {}
      }
    })

    if (response.success) {
      console.log('✅ Impossible case test completed successfully')
      console.log('🎲 Possible:', response.data.possible)
      console.log('❌ Reason:', response.data.reason)
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Impossible case test failed:', error.message)
    return null
  }
}

async function runAllTests() {
  console.log('🚀 Starting Algorithmic Tools Demo...')
  console.log('='.repeat(50))

  const results = []

  // Test all algorithmic tools
  results.push(await testSkewHeapOperations())
  results.push(await testBipartiteMatching())
  results.push(await testDigitCountingDP())
  results.push(await testInteractiveOptimization())
  results.push(await testSubsetSumOdds())
  results.push(await testImpossibleCase())
  results.push(await testBipartitePotentials())
  results.push(await testIntervalOptimization())

  // Summary
  console.log('\n📊 DEMO SUMMARY')
  console.log('='.repeat(50))
  
  const successful = results.filter(r => r !== null).length
  const total = results.length
  
  console.log(`✅ Successful tests: ${successful}/${total}`)
  console.log(`📈 Success rate: ${((successful / total) * 100).toFixed(1)}%`)
  
  if (successful === total) {
    console.log('🎉 All algorithmic tools are working perfectly!')
  } else {
    console.log('⚠️ Some tests failed - check the logs above')
  }

  console.log('\n🔧 Available Algorithmic Tools:')
  console.log('  • Skew Heap Operations - Tree manipulation with role graphs')
  console.log('  • Bipartite Matching - Hall\'s condition for matching problems')
  console.log('  • Digit Counting DP - Modular arithmetic with dynamic programming')
  console.log('  • Interactive Optimization - Multi-phase strategic algorithms')
  console.log('  • Subset Sum of Odds - Mathematical optimization with unimodal construction')
  console.log('  • Bipartite Potentials - BFS component analysis for graph potentials')
  console.log('  • Interval Optimization - Geometric optimization with interval merging')
  
  console.log('\n💡 These tools provide sophisticated algorithmic solutions for:')
  console.log('  • Competitive programming challenges')
  console.log('  • Mathematical optimization problems')
  console.log('  • Graph theory and combinatorics')
  console.log('  • Interactive problem solving')
  console.log('  • Advanced data structure operations')
}

async function testBipartitePotentials() {
  console.log('\n⚡ Testing Bipartite Potentials...')

  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'advanced-algorithmic-tools',
      toolName: 'bipartite_potentials',
      params: {
        n: 3,
        m: 3,
        k: 4,
        tx: 1,
        ty: 1,
        constraints: [
          { x: 1, y: 1, d: 5 },
          { x: 1, y: 2, d: 3 },
          { x: 2, y: 2, d: 4 },
          { x: 3, y: 3, d: 2 }
        ]
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['algorithmic'],
        environment: 'development',
        metadata: {}
      }
    })

    if (response.success) {
      console.log('✅ Bipartite potentials completed successfully')
      console.log('⚡ Result:', response.data.result)
      console.log('🎯 Possible:', response.data.possible)
      console.log('📝 Explanation:', response.data.explanation)
      console.log('⚡ Algorithm:', response.data.algorithm)
      console.log('📈 Complexity:', response.data.complexity)
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Bipartite potentials test failed:', error.message)
    return null
  }
}

async function testIntervalOptimization() {
  console.log('\n📐 Testing Interval Optimization...')

  try {
    const response = await makeRequest('/api/mcp-extensions/execute', 'POST', {
      extensionId: 'advanced-algorithmic-tools',
      toolName: 'interval_optimization',
      params: {
        n: 3,
        xc: 0,
        yc: 10,
        xa: 0,
        ya: 0,
        rectangles: [
          { x1: 0, y1: 2, x2: 5, y2: 4 },
          { x1: 1, y1: 3, x2: 6, y2: 6 },
          { x1: 2, y1: 7, x2: 7, y2: 9 }
        ]
      },
      context: {
        userId: 'demo-user',
        sessionId: 'demo-session',
        requestId: `req_${Date.now()}`,
        permissions: ['algorithmic'],
        environment: 'development',
        metadata: {}
      }
    })

    if (response.success) {
      console.log('✅ Interval optimization completed successfully')
      console.log('💰 Cost:', response.data.cost)
      console.log('📝 Explanation:', response.data.explanation)
      console.log('⚡ Algorithm:', response.data.algorithm)
      console.log('📈 Complexity:', response.data.complexity)
      return response.data
    } else {
      throw new Error(response.error)
    }
  } catch (error) {
    console.error('❌ Interval optimization test failed:', error.message)
    return null
  }
}

// Run the demo
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  testSkewHeapOperations,
  testBipartiteMatching,
  testDigitCountingDP,
  testInteractiveOptimization,
  testSubsetSumOdds,
  testImpossibleCase,
  runAllTests
}
