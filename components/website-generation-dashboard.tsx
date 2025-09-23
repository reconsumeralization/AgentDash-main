"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Label } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Progress } from "@/components/ui"
import {
  WebsiteGenerationFactory,
  type WebsiteSpec,
  type GenerationProgress,
  WEBSITE_TEMPLATES,
} from "@/lib"
import {
  Palette,
  Download,
  Eye,
  Settings,
  Plus,
  Rocket,
  FileCode,
  Layout,
  Database,
  Search,
  PenTool,
  Clock,
  CheckCircle,
} from "lucide-react"

export function WebsiteGenerationDashboard() {
  const [websiteSpecs, setWebsiteSpecs] = useState<WebsiteSpec[]>([])
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof WEBSITE_TEMPLATES>("STARTUP_LANDING")
  const [websiteName, setWebsiteName] = useState("")
  const [websiteDescription, setWebsiteDescription] = useState("")
  const [selectedFramework, setSelectedFramework] = useState<"nextjs" | "react" | "vue" | "svelte">("nextjs")
  const [selectedStyling, setSelectedStyling] = useState<"tailwind" | "css" | "styled-components">("tailwind")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Load existing website specs and progress
    setWebsiteSpecs(WebsiteGenerationFactory.getAllWebsiteSpecs())
    setGenerationProgress(WebsiteGenerationFactory.getAllGenerationProgress())

    // Set up polling for progress updates
    const interval = setInterval(() => {
      setGenerationProgress(WebsiteGenerationFactory.getAllGenerationProgress())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleCreateWebsite = () => {
    if (!websiteName.trim()) return

    const template = WEBSITE_TEMPLATES[selectedTemplate]
    const spec = WebsiteGenerationFactory.createWebsiteSpec(
      websiteName,
      websiteDescription || template.description,
      template.type,
      {
        framework: selectedFramework,
        styling: selectedStyling,
        features: template.features,
      },
    )

    setWebsiteSpecs([...websiteSpecs, spec])
    setWebsiteName("")
    setWebsiteDescription("")
  }

  const handleGenerateWebsite = async (websiteId: string) => {
    setIsGenerating(true)
    try {
      await WebsiteGenerationFactory.generateWebsite(websiteId)
      setGenerationProgress(WebsiteGenerationFactory.getAllGenerationProgress())
    } catch (error) {
      console.error("Website generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadWebsite = (websiteId: string) => {
    const progress = generationProgress.find((p) => p.websiteId === websiteId)
    if (!progress || progress.generatedFiles.length === 0) return

    // Create a zip file with all generated files
    const files = progress.generatedFiles.map((file) => ({
      name: file.path,
      content: file.content,
    }))

    // For demo purposes, just download the first file
    const firstFile = files[0]
    if (firstFile) {
      const blob = new Blob([firstFile.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = firstFile.name
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const getProgressColor = (progress: number): string => {
    if (progress === 100) return "bg-green-500"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-gray-500"
  }

  const getStageIcon = (stage: string) => {
    const icons = {
      Planning: Settings,
      "Design Architecture": Palette,
      "Component Generation": Layout,
      "Page Generation": FileCode,
      "Backend Integration": Database,
      "Content Integration": PenTool,
      "SEO Optimization": Search,
      Completed: CheckCircle,
    }
    return icons[stage as keyof typeof icons] || Clock
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Website Generation Framework</h2>
          <p className="text-muted-foreground">
            Create complete websites using AI agents specialized in design, development, and optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{websiteSpecs.length} websites created</Badge>
          <Badge variant="outline">{generationProgress.filter((p) => p.progress === 100).length} completed</Badge>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Website</TabsTrigger>
          <TabsTrigger value="websites">My Websites</TabsTrigger>
          <TabsTrigger value="progress">Generation Progress</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Website</CardTitle>
                <CardDescription>Choose a template and customize your website specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="website-name">Website Name</Label>
                  <Input
                    id="website-name"
                    placeholder="My Awesome Website"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="website-description">Description (Optional)</Label>
                  <Textarea
                    id="website-description"
                    placeholder="Describe your website's purpose and goals..."
                    value={websiteDescription}
                    onChange={(e) => setWebsiteDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Framework</Label>
                    <Select value={selectedFramework} onValueChange={(value: any) => setSelectedFramework(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nextjs">Next.js</SelectItem>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue.js</SelectItem>
                        <SelectItem value="svelte">Svelte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Styling</Label>
                    <Select value={selectedStyling} onValueChange={(value: any) => setSelectedStyling(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                        <SelectItem value="css">CSS Modules</SelectItem>
                        <SelectItem value="styled-components">Styled Components</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Template</Label>
                  <Select value={selectedTemplate} onValueChange={(value: any) => setSelectedTemplate(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(WEBSITE_TEMPLATES).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreateWebsite} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Website Specification
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
                <CardDescription>{WEBSITE_TEMPLATES[selectedTemplate].name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{WEBSITE_TEMPLATES[selectedTemplate].description}</p>

                <div>
                  <Label className="text-sm font-medium">Website Type</Label>
                  <Badge variant="secondary" className="ml-2">
                    {WEBSITE_TEMPLATES[selectedTemplate].type}
                  </Badge>
                </div>

                <div>
                  <Label className="text-sm font-medium">Included Features</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {WEBSITE_TEMPLATES[selectedTemplate].features.map((feature) => (
                      <Badge key={feature.id} variant="outline" className="text-xs">
                        {feature.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    This template will generate a complete {selectedFramework} application with {selectedStyling}{" "}
                    styling.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="websites" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {websiteSpecs.map((spec) => {
              const progress = generationProgress.find((p) => p.websiteId === spec.id)
              const isComplete = progress?.progress === 100
              const isGenerating = progress && progress.progress < 100

              return (
                <Card key={spec.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{spec.name}</CardTitle>
                      <Badge variant="outline">{spec.type}</Badge>
                    </div>
                    <CardDescription className="text-sm">{spec.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Framework:</span>
                        <span>{spec.framework}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Styling:</span>
                        <span>{spec.styling}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Features:</span>
                        <span>{spec.features.length}</span>
                      </div>

                      {progress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Generation Progress</span>
                            <span>{Math.round(progress.progress)}%</span>
                          </div>
                          <Progress value={progress.progress} className="w-full" />
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {!progress && (
                          <Button size="sm" onClick={() => handleGenerateWebsite(spec.id)} disabled={isGenerating}>
                            <Rocket className="w-3 h-3 mr-1" />
                            Generate
                          </Button>
                        )}
                        {isComplete && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleDownloadWebsite(spec.id)}>
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {generationProgress.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>No website generation in progress</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {generationProgress.map((progress) => {
                const spec = websiteSpecs.find((s) => s.id === progress.websiteId)
                const StageIcon = getStageIcon(progress.currentStage)
                const isComplete = progress.progress === 100

                return (
                  <Card key={progress.websiteId}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{spec?.name || "Unknown Website"}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant={isComplete ? "default" : "secondary"}>
                            {isComplete ? "Completed" : "Generating"}
                          </Badge>
                          {progress.errors.length > 0 && (
                            <Badge variant="destructive">{progress.errors.length} errors</Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription>{progress.currentTask}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <StageIcon className="w-5 h-5" />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{progress.currentStage}</span>
                              <span>{Math.round(progress.progress)}%</span>
                            </div>
                            <Progress value={progress.progress} className="w-full" />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {progress.stagesCompleted}/{progress.stagesTotal}
                            </div>
                            <div className="text-muted-foreground">Stages</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{progress.generatedFiles.length}</div>
                            <div className="text-muted-foreground">Files</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-destructive">{progress.errors.length}</div>
                            <div className="text-muted-foreground">Errors</div>
                          </div>
                        </div>

                        {progress.generatedFiles.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Generated Files</Label>
                            <ScrollArea className="h-20 mt-2">
                              <div className="space-y-1">
                                {progress.generatedFiles.slice(-5).map((file, index) => (
                                  <div key={index} className="flex items-center justify-between text-xs">
                                    <span className="font-mono">{file.path}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {file.type}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}

                        {progress.errors.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-destructive">Recent Errors</Label>
                            <ScrollArea className="h-16 mt-2">
                              <div className="space-y-1">
                                {progress.errors.slice(-3).map((error, index) => (
                                  <div key={index} className="text-xs text-destructive">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(WEBSITE_TEMPLATES).map(([key, template]) => (
              <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    <Badge variant="outline">{template.type}</Badge>
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Features</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.features.map((feature) => (
                          <Badge key={feature.id} variant="secondary" className="text-xs">
                            {feature.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedTemplate(key as keyof typeof WEBSITE_TEMPLATES)}
                      className="w-full"
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
