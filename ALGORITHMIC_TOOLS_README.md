# 🧮 Advanced Algorithmic Tools for Gemini CLI

## Overview

The Advanced Algorithmic Tools MCP Extension provides sophisticated algorithmic solutions for competitive programming, optimization, and mathematical problems. These tools are based on advanced C++ algorithms and have been adapted to work seamlessly with the Gemini CLI through the Native MCP Extensions system.

## 🚀 Features

The Advanced Algorithmic Tools MCP Extension now provides **7 sophisticated algorithms** converted from advanced C++ competitive programming solutions:

### 1. Skew Heap Operations
**Complexity**: O(M * α(N)) where α is inverse Ackermann function

Performs advanced tree operations using role graphs and the inclusion-exclusion principle. Ideal for:
- Graph connectivity problems
- Dynamic union-find operations
- Network analysis

**Input Schema**:
```json
{
  "n": "number (Number of cities)",
  "couriers": [
    {
      "from": "number",
      "to": "number"
    }
  ]
}
```

**Output Schema**:
```json
{
  "results": "array of numbers",
  "totalConnectedPairs": "number",
  "algorithm": "string",
  "complexity": "string"
}
```

### 2. Bipartite Matching
**Complexity**: O(N * M * K) where K is average likes per cat

Solves bipartite matching problems using Hall's condition. Perfect for:
- Assignment problems
- Resource allocation
- Matching algorithms

**Input Schema**:
```json
{
  "cats": [
    {
      "id": "number",
      "pot": "number", 
      "likes": ["array of numbers"]
    }
  ],
  "numPots": "number"
}
```

**Output Schema**:
```json
{
  "isFeasible": "boolean",
  "algorithm": "string",
  "complexity": "string",
  "explanation": "string"
}
```

### 3. Digit Counting DP
**Complexity**: O(log M * P_min) where P_min is minimum score

Counts digit occurrences using dynamic programming with modular arithmetic. Useful for:
- Number theory problems
- Digit analysis
- Mathematical optimization

**Input Schema**:
```json
{
  "maxScore": "number",
  "scores": ["array of numbers"]
}
```

**Output Schema**:
```json
{
  "digitCounts": "object",
  "algorithm": "string", 
  "complexity": "string",
  "explanation": "string"
}
```

### 4. Interactive Optimization
**Complexity**: O(N²) moves in worst case

Solves interactive optimization problems with multi-phase strategies. Great for:
- Interactive algorithms
- Strategic optimization
- Multi-phase problem solving

**Input Schema**:
```json
{
  "n": "number (Number of wheels)",
  "initialK": "number (Initial K value)"
}
```

**Output Schema**:
```json
{
  "strategy": {
    "totalPhases": "number",
    "phases": [
      {
        "phase": "number",
        "description": "string",
        "moves": "number"
      }
    ],
    "estimatedTotalMoves": "number",
    "successProbability": "number"
  },
  "algorithm": "string",
  "complexity": "string",
  "explanation": "string"
}
```

### 5. Subset Sum of Odds
**Complexity**: O(N) for construction, O(N²) for verification

Solves subset sum problems with odd numbers using unimodal construction. Excellent for:
- Mathematical optimization
- Subset problems
- Number theory

**Input Schema**:
```json
{
  "n": "number (Number of cups)",
  "targetHeight": "number (Target height H)"
}
```

**Output Schema**:
```json
{
  "possible": "boolean",
  "heights": ["array of numbers"],
  "construction": "string",
  "verification": "boolean",
  "algorithm": "string",
  "complexity": "string",
  "explanation": "string"
}
```

### 6. Bipartite Potentials
**Complexity**: O(K + N + M) where K is number of constraints

Finds minimum potentials in bipartite graphs with constraints using BFS component analysis. Perfect for:
- Graph theory problems
- Constraint satisfaction
- Network optimization

**Input Schema**:
```json
{
  "n": "number (Number of X nodes)",
  "m": "number (Number of Y nodes)",
  "k": "number (Number of constraints)",
  "tx": "number (Target X node)",
  "ty": "number (Target Y node)",
  "constraints": [
    {
      "x": "number",
      "y": "number", 
      "d": "number"
    }
  ]
}
```

**Output Schema**:
```json
{
  "result": "number",
  "possible": "boolean",
  "algorithm": "string",
  "complexity": "string",
  "explanation": "string"
}
```

### 7. Interval Optimization
**Complexity**: O(N log N) for sorting and merging intervals

Optimizes movement costs using interval merging and geometric calculations. Great for:
- Geometric optimization
- Path planning
- Resource allocation

