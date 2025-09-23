"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { DefConectProjectManagement } from "./defconect-project-management"
import { DefConectAnalyticsDashboard } from "./defconect-analytics-dashboard"
import { DefConectAIengagement } from "./defconect-ai-engagement"
import {
  Users,
  Target,
  Heart,
  Zap,
  TrendingUp,
  MessageCircle,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Briefcase,
  Network,
  Brain,
  Sparkles,
  UserPlus,
  Send,
  BarChart3,
  Mail,
  Linkedin,
  FileText,
  Bell,
  Settings,
  Download,
  Upload
} from "lucide-react"

interface Professional {
  id: string
  name: string
  title: string
  company: string
  location: string
  avatar: string
  aspirations: string[]
  skills: string[]
  causes: string[]
  learning: string[]
  tribeScore: number
  sharedGoals: string[]
  collaborationPotential: number
  lastActive: Date
  projects: string[]
  achievements: string[]
  // CRM-specific fields
  relationshipStatus: 'prospect' | 'contact' | 'qualified' | 'tribe_member'
  engagementLevel: 'low' | 'medium' | 'high' | 'very_high'
  lastInteraction: Date
  interactionCount: number
  linkedinUrl?: string
  email?: string
  phone?: string
  notes: string[]
  tags: string[]
  followUpDate?: Date
  referralSource?: string
}

interface Tribe {
  id: string
  name: string
  description: string
  members: Professional[]
  sharedAspirations: string[]
  collaborationHistory: number
  activeProjects: number
  growthRate: number
}

interface Aspiration {
  id: string
  category: string
  description: string
  timeline: string
  skills: string[]
  resources: string[]
  collaborators: string[]
}

