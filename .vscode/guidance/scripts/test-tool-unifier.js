#!/usr/bin/env node

/**
 * Test Runner for Tool Unifier
 * Simple test script to validate the tool unifier implementation
 */

const ToolUnifier = require('../lib/tool-unifier');
const fs = require('fs').promises;
const path = require('path');

async function runTests() {
  console.log('🧪 Running Tool Unifier Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  const test = async (name, testFn) => {
    try {
      await testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  };
  
  // Test 1: Basic initialization
  await test('Basic initialization', async () => {
    const unifier = new ToolUnifier();
    if (!unifier.options) {
      throw new Error('Options not initialized');
    }
    if (unifier.options.preferredTool !== 'ripgrep') {
      throw new Error('Default preferred tool should be ripgrep');
    }
  });
  
  // Test 2: Tool detection
  await test('Tool detection', async () => {
    const unifier = new ToolUnifier();
    await unifier.detectAvailableTools();
    
    const availableTools = Array.from(unifier.availableTools.values());
    if (availableTools.length === 0) {
      throw new Error('No tools detected - at least grep should be available');
    }
    
    const hasAvailableTool = availableTools.some(available => available);
    if (!hasAvailableTool) {
      throw new Error('No available tools found');
    }
  });
  
  // Test 3: Tool selection
  await test('Tool selection', async () => {
    const unifier = new ToolUnifier();
    await unifier.detectAvailableTools();
    
    const primaryTool = unifier.getPrimaryTool();
    if (!primaryTool) {
      throw new Error('No primary tool selected');
    }
    
    const isAvailable = unifier.availableTools.get(primaryTool);
    if (!isAvailable) {
      throw new Error('Primary tool is not available');
    }
  });
  
  // Test 4: Search functionality
  await test('Search functionality', async () => {
    const unifier = new ToolUnifier();
    await unifier.detectAvailableTools();
    
    // Create a temporary test file
    const testDir = path.join(__dirname, 'test-temp');
    await fs.mkdir(testDir, { recursive: true });
    
    const testFile = path.join(testDir, 'test.txt');
    await fs.writeFile(testFile, 'This is a test file with some content.\nIt contains the word test multiple times.\n');
    
    try {
      const results = await unifier.search({
        pattern: 'test',
        path: testDir,
        maxResults: 10
      });
      
      if (!results) {
        throw new Error('No results returned');
      }
      
      if (!results.tool) {
        throw new Error('No tool specified in results');
      }
      
      if (!Array.isArray(results.results)) {
        throw new Error('Results should be an array');
      }
      
      if (typeof results.totalMatches !== 'number') {
        throw new Error('Total matches should be a number');
      }
      
      if (results.totalMatches === 0) {
        throw new Error('Should find at least one match');
      }
      
    } finally {
      // Clean up
      await fs.unlink(testFile).catch(() => {});
      await fs.rmdir(testDir).catch(() => {});
    }
  });
  
  // Test 5: Error handling
  await test('Error handling', async () => {
    const unifier = new ToolUnifier();
    await unifier.detectAvailableTools();
    
    try {
      await unifier.search({
        pattern: '', // Empty pattern should fail
        path: '.'
      });
      throw new Error('Should have thrown error for empty pattern');
    } catch (error) {
      if (!error.message.includes('Search pattern is required')) {
        throw new Error('Wrong error message for empty pattern');
      }
    }
  });
  
  // Test 6: Validation
  await test('Option validation', async () => {
    const unifier = new ToolUnifier();
    
    const validation = unifier.validateSearchOptions({
      pattern: 'test',
      maxResults: 100
    });
    
    if (!validation.isValid) {
      throw new Error('Valid options should pass validation');
    }
    
    const invalidValidation = unifier.validateSearchOptions({
      pattern: '',
      maxResults: -1
    });
    
    if (invalidValidation.isValid) {
      throw new Error('Invalid options should fail validation');
    }
    
    if (invalidValidation.errors.length === 0) {
      throw new Error('Should have validation errors');
    }
  });
  
  // Test 7: Performance metrics
  await test('Performance metrics', async () => {
    const unifier = new ToolUnifier();
    await unifier.detectAvailableTools();
    await unifier.measureToolPerformance();
    
    const stats = unifier.getStats();
    
    if (!stats.availableTools) {
      throw new Error('Stats should include available tools');
    }
    
    if (!stats.primaryTool) {
      throw new Error('Stats should include primary tool');
    }
    
    if (!stats.performanceMetrics) {
      throw new Error('Stats should include performance metrics');
    }
  });
  
  // Test 8: Fallback mechanism
  await test('Fallback mechanism', async () => {
    const unifier = new ToolUnifier();
    await unifier.detectAvailableTools();
    
    // Mock primary tool failure
    const originalPerformSearch = unifier.performSearch;
    let callCount = 0;
    
    unifier.performSearch = async (toolName, options) => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Primary tool failed');
      }
      return {
        tool: 'grep',
        results: [{ file: 'test.txt', line: 1, text: 'test content', match: 'test' }],
        totalMatches: 1
      };
    };
    
    // Mock both tools available
    unifier.availableTools.set('ripgrep', true);
    unifier.availableTools.set('grep', true);
    
    const results = await unifier.search({
      pattern: 'test',
      path: '.'
    });
    
    if (results.tool !== 'grep') {
      throw new Error('Should have fallen back to grep');
    }
    
    if (callCount !== 2) {
      throw new Error('Should have called performSearch twice');
    }
    
    // Restore original method
    unifier.performSearch = originalPerformSearch;
  });
  
  // Test 9: Result parsing
  await test('Result parsing', async () => {
    const unifier = new ToolUnifier();
    
    // Test ripgrep parsing
    const ripgrepOutput = JSON.stringify({
      type: 'match',
      data: {
        path: { text: 'test.txt' },
        line_number: 1,
        lines: { text: 'This is a test line' },
        submatches: [{
          match: { text: 'test' },
          start: 10,
          end: 14
        }]
      }
    });
    
    const ripgrepResults = unifier.parseRipgrepResults(ripgrepOutput);
    
    if (ripgrepResults.tool !== 'ripgrep') {
      throw new Error('Should parse as ripgrep results');
    }
    
    if (ripgrepResults.results.length !== 1) {
      throw new Error('Should parse one result');
    }
    
    if (ripgrepResults.results[0].file !== 'test.txt') {
      throw new Error('Should parse file name correctly');
    }
    
    // Test grep parsing
    const grepOutput = 'test.txt:1:This is a test line';
    const grepResults = unifier.parseGrepResults(grepOutput);
    
    if (grepResults.tool !== 'grep') {
      throw new Error('Should parse as grep results');
    }
    
    if (grepResults.results.length !== 1) {
      throw new Error('Should parse one grep result');
    }
    
    if (grepResults.results[0].file !== 'test.txt') {
      throw new Error('Should parse grep file name correctly');
    }
  });
  
  // Test 10: Command execution
  await test('Command execution', async () => {
    const unifier = new ToolUnifier();
    
    // Test successful command
    const successResult = await unifier.executeCommand('echo', ['hello'], { timeout: 5000 });
    
    if (!successResult.success) {
      throw new Error('Echo command should succeed');
    }
    
    if (!successResult.output.includes('hello')) {
      throw new Error('Echo output should contain hello');
    }
    
    // Test failed command
    const failResult = await unifier.executeCommand('nonexistent-command-12345', [], { timeout: 5000 });
    
    if (failResult.success) {
      throw new Error('Nonexistent command should fail');
    }
    
    if (!failResult.error) {
      throw new Error('Failed command should have error message');
    }
  });
  
  // Summary
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log(`\n❌ Some tests failed. Please check the implementation.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All tests passed! Tool Unifier is working correctly.`);
    process.exit(0);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests };