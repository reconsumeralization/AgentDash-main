"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { 
  Target, 
  Zap, 
  Brain, 
  Code, 
  Calculator,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib"

interface AlgorithmicTool {
  id: string
  name: string
  description: string
  category: string
  complexity: string
  useCases: string[]
  icon: any
}

interface AlgorithmicToolsInterfaceProps {
  className?: string
}

const algorithmicTools: AlgorithmicTool[] = [
    {
      id: "skew_heap_operations",
      name: "Skew Heap Operations",
      description: "Perform skew heap tree operations with role graphs and inclusion-exclusion principle",
      category: "Graph Theory",
      complexity: "O(M * α(N))",
      useCases: ["Graph connectivity", "Dynamic union-find", "Tree manipulation"],
      icon: BarChart3
    },
    {
      id: "bipartite_matching",
      name: "Bipartite Matching",
      description: "Solve bipartite matching problems using Hall's condition",
      category: "Graph Theory",
      complexity: "O(N * M * K)",
      useCases: ["Matching problems", "Assignment optimization", "Network flow"],
      icon: Target
    },
    {
      id: "digit_counting_dp",
      name: "Digit Counting DP",
      description: "Count digit occurrences using dynamic programming with modular arithmetic",
      category: "Dynamic Programming",
      complexity: "O(log M * P_min)",
      useCases: ["Number theory", "Digit analysis", "Mathematical optimization"],
      icon: Calculator
    },
    {
      id: "interactive_optimization",
      name: "Interactive Optimization",
      description: "Solve interactive optimization problems with multi-phase strategies",
      category: "Optimization",
      complexity: "O(N²)",
      useCases: ["Interactive problems", "Multi-phase strategies", "Optimization"],
      icon: TrendingUp
    },
    {
      id: "subset_sum_odds",
      name: "Subset Sum of Odds",
      description: "Solve subset sum problems with odd numbers using unimodal construction",
      category: "Mathematical",
      complexity: "O(N)",
      useCases: ["Subset problems", "Mathematical optimization", "Number theory"],
      icon: Brain
    },
    {
      id: "bipartite_potentials",
      name: "Bipartite Potentials",
      description: "Find minimum potentials in bipartite graphs with constraints using BFS component analysis",
      category: "Graph Theory",
      complexity: "O(K + N + M)",
      useCases: ["Graph potentials", "Constraint satisfaction", "Network optimization"],
      icon: Zap
    },
    {
      id: "interval_optimization",
      name: "Interval Optimization",
      description: "Optimize movement costs using interval merging and geometric calculations",
      category: "Geometric",
      complexity: "O(N log N)",
      useCases: ["Geometric optimization", "Path planning", "Resource allocation"],
      icon: Code
    }
  ]

export function AlgorithmicToolsInterface({ className }: AlgorithmicToolsInterfaceProps) {
  const [tools, setTools] = useState<AlgorithmicTool[]>([])
  const [selectedTool, setSelectedTool] = useState<AlgorithmicTool | null>(null)
  const [input, setInput] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTools(algorithmicTools)
  }, [])

  const executeTool = async (tool: AlgorithmicTool) => {
    if (!input.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/mcp-extensions/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extensionId: 'advanced-algorithmic-tools',
          toolName: tool.id,
          params: JSON.parse(input),
          context: {
            userId: 'demo-user',
            sessionId: 'demo-session',
            requestId: `req_${Date.now()}`,
            permissions: ['algorithmic'],
            environment: 'development',
            metadata: {}
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        setResult({ error: 'Failed to execute tool' })
      }
    } catch (error) {
      setResult({ error: 'Error executing tool' })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Graph Theory': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Dynamic Programming': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Optimization': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Mathematical': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'Geometric': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getComplexityColor = (complexity: string) => {
    if (complexity.includes('O(1)') || complexity.includes('O(log')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    } else if (complexity.includes('O(N)') || complexity.includes('O(M)')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    } else if (complexity.includes('O(N²)') || complexity.includes('O(N log N)')) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    } else {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Algorithmic Tools</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Advanced algorithmic problem solving with sophisticated competitive programming solutions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tools List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Tools</h2>
          <div className="space-y-3">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Card 
                  key={tool.id} 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedTool?.id === tool.id ? "ring-2 ring-primary" : ""
                  )}
                  onClick={() => setSelectedTool(tool)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {tool.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCategoryColor(tool.category)}>
                        {tool.category}
                      </Badge>
                      <Badge className={getComplexityColor(tool.complexity)}>
                        {tool.complexity}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-2">Use Cases:</div>
                      <div className="flex flex-wrap gap-1">
                        {tool.useCases.map((useCase) => (
                          <Badge key={useCase} variant="outline" className="text-xs">
                            {useCase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Tool Execution */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Execute Tool</h2>
          
          {selectedTool ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = selectedTool.icon
                    return <Icon className="h-5 w-5" />
                  })()}
                  {selectedTool.name}
                </CardTitle>
                <CardDescription>{selectedTool.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Input Parameters (JSON format)
                  </label>
                  <Textarea
                    placeholder={`Enter parameters for ${selectedTool.name}...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>
                
                <Button 
                  onClick={() => executeTool(selectedTool)}
                  disabled={loading || !input.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Execute Tool
                    </>
                  )}
                </Button>

                {/* Result */}
                {result && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Result</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{JSON.stringify(result, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Tool</h3>
                <p className="text-muted-foreground">
                  Choose an algorithmic tool from the list to execute it
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tool Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Tool Examples
          </CardTitle>
          <CardDescription>
            Example inputs for each algorithmic tool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="skew_heap_operations" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="skew_heap_operations">Skew Heap</TabsTrigger>
              <TabsTrigger value="bipartite_matching">Bipartite</TabsTrigger>
              <TabsTrigger value="digit_counting_dp">Digit Counting</TabsTrigger>
              <TabsTrigger value="interval_optimization">Interval</TabsTrigger>
            </TabsList>
            
            <TabsContent value="skew_heap_operations" className="mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`{
  "n": 5,
  "couriers": [
    { "from": 1, "to": 2 },
    { "from": 2, "to": 3 },
    { "from": 3, "to": 4 },
    { "from": 4, "to": 5 }
  ]
}`}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="bipartite_matching" className="mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`{
  "cats": [
    { "id": 1, "pot": 1, "likes": [1, 2] },
    { "id": 2, "pot": 2, "likes": [2, 3] },
    { "id": 3, "pot": 3, "likes": [1, 3] }
  ],
  "numPots": 3
}`}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="digit_counting_dp" className="mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`{
  "maxScore": 1000,
  "scores": [1, 3, 5, 7, 9]
}`}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="interval_optimization" className="mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`{
  "n": 3,
  "xc": 0,
  "yc": 10,
  "xa": 0,
  "ya": 0,
  "rectangles": [
    { "x1": 0, "y1": 2, "x2": 5, "y2": 4 },
    { "x1": 1, "y1": 3, "x2": 6, "y2": 6 },
    { "x1": 2, "y1": 7, "x2": 7, "y2": 9 }
  ]
}`}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
