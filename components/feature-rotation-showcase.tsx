"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  RotateCcw, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Settings,
  Maximize,
  Minimize,
  Zap,
  Brain,
  Users,
  Shield,
  BarChart3,
  CheckCircle,
  MessageSquare,
  Search,
  Globe,
  Lock,
  Star,
  TrendingUp,
  Activity,
  Target,
  Rocket,
  Sparkles,
  Eye,
  Heart,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react"

interface FeatureShowcase {
  id: string
  title: string
  description: string
  category: 'integration' | 'ai' | 'security' | 'analytics' | 'collaboration'
  priority: 'critical' | 'high' | 'medium'
  status: 'active' | 'demo' | 'development' | 'planned'
  metrics: {
    performance: number
    engagement: number
    adoption: number
  }
  demo: {
    component: React.ComponentType
    data: any
    interactions: string[]
  }
  benefits: string[]
  technicalSpecs: {
    apis: string[]
    integrations: string[]
    capabilities: string[]
  }
}

const FEATURE_SHOWCASES: FeatureShowcase[] = [
  {
    id: 'linkedin-integration',
    title: 'LinkedIn API Integration',
    description: 'Enterprise-grade multi-business line integration with progressive permissions',
    category: 'integration',
    priority: 'critical',
    status: 'active',
    metrics: { performance: 98, engagement: 95, adoption: 87 },
    demo: {
      component: LinkedInIntegrationDemo,
      data: { campaigns: 45, leads: 234, connections: 1200 },
      interactions: ['Create Campaign', 'Search Leads', 'Manage Connections']
    },
    benefits: ['10x More LinkedIn Integration', 'Progressive Permission Management', 'Advanced Rate Limiting'],
    technicalSpecs: {
      apis: ['Marketing API', 'Sales Navigator', 'Talent Solutions'],
      integrations: ['OAuth 2.0', 'Webhooks', 'Real-time Sync'],
      capabilities: ['Campaign Management', 'Lead Generation', 'Job Posting']
    }
  },
  {
    id: 'ai-orchestration',
    title: 'AI Agent Orchestration',
    description: 'LinkedIn-aware intelligent agents with collaborative task execution',
    category: 'ai',
    priority: 'critical',
    status: 'active',
    metrics: { performance: 96, engagement: 92, adoption: 78 },
    demo: {
      component: AIOrchestrationDemo,
      data: { agents: 8, tasks: 156, successRate: 94 },
      interactions: ['Select Agent', 'Execute Task', 'Monitor Performance']
    },
    benefits: ['LinkedIn-Aware Selection', 'Performance-Based Routing', 'Real-time Collaboration'],
    technicalSpecs: {
      apis: ['Agent API', 'Task API', 'Performance API'],
      integrations: ['ML Models', 'LinkedIn Context', 'Real-time Monitoring'],
      capabilities: ['Intelligent Routing', 'Collaborative Execution', 'Self-Optimization']
    }
  },
  {
    id: 'aspiration-networking',
    title: 'Aspiration-Based Networking',
    description: 'Revolutionary focus on future goals rather than past achievements',
    category: 'collaboration',
    priority: 'high',
    status: 'active',
    metrics: { performance: 94, engagement: 89, adoption: 82 },
    demo: {
      component: AspirationNetworkingDemo,
      data: { tribes: 23, members: 456, aspirations: 89 },
      interactions: ['Create Tribe', 'Find Aspirations', 'Match Members']
    },
    benefits: ['Future-Focused Matching', 'LinkedIn Profile Enrichment', 'AI-Powered Discovery'],
    technicalSpecs: {
      apis: ['Tribe API', 'Profile API', 'Matching API'],
      integrations: ['LinkedIn Profiles', 'AI Analysis', 'Cross-Platform Sync'],
      capabilities: ['Aspiration Analysis', 'Compatibility Matching', 'Network Discovery']
    }
  },
  {
    id: 'business-intelligence',
    title: 'Predictive Analytics',
    description: 'ML-powered business intelligence with real-time insights',
    category: 'analytics',
    priority: 'high',
    status: 'active',
    metrics: { performance: 97, engagement: 91, adoption: 85 },
    demo: {
      component: BusinessIntelligenceDemo,
      data: { reports: 12, predictions: 34, accuracy: 92 },
      interactions: ['Generate Report', 'View Predictions', 'Export Data']
    },
    benefits: ['Predictive Analytics', 'Real-time Dashboards', 'Business Intelligence'],
    technicalSpecs: {
      apis: ['Analytics API', 'Prediction API', 'Dashboard API'],
      integrations: ['LinkedIn Marketing', 'ML Models', 'WebSocket Updates'],
      capabilities: ['Growth Prediction', 'Campaign Analytics', 'Performance Monitoring']
    }
  },
  {
    id: 'zero-trust-security',
    title: 'Zero-Trust Security',
    description: 'Enterprise-grade security with LinkedIn compliance automation',
    category: 'security',
    priority: 'critical',
    status: 'active',
    metrics: { performance: 99, engagement: 88, adoption: 93 },
    demo: {
      component: ZeroTrustSecurityDemo,
      data: { threats: 0, compliance: 100, authentications: 2340 },
      interactions: ['Multi-Factor Auth', 'Threat Detection', 'Compliance Check']
    },
    benefits: ['Multi-Factor Authentication', 'Advanced Threat Detection', 'GDPR/CCPA Compliance'],
    technicalSpecs: {
      apis: ['Auth API', 'Security API', 'Compliance API'],
      integrations: ['LinkedIn OAuth', 'Biometric Auth', 'Threat Detection'],
      capabilities: ['Zero-Trust Architecture', 'Real-time Monitoring', 'Automated Compliance']
    }
  }
]

