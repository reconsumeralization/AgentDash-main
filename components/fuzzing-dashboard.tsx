'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { 
  Play, 
  Square, 
  Bug, 
  Shield, 
  Activity, 
  Target, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Network,
  Cpu,
  HardDrive
} from 'lucide-react'

interface FuzzingResults {
  totalExecutions: number
  executionsPerSecond: number
  codeCoverage: number
  stateCoverage: number
  bugsFound: number
  crashes: number
  timeouts: number
  errors: number
  traces: any[]
  stateModel: any[]
}

interface FuzzingDashboardProps {
  className?: string
}

export function FuzzingDashboard({ className }: FuzzingDashboardProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<FuzzingResults>({
    totalExecutions: 0,
    executionsPerSecond: 0,
    codeCoverage: 0,
    stateCoverage: 0,
    bugsFound: 0,
    crashes: 0,
    timeouts: 0,
    errors: 0,
    traces: [],
    stateModel: []
  })
  const [selectedTrace, setSelectedTrace] = useState<any>(null)
  const [fuzzingMode, setFuzzingMode] = useState<'persistent' | 'standard'>('persistent')

  // Simulate fuzzing results
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setResults(prev => ({
          ...prev,
          totalExecutions: prev.totalExecutions + Math.floor(Math.random() * 1000) + 500,
          executionsPerSecond: Math.floor(Math.random() * 50000) + 30000,
          codeCoverage: Math.min(100, prev.codeCoverage + Math.random() * 2),
          stateCoverage: Math.min(100, prev.stateCoverage + Math.random() * 5),
          bugsFound: prev.bugsFound + (Math.random() < 0.1 ? 1 : 0),
          crashes: prev.crashes + (Math.random() < 0.05 ? 1 : 0),
          timeouts: prev.timeouts + (Math.random() < 0.02 ? 1 : 0),
          errors: prev.errors + (Math.random() < 0.03 ? 1 : 0)
        }))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isRunning])

  const startFuzzing = () => {
    setIsRunning(true)
    setResults({
      totalExecutions: 0,
      executionsPerSecond: 0,
      codeCoverage: 0,
      stateCoverage: 0,
      bugsFound: 0,
      crashes: 0,
      timeouts: 0,
      errors: 0,
      traces: [],
      stateModel: []
    })
  }

  const stopFuzzing = () => {
    setIsRunning(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600'
      case 'stopped': return 'text-gray-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 animate-pulse" />
      case 'stopped': return <Square className="h-4 w-4" />
      case 'error': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AFL* Stateful Fuzzing Dashboard</h1>
          <p className="text-muted-foreground">
            Advanced stateful fuzzing for AI Platform security testing
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={isRunning ? "default" : "secondary"} className="flex items-center space-x-2">
            {getStatusIcon(isRunning ? 'running' : 'stopped')}
            <span>{isRunning ? 'Running' : 'Stopped'}</span>
          </Badge>
          <Button
            onClick={isRunning ? stopFuzzing : startFuzzing}
            variant={isRunning ? "destructive" : "default"}
            className="flex items-center space-x-2"
          >
            {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isRunning ? 'Stop' : 'Start'} Fuzzing</span>
          </Button>
        </div>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Fuzzing Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={fuzzingMode === 'persistent' ? 'default' : 'outline'}
              onClick={() => setFuzzingMode('persistent')}
              className="flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>AFL* Persistent Mode</span>
            </Button>
            <Button
              variant={fuzzingMode === 'standard' ? 'default' : 'outline'}
              onClick={() => setFuzzingMode('standard')}
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Standard Mode</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {fuzzingMode === 'persistent' 
              ? 'Uses AFL* persistent mode for deep state exploration and maximum performance'
              : 'Uses standard fuzzing approach with shorter traces'
            }
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {results.executionsPerSecond.toLocaleString()} exec/sec
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">State Coverage</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.stateCoverage.toFixed(1)}%</div>
            <Progress value={results.stateCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Coverage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.codeCoverage.toFixed(1)}%</div>
            <Progress value={results.codeCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugs Found</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{results.bugsFound}</div>
            <p className="text-xs text-muted-foreground">
              {results.crashes} crashes, {results.errors} errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traces">Traces</TabsTrigger>
          <TabsTrigger value="states">State Model</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Executions per Second</span>
                  <span className="text-lg font-bold">{results.executionsPerSecond.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Traces</span>
                  <span className="text-lg font-bold">{results.traces.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Timeouts</span>
                  <span className="text-lg font-bold text-yellow-600">{results.timeouts}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Vulnerabilities Found</span>
                  <Badge variant={results.bugsFound > 0 ? "destructive" : "default"}>
                    {results.bugsFound}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Crashes</span>
                  <Badge variant={results.crashes > 0 ? "destructive" : "secondary"}>
                    {results.crashes}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Error States</span>
                  <Badge variant={results.errors > 0 ? "destructive" : "secondary"}>
                    {results.errors}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AFL* Specific Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>AFL* Advanced Features</span>
              </CardTitle>
              <CardDescription>
                Stateful fuzzing capabilities based on AFL* research
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Persistent Mode</p>
                    <p className="text-sm text-muted-foreground">Deep state exploration</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Network className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">State Awareness</p>
                    <p className="text-sm text-muted-foreground">Context-aware mutations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <HardDrive className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Network Optimization</p>
                    <p className="text-sm text-muted-foreground">Reduced overhead</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fuzzing Traces</CardTitle>
              <CardDescription>
                Detailed trace information and execution results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.traces.slice(-10).map((trace, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTrace(trace)}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant={trace.isCrash ? "destructive" : "secondary"}>
                        {trace.isCrash ? "Crash" : "Normal"}
                      </Badge>
                      <span className="font-mono text-sm">{trace.id}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{trace.messages?.length || 0} messages</span>
                      <span>{trace.executionTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="states" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>State Model Coverage</CardTitle>
              <CardDescription>
                State model exploration and coverage analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.stateModel.map((state, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={state.isError ? "destructive" : "default"}>
                        {state.id}
                      </Badge>
                      <div>
                        <p className="font-medium">{state.name}</p>
                        <p className="text-sm text-muted-foreground">{state.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{state.hitCount} hits</p>
                        <p className="text-xs text-muted-foreground">{state.coverage.toFixed(1)}% coverage</p>
                      </div>
                      <Progress value={state.coverage} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Security Vulnerabilities</span>
              </CardTitle>
              <CardDescription>
                Discovered vulnerabilities and security issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.bugsFound > 0 ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {results.bugsFound} potential vulnerabilities found during fuzzing campaign.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    {Array.from({ length: results.bugsFound }, (_, i) => (
                      <div key={i} className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-red-800">Vulnerability #{i + 1}</p>
                            <p className="text-sm text-red-600">Potential buffer overflow or injection vulnerability</p>
                          </div>
                          <Badge variant="destructive">High</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium">No vulnerabilities found</p>
                  <p className="text-muted-foreground">The system appears to be secure against current fuzzing patterns.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
