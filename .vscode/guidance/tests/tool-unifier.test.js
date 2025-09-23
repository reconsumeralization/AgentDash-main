/**
 * Tool Unifier Tests
 * Tests for the unified search interface that combines ripgrep and grep functionality
 */

const ToolUnifier = require('../lib/tool-unifier');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

describe('ToolUnifier', () => {
  let toolUnifier;
  let testDir;
  let testFiles;

  beforeAll(async () => {
    // Create test directory and files
    testDir = path.join(__dirname, 'test-files');
    await fs.mkdir(testDir, { recursive: true });
    
    // Create test files with known content
    testFiles = {
      'test1.txt': 'This is a test file with some content.\nIt contains multiple lines.\nSearch for "test" in this file.',
      'test2.js': 'function testFunction() {\n  console.log("This is a test function");\n  return "test result";\n}',
      'test3.md': '# Test Document\n\nThis is a **test** document with various content.\n\n## Test Section\n\nMore test content here.',
      'binary.bin': Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05])
    };

    for (const [filename, content] of Object.entries(testFiles)) {
      const filePath = path.join(testDir, filename);
      await fs.writeFile(filePath, content);
    }
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.rmdir(testDir, { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  beforeEach(() => {
    toolUnifier = new ToolUnifier({
      timeout: 10000,
      maxResults: 100
    });
  });

  describe('Initialization', () => {
    test('should initialize with default options', () => {
      expect(toolUnifier.options.preferredTool).toBe('ripgrep');
      expect(toolUnifier.options.fallbackTool).toBe('grep');
      expect(toolUnifier.options.timeout).toBe(10000);
      expect(toolUnifier.options.maxResults).toBe(100);
    });

    test('should initialize with custom options', () => {
      const customUnifier = new ToolUnifier({
        preferredTool: 'grep',
        timeout: 5000,
        maxResults: 50
      });

      expect(customUnifier.options.preferredTool).toBe('grep');
      expect(customUnifier.options.timeout).toBe(5000);
      expect(customUnifier.options.maxResults).toBe(50);
    });

    test('should initialize tool capabilities', () => {
      expect(toolUnifier.toolCapabilities.has('ripgrep')).toBe(true);
      expect(toolUnifier.toolCapabilities.has('grep')).toBe(true);
      
      const ripgrepCapability = toolUnifier.toolCapabilities.get('ripgrep');
      expect(ripgrepCapability.features).toContain('regex');
      expect(ripgrepCapability.features).toContain('performance_optimized');
      
      const grepCapability = toolUnifier.toolCapabilities.get('grep');
      expect(grepCapability.features).toContain('regex');
      expect(grepCapability.features).toContain('case_insensitive');
    });
  });

  describe('Tool Detection', () => {
    test('should detect available tools', async () => {
      await toolUnifier.detectAvailableTools();
      
      // At least one tool should be available (grep is usually available)
      const availableTools = Array.from(toolUnifier.availableTools.values());
      expect(availableTools.some(available => available)).toBe(true);
    });

    test('should check tool availability correctly', async () => {
      // Test with a tool that should exist (grep)
      const grepAvailable = await toolUnifier.checkToolAvailability('grep');
      expect(typeof grepAvailable).toBe('boolean');
      
      // Test with a tool that likely doesn't exist
      const fakeToolAvailable = await toolUnifier.checkToolAvailability('nonexistent-tool-12345');
      expect(fakeToolAvailable).toBe(false);
    });
  });

  describe('Performance Measurement', () => {
    test('should measure tool performance', async () => {
      await toolUnifier.detectAvailableTools();
      await toolUnifier.measureToolPerformance();
      
      // Check that performance metrics were recorded for available tools
      for (const [toolName, isAvailable] of toolUnifier.availableTools) {
        if (isAvailable) {
          const performance = toolUnifier.performanceMetrics.get(toolName);
          expect(performance).toBeDefined();
          expect(typeof performance.duration).toBe('number');
          expect(typeof performance.success).toBe('boolean');
        }
      }
    });

    test('should create and clean up test file', async () => {
      const testFile = await toolUnifier.createTestFile();
      expect(testFile).toBeDefined();
      
      // Check that file exists
      const stats = await fs.stat(testFile);
      expect(stats.isFile()).toBe(true);
      
      // Clean up
      await fs.unlink(testFile);
      
      // Check that file is deleted
      await expect(fs.stat(testFile)).rejects.toThrow();
    });
  });

  describe('Tool Selection', () => {
    test('should select primary tool correctly', async () => {
      await toolUnifier.detectAvailableTools();
      
      const primaryTool = toolUnifier.getPrimaryTool();
      expect(primaryTool).toBeDefined();
      expect(toolUnifier.availableTools.get(primaryTool)).toBe(true);
    });

    test('should select fallback tool correctly', async () => {
      await toolUnifier.detectAvailableTools();
      
      const fallbackTool = toolUnifier.getFallbackTool();
      if (fallbackTool) {
        expect(toolUnifier.availableTools.get(fallbackTool)).toBe(true);
      }
    });

    test('should prefer ripgrep over grep when both available', async () => {
      // Mock both tools as available
      toolUnifier.availableTools.set('ripgrep', true);
      toolUnifier.availableTools.set('grep', true);
      
      const primaryTool = toolUnifier.getPrimaryTool();
      expect(primaryTool).toBe('ripgrep');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      await toolUnifier.detectAvailableTools();
    });

    test('should perform basic search', async () => {
      const results = await toolUnifier.search({
        pattern: 'test',
        path: testDir,
        maxResults: 10
      });

      expect(results).toBeDefined();
      expect(results.tool).toBeDefined();
      expect(Array.isArray(results.results)).toBe(true);
      expect(typeof results.totalMatches).toBe('number');
      expect(results.totalMatches).toBeGreaterThan(0);
    });

    test('should handle case-insensitive search', async () => {
      const results = await toolUnifier.search({
        pattern: 'TEST',
        path: testDir,
        caseSensitive: false,
        maxResults: 10
      });

      expect(results.totalMatches).toBeGreaterThan(0);
      
      // Check that results contain matches regardless of case
      const hasMatches = results.results.some(result => 
        result.text.toLowerCase().includes('test')
      );
      expect(hasMatches).toBe(true);
    });

    test('should respect max results limit', async () => {
      const maxResults = 2;
      const results = await toolUnifier.search({
        pattern: 'test',
        path: testDir,
        maxResults
      });

      expect(results.results.length).toBeLessThanOrEqual(maxResults);
    });

    test('should handle regex patterns', async () => {
      const results = await toolUnifier.search({
        pattern: 'test.*function',
        path: testDir,
        maxResults: 10
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results.results)).toBe(true);
    });

    test('should throw error for empty pattern', async () => {
      await expect(toolUnifier.search({
        pattern: '',
        path: testDir
      })).rejects.toThrow('Search pattern is required');
    });

    test('should throw error when no tools available', async () => {
      // Mock no tools available
      toolUnifier.availableTools.clear();
      
      await expect(toolUnifier.search({
        pattern: 'test',
        path: testDir
      })).rejects.toThrow('No search tools available');
    });
  });

  describe('Fallback Mechanism', () => {
    test('should fallback to secondary tool when primary fails', async () => {
      // Mock primary tool failure
      const originalPerformSearch = toolUnifier.performSearch;
      toolUnifier.performSearch = jest.fn()
        .mockRejectedValueOnce(new Error('Primary tool failed'))
        .mockResolvedValueOnce({
          tool: 'grep',
          results: [{ file: 'test.txt', line: 1, text: 'test content' }],
          totalMatches: 1
        });

      // Mock both tools available
      toolUnifier.availableTools.set('ripgrep', true);
      toolUnifier.availableTools.set('grep', true);

      const results = await toolUnifier.search({
        pattern: 'test',
        path: testDir
      });

      expect(results.tool).toBe('grep');
      expect(toolUnifier.performSearch).toHaveBeenCalledTimes(2);
    });

    test('should throw error when both tools fail', async () => {
      // Mock both tools failing
      toolUnifier.performSearch = jest.fn()
        .mockRejectedValue(new Error('Tool failed'));

      // Mock both tools available
      toolUnifier.availableTools.set('ripgrep', true);
      toolUnifier.availableTools.set('grep', true);

      await expect(toolUnifier.search({
        pattern: 'test',
        path: testDir
      })).rejects.toThrow('Tool failed');
    });
  });

  describe('Result Parsing', () => {
    test('should parse ripgrep JSON results correctly', () => {
      const mockRipgrepOutput = JSON.stringify({
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

      const results = toolUnifier.parseRipgrepResults(mockRipgrepOutput);
      
      expect(results.tool).toBe('ripgrep');
      expect(results.results).toHaveLength(1);
      expect(results.results[0].file).toBe('test.txt');
      expect(results.results[0].line).toBe(1);
      expect(results.results[0].text).toBe('This is a test line');
      expect(results.results[0].match).toBe('test');
    });

    test('should parse grep results correctly', () => {
      const mockGrepOutput = 'test.txt:1:This is a test line\ntest.txt:2:Another test line';
      
      const results = toolUnifier.parseGrepResults(mockGrepOutput);
      
      expect(results.tool).toBe('grep');
      expect(results.results).toHaveLength(2);
      expect(results.results[0].file).toBe('test.txt');
      expect(results.results[0].line).toBe(1);
      expect(results.results[0].text).toBe('This is a test line');
    });

    test('should handle empty results', () => {
      const ripgrepResults = toolUnifier.parseRipgrepResults('');
      expect(ripgrepResults.results).toHaveLength(0);
      expect(ripgrepResults.totalMatches).toBe(0);

      const grepResults = toolUnifier.parseGrepResults('');
      expect(grepResults.results).toHaveLength(0);
      expect(grepResults.totalMatches).toBe(0);
    });
  });

  describe('Command Execution', () => {
    test('should execute command successfully', async () => {
      const result = await toolUnifier.executeCommand('echo', ['hello'], { timeout: 5000 });
      
      expect(result.success).toBe(true);
      expect(result.output.trim()).toBe('hello');
      expect(result.error).toBeNull();
    });

    test('should handle command failure', async () => {
      const result = await toolUnifier.executeCommand('nonexistent-command-12345', [], { timeout: 5000 });
      
      expect(result.success).toBe(false);
      expect(result.output).toBe('');
      expect(result.error).toBeDefined();
    });

    test('should handle command timeout', async () => {
      const result = await toolUnifier.executeCommand('sleep', ['10'], { timeout: 1000 });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
    });
  });

  describe('Validation', () => {
    test('should validate search options correctly', () => {
      const validOptions = {
        pattern: 'test',
        path: '.',
        maxResults: 100
      };
      
      const validation = toolUnifier.validateSearchOptions(validOptions);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect invalid search options', () => {
      const invalidOptions = {
        pattern: '',
        maxResults: -1,
        path: 123
      };
      
      const validation = toolUnifier.validateSearchOptions(invalidOptions);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors).toContain('Search pattern is required');
      expect(validation.errors).toContain('Max results must be between 1 and 10000');
      expect(validation.errors).toContain('Path must be a string');
    });
  });

  describe('Statistics and Metrics', () => {
    test('should provide tool statistics', async () => {
      await toolUnifier.detectAvailableTools();
      await toolUnifier.measureToolPerformance();
      
      const stats = toolUnifier.getStats();
      
      expect(stats.availableTools).toBeDefined();
      expect(Array.isArray(stats.availableTools)).toBe(true);
      expect(stats.primaryTool).toBeDefined();
      expect(stats.performanceMetrics).toBeDefined();
      expect(stats.capabilities).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle file system errors gracefully', async () => {
      // Mock fs.promises.writeFile to throw an error
      const originalWriteFile = fs.writeFile;
      fs.writeFile = jest.fn().mockRejectedValue(new Error('File system error'));
      
      await expect(toolUnifier.createTestFile()).rejects.toThrow('File system error');
      
      // Restore original function
      fs.writeFile = originalWriteFile;
    });

    test('should handle invalid JSON in ripgrep results', () => {
      const invalidJsonOutput = '{"invalid": json}\n{"valid": "json"}';
      
      // Should not throw error, just skip invalid lines
      expect(() => {
        toolUnifier.parseRipgrepResults(invalidJsonOutput);
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should work end-to-end with real files', async () => {
      await toolUnifier.initialize();
      
      const results = await toolUnifier.search({
        pattern: 'test',
        path: testDir,
        maxResults: 5
      });

      expect(results).toBeDefined();
      expect(results.tool).toBeDefined();
      expect(results.results.length).toBeGreaterThan(0);
      
      // Verify that results contain actual file matches
      const hasRealMatches = results.results.some(result => 
        result.file && result.line && result.text
      );
      expect(hasRealMatches).toBe(true);
    });

    test('should handle different file types', async () => {
      await toolUnifier.initialize();
      
      // Search in specific file types
      const txtResults = await toolUnifier.search({
        pattern: 'test',
        path: path.join(testDir, 'test1.txt'),
        maxResults: 10
      });

      const jsResults = await toolUnifier.search({
        pattern: 'function',
        path: path.join(testDir, 'test2.js'),
        maxResults: 10
      });

      expect(txtResults.totalMatches).toBeGreaterThan(0);
      expect(jsResults.totalMatches).toBeGreaterThan(0);
    });
  });
});

// Mock implementations for testing
jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

// Helper function to create mock spawn
const createMockSpawn = (stdout, stderr, exitCode = 0) => {
  return jest.fn().mockReturnValue({
    stdout: {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'data') {
          setTimeout(() => callback(Buffer.from(stdout)), 0);
        }
      })
    },
    stderr: {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'data') {
          setTimeout(() => callback(Buffer.from(stderr)), 0);
        }
      })
    },
    on: jest.fn().mockImplementation((event, callback) => {
      if (event === 'close') {
        setTimeout(() => callback(exitCode), 0);
      }
    }),
    kill: jest.fn()
  });
};
