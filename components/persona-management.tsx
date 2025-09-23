"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  Filter, 
  Brain, 
  Users, 
  Target, 
  TrendingUp,
  BarChart3,
  Network,
  Settings,
  Edit,
  Trash2,
  Copy,
  Share,
  Star,
  Eye,
  MoreHorizontal,
  User,
  UserCheck,
  UserX,
  Zap,
  Sparkles,
  Activity,
  MessageSquare,
  Globe,
  Smartphone,
  Laptop,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  DollarSign,
  Award,
  Lightbulb,
  BookOpen,
  Gamepad2,
  Music,
  Camera,
  Palette,
  Code,
  Database,
  Shield,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Download,
  Upload,
  RefreshCw
} from "lucide-react"
import { PsychographicPreset, UserPersona, AudienceSegment } from '@/lib/supabase'

interface PersonaManagementProps {
  userId: string
}

export function PersonaManagement({ userId }: PersonaManagementProps) {
  const [psychographicPresets, setPsychographicPresets] = useState<PsychographicPreset[]>([])
  const [userPersonas, setUserPersonas] = useState<UserPersona[]>([])
  const [audienceSegments, setAudienceSegments] = useState<AudienceSegment[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isCreatePresetDialogOpen, setIsCreatePresetDialogOpen] = useState(false)
  const [isCreatePersonaDialogOpen, setIsCreatePersonaDialogOpen] = useState(false)
  const [isCreateSegmentDialogOpen, setIsCreateSegmentDialogOpen] = useState(false)

  // Form states for creating presets
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetDescription, setNewPresetDescription] = useState('')
  const [newPresetCategory, setNewPresetCategory] = useState<'professional' | 'demographic' | 'behavioral' | 'psychographic' | 'lifestyle'>('professional')
  const [newPresetTraits, setNewPresetTraits] = useState('')
  const [newPresetDemographics, setNewPresetDemographics] = useState('')
  const [newPresetBehaviors, setNewPresetBehaviors] = useState('')
  const [newPresetCommunication, setNewPresetCommunication] = useState('')
  const [newPresetContent, setNewPresetContent] = useState('')
  const [newPresetPlatform, setNewPresetPlatform] = useState('')

  // Load psychographic presets
  const loadPsychographicPresets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/psychographic-presets?userId=${userId}`)
      const data = await response.json()
      setPsychographicPresets(data.presets || [])
    } catch (error) {
      console.error('Error loading psychographic presets:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Load user personas
  const loadUserPersonas = useCallback(async () => {
    try {
      const response = await fetch(`/api/user-personas?userId=${userId}`)
      const data = await response.json()
      setUserPersonas(data.personas || [])
    } catch (error) {
      console.error('Error loading user personas:', error)
    }
  }, [userId])

  // Load audience segments
  const loadAudienceSegments = useCallback(async () => {
    try {
      const response = await fetch(`/api/audience-segments?userId=${userId}`)
      const data = await response.json()
      setAudienceSegments(data.segments || [])
    } catch (error) {
      console.error('Error loading audience segments:', error)
    }
  }, [userId])

  // Create psychographic preset
  const createPsychographicPreset = async () => {
    if (!newPresetName.trim()) return

    try {
      const response = await fetch('/api/psychographic-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: newPresetName,
          description: newPresetDescription,
          category: newPresetCategory,
          traits: parseJsonField(newPresetTraits),
          demographics: parseJsonField(newPresetDemographics),
          behaviors: parseJsonField(newPresetBehaviors),
          communication_style: parseJsonField(newPresetCommunication),
          content_preferences: parseJsonField(newPresetContent),
          platform_usage: parseJsonField(newPresetPlatform),
          is_public: false
        })
      })

      if (response.ok) {
        await loadPsychographicPresets()
        setIsCreatePresetDialogOpen(false)
        resetPresetForm()
      }
    } catch (error) {
      console.error('Error creating psychographic preset:', error)
    }
  }

  // Helper function to parse JSON fields
  const parseJsonField = (field: string): Record<string, any> => {
    try {
      return field.trim() ? JSON.parse(field) : {}
    } catch {
      // If not valid JSON, treat as simple key-value pairs
      const pairs = field.split(',').map(pair => pair.trim())
      const result: Record<string, any> = {}
      pairs.forEach(pair => {
        const [key, value] = pair.split(':').map(s => s.trim())
        if (key && value) {
          result[key] = value
        }
      })
      return result
    }
  }

  // Reset form
  const resetPresetForm = () => {
    setNewPresetName('')
    setNewPresetDescription('')
    setNewPresetCategory('professional')
    setNewPresetTraits('')
    setNewPresetDemographics('')
    setNewPresetBehaviors('')
    setNewPresetCommunication('')
    setNewPresetContent('')
    setNewPresetPlatform('')
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional':
        return <Briefcase className="h-4 w-4" />
      case 'demographic':
        return <Users className="h-4 w-4" />
      case 'behavioral':
        return <Activity className="h-4 w-4" />
      case 'psychographic':
        return <Brain className="h-4 w-4" />
      case 'lifestyle':
        return <Heart className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professional':
        return 'bg-blue-100 text-blue-800'
      case 'demographic':
        return 'bg-green-100 text-green-800'
      case 'behavioral':
        return 'bg-yellow-100 text-yellow-800'
      case 'psychographic':
        return 'bg-purple-100 text-purple-800'
      case 'lifestyle':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    loadPsychographicPresets()
    loadUserPersonas()
    loadAudienceSegments()
  }, [loadPsychographicPresets, loadUserPersonas, loadAudienceSegments])

  const filteredPresets = psychographicPresets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || preset.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audience Intelligence at Scale</h2>
          <p className="text-muted-foreground">Manage, Monitor, and Empower Your Personas with advanced psychographic presets</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreatePresetDialogOpen} onOpenChange={setIsCreatePresetDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Preset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Psychographic Preset</DialogTitle>
                <DialogDescription>
                  Create a new preset to start your journey with advanced audience intelligence.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="presetName">Name</Label>
                    <Input
                      id="presetName"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="Enter preset name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="presetCategory">Category</Label>
                    <Select value={newPresetCategory} onValueChange={(value: any) => setNewPresetCategory(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="demographic">Demographic</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="psychographic">Psychographic</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="presetDescription">Description</Label>
                  <Textarea
                    id="presetDescription"
                    value={newPresetDescription}
                    onChange={(e) => setNewPresetDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <Label htmlFor="presetTraits">Personality Traits (JSON or key:value pairs)</Label>
                  <Textarea
                    id="presetTraits"
                    value={newPresetTraits}
                    onChange={(e) => setNewPresetTraits(e.target.value)}
                    placeholder='{"openness": "high", "conscientiousness": "medium"} or openness:high, conscientiousness:medium'
                  />
                </div>
                <div>
                  <Label htmlFor="presetDemographics">Demographics (JSON or key:value pairs)</Label>
                  <Textarea
                    id="presetDemographics"
                    value={newPresetDemographics}
                    onChange={(e) => setNewPresetDemographics(e.target.value)}
                    placeholder='{"age_range": "25-35", "income": "50k-100k"} or age_range:25-35, income:50k-100k'
                  />
                </div>
                <div>
                  <Label htmlFor="presetBehaviors">Behaviors (JSON or key:value pairs)</Label>
                  <Textarea
                    id="presetBehaviors"
                    value={newPresetBehaviors}
                    onChange={(e) => setNewPresetBehaviors(e.target.value)}
                    placeholder='{"online_activity": "high", "shopping_behavior": "research_heavy"}'
                  />
                </div>
                <div>
                  <Label htmlFor="presetCommunication">Communication Style (JSON or key:value pairs)</Label>
                  <Textarea
                    id="presetCommunication"
                    value={newPresetCommunication}
                    onChange={(e) => setNewPresetCommunication(e.target.value)}
                    placeholder='{"tone": "professional", "preferred_channels": ["email", "linkedin"]}'
                  />
                </div>
                <div>
                  <Label htmlFor="presetContent">Content Preferences (JSON or key:value pairs)</Label>
                  <Textarea
                    id="presetContent"
                    value={newPresetContent}
                    onChange={(e) => setNewPresetContent(e.target.value)}
                    placeholder='{"content_types": ["articles", "videos"], "topics": ["technology", "business"]}'
                  />
                </div>
                <div>
                  <Label htmlFor="presetPlatform">Platform Usage (JSON or key:value pairs)</Label>
                  <Textarea
                    id="presetPlatform"
                    value={newPresetPlatform}
                    onChange={(e) => setNewPresetPlatform(e.target.value)}
                    placeholder='{"linkedin": "daily", "twitter": "weekly", "email": "frequent"}'
                  />
                </div>
                <Button onClick={createPsychographicPreset} className="w-full">
                  Create Psychographic Preset
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="presets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="presets">Psychographic Presets</TabsTrigger>
          <TabsTrigger value="personas">User Personas</TabsTrigger>
          <TabsTrigger value="segments">Audience Segments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search psychographic presets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="demographic">Demographic</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="psychographic">Psychographic</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresets.map((preset) => (
              <Card key={preset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(preset.category)}
                      <CardTitle className="text-lg">{preset.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(preset.category)}>
                        {preset.category}
                      </Badge>
                      <Badge variant="outline">
                        {preset.usage_count} uses
                      </Badge>
                    </div>
                    
                    {/* Traits Preview */}
                    {Object.keys(preset.traits).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Key Traits:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(preset.traits).slice(0, 3).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                          {Object.keys(preset.traits).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{Object.keys(preset.traits).length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Demographics Preview */}
                    {Object.keys(preset.demographics).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Demographics:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(preset.demographics).slice(0, 2).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Platform Usage Preview */}
                    {Object.keys(preset.platform_usage).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Platform Usage:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(preset.platform_usage).slice(0, 2).map(([platform, usage]) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}: {String(usage)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPresets.length === 0 && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Psychographic Presets Found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first psychographic preset to start building audience intelligence
              </p>
              <Button onClick={() => setIsCreatePresetDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Preset
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="personas" className="space-y-4">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">User Personas</h3>
            <p className="text-muted-foreground mb-4">
              Create and manage individual user personality profiles based on psychographic presets
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create User Persona
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Audience Segments</h3>
            <p className="text-muted-foreground mb-4">
              Group personas into targeted audience segments for strategic outreach
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Audience Segment
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              View detailed analytics and insights about your audience intelligence
            </p>
            <Button>
              <Eye className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
