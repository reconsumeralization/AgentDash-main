# Tool Unification Documentation

## Overview

The Tool Unifier provides a unified interface for text search operations across different search tools, primarily ripgrep and grep. This addresses GitHub Issue #9022 by creating a consistent API that automatically selects the best available tool and provides fallback mechanisms.

## Features

### 🔍 **Unified Search Interface**
- Single API for all search operations
- Automatic tool detection and selection
- Intelligent fallback mechanisms
- Consistent result format

### ⚡ **Performance Optimization**
- Automatic performance benchmarking
- Tool selection based on performance metrics
- Optimized command-line argument generation
- Efficient result parsing

### 🛡️ **Robust Error Handling**
- Graceful fallback between tools
- Comprehensive error reporting
- Timeout management
- Input validation

### 📊 **Rich Metadata**
- Tool performance metrics
- Search statistics
- Capability detection
- Usage analytics

## Installation

```bash
npm install tool-unifier
```

## Quick Start

```javascript
const ToolUnifier = require('tool-unifier');

// Initialize the tool unifier
const unifier = new ToolUnifier({
  preferredTool: 'ripgrep',
  fallbackTool: 'grep',
  timeout: 30000,
  maxResults: 1000
});

// Initialize and detect available tools
await unifier.initialize();

// Perform a search
const results = await unifier.search({
  pattern: 'function',
  path: './src',
  caseSensitive: false,
  maxResults: 100
});

console.log(`Found ${results.totalMatches} matches using ${results.tool}`);
```

## API Reference

### Constructor Options

```javascript
const unifier = new ToolUnifier({
  preferredTool: 'ripgrep',    // Preferred tool (ripgrep, grep)
  fallbackTool: 'grep',        // Fallback tool
  timeout: 30000,              // Command timeout in milliseconds
  maxResults: 1000             // Maximum results per search
});
```

### Search Options

```javascript
const searchOptions = {
  pattern: 'search term',      // Required: Search pattern
  path: './directory',         // Search path (default: current directory)
  caseSensitive: false,        // Case sensitivity (default: false)
  multiline: false,           // Multiline matching (default: false)
  maxResults: 100,            // Maximum results (default: from constructor)
  includeBinary: false,       // Include binary files (default: false)
  gitignore: true             // Respect .gitignore (default: true)
};
```

### Search Results

```javascript
{
  tool: 'ripgrep',            // Tool used for search
  results: [                  // Array of match results
    {
      file: 'src/app.js',     // File path
      line: 42,               // Line number
      column: 10,             // Column number (ripgrep only)
      text: 'function test()', // Full line text
      match: 'function'       // Matched text
    }
  ],
  totalMatches: 1             // Total number of matches
}
```

## Tool Capabilities

### ripgrep (Preferred)
- **Performance**: High
- **Features**: 
  - Advanced regex support
  - Unicode support
  - Binary file detection
  - Gitignore integration
  - JSON output format
  - Performance optimized
- **Best for**: Large codebases, complex searches

### grep (Fallback)
- **Performance**: Medium
- **Features**:
  - Basic regex support
  - Case-insensitive search
  - Multiline matching
  - Basic unicode support
- **Best for**: Simple searches, compatibility

## Usage Examples

### Basic Search

```javascript
// Simple text search
const results = await unifier.search({
  pattern: 'TODO',
  path: './src'
});

results.results.forEach(match => {
  console.log(`${match.file}:${match.line} - ${match.text}`);
});
```

### Case-Insensitive Search

```javascript
// Case-insensitive search
const results = await unifier.search({
  pattern: 'ERROR',
  caseSensitive: false,
  path: './logs'
});
```

### Regex Search

```javascript
// Regex pattern search
const results = await unifier.search({
  pattern: 'function\\s+\\w+\\s*\\(',
  path: './src',
  maxResults: 50
});
```

### Multiline Search

```javascript
// Multiline pattern search
const results = await unifier.search({
  pattern: 'class\\s+\\w+\\s*{[\\s\\S]*?}',
  multiline: true,
  path: './src'
});
```

### Binary File Handling

```javascript
// Include binary files in search
const results = await unifier.search({
  pattern: '\\x00\\x01\\x02',
  includeBinary: true,
  path: './data'
});
```

### Gitignore Integration

```javascript
// Respect .gitignore files
const results = await unifier.search({
  pattern: 'password',
  gitignore: true,
  path: './'
});

// Ignore .gitignore files
const results = await unifier.search({
  pattern: 'password',
  gitignore: false,
  path: './'
});
```

## Advanced Usage

### Custom Tool Configuration

```javascript
const unifier = new ToolUnifier({
  preferredTool: 'grep',      // Use grep as primary
  fallbackTool: 'ripgrep',    // Fallback to ripgrep
  timeout: 60000,             // 60 second timeout
  maxResults: 5000            // Allow more results
});
```

### Performance Monitoring

```javascript
// Get tool performance statistics
const stats = unifier.getStats();

console.log('Available tools:', stats.availableTools);
console.log('Primary tool:', stats.primaryTool);
console.log('Performance metrics:', stats.performanceMetrics);
```

### Error Handling

```javascript
try {
  const results = await unifier.search({
    pattern: 'test',
    path: './nonexistent'
  });
} catch (error) {
  if (error.message.includes('No search tools available')) {
    console.error('No search tools are installed');
  } else if (error.message.includes('Search pattern is required')) {
    console.error('Please provide a search pattern');
  } else {
    console.error('Search failed:', error.message);
  }
}
```