export function DefConectNetworking() {
  const [professionals, _setProfessionals] = useState<Professional[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'UX Designer',
      company: 'TechFlow',
      location: 'San Francisco, CA',
      avatar: '/placeholder-user.jpg',
      aspirations: ['Accessibility Innovation', 'AR/VR Design', 'Design Leadership'],
      skills: ['Figma', 'User Research', 'Prototyping', 'Accessibility'],
      causes: ['Digital Inclusion', 'Sustainable Design'],
      learning: ['Machine Learning', 'Augmented Reality'],
      tribeScore: 95,
      sharedGoals: ['Accessibility Innovation', 'AR/VR Design'],
      collaborationPotential: 92,
      lastActive: new Date(),
      projects: ['Accessible AR Interface', 'Inclusive Design System'],
      achievements: ['Award-winning accessibility project', 'Published AR research'],
      // CRM fields
      relationshipStatus: 'tribe_member',
      engagementLevel: 'very_high',
      lastInteraction: new Date(Date.now() - 86400000), // 1 day ago
      interactionCount: 12,
      linkedinUrl: 'https://linkedin.com/in/sarahchen',
      email: 'sarah.chen@techflow.com',
      phone: '+1-415-555-0123',
      notes: ['Great collaborator on accessibility projects', 'Shared AR/VR design vision', 'Recommended for design leadership roles'],
      tags: ['Accessibility Expert', 'AR/VR Enthusiast', 'Design Leader'],
      followUpDate: new Date(Date.now() + 604800000), // 1 week from now
      referralSource: 'LinkedIn Connection'
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      title: 'Product Manager',
      company: 'GreenTech Solutions',
      location: 'Austin, TX',
      avatar: '/placeholder-user.jpg',
      aspirations: ['Sustainable Product Development', 'Climate Tech Leadership', 'Social Impact'],
      skills: ['Product Strategy', 'Data Analysis', 'Stakeholder Management'],
      causes: ['Climate Action', 'Social Impact'],
      learning: ['Python for AI', 'Sustainable Engineering'],
      tribeScore: 88,
      sharedGoals: ['Sustainable Product Development', 'Climate Tech'],
      collaborationPotential: 85,
      lastActive: new Date(Date.now() - 3600000),
      projects: ['Carbon Footprint Tracker', 'Green Supply Chain Platform'],
      achievements: ['Launched 3 climate-focused products', 'Reduced company carbon footprint by 40%'],
      // CRM fields
      relationshipStatus: 'qualified',
      engagementLevel: 'high',
      lastInteraction: new Date(Date.now() - 172800000), // 2 days ago
      interactionCount: 8,
      linkedinUrl: 'https://linkedin.com/in/marcusrodriguez',
      email: 'marcus.rodriguez@greentech.com',
      phone: '+1-512-555-0456',
      notes: ['Excellent climate tech PM', 'Strong sustainability focus', 'Looking to collaborate on green initiatives'],
      tags: ['Climate Tech PM', 'Sustainability Expert', 'Product Strategy'],
      followUpDate: new Date(Date.now() + 259200000), // 3 days from now
      referralSource: 'Climate Tech Conference'
    },
    {
      id: '3',
      name: 'Dr. Aisha Patel',
      title: 'AI Research Scientist',
      company: 'Innovation Labs',
      location: 'Boston, MA',
      avatar: '/placeholder-user.jpg',
      aspirations: ['AI Ethics', 'Responsible AI', 'Tech for Good'],
      skills: ['Machine Learning', 'Python', 'Research', 'Ethics'],
      causes: ['AI Ethics', 'Tech for Good'],
      learning: ['Quantum Computing', 'Ethical AI Frameworks'],
      tribeScore: 91,
      sharedGoals: ['AI Ethics', 'Responsible AI'],
      collaborationPotential: 89,
      lastActive: new Date(Date.now() - 1800000),
      projects: ['Ethical AI Framework', 'Bias Detection Tool'],
      achievements: ['Published 15 AI ethics papers', 'Keynote speaker at AI Ethics Summit'],
      // CRM fields
      relationshipStatus: 'tribe_member',
      engagementLevel: 'very_high',
      lastInteraction: new Date(Date.now() - 7200000), // 2 hours ago
      interactionCount: 15,
      linkedinUrl: 'https://linkedin.com/in/dr-aisha-patel',
      email: 'aisha.patel@innovationlabs.com',
      phone: '+1-617-555-0789',
      notes: ['Leading AI ethics researcher', 'Excellent collaborator', 'Potential for joint research projects'],
      tags: ['AI Ethics Expert', 'Research Scientist', 'Responsible AI'],
      followUpDate: new Date(Date.now() + 864000000), // 10 days from now
      referralSource: 'Academic Conference'
    }
  ])

  const [tribes, _setTribes] = useState<Tribe[]>([
    {
      id: '1',
      name: 'Accessibility Innovators',
      description: 'Professionals passionate about creating inclusive digital experiences',
      members: professionals.slice(0, 2),
      sharedAspirations: ['Accessibility Innovation', 'Inclusive Design'],
      collaborationHistory: 12,
      activeProjects: 3,
      growthRate: 25
    },
    {
      id: '2',
      name: 'Climate Tech Leaders',
      description: 'Building sustainable solutions for a better future',
      members: professionals.slice(1, 3),
      sharedAspirations: ['Sustainable Development', 'Climate Action'],
      collaborationHistory: 8,
      activeProjects: 2,
      growthRate: 18
    }
  ])

  const [aspirations, _setAspirations] = useState<Aspiration[]>([
    {
      id: '1',
      category: 'Learning',
      description: 'Master Python for AI and machine learning applications',
      timeline: '6 months',
      skills: ['Python', 'Machine Learning', 'Data Science'],
      resources: ['Online courses', 'Coding bootcamp', 'Mentorship'],
      collaborators: ['AI researchers', 'Data scientists', 'ML engineers']
    },
    {
      id: '2',
      category: 'Career',
      description: 'Transition to product management in climate tech',
      timeline: '12 months',
      skills: ['Product Strategy', 'Climate Tech', 'Sustainability'],
      resources: ['Product management course', 'Climate tech network', 'Industry mentors'],
      collaborators: ['Climate tech PMs', 'Sustainability experts', 'Product strategists']
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [_selectedTribe, _setSelectedTribe] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('discover')

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.aspirations.some(asp => asp.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const getTribeColor = (tribeScore: number) => {
    if (tribeScore >= 90) return 'text-green-600 bg-green-100'
    if (tribeScore >= 80) return 'text-blue-600 bg-blue-100'
    if (tribeScore >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getCollaborationColor = (potential: number) => {
    if (potential >= 90) return 'text-green-600 bg-green-100'
    if (potential >= 80) return 'text-blue-600 bg-blue-100'
    if (potential >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            DefConect Networking
          </h2>
          <p className="text-muted-foreground">
            Find your professional tribe based on shared aspirations and future goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered Matching
          </Badge>
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Tribe
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tribe Members</p>
                <p className="text-2xl font-bold">{professionals.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tribes</p>
                <p className="text-2xl font-bold">{tribes.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shared Goals</p>
                <p className="text-2xl font-bold">{aspirations.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collaborations</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            CRM
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="ai-engagement" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Engagement
          </TabsTrigger>
          <TabsTrigger value="tribes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tribes
          </TabsTrigger>
          <TabsTrigger value="aspirations" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Aspirations
          </TabsTrigger>
          <TabsTrigger value="collaborate" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Collaborate
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, title, or aspirations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfessionals.map((professional) => (
                <Card key={professional.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-bold">
                            {professional.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{professional.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{professional.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTribeColor(professional.tribeScore)}>
                          {professional.tribeScore}% Match
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      {professional.company}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {professional.location}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Aspirations:</div>
                      <div className="flex flex-wrap gap-1">
                        {professional.aspirations.slice(0, 2).map((aspiration) => (
                          <Badge key={aspiration} variant="secondary" className="text-xs">
                            {aspiration}
                          </Badge>
                        ))}
                        {professional.aspirations.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{professional.aspirations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Learning:</div>
                      <div className="flex flex-wrap gap-1">
                        {professional.learning.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={getCollaborationColor(professional.collaborationPotential)}>
                          {professional.collaborationPotential}% Collaboration
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button size="sm">
                          <UserPlus className="h-3 w-3 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* CRM Tab */}
        <TabsContent value="crm" className="space-y-6">
          {/* CRM Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                    <p className="text-2xl font-bold">{professionals.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Relationships</p>
                    <p className="text-2xl font-bold">
                      {professionals.filter(p => p.engagementLevel === 'high' || p.engagementLevel === 'very_high').length}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Follow-ups</p>
                    <p className="text-2xl font-bold">
                      {professionals.filter(p => p.followUpDate && p.followUpDate > new Date()).length}
                    </p>
                  </div>
                  <Bell className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tribe Members</p>
                    <p className="text-2xl font-bold">
                      {professionals.filter(p => p.relationshipStatus === 'tribe_member').length}
                    </p>
                  </div>
                  <Network className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Relationship Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Relationship Pipeline
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your professional relationships through the DefConect pipeline
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {professionals.filter(p => p.relationshipStatus === 'prospect').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Prospects</div>
                  <div className="text-xs text-gray-500 mt-1">Initial connections</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {professionals.filter(p => p.relationshipStatus === 'contact').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Contacts</div>
                  <div className="text-xs text-blue-500 mt-1">Active engagement</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {professionals.filter(p => p.relationshipStatus === 'qualified').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Qualified</div>
                  <div className="text-xs text-yellow-500 mt-1">High potential</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {professionals.filter(p => p.relationshipStatus === 'tribe_member').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Tribe Members</div>
                  <div className="text-xs text-green-500 mt-1">Active collaborators</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Contact Management</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {professionals.map((professional) => (
                  <Card key={professional.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">
                              {professional.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{professional.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{professional.title} at {professional.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              professional.relationshipStatus === 'tribe_member' ? 'bg-green-100 text-green-800' :
                              professional.relationshipStatus === 'qualified' ? 'bg-yellow-100 text-yellow-800' :
                              professional.relationshipStatus === 'contact' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {professional.relationshipStatus.replace('_', ' ')}
                          </Badge>
                          <Badge
                            className={
                              professional.engagementLevel === 'very_high' ? 'bg-green-100 text-green-800' :
                              professional.engagementLevel === 'high' ? 'bg-blue-100 text-blue-800' :
                              professional.engagementLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {professional.engagementLevel.replace('_', ' ')} engagement
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Interactions</div>
                          <div className="font-medium">{professional.interactionCount}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Contact</div>
                          <div className="font-medium">
                            {professional.lastInteraction.toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Tribe Score</div>
                          <div className="font-medium">{professional.tribeScore}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Follow-up</div>
                          <div className="font-medium">
                            {professional.followUpDate ?
                              (professional.followUpDate > new Date() ?
                                professional.followUpDate.toLocaleDateString() :
                                'Overdue'
                              ) : 'None'
                            }
                          </div>
                        </div>
                      </div>

                      {professional.tags.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Tags:</div>
                          <div className="flex flex-wrap gap-1">
                            {professional.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {professional.notes.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Recent Notes:</div>
                          <ul className="text-sm space-y-1">
                            {professional.notes.slice(0, 2).map((note, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                                {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {professional.linkedinUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={professional.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-3 w-3 mr-1" />
                              LinkedIn
                            </a>
                          </Button>
                        )}
                        {professional.email && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`mailto:${professional.email}`}>
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Add Note
                        </Button>
                        <Button size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Update Status
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="h-full">
          <DefConectProjectManagement />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="h-full">
          <DefConectAnalyticsDashboard />
        </TabsContent>

        {/* AI Engagement Tab */}
        <TabsContent value="ai-engagement" className="h-full">
          <DefConectAIengagement />
        </TabsContent>

        {/* Tribes Tab */}
        <TabsContent value="tribes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tribes.map((tribe) => (
              <Card key={tribe.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {tribe.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{tribe.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Shared Aspirations:</div>
                    <div className="flex flex-wrap gap-1">
                      {tribe.sharedAspirations.map((aspiration) => (
                        <Badge key={aspiration} variant="secondary" className="text-xs">
                          {aspiration}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{tribe.members.length}</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{tribe.activeProjects}</div>
                      <div className="text-xs text-muted-foreground">Active Projects</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">+{tribe.growthRate}%</div>
                      <div className="text-xs text-muted-foreground">Growth Rate</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Join Discussion
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Plus className="h-3 w-3 mr-1" />
                      Join Tribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aspirations Tab */}
        <TabsContent value="aspirations" className="space-y-4">
          <div className="space-y-4">
            {aspirations.map((aspiration) => (
              <Card key={aspiration.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {aspiration.description}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline">{aspiration.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {aspiration.timeline}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Skills to Develop:</div>
                    <div className="flex flex-wrap gap-1">
                      {aspiration.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Resources:</div>
                    <div className="flex flex-wrap gap-1">
                      {aspiration.resources.map((resource) => (
                        <Badge key={resource} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Ideal Collaborators:</div>
                    <div className="flex flex-wrap gap-1">
                      {aspiration.collaborators.map((collaborator) => (
                        <Badge key={collaborator} variant="default" className="text-xs">
                          {collaborator}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Search className="h-3 w-3 mr-1" />
                      Find Collaborators
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Plus className="h-3 w-3 mr-1" />
                      Add to Goals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Collaborate Tab */}
        <TabsContent value="collaborate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Dream Team Builder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Build your ideal team based on shared aspirations and complementary skills
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Description</label>
                <Textarea
                  placeholder="Describe your project and the kind of collaborators you're looking for..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">UX Design</Badge>
                  <Badge variant="secondary">Product Management</Badge>
                  <Badge variant="secondary">AI/ML</Badge>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Skill
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Shared Aspirations</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Accessibility Innovation</Badge>
                  <Badge variant="default">Climate Tech</Badge>
                  <Badge variant="default">AI Ethics</Badge>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Aspiration
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Brain className="h-4 w-4 mr-2" />
                  AI-Powered Team Matching
                </Button>
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Share Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
