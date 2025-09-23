"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Label } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Badge } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { agentRegistry } from "@/lib"
import { Code2, Sparkles, Copy, Download, Zap, FileCode, RefreshCw } from "lucide-react"

interface CodeBlock {
  id: string
  title: string
  description: string
  language: string
  framework: string
  code: string
  tags: string[]
  complexity: "beginner" | "intermediate" | "advanced"
  createdAt: Date
}

export function CodeBlockGenerator() {
  const [blocks, setBlocks] = useState<CodeBlock[]>([])
  const [prompt, setPrompt] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("typescript")
  const [selectedFramework, setSelectedFramework] = useState("react")
  const [selectedComplexity, setSelectedComplexity] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeBlock, setActiveBlock] = useState<string>("")

  const handleGenerateBlock = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const codingAgents = agentRegistry.getAgentsByType("coding")
      if (codingAgents.length > 0) {
        const enhancedPrompt = `
          Create a ${selectedComplexity} level ${selectedLanguage} code block for ${selectedFramework}.
          Requirements: ${prompt}
          
          Please provide:
          1. Clean, well-commented code
          2. Follow best practices
          3. Include proper error handling
          4. Make it production-ready
          5. Add TypeScript types if applicable
        `

        const executionId = await agentRegistry.executeAgent(codingAgents[0].id, enhancedPrompt)
        const execution = agentRegistry.getExecution(executionId)

        if (execution?.output) {
          const newBlock: CodeBlock = {
            id: `block_${Date.now()}`,
            title: prompt.slice(0, 50) + (prompt.length > 50 ? "..." : ""),
            description: `Generated ${selectedLanguage} code for ${selectedFramework}`,
            language: selectedLanguage,
            framework: selectedFramework,
            code: execution.output,
            tags: [selectedLanguage, selectedFramework, selectedComplexity],
            complexity: selectedComplexity,
            createdAt: new Date(),
          }

          setBlocks([newBlock, ...blocks])
          setActiveBlock(newBlock.id)
          setPrompt("")
        }
      }
    } catch (error) {
      console.error("Code block generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
  }

  const handleDownloadCode = (block: CodeBlock) => {
    const extension = block.language === "typescript" ? "tsx" : block.language === "javascript" ? "jsx" : block.language
    const filename = `${block.title.replace(/[^a-zA-Z0-9]/g, "_")}.${extension}`

    const blob = new Blob([block.code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeBlockData = blocks.find((b) => b.id === activeBlock)

  const quickPrompts = [
    "Create a responsive navigation component",
    "Build a form with validation",
    "Create a data table with sorting",
    "Build a modal dialog component",
    "Create a dashboard card component",
    "Build a search input with autocomplete",
    "Create a file upload component",
    "Build a pagination component",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Code Block Generator</h2>
          <p className="text-muted-foreground">Generate reusable code blocks with AI assistance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{blocks.length} blocks generated</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Generator Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Code Block
              </CardTitle>
              <CardDescription>Describe what you want to build and let AI create it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">What do you want to build?</Label>
                <Textarea
                  id="prompt"
                  placeholder="Create a responsive card component with hover effects..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Framework</Label>
                  <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="nextjs">Next.js</SelectItem>
                      <SelectItem value="vue">Vue</SelectItem>
                      <SelectItem value="svelte">Svelte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Complexity</Label>
                <Select value={selectedComplexity} onValueChange={(value: any) => setSelectedComplexity(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleGenerateBlock} disabled={isGenerating || !prompt.trim()} className="w-full">
                {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                {isGenerating ? "Generating..." : "Generate Block"}
              </Button>

              <div className="space-y-2">
                <Label className="text-sm">Quick Prompts</Label>
                <div className="grid gap-1">
                  {quickPrompts.slice(0, 4).map((quickPrompt, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => setPrompt(quickPrompt)}
                    >
                      {quickPrompt}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Blocks List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCode className="w-5 h-5 mr-2" />
                Generated Blocks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {blocks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No code blocks generated yet. Create your first one!
                    </p>
                  ) : (
                    blocks.map((block) => (
                      <div
                        key={block.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          activeBlock === block.id ? "bg-accent border-primary" : ""
                        }`}
                        onClick={() => setActiveBlock(block.id)}
                      >
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">{block.title}</h4>
                          <p className="text-xs text-muted-foreground">{block.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {block.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{block.createdAt.toLocaleDateString()}</span>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyCode(block.code)
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadCode(block)
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Code Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Code2 className="w-5 h-5 mr-2" />
                  Code Preview
                </div>
                {activeBlockData && (
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleCopyCode(activeBlockData.code)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadCode(activeBlockData)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeBlockData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge>{activeBlockData.language}</Badge>
                      <Badge variant="outline">{activeBlockData.framework}</Badge>
                      <Badge variant="secondary">{activeBlockData.complexity}</Badge>
                    </div>
                  </div>
                  <ScrollArea className="h-[500px]">
                    <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                      <code>{activeBlockData.code}</code>
                    </pre>
                  </ScrollArea>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                  <div className="text-center">
                    <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a code block to preview</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