export function FeatureRotationShowcase() {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(5000)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showMetrics, setShowMetrics] = useState(true)
  const [interactionCount, setInteractionCount] = useState(0)

  const currentFeature = FEATURE_SHOWCASES[currentFeatureIndex]

  // Auto-rotation effect
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % FEATURE_SHOWCASES.length)
    }, rotationSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, rotationSpeed])

  const handleFeatureSelect = useCallback((index: number) => {
    setCurrentFeatureIndex(index)
    setInteractionCount(prev => prev + 1)
  }, [])

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
    setInteractionCount(prev => prev + 1)
  }, [isPlaying])

  const handleSpeedChange = useCallback((speed: number) => {
    setRotationSpeed(speed)
    setInteractionCount(prev => prev + 1)
  }, [])

  const handleViewModeChange = useCallback((mode: 'desktop' | 'tablet' | 'mobile') => {
    setViewMode(mode)
    setInteractionCount(prev => prev + 1)
  }, [])

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-50">
        <Card className="backdrop-blur-md bg-white/80 border-white/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="hover:bg-blue-100"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentFeatureIndex((prev) => (prev - 1 + FEATURE_SHOWCASES.length) % FEATURE_SHOWCASES.length)}
                    className="hover:bg-blue-100"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentFeatureIndex((prev) => (prev + 1) % FEATURE_SHOWCASES.length)}
                    className="hover:bg-blue-100"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Speed:</span>
                  <Button
                    variant={rotationSpeed === 3000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(3000)}
                  >
                    Fast
                  </Button>
                  <Button
                    variant={rotationSpeed === 5000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(5000)}
                  >
                    Normal
                  </Button>
                  <Button
                    variant={rotationSpeed === 8000 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSpeedChange(8000)}
                  >
                    Slow
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'desktop' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleViewModeChange('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'tablet' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleViewModeChange('tablet')}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'mobile' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleViewModeChange('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>

                <Badge variant="outline" className="text-xs">
                  Interactions: {interactionCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Navigation */}
      <div className="absolute top-20 left-4 z-40">
        <Card className="backdrop-blur-md bg-white/80 border-white/20 shadow-lg">
          <CardContent className="p-3">
            <div className="space-y-2">
              {FEATURE_SHOWCASES.map((feature, index) => (
                <Button
                  key={feature.id}
                  variant={index === currentFeatureIndex ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleFeatureSelect(index)}
                  className="w-full justify-start text-xs"
                >
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(feature.category)}
                    <span className="truncate">{feature.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {feature.metrics.performance}%
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Display */}
      <div className="absolute top-20 left-64 right-4 bottom-4">
        <div className={`h-full transition-all duration-1000 ${
          viewMode === 'mobile' ? 'max-w-sm mx-auto' : 
          viewMode === 'tablet' ? 'max-w-2xl mx-auto' : 
          'w-full'
        }`}>
          <FeatureDisplay
            feature={currentFeature}
            viewMode={viewMode}
            showMetrics={showMetrics}
            onInteraction={() => setInteractionCount(prev => prev + 1)}
          />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-64 right-4 z-30">
        <Card className="backdrop-blur-md bg-white/80 border-white/20 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">{currentFeature.title}</span>
                <Badge variant={getPriorityVariant(currentFeature.priority)}>
                  {currentFeature.priority}
                </Badge>
                <Badge variant={getStatusVariant(currentFeature.status)}>
                  {currentFeature.status}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {currentFeatureIndex + 1} of {FEATURE_SHOWCASES.length}
                </span>
                <Progress 
                  value={((currentFeatureIndex + 1) / FEATURE_SHOWCASES.length) * 100} 
                  className="w-20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FeatureDisplay({ 
  feature, 
  viewMode, 
  showMetrics, 
  onInteraction 
}: { 
  feature: FeatureShowcase
  viewMode: 'desktop' | 'tablet' | 'mobile'
  showMetrics: boolean
  onInteraction: () => void
}) {
  return (
    <div className="h-full">
      <Card className="h-full backdrop-blur-md bg-white/90 border-white/20 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center space-x-3">
                {getCategoryIcon(feature.category, "h-6 w-6")}
                <span>{feature.title}</span>
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
              </CardTitle>
              <p className="text-gray-600 mt-2">{feature.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onInteraction}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="h-full overflow-y-auto">
          <Tabs defaultValue="demo" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="demo">Demo</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="specs">Technical</TabsTrigger>
            </TabsList>

            <TabsContent value="demo" className="h-full">
              <div className="h-full">
                <feature.demo.component 
                  data={feature.demo.data}
                  interactions={feature.demo.interactions}
                  onInteraction={onInteraction}
                />
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="h-full">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{feature.metrics.performance}%</div>
                    <div className="text-sm text-gray-600">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{feature.metrics.engagement}%</div>
                    <div className="text-sm text-gray-600">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{feature.metrics.adoption}%</div>
                    <div className="text-sm text-gray-600">Adoption</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Real-time Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance Score</span>
                        <span>{feature.metrics.performance}%</span>
                      </div>
                      <Progress value={feature.metrics.performance} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>User Engagement</span>
                        <span>{feature.metrics.engagement}%</span>
                      </div>
                      <Progress value={feature.metrics.engagement} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Adoption Rate</span>
                        <span>{feature.metrics.adoption}%</span>
                      </div>
                      <Progress value={feature.metrics.adoption} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="h-full">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Benefits</h3>
                <div className="space-y-3">
                  {feature.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Star className="h-5 w-5 text-green-600" />
                      <span className="text-green-800">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="h-full">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">APIs</h3>
                  <div className="flex flex-wrap gap-2">
                    {feature.technicalSpecs.apis.map((api, index) => (
                      <Badge key={index} variant="outline">{api}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Integrations</h3>
                  <div className="flex flex-wrap gap-2">
                    {feature.technicalSpecs.integrations.map((integration, index) => (
                      <Badge key={index} variant="secondary">{integration}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {feature.technicalSpecs.capabilities.map((capability, index) => (
                      <Badge key={index} variant="default">{capability}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Demo Components
function LinkedInIntegrationDemo({ data, onInteraction }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.campaigns}</div>
            <div className="text-sm text-gray-600">Active Campaigns</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.leads}</div>
            <div className="text-sm text-gray-600">Generated Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{data.connections}</div>
            <div className="text-sm text-gray-600">Connections</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={onInteraction} className="flex-1">
          <Zap className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
        <Button onClick={onInteraction} variant="outline" className="flex-1">
          <Search className="h-4 w-4 mr-2" />
          Search Leads
        </Button>
        <Button onClick={onInteraction} variant="outline" className="flex-1">
          <Users className="h-4 w-4 mr-2" />
          Manage Connections
        </Button>
      </div>
    </div>
  )
}

function AIOrchestrationDemo({ data, onInteraction }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.agents}</div>
            <div className="text-sm text-gray-600">Active Agents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tasks Completed</span>
          <span>{data.tasks}</span>
        </div>
        <Progress value={(data.tasks / 200) * 100} className="h-2" />
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={onInteraction} className="flex-1">
          <Brain className="h-4 w-4 mr-2" />
          Select Agent
        </Button>
        <Button onClick={onInteraction} variant="outline" className="flex-1">
          <Activity className="h-4 w-4 mr-2" />
          Monitor Performance
        </Button>
      </div>
    </div>
  )
}

function AspirationNetworkingDemo({ data, onInteraction }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.tribes}</div>
            <div className="text-sm text-gray-600">Active Tribes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.members}</div>
            <div className="text-sm text-gray-600">Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{data.aspirations}</div>
            <div className="text-sm text-gray-600">Aspirations</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={onInteraction} className="flex-1">
          <Target className="h-4 w-4 mr-2" />
          Create Tribe
        </Button>
        <Button onClick={onInteraction} variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          Find Aspirations
        </Button>
        <Button onClick={onInteraction} variant="outline" className="flex-1">
          <Heart className="h-4 w-4 mr-2" />
          Match Members
        </Button>
      </div>
    </div>
  )
}

function BusinessIntelligenceDemo({ data, onInteraction }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.reports}</div>
            <div className="text-sm text-gray-600">Generated Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.accuracy}%</div>
            <div className="text-sm text-gray-600">Prediction Accuracy</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Active Predictions</span>
          <span>{data.predictions}</span>
        </div>
        <Progress value={(data.predictions / 50) * 100} className="h-2" />
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={onInteraction} className="flex-1">
          <BarChart3 className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
        <Button onClick={onInteraction} variant="outline" className="flex-1">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Predictions
        </Button>
        <Button onClick={onInteraction} variant="outline" className="flex-1">
          <ArrowRight className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  )
}

function ZeroTrustSecurityDemo({ data, onInteraction }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{data.threats}</div>
            <div className="text-sm text-gray-600">Active Threats</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.compliance}%</div>
            <div className="text-sm text-gray-600">Compliance Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.authentications}</div>
            <div className="text-sm text-gray-600">Authentications</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={onInteraction} className="flex-1">
          <Lock className="h-4 w-4 mr-2" />
          Multi-Factor Auth
        </Button>
        <Button onClick={onInteraction} variant="outline" className="flex-1">
          <Shield className="h-4 w-4 mr-2" />
          Threat Detection
        </Button>
        <Button onClick={onInteraction} variant="outline" className="flex-1">
          <CheckCircle className="h-4 w-4 mr-2" />
          Compliance Check
        </Button>
      </div>
    </div>
  )
}

// Helper Functions
function getCategoryIcon(category: string, size = "h-4 w-4") {
  const icons = {
    integration: <Globe className={size} />,
    ai: <Brain className={size} />,
    security: <Shield className={size} />,
    analytics: <BarChart3 className={size} />,
    collaboration: <Users className={size} />
  }
  return icons[category as keyof typeof icons] || <Star className={size} />
}

function getPriorityVariant(priority: string) {
  const variants = {
    critical: "destructive" as const,
    high: "default" as const,
    medium: "secondary" as const
  }
  return variants[priority as keyof typeof variants] || "secondary"
}

function getStatusVariant(status: string) {
  const variants = {
    active: "default" as const,
    demo: "secondary" as const,
    development: "outline" as const,
    planned: "secondary" as const
  }
  return variants[status as keyof typeof variants] || "secondary"
}