### Validation

```javascript
// Validate search options before execution
const options = {
  pattern: 'test',
  maxResults: 100
};

const validation = unifier.validateSearchOptions(options);
if (!validation.isValid) {
  console.error('Invalid options:', validation.errors);
  return;
}

const results = await unifier.search(options);
```

## Tool Detection

The Tool Unifier automatically detects available tools on the system:

```javascript
// Check tool availability
await unifier.detectAvailableTools();

// Check specific tool
const ripgrepAvailable = await unifier.checkToolAvailability('rg');
const grepAvailable = await unifier.checkToolAvailability('grep');

console.log('ripgrep available:', ripgrepAvailable);
console.log('grep available:', grepAvailable);
```

## Performance Benchmarking

The Tool Unifier automatically benchmarks available tools:

```javascript
// Run performance benchmarks
await unifier.measureToolPerformance();

// Get performance metrics
const stats = unifier.getStats();
const ripgrepPerf = stats.performanceMetrics.ripgrep;
const grepPerf = stats.performanceMetrics.grep;

console.log('ripgrep performance:', ripgrepPerf);
console.log('grep performance:', grepPerf);
```

## Fallback Mechanism

When the primary tool fails, the Tool Unifier automatically falls back to the secondary tool:

```javascript
// Primary tool (ripgrep) fails, falls back to grep
const results = await unifier.search({
  pattern: 'test',
  path: './src'
});

console.log(`Search completed using ${results.tool}`);
```

## Command Line Arguments

The Tool Unifier automatically generates appropriate command-line arguments for each tool:

### ripgrep Arguments
```bash
rg -i -U -m 100 --json -- test .
```

### grep Arguments
```bash
grep -i -E -r -n -m 100 test .
```

## Result Parsing

Results are parsed differently based on the tool used:

### ripgrep (JSON Format)
```json
{
  "type": "match",
  "data": {
    "path": {"text": "src/app.js"},
    "line_number": 42,
    "lines": {"text": "function test() {"},
    "submatches": [{
      "match": {"text": "function"},
      "start": 0,
      "end": 8
    }]
  }
}
```

### grep (Text Format)
```
src/app.js:42:function test() {
```

## Error Codes

| Error | Description | Solution |
|-------|-------------|----------|
| `NO_TOOLS_AVAILABLE` | No search tools found | Install ripgrep or grep |
| `INVALID_PATTERN` | Empty or invalid pattern | Provide valid search pattern |
| `TIMEOUT` | Command execution timeout | Increase timeout or reduce scope |
| `TOOL_FAILED` | Tool execution failed | Check tool installation |
| `INVALID_OPTIONS` | Invalid search options | Validate options before search |

## Best Practices

### 1. **Tool Selection**
- Use ripgrep for large codebases
- Use grep for simple searches
- Let the unifier choose automatically

### 2. **Performance Optimization**
- Set appropriate `maxResults` limits
- Use specific paths instead of broad searches
- Enable `gitignore` for faster searches

### 3. **Error Handling**
- Always wrap searches in try-catch blocks
- Handle tool availability gracefully
- Provide meaningful error messages

### 4. **Result Processing**
- Check `totalMatches` before processing results
- Handle empty result sets
- Process results in batches for large datasets

## Troubleshooting

### Common Issues

#### No Tools Available
```javascript
// Check tool availability
const stats = unifier.getStats();
if (stats.availableTools.length === 0) {
  console.error('No search tools available. Install ripgrep or grep.');
}
```

#### Search Timeout
```javascript
// Increase timeout for large searches
const unifier = new ToolUnifier({
  timeout: 60000  // 60 seconds
});
```

#### Memory Issues
```javascript
// Limit results for large searches
const results = await unifier.search({
  pattern: 'test',
  maxResults: 1000  // Limit to 1000 results
});
```

#### Permission Errors
```javascript
// Check file permissions
try {
  const results = await unifier.search({
    pattern: 'test',
    path: './restricted'
  });
} catch (error) {
  if (error.message.includes('permission')) {
    console.error('Permission denied. Check file access rights.');
  }
}
```

## Integration Examples

### With File Watchers
```javascript
const chokidar = require('chokidar');

const unifier = new ToolUnifier();
await unifier.initialize();

// Watch for file changes and search
chokidar.watch('./src').on('change', async (path) => {
  const results = await unifier.search({
    pattern: 'TODO',
    path: path
  });
  
  console.log(`Found ${results.totalMatches} TODOs in ${path}`);
});
```

### With Web Servers
```javascript
const express = require('express');
const app = express();

const unifier = new ToolUnifier();
await unifier.initialize();

app.get('/search', async (req, res) => {
  try {
    const results = await unifier.search({
      pattern: req.query.q,
      path: req.query.path || './',
      maxResults: parseInt(req.query.limit) || 100
    });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### With Build Tools
```javascript
const gulp = require('gulp');

const unifier = new ToolUnifier();
await unifier.initialize();

gulp.task('search-todos', async () => {
  const results = await unifier.search({
    pattern: 'TODO|FIXME|HACK',
    path: './src',
    caseSensitive: false
  });
  
  console.log(`Found ${results.totalMatches} todos/fixmes/hacks`);
  results.results.forEach(match => {
    console.log(`${match.file}:${match.line} - ${match.text}`);
  });
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.0
- Initial release
- Support for ripgrep and grep
- Automatic tool detection
- Fallback mechanisms
- Performance benchmarking
- Comprehensive error handling