**Input Schema**:
```json
{
  "n": "number (Number of rectangles)",
  "xc": "number (Current X coordinate)",
  "yc": "number (Current Y coordinate)",
  "xa": "number (Target X coordinate)",
  "ya": "number (Target Y coordinate)",
  "rectangles": [
    {
      "x1": "number",
      "y1": "number",
      "x2": "number",
      "y2": "number"
    }
  ]
}
```

**Output Schema**:
```json
{
  "cost": "number",
  "algorithm": "string",
  "complexity": "string",
  "explanation": "string"
}
```

## 🛠️ Usage

### Via API

```bash
# Test all algorithmic tools
npm run algo:demo

# Test with development server
npm run algo:test
```

### Via MCP Extensions

```typescript
import { AlgorithmicToolsMCPExtension } from './lib/algorithmic-tools'

const extension = new AlgorithmicToolsMCPExtension()
await extension.initialize()

// Execute a tool
const result = await extension.executeTool('skew_heap_operations', {
  n: 4,
  couriers: [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 }
  ]
}, context)
```

### Via HTTP API

```bash
curl -X POST http://localhost:3000/api/mcp-extensions/execute \
  -H "Content-Type: application/json" \
  -d '{
    "extensionId": "advanced-algorithmic-tools",
    "toolName": "bipartite_matching",
    "params": {
      "cats": [
        {"id": 1, "pot": 1, "likes": [1, 2, 3]},
        {"id": 2, "pot": 1, "likes": [2, 3, 4]}
      ],
      "numPots": 5
    },
    "context": {
      "userId": "user123",
      "sessionId": "session456",
      "requestId": "req789",
      "permissions": ["algorithmic"],
      "environment": "development",
      "metadata": {}
    }
  }'
```

## 🧪 Testing

The algorithmic tools include comprehensive test coverage:

```bash
# Run the demo script
npm run algo:demo

# Expected output:
# ✅ Skew heap operations completed successfully
# ✅ Bipartite matching completed successfully  
# ✅ Digit counting DP completed successfully
# ✅ Interactive optimization completed successfully
# ✅ Subset sum of odds completed successfully
# ✅ Impossible case test completed successfully
```

## 🔧 Implementation Details

### Architecture

The algorithmic tools are implemented as a native MCP extension that:

1. **Extends BaseMCPExtension** - Inherits all core MCP functionality
2. **Implements Tool Registry** - Each algorithm is registered as a tool with proper schemas
3. **Provides Type Safety** - Full TypeScript support with input/output validation
4. **Handles Permissions** - Requires 'algorithmic' or 'development' permissions
5. **Supports Context** - Full execution context with user, session, and metadata

### Security

- **Permission-based access** - Only users with appropriate permissions can execute tools
- **Input validation** - All inputs are validated against JSON schemas
- **Output sanitization** - All outputs are properly formatted and validated
- **Resource limits** - Built-in memory and execution time limits

### Performance

- **Optimized algorithms** - Based on proven competitive programming solutions
- **Efficient data structures** - Uses appropriate data structures for each algorithm
- **Memory management** - Proper cleanup and resource management
- **Caching** - Intelligent caching for repeated operations

## 📚 Algorithm Sources

These tools are based on advanced C++ algorithms from competitive programming:

1. **Skew Heap Operations** - Role Graph model with inclusion-exclusion principle
2. **Bipartite Matching** - Hall's condition for perfect matching
3. **Digit Counting DP** - Modular arithmetic with dynamic programming
4. **Interactive Optimization** - Multi-phase strategic approach
5. **Subset Sum of Odds** - Unimodal construction with mathematical properties

## 🎯 Use Cases

### Competitive Programming
- **Codeforces/AtCoder problems** - Direct application of these algorithms
- **ACM ICPC** - Complex algorithmic challenges
- **Google Code Jam** - Optimization and mathematical problems

### Research & Development
- **Algorithm research** - Testing and validating new approaches
- **Performance analysis** - Comparing different algorithmic solutions
- **Mathematical modeling** - Complex optimization problems

### Education
- **Algorithm courses** - Teaching advanced algorithmic concepts
- **Problem solving** - Interactive learning and practice
- **Competition preparation** - Training for programming contests

## 🔮 Future Enhancements

- **More algorithms** - Additional competitive programming algorithms
- **Performance profiling** - Built-in performance analysis
- **Visualization** - Graph and tree visualization tools
- **Parallel execution** - Multi-threaded algorithm execution
- **Custom algorithms** - User-defined algorithm support

## 📄 License

Copyright 2025 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

**🚀 Ready to solve complex algorithmic challenges with the power of advanced competitive programming algorithms!**
