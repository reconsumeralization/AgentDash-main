"use client"

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Separator } from '@/components/ui'
import { Checkbox } from '@/components/ui'
import {
  Code2, Shield, Zap, Eye, TestTube, FileText,
  Play, Download, Copy, RefreshCw, Settings, Brain,
  AlertCircle, CheckCircle, Clock, Star, X
} from 'lucide-react'

interface CodeGenerationRequest {
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go'
  framework?: string
  purpose: string
  requirements: string[]
  securityLevel: 'low' | 'medium' | 'high'
  accessibility: boolean
  testing: boolean
  documentation: boolean
}

interface CodeGenerationResult {
  code: string
  security: {
    score: number
    vulnerabilities: Array<{
      type: string
      severity: string
      description: string
      fix: string
    }>
    recommendations: string[]
    riskLevel: string
  }
  quality: {
    maintainabilityIndex: number
    cyclomaticComplexity: number
    halsteadVolume: number
    linesOfCode: number
    testCoverage?: number
    documentationCoverage?: number
  }
  performance: {
    score: number
    bottlenecks: string[]
    optimizations: string[]
    estimatedLatency: number
    memoryUsage: number
  }
  improvements: Array<{
    type: string
    priority: string
    description: string
    before: string
    after: string
    impact: string
  }>
  alternatives: Array<{
    approach: string
    pros: string[]
    cons: string[]
    code: string
    useCase: string
  }>
  documentation: string
  tests?: string
  dependencies: string[]
}

interface GuidanceCodeGeneratorProps {
  onCodeGenerated?: (result: CodeGenerationResult) => void
  initialRequest?: Partial<CodeGenerationRequest>
}

