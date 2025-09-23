/**
 * Tool Unifier - Unifies ripGrep and grep tools for consistent search functionality
 * Addresses GitHub Issue #9022: Unify ripGrep and grep tools
 * 
 * This module provides a unified interface for text search operations,
 * automatically detecting and using the best available tool (ripgrep preferred, grep fallback).
 */

const { spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

class ToolUnifier {
  constructor(options = {}) {
    this.options = {
      preferredTool: 'ripgrep',
      fallbackTool: 'grep',
      timeout: 30000,
      maxResults: 1000,
      ...options
    };
    
    this.availableTools = new Map();
    this.toolCapabilities = new Map();
    this.performanceMetrics = new Map();
    
    this.initializeToolCapabilities();
  }

  /**
   * Initialize tool capabilities and detection
   */
  async initialize() {
    await this.detectAvailableTools();
    await this.measureToolPerformance();
    this.logToolStatus();
  }

  /**
   * Initialize tool capabilities mapping
   */
  initializeToolCapabilities() {
    this.toolCapabilities.set('ripgrep', {
      name: 'ripgrep',
      command: 'rg',
      features: [
        'regex',
        'case_insensitive',
        'multiline',
        'unicode',
        'binary_detection',
        'gitignore_support',
        'performance_optimized'
      ],
      performance: 'high',
      reliability: 'high'
    });

    this.toolCapabilities.set('grep', {
      name: 'grep',
      command: 'grep',
      features: [
        'regex',
        'case_insensitive',
        'multiline',
        'basic_unicode'
      ],
      performance: 'medium',
      reliability: 'high'
    });
  }

  /**
   * Detect available tools on the system
   */
  async detectAvailableTools() {
    const tools = ['ripgrep', 'grep'];
    
    for (const tool of tools) {
      const capability = this.toolCapabilities.get(tool);
      if (capability) {
        const isAvailable = await this.checkToolAvailability(capability.command);
        this.availableTools.set(tool, isAvailable);
        
        if (isAvailable) {
          console.log(`✅ ${tool} (${capability.command}) is available`);
        } else {
          console.log(`❌ ${tool} (${capability.command}) is not available`);
        }
      }
    }
  }

  /**
   * Check if a tool is available on the system
   */
  async checkToolAvailability(command) {
    try {
      const result = await this.executeCommand(command, ['--version'], { timeout: 5000 });
      return result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Measure tool performance for optimization
   */
  async measureToolPerformance() {
    const testFile = await this.createTestFile();
    
    for (const [toolName, isAvailable] of this.availableTools) {
      if (isAvailable) {
        const capability = this.toolCapabilities.get(toolName);
        if (capability) {
          const performance = await this.benchmarkTool(capability, testFile);
          this.performanceMetrics.set(toolName, performance);
        }
      }
    }
    
    // Clean up test file
    await fs.unlink(testFile).catch(() => {});
  }

  /**
   * Create a test file for performance benchmarking
   */
  async createTestFile() {
    const testContent = Array.from({ length: 1000 }, (_, i) => 
      `Line ${i}: This is a test line with some content for performance testing.`
    ).join('\n');
    
    const testFile = path.join(process.cwd(), '.tool-unifier-test.txt');
    await fs.writeFile(testFile, testContent);
    return testFile;
  }

  /**
   * Benchmark a tool's performance
   */
  async benchmarkTool(capability, testFile) {
    const startTime = Date.now();
    
    try {
      const result = await this.executeCommand(
        capability.command,
        ['test', testFile],
        { timeout: 10000 }
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return {
        duration,
        success: result.success,
        outputSize: result.output.length,
        throughput: result.output.length / (duration / 1000) // bytes per second
      };
    } catch (error) {
      return {
        duration: -1,
        success: false,
        outputSize: 0,
        throughput: 0,
        error: error.message
      };
    }
  }

  /**
   * Log tool status and capabilities
   */
  logToolStatus() {
    console.log('\n🔧 Tool Unifier Status:');
    console.log('======================');
    
    for (const [toolName, isAvailable] of this.availableTools) {
      if (isAvailable) {
        const capability = this.toolCapabilities.get(toolName);
        const performance = this.performanceMetrics.get(toolName);
        
        console.log(`\n📋 ${toolName.toUpperCase()}:`);
        console.log(`   Command: ${capability.command}`);
        console.log(`   Features: ${capability.features.join(', ')}`);
        console.log(`   Performance: ${capability.performance}`);
        console.log(`   Reliability: ${capability.reliability}`);
        
        if (performance) {
          console.log(`   Benchmark: ${performance.duration}ms, ${performance.throughput.toFixed(2)} bytes/sec`);
        }
      }
    }
    
    const primaryTool = this.getPrimaryTool();
    const fallbackTool = this.getFallbackTool();
    
    console.log(`\n🎯 Primary Tool: ${primaryTool || 'None'}`);
    console.log(`🔄 Fallback Tool: ${fallbackTool || 'None'}`);
  }

  /**
   * Get the primary tool for search operations
   */
  getPrimaryTool() {
    if (this.availableTools.get(this.options.preferredTool)) {
      return this.options.preferredTool;
    }
    
    // Find the best available tool based on performance
    let bestTool = null;
    let bestPerformance = -1;
    
    for (const [toolName, isAvailable] of this.availableTools) {
      if (isAvailable) {
        const performance = this.performanceMetrics.get(toolName);
        if (performance && performance.throughput > bestPerformance) {
          bestPerformance = performance.throughput;
          bestTool = toolName;
        }
      }
    }
    
    return bestTool;
  }

  /**
   * Get the fallback tool for search operations
   */
  getFallbackTool() {
    const primaryTool = this.getPrimaryTool();
    
    for (const [toolName, isAvailable] of this.availableTools) {
      if (isAvailable && toolName !== primaryTool) {
        return toolName;
      }
    }
    
    return null;
  }

  /**
   * Unified search interface
   */
  async search(options = {}) {
    const searchOptions = {
      pattern: options.pattern || '',
      path: options.path || '.',
      caseSensitive: options.caseSensitive || false,
      multiline: options.multiline || false,
      maxResults: options.maxResults || this.options.maxResults,
      includeBinary: options.includeBinary || false,
      gitignore: options.gitignore !== false, // Default to true
      ...options
    };

    if (!searchOptions.pattern) {
      throw new Error('Search pattern is required');
    }

    const primaryTool = this.getPrimaryTool();
    if (!primaryTool) {
      throw new Error('No search tools available');
    }

    try {
      return await this.performSearch(primaryTool, searchOptions);
    } catch (error) {
      console.warn(`Primary tool ${primaryTool} failed: ${error.message}`);
      
      const fallbackTool = this.getFallbackTool();
      if (fallbackTool && fallbackTool !== primaryTool) {
        console.log(`Falling back to ${fallbackTool}`);
        return await this.performSearch(fallbackTool, searchOptions);
      }
      
      throw error;
    }
  }

  /**
   * Perform search with a specific tool
   */
  async performSearch(toolName, options) {
    const capability = this.toolCapabilities.get(toolName);
    if (!capability) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    const args = this.buildToolArguments(toolName, options);
    const result = await this.executeCommand(capability.command, args, {
      timeout: this.options.timeout,
      cwd: options.path
    });

    if (!result.success) {
      throw new Error(`Search failed: ${result.error}`);
    }

    return this.parseSearchResults(toolName, result.output, options);
  }

  /**
   * Build command line arguments for a specific tool
   */
  buildToolArguments(toolName, options) {
    const args = [];

    if (toolName === 'ripgrep') {
      args.push(options.pattern);
      
      if (!options.caseSensitive) {
        args.push('-i');
      }
      
      if (options.multiline) {
        args.push('-U');
      }
      
      if (options.maxResults) {
        args.push('-m', options.maxResults.toString());
      }
      
      if (options.includeBinary) {
        args.push('-a');
      } else {
        args.push('--binary-files=without-match');
      }
      
      if (options.gitignore) {
        args.push('--no-ignore-vcs');
      } else {
        args.push('--no-ignore');
      }
      
      args.push('--json');
      args.push('--');
      args.push('.');
      
    } else if (toolName === 'grep') {
      if (!options.caseSensitive) {
        args.push('-i');
      }
      
      if (options.multiline) {
        args.push('-P');
      } else {
        args.push('-E');
      }
      
      if (options.maxResults) {
        args.push('-m', options.maxResults.toString());
      }
      
      if (!options.includeBinary) {
        args.push('-I');
      }
      
      args.push('-r');
      args.push('-n');
      args.push(options.pattern);
      args.push('.');
    }

    return args;
  }

  /**
   * Parse search results based on tool type
   */
  parseSearchResults(toolName, output, options) {
    if (toolName === 'ripgrep') {
      return this.parseRipgrepResults(output);
    } else if (toolName === 'grep') {
      return this.parseGrepResults(output);
    }
    
    throw new Error(`Unknown tool for result parsing: ${toolName}`);
  }

  /**
   * Parse ripgrep JSON output
   */
  parseRipgrepResults(output) {
    const lines = output.trim().split('\n');
    const results = [];
    
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.type === 'match') {
          results.push({
            file: data.data.path.text,
            line: data.data.line_number,
            column: data.data.submatches[0]?.start || 0,
            text: data.data.lines.text.trim(),
            match: data.data.submatches[0]?.match?.text || ''
          });
        }
      } catch (error) {
        // Skip invalid JSON lines
        continue;
      }
    }
    
    return {
      tool: 'ripgrep',
      results,
      totalMatches: results.length
    };
  }

  /**
   * Parse grep output
   */
  parseGrepResults(output) {
    const lines = output.trim().split('\n');
    const results = [];
    
    for (const line of lines) {
      if (line.trim()) {
        const match = line.match(/^([^:]+):(\d+):(.*)$/);
        if (match) {
          results.push({
            file: match[1],
            line: parseInt(match[2]),
            column: 0,
            text: match[3],
            match: match[3] // grep doesn't provide match highlighting
          });
        }
      }
    }
    
    return {
      tool: 'grep',
      results,
      totalMatches: results.length
    };
  }

  /**
   * Execute a command with timeout and error handling
   */
  async executeCommand(command, args, options = {}) {
    return new Promise((resolve) => {
      const process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: options.cwd || process.cwd()
      });

      let output = '';
      let errorOutput = '';
      let timeoutId = null;

      // Set up timeout
      if (options.timeout) {
        timeoutId = setTimeout(() => {
          process.kill('SIGTERM');
          resolve({
            success: false,
            output: '',
            error: `Command timed out after ${options.timeout}ms`
          });
        }, options.timeout);
      }

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        resolve({
          success: code === 0,
          output,
          error: errorOutput || (code !== 0 ? `Command failed with exit code ${code}` : null)
        });
      });

      process.on('error', (error) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        resolve({
          success: false,
          output: '',
          error: error.message
        });
      });
    });
  }

  /**
   * Get tool statistics and performance metrics
   */
  getStats() {
    return {
      availableTools: Array.from(this.availableTools.entries()),
      primaryTool: this.getPrimaryTool(),
      fallbackTool: this.getFallbackTool(),
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      capabilities: Object.fromEntries(this.toolCapabilities)
    };
  }

  /**
   * Validate search options
   */
  validateSearchOptions(options) {
    const errors = [];

    if (!options.pattern) {
      errors.push('Search pattern is required');
    }

    if (options.maxResults && (options.maxResults < 1 || options.maxResults > 10000)) {
      errors.push('Max results must be between 1 and 10000');
    }

    if (options.path && typeof options.path !== 'string') {
      errors.push('Path must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = ToolUnifier;