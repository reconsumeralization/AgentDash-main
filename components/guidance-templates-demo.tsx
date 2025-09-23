"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import {
  Brain,
  Users,
  BarChart3,
  MessageSquare,
  Briefcase,
  Network,
  Sparkles,
  Eye,
  Download,
  Play,
  ChevronDown,
  ChevronRight,
  FileText,
  Settings
} from "lucide-react"

// Import the guidance templates as JSON
import AIMatchingDashboardGuidance from "../guidance-templates/ai-matching-dashboard.json"
import CRMRelationshipDashboardGuidance from "../guidance-templates/crm-relationship-dashboard.json"
import AnalyticsReportingDashboardGuidance from "../guidance-templates/analytics-reporting-dashboard.json"
import AIengagementAssistantGuidance from "../guidance-templates/ai-engagement-assistant.json"
import ProjectCollaborationDashboardGuidance from "../guidance-templates/project-collaboration-dashboard.json"
import TribeCommunityDashboardGuidance from "../guidance-templates/tribe-community-dashboard.json"
import MasterAIDashboardGuidance from "../guidance-templates/master-ai-dashboard-guidance.json"

const getIconForTemplate = (templateId: string) => {
  switch (templateId) {
    case "ai-matching": return Brain
    case "crm": return Users
    case "analytics": return BarChart3
    case "engagement": return MessageSquare
    case "projects": return Briefcase
    case "tribes": return Network
    case "master": return Sparkles
    default: return Sparkles
  }
}

function GuidanceStructureRenderer({ templateId }: { templateId: string | null }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  // Load guidance data internally to avoid serialization issues
  const getGuidanceData = (id: string | null) => {
    if (!id) return null
    const template = templateData.find(t => t.id === id)
    return template ? { guidance: template.guidance, name: template.name } : null
  }

  const data = getGuidanceData(templateId)

  if (!data) return <div>Select a template to view its structure</div>

  const renderGuidanceSection = (guidance: unknown, sectionName: string, depth = 0) => {
    const sectionId = `${sectionName}-${depth}`

    if (typeof guidance === 'string' || typeof guidance === 'number' || typeof guidance === 'boolean') {
      return (
        <div key={sectionId} className="ml-4">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3" />
            <span className="text-sm font-medium">{sectionName}:</span>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{String(guidance)}</code>
          </div>
        </div>
      )
    }

    if (Array.isArray(guidance)) {
      return (
        <div key={sectionId} className="ml-4">
          <div className="flex items-center gap-2 mb-2">
            <ChevronRight className="h-3 w-3" />
            <span className="text-sm font-medium">{sectionName}</span>
            <Badge variant="outline" className="text-xs">Array</Badge>
          </div>
          <div className="ml-4 space-y-1">
            {guidance.map((item, index) => (
              <div key={index} className="text-sm">
                {typeof item === 'string' ? (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ) : (
                  renderGuidanceSection(item, `[${index}]`, depth + 1)
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (typeof guidance === 'object' && guidance !== null) {
      const isExpanded = expandedSections.has(sectionId)
      const entries = Object.entries(guidance)

      return (
        <div key={sectionId} className="ml-4">
          <div
            className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
            onClick={() => toggleSection(sectionId)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <span className="text-sm font-medium">{sectionName}</span>
            <Badge variant="outline" className="text-xs">Object</Badge>
            <span className="text-xs text-gray-500">({entries.length} properties)</span>
          </div>
          {isExpanded && (
            <div className="ml-4 space-y-1">
              {entries.map(([key, value]) => (
                <div key={key}>
                  {renderGuidanceSection(value, key, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={sectionId} className="ml-4">
        <div className="flex items-center gap-2">
          <ChevronRight className="h-3 w-3" />
          <span className="text-sm font-medium">{sectionName}:</span>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{String(guidance)}</code>
        </div>
      </div>
    )
  }

  return renderGuidanceSection(data.guidance, data.name)
}

const templateData = [
  {
    id: "ai-matching",
    name: "AI Matching Dashboard",
    description: "Intelligent professional discovery and connection platform",
    guidance: AIMatchingDashboardGuidance,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600"
  },
  {
    id: "crm",
    name: "CRM Relationship Dashboard",
    description: "Professional relationship pipeline management",
    guidance: CRMRelationshipDashboardGuidance,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600"
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Comprehensive insights and performance metrics",
    guidance: AnalyticsReportingDashboardGuidance,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600"
  },
  {
    id: "engagement",
    name: "AI Engagement Assistant",
    description: "Smart conversation and relationship management",
    guidance: AIengagementAssistantGuidance,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600"
  },
  {
    id: "projects",
    name: "Project Collaboration",
    description: "AI-optimized team formation and management",
    guidance: ProjectCollaborationDashboardGuidance,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-600"
  },
  {
    id: "tribes",
    name: "Tribe Community",
    description: "Community building around shared aspirations",
    guidance: TribeCommunityDashboardGuidance,
    color: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-600"
  },
  {
    id: "master",
    name: "Master Framework",
    description: "Unified framework for all AI dashboard types",
    guidance: MasterAIDashboardGuidance,
    color: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600"
  }
]

export function GuidanceTemplatesDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)


  const selectedTemplateData = templateData.find(t => t.id === selectedTemplate)

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            AI Dashboard Guidance Templates
          </h2>
          <p className="text-muted-foreground">
            Structured templates for building AI-heavy GUI and report pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            7 Templates Ready
          </Badge>
          <Button size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templateData.map((template) => {
          const Icon = getIconForTemplate(template.id)
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${template.color} ${
                selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${template.iconColor.replace('text-', 'bg-').replace('-600', '-100')}`}>
                    <Icon className={`h-5 w-5 ${template.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTemplate(template.id)
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Explore
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    Docs
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Template Details */}
      {selectedTemplateData && (
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getIconForTemplate(selectedTemplateData.id)
                  return <Icon className={`h-6 w-6 ${selectedTemplateData.iconColor}`} />
                })()}
                <div>
                  <CardTitle className="text-xl">{selectedTemplateData.name}</CardTitle>
                  <p className="text-muted-foreground">{selectedTemplateData.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-3 w-3 mr-1" />
                  Generate Code
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Export Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="structure" className="w-full">
              <TabsList>
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="ai-features">AI Features</TabsTrigger>
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
              </TabsList>

              <TabsContent value="structure" className="mt-4">
                <ScrollArea className="h-[500px] w-full border rounded-lg p-4">
                  <div className="space-y-2">
                    <GuidanceStructureRenderer templateId={selectedTemplate} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="components" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">UI Components</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Layout:</strong> Responsive grid/card-based design
                        </div>
                        <div>
                          <strong>State:</strong> Complex state management with real-time updates
                        </div>
                        <div>
                          <strong>Interactions:</strong> AI-powered suggestions and automation
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Data Architecture</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Models:</strong> TypeScript interfaces for all data structures
                        </div>
                        <div>
                          <strong>State:</strong> Zustand stores for complex state management
                        </div>
                        <div>
                          <strong>Real-time:</strong> WebSocket connections for live updates
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ai-features" className="mt-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Integration Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium mb-2">AI Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary">Intelligent Matching</Badge>
                            <Badge variant="secondary">Predictive Analytics</Badge>
                            <Badge variant="secondary">Real-time Insights</Badge>
                            <Badge variant="secondary">Automated Workflows</Badge>
                            <Badge variant="secondary">Smart Recommendations</Badge>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Integration Points:</h4>
                          <div className="space-y-1">
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              <strong>Coral Protocol:</strong> Decentralized AI agent orchestration
                            </div>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              <strong>Machine Learning:</strong> Pattern recognition and prediction
                            </div>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              <strong>Natural Language:</strong> Conversation analysis and generation
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="implementation" className="mt-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Implementation Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium mb-2">Core Features:</h4>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Set up component structure and routing
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Implement state management with Zustand
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Add real-time data synchronization
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Integrate AI/ML services
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Implement responsive design patterns
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Start</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>1.</strong> Import the guidance template
                        </div>
                        <div>
                          <strong>2.</strong> Follow the UI structure patterns
                        </div>
                        <div>
                          <strong>3.</strong> Implement AI integration points
                        </div>
                        <div>
                          <strong>4.</strong> Add real-time features and state management
                        </div>
                        <div>
                          <strong>5.</strong> Test with sample data and refine UX
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Features</p>
                <p className="text-2xl font-bold">50+</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Components</p>
                <p className="text-2xl font-bold">200+</p>
              </div>
              <Settings className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dashboards</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