export function GuidanceCodeGenerator({ 
  onCodeGenerated, 
  initialRequest 
}: GuidanceCodeGeneratorProps) {
  const [request, setRequest] = useState<CodeGenerationRequest>({
    language: 'typescript',
    purpose: '',
    requirements: [''],
    securityLevel: 'medium',
    accessibility: true,
    testing: true,
    documentation: true,
    ...initialRequest
  })

  const [result, setResult] = useState<CodeGenerationResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('code')

  const handleGenerate = useCallback(async () => {
    if (!request.purpose.trim()) {
      setError('Please provide a purpose for the code generation')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/guidance/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          requirements: request.requirements.filter(req => req.trim())
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate code')
      }

      const data = await response.json()
      setResult(data.data)
      onCodeGenerated?.(data.data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }, [request, onCodeGenerated])

  const addRequirement = () => {
    setRequest(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }))
  }

  const updateRequirement = (index: number, value: string) => {
    setRequest(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }))
  }

  const removeRequirement = (index: number) => {
    setRequest(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Guidance Code Generator
          </CardTitle>
          <CardDescription>
            Generate enterprise-grade code with comprehensive security analysis and quality metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Programming Language</Label>
              <Select
                value={request.language}
                onValueChange={(value: any) => setRequest(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="framework">Framework (Optional)</Label>
              <Input
                id="framework"
                value={request.framework || ''}
                onChange={(e) => setRequest(prev => ({ ...prev, framework: e.target.value }))}
                placeholder="e.g., React, Next.js, Express"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              value={request.purpose}
              onChange={(e) => setRequest(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="Describe what you want to build..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Requirements</Label>
            {request.requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder={`Requirement ${index + 1}`}
                />
                {request.requirements.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeRequirement(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addRequirement} className="w-full">
              Add Requirement
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="security">Security Level</Label>
              <Select
                value={request.securityLevel}
                onValueChange={(value: any) => setRequest(prev => ({ ...prev, securityLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessibility"
                    checked={request.accessibility}
                    onCheckedChange={(checked) => setRequest(prev => ({ ...prev, accessibility: !!checked }))}
                  />
                  <Label htmlFor="accessibility" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Accessibility
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="testing"
                    checked={request.testing}
                    onCheckedChange={(checked) => setRequest(prev => ({ ...prev, testing: !!checked }))}
                  />
                  <Label htmlFor="testing" className="flex items-center gap-1">
                    <TestTube className="h-4 w-4" />
                    Testing
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="documentation"
                    checked={request.documentation}
                    onCheckedChange={(checked) => setRequest(prev => ({ ...prev, documentation: !!checked }))}
                  />
                  <Label htmlFor="documentation" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Documentation
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !request.purpose.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Code...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Panel */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Generated Code
            </CardTitle>
            <CardDescription>
              Enterprise-grade code with comprehensive analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="improvements">Improvements</TabsTrigger>
                <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Generated Code</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.code)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCode(result.code, 'generated-code.ts')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-96 w-full border rounded-md">
                  <pre className="p-4 text-sm">
                    <code>{result.code}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Security Analysis</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(result.security.score)}`}>
                      {result.security.score}/100
                    </span>
                    {getScoreBadge(result.security.score)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Risk Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={result.security.riskLevel === 'low' ? 'default' : 'destructive'}>
                        {result.security.riskLevel.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Vulnerabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold">{result.security.vulnerabilities.length}</span>
                    </CardContent>
                  </Card>
                </div>

                {result.security.vulnerabilities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Vulnerabilities Found</h4>
                    {result.security.vulnerabilities.map((vuln, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive">{vuln.severity}</Badge>
                          <span className="font-medium">{vuln.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{vuln.description}</p>
                        <p className="text-sm font-medium">Fix: {vuln.fix}</p>
                      </div>
                    ))}
                  </div>
                )}

                {result.security.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recommendations</h4>
                    <ul className="space-y-1">
                      {result.security.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Quality Metrics</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(result.quality.maintainabilityIndex)}`}>
                      {result.quality.maintainabilityIndex}/100
                    </span>
                    {getScoreBadge(result.quality.maintainabilityIndex)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Lines of Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold">{result.quality.linesOfCode}</span>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Complexity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold">{result.quality.cyclomaticComplexity}</span>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Test Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold">{result.quality.testCoverage || 0}%</span>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold">{result.quality.documentationCoverage || 0}%</span>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Performance Analysis</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(result.performance.score)}`}>
                      {result.performance.score}/100
                    </span>
                    {getScoreBadge(result.performance.score)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Estimated Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold">{result.performance.estimatedLatency}ms</span>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold">{Math.round(result.performance.memoryUsage / 1024)}KB</span>
                    </CardContent>
                  </Card>
                </div>

                {result.performance.bottlenecks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Bottlenecks</h4>
                    {result.performance.bottlenecks.map((bottleneck, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        {bottleneck}
                      </div>
                    ))}
                  </div>
                )}

                {result.performance.optimizations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Optimizations</h4>
                    {result.performance.optimizations.map((optimization, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                        {optimization}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="improvements" className="space-y-4">
                <h3 className="text-lg font-semibold">Improvement Suggestions</h3>
                {result.improvements.map((improvement, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge variant={improvement.priority === 'high' ? 'destructive' : 'default'}>
                          {improvement.priority}
                        </Badge>
                        <CardTitle className="text-base">{improvement.type}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{improvement.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Before</h5>
                          <pre className="text-xs bg-gray-100 p-2 rounded">
                            <code>{improvement.before}</code>
                          </pre>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">After</h5>
                          <pre className="text-xs bg-gray-100 p-2 rounded">
                            <code>{improvement.after}</code>
                          </pre>
                        </div>
                      </div>
                      <p className="text-sm text-green-600 font-medium">Impact: {improvement.impact}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="alternatives" className="space-y-4">
                <h3 className="text-lg font-semibold">Alternative Implementations</h3>
                {result.alternatives.map((alternative, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{alternative.approach}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-1 text-green-600">Pros</h5>
                          <ul className="text-sm space-y-1">
                            {alternative.pros.map((pro, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600 mt-1" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1 text-red-600">Cons</h5>
                          <ul className="text-sm space-y-1">
                            {alternative.cons.map((con, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <AlertCircle className="h-3 w-3 text-red-600 mt-1" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1">Use Case</h5>
                        <p className="text-sm text-gray-600">{alternative.useCase}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
