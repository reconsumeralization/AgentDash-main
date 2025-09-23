"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui"
import { Label } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Separator } from "@/components/ui"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui"
import { agentRegistry } from "@/lib"
import { Save, Code, FileText, Copy, Check, RefreshCw, Bug, Sparkles } from "lucide-react"

interface CodeFile {
  id: string
  name: string
  language: string
  content: string
  path: string
  modified: boolean
}

interface CodeProject {
  id: string
  name: string
  files: CodeFile[]
  activeFileId: string
  framework: string
}

export function CodingIDEBlocks() {
  const [projects, setProjects] = useState<CodeProject[]>([])
  const [activeProject, setActiveProject] = useState<string>("")
  const [codePrompt, setCodePrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [output, setOutput] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("typescript")
  const [selectedFramework, setSelectedFramework] = useState("react")
  const [copied, setCopied] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Initialize with sample project
  useEffect(() => {
    const sampleProject: CodeProject = {
      id: "sample_project",
      name: "My App",
      activeFileId: "file_1",
      framework: "react",
      files: [
        {
          id: "file_1",
          name: "App.tsx",
          language: "typescript",
          path: "src/App.tsx",
          content: `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your App
        </h1>
        <p className="text-gray-600">
          Start building something amazing!
        </p>
      </div>
    </div>
  )
}

export default App`,
          modified: false,
        },
        {
          id: "file_2",
          name: "index.css",
          language: "css",
          path: "src/index.css",
          content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`,
          modified: false,
        },
      ],
    }
    setProjects([sampleProject])
    setActiveProject(sampleProject.id)
  }, [])

  const currentProject = projects.find((p) => p.id === activeProject)
  const activeFile = currentProject?.files.find((f) => f.id === currentProject.activeFileId)

  const handleGenerateCode = async () => {
    if (!codePrompt.trim()) return

    setIsGenerating(true)
    try {
      // Use coding agent to generate code
      const codingAgents = agentRegistry.getAgentsByType("coding")
      if (codingAgents.length > 0) {
        const prompt = `Generate ${selectedLanguage} code for ${selectedFramework}: ${codePrompt}`
        const executionId = await agentRegistry.executeAgent(codingAgents[0].id, prompt)
        const execution = agentRegistry.getExecution(executionId)

        if (execution?.output) {
          setOutput(execution.output)

          // Auto-create new file with generated code
          if (currentProject) {
            const newFile: CodeFile = {
              id: `file_${Date.now()}`,
              name: `generated-${Date.now()}.${selectedLanguage === "typescript" ? "tsx" : selectedLanguage}`,
              language: selectedLanguage,
              path: `src/generated-${Date.now()}.${selectedLanguage === "typescript" ? "tsx" : selectedLanguage}`,
              content: execution.output,
              modified: true,
            }

            const updatedProject = {
              ...currentProject,
              files: [...currentProject.files, newFile],
              activeFileId: newFile.id,
            }

            setProjects(projects.map((p) => (p.id === activeProject ? updatedProject : p)))
          }
        }
      }
    } catch (error) {
      console.error("Code generation failed:", error)
      setOutput("Error generating code. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileContentChange = (content: string) => {
    if (!currentProject || !activeFile) return

    const updatedFile = { ...activeFile, content, modified: true }
    const updatedProject = {
      ...currentProject,
      files: currentProject.files.map((f) => (f.id === activeFile.id ? updatedFile : f)),
    }

    setProjects(projects.map((p) => (p.id === activeProject ? updatedProject : p)))
  }

  const handleSaveFile = () => {
    if (!currentProject || !activeFile) return

    const updatedFile = { ...activeFile, modified: false }
    const updatedProject = {
      ...currentProject,
      files: currentProject.files.map((f) => (f.id === activeFile.id ? updatedFile : f)),
    }

    setProjects(projects.map((p) => (p.id === activeProject ? updatedProject : p)))
  }

  const handleCopyCode = async () => {
    if (activeFile?.content) {
      await navigator.clipboard.writeText(activeFile.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateNewFile = () => {
    if (!currentProject) return

    const newFile: CodeFile = {
      id: `file_${Date.now()}`,
      name: `new-file.${selectedLanguage === "typescript" ? "tsx" : selectedLanguage}`,
      language: selectedLanguage,
      path: `src/new-file.${selectedLanguage === "typescript" ? "tsx" : selectedLanguage}`,
      content: `// New ${selectedLanguage} file\n\n`,
      modified: true,
    }

    const updatedProject = {
      ...currentProject,
      files: [...currentProject.files, newFile],
      activeFileId: newFile.id,
    }

    setProjects(projects.map((p) => (p.id === activeProject ? updatedProject : p)))
  }

  const handleRefactorCode = async () => {
    if (!activeFile?.content) return

    setIsGenerating(true)
    try {
      const codingAgents = agentRegistry.getAgentsByType("coding")
      if (codingAgents.length > 0) {
        const prompt = `Refactor and improve this ${selectedLanguage} code:\n\n${activeFile.content}`
        const executionId = await agentRegistry.executeAgent(codingAgents[0].id, prompt)
        const execution = agentRegistry.getExecution(executionId)

        if (execution?.output) {
          handleFileContentChange(execution.output)
        }
      }
    } catch (error) {
      console.error("Refactoring failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDebugCode = async () => {
    if (!activeFile?.content) return

    setIsGenerating(true)
    try {
      const codingAgents = agentRegistry.getAgentsByType("coding")
      if (codingAgents.length > 0) {
        const prompt = `Debug and fix issues in this ${selectedLanguage} code:\n\n${activeFile.content}`
        const executionId = await agentRegistry.executeAgent(codingAgents[0].id, prompt)
        const execution = agentRegistry.getExecution(executionId)

        if (execution?.output) {
          setOutput(`Debug Analysis:\n\n${execution.output}`)
        }
      }
    } catch (error) {
      console.error("Debugging failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center space-x-4">
            <Code className="h-6 w-6" />
            <h1 className="text-lg font-semibold">AI Coding IDE</h1>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="nextjs">Next.js</SelectItem>
                <SelectItem value="vue">Vue</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
                <SelectItem value="vanilla">Vanilla</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleCreateNewFile}>
              <FileText className="h-4 w-4 mr-2" />
              New File
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* File Explorer */}
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full border-r">
              <div className="p-3 border-b">
                <h3 className="font-medium text-sm">Files</h3>
              </div>
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {currentProject?.files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-accent ${
                        file.id === currentProject.activeFileId ? "bg-accent" : ""
                      }`}
                      onClick={() => {
                        const updatedProject = { ...currentProject, activeFileId: file.id }
                        setProjects(projects.map((p) => (p.id === activeProject ? updatedProject : p)))
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      {file.modified && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Code Editor */}
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col">
              {/* Editor Header */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{activeFile?.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {activeFile?.language}
                  </Badge>
                  {activeFile?.modified && (
                    <Badge variant="secondary" className="text-xs">
                      Modified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" onClick={handleCopyCode}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleRefactorCode} disabled={isGenerating}>
                    <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDebugCode} disabled={isGenerating}>
                    <Bug className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleSaveFile} disabled={!activeFile?.modified}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 p-4">
                <Textarea
                  ref={editorRef}
                  value={activeFile?.content || ""}
                  onChange={(e) => handleFileContentChange(e.target.value)}
                  className="w-full h-full font-mono text-sm resize-none border-0 focus-visible:ring-0"
                  placeholder="Start coding..."
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* AI Assistant Panel */}
          <ResizablePanel defaultSize={30} minSize={25}>
            <div className="h-full border-l">
              <Tabs defaultValue="generate" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="generate">Generate</TabsTrigger>
                  <TabsTrigger value="output">Output</TabsTrigger>
                  <TabsTrigger value="terminal">Terminal</TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="flex-1 p-4 space-y-4">
                  <div>
                    <Label htmlFor="code-prompt">Describe what you want to build</Label>
                    <Textarea
                      id="code-prompt"
                      placeholder="Create a login form with email and password fields..."
                      value={codePrompt}
                      onChange={(e) => setCodePrompt(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleGenerateCode} disabled={isGenerating || !codePrompt.trim()} className="w-full">
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? "Generating..." : "Generate Code"}
                  </Button>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" onClick={() => setCodePrompt("Create a React component")}>
                        Component
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setCodePrompt("Create an API endpoint")}>
                        API
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCodePrompt("Create a form with validation")}
                      >
                        Form
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setCodePrompt("Create a dashboard layout")}>
                        Dashboard
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="output" className="flex-1 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">AI Output</h4>
                        {output && (
                          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(output)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {output ? (
                        <pre className="text-sm bg-muted p-3 rounded-md overflow-auto whitespace-pre-wrap">
                          {output}
                        </pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          AI output will appear here after code generation
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="terminal" className="flex-1 p-4">
                  <div className="h-full bg-black text-green-400 p-3 rounded-md font-mono text-sm">
                    <div className="mb-2">$ npm run dev</div>
                    <div className="text-gray-400">Starting development server...</div>
                    <div className="text-gray-400">✓ Ready on http://localhost:3000</div>
                    <div className="mt-4">
                      <span className="text-green-400">$</span>
                      <span className="ml-2 animate-pulse">_</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
