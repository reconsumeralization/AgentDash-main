"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Avatar, AvatarFallback } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import {
  Brain,
  MessageSquare,
  Sparkles,
  Lightbulb,
  Target,
  Users,
  Send,
  Copy,
  ThumbsUp,
  Clock,
  TrendingUp,
  Heart,
  Zap,
  Star,
  Coffee,
  Briefcase,
  GraduationCap,
  Globe,
  Calendar,
  ArrowRight,
  RefreshCw
} from "lucide-react"

interface ConversationStarter {
  id: string
  type: 'icebreaker' | 'aspiration' | 'collaboration' | 'personal'
  title: string
  content: string
  context: string
  effectiveness: number
  tags: string[]
  usageCount: number
}

interface EngagementSuggestion {
  id: string
  contactId: string
  contactName: string
  suggestionType: 'follow_up' | 'collaboration' | 'introduction' | 'celebration'
  title: string
  description: string
  suggestedTime: Date
  priority: 'low' | 'medium' | 'high'
  reasoning: string
  conversationStarters: ConversationStarter[]
  successProbability: number
}

interface AIInsight {
  id: string
  type: 'pattern' | 'opportunity' | 'warning' | 'success'
  title: string
  description: string
  actionable: boolean
  impact: 'low' | 'medium' | 'high'
  relatedContacts: string[]
}

export function DefConectAIengagement() {
  const [selectedContact, setSelectedContact] = useState<string>('sarah-chen')
  const [engagementType, setEngagementType] = useState<string>('all')

  const [conversationStarters, _setConversationStarters] = useState<ConversationStarter[]>([
    {
      id: '1',
      type: 'aspiration',
      title: 'Shared Accessibility Passion',
      content: "I noticed your work on inclusive design resonates with my goal to make AR/VR accessible to everyone. What challenges have you faced in implementing accessibility standards for immersive technologies?",
      context: 'Perfect for Sarah Chen based on her AR/VR accessibility aspirations',
      effectiveness: 92,
      tags: ['accessibility', 'AR/VR', 'design', 'innovation'],
      usageCount: 45
    },
    {
      id: '2',
      type: 'collaboration',
      title: 'Climate Tech Synergy',
      content: "Your background in sustainable product development aligns perfectly with my climate tech aspirations. I'd love to learn about how you've approached measuring environmental impact in product design.",
      context: 'Great for Marcus Rodriguez based on shared climate tech interests',
      effectiveness: 88,
      tags: ['climate tech', 'sustainability', 'product development'],
      usageCount: 32
    },
    {
      id: '3',
      type: 'icebreaker',
      title: 'AI Ethics Discussion',
      content: "I've been diving deep into AI ethics lately, and your research papers on responsible AI have been incredibly insightful. What are your thoughts on the current challenges in implementing ethical AI frameworks?",
      context: 'Ideal for Dr. Aisha Patel based on her AI ethics expertise',
      effectiveness: 95,
      tags: ['AI ethics', 'responsible AI', 'research', 'frameworks'],
      usageCount: 67
    },
    {
      id: '4',
      type: 'personal',
      title: 'Career Transition Support',
      content: "Congratulations on your recent publication! I'm currently transitioning into climate tech product management and would greatly value your insights on navigating this career shift.",
      context: 'Timely follow-up for Marcus after his recent publication',
      effectiveness: 87,
      tags: ['career transition', 'climate tech', 'mentorship'],
      usageCount: 23
    },
    {
      id: '5',
      type: 'collaboration',
      title: 'Cross-Tribe Project Idea',
      content: "Your work on AI ethics and my climate tech initiatives could create something powerful. Have you considered how AI could optimize carbon footprint calculations for businesses?",
      context: 'Bridge between AI Ethics Collective and Climate Tech Leaders',
      effectiveness: 91,
      tags: ['AI', 'climate tech', 'cross-tribe', 'innovation'],
      usageCount: 18
    }
  ])

  const [engagementSuggestions, _setEngagementSuggestions] = useState<EngagementSuggestion[]>([
    {
      id: '1',
      contactId: 'sarah-chen',
      contactName: 'Sarah Chen',
      suggestionType: 'collaboration',
      title: 'Propose Joint AR Accessibility Project',
      description: 'Sarah recently published AR research and your team is working on accessibility features. Suggest a collaboration on inclusive AR navigation.',
      suggestedTime: new Date(Date.now() + 86400000), // Tomorrow
      priority: 'high',
      reasoning: 'High aspiration alignment (95%) and complementary skills make this collaboration likely to succeed.',
      conversationStarters: conversationStarters.slice(0, 2),
      successProbability: 78
    },
    {
      id: '2',
      contactId: 'marcus-rodriguez',
      contactName: 'Marcus Rodriguez',
      suggestionType: 'follow_up',
      title: 'Follow Up on Climate Tech Discussion',
      description: 'Marcus mentioned interest in your sustainable product development approach. Follow up to discuss specific implementation strategies.',
      suggestedTime: new Date(Date.now() + 259200000), // 3 days from now
      priority: 'medium',
      reasoning: 'Recent conversation shows strong engagement. Timing is optimal for deeper discussion.',
      conversationStarters: conversationStarters.slice(1, 3),
      successProbability: 85
    },
    {
      id: '3',
      contactId: 'aisha-patel',
      contactName: 'Dr. Aisha Patel',
      suggestionType: 'introduction',
      title: 'Introduce to AI Ethics Researcher',
      description: 'Connect Dr. Patel with another researcher in your network who could benefit from her expertise in ethical AI frameworks.',
      suggestedTime: new Date(Date.now() + 604800000), // 1 week from now
      priority: 'low',
      reasoning: 'Building Dr. Patel\'s network could strengthen tribe relationships and create future collaboration opportunities.',
      conversationStarters: conversationStarters.slice(2, 4),
      successProbability: 62
    }
  ])

  const [aiInsights, _setAiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'High-Value Collaboration Opportunity Detected',
      description: 'Sarah Chen and Marcus Rodriguez have complementary skills that could create a breakthrough in accessible climate tech solutions.',
      actionable: true,
      impact: 'high',
      relatedContacts: ['sarah-chen', 'marcus-rodriguez']
    },
    {
      id: '2',
      type: 'pattern',
      title: 'Engagement Pattern Identified',
      description: 'Contacts respond 40% better to messages that reference their recent achievements rather than generic networking outreach.',
      actionable: true,
      impact: 'medium',
      relatedContacts: []
    },
    {
      id: '3',
      type: 'success',
      title: 'Successful Connection Strategy',
      description: 'Your approach of sharing specific resources related to shared aspirations has resulted in 3 new collaborations this month.',
      actionable: false,
      impact: 'medium',
      relatedContacts: ['sarah-chen', 'aisha-patel']
    },
    {
      id: '4',
      type: 'warning',
      title: 'Engagement Gap Detected',
      description: '3 high-potential contacts haven\'t been engaged in 2 weeks. Consider personalized outreach to maintain momentum.',
      actionable: true,
      impact: 'medium',
      relatedContacts: ['marcus-rodriguez']
    }
  ])

  const [customMessage, setCustomMessage] = useState('')
  const [selectedStarters, setSelectedStarters] = useState<string[]>([])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'icebreaker': return 'bg-blue-100 text-blue-800'
      case 'aspiration': return 'bg-green-100 text-green-800'
      case 'collaboration': return 'bg-purple-100 text-purple-800'
      case 'personal': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-100 text-green-800'
      case 'pattern': return 'bg-blue-100 text-blue-800'
      case 'success': return 'bg-emerald-100 text-emerald-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredStarters = conversationStarters.filter(starter => {
    if (engagementType === 'all') return true
    return starter.type === engagementType
  })

  const filteredSuggestions = engagementSuggestions.filter(suggestion => {
    if (selectedContact === 'all') return true
    return suggestion.contactId === selectedContact
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Engagement Assistant
          </h2>
          <p className="text-muted-foreground">
            Powered by Coral Protocol agents for intelligent conversation starters and engagement suggestions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Insights
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getInsightColor(insight.type)}>
                    {insight.type}
                  </Badge>
                  {insight.impact === 'high' && (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <h4 className="font-medium mb-2">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                {insight.actionable && (
                  <Button size="sm" variant="outline">
                    Take Action
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Conversation Starters */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Smart Conversation Starters
              </CardTitle>
              <Select value={engagementType} onValueChange={setEngagementType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="icebreaker">Icebreakers</SelectItem>
                  <SelectItem value="aspiration">Aspirations</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {filteredStarters.map((starter) => (
                  <div key={starter.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(starter.type)}>
                          {starter.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {starter.effectiveness}% effective
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(starter.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <h4 className="font-medium mb-2">{starter.title}</h4>
                    <p className="text-sm mb-3">{starter.content}</p>
                    <p className="text-xs text-muted-foreground mb-3">{starter.context}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {starter.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Used {starter.usageCount} times
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Engagement Suggestions */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Personalized Engagement Suggestions
              </CardTitle>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  <SelectItem value="sarah-chen">Sarah Chen</SelectItem>
                  <SelectItem value="marcus-rodriguez">Marcus Rodriguez</SelectItem>
                  <SelectItem value="aisha-patel">Dr. Aisha Patel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {filteredSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {suggestion.contactName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground">{suggestion.contactName}</p>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority} priority
                      </Badge>
                    </div>

                    <p className="text-sm mb-3">{suggestion.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {suggestion.suggestedTime.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {suggestion.successProbability}% success rate
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      <strong>AI Reasoning:</strong> {suggestion.reasoning}
                    </p>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Suggested Starters:</p>
                      <div className="space-y-2">
                        {suggestion.conversationStarters.slice(0, 2).map((starter) => (
                          <div key={starter.id} className="p-2 bg-muted/50 rounded text-sm">
                            {starter.content}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1">
                        <Send className="h-3 w-3 mr-1" />
                        Send Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Custom Message Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Custom Message Composer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Conversation Starters</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {conversationStarters.slice(0, 4).map((starter) => (
                  <div key={starter.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={starter.id}
                      checked={selectedStarters.includes(starter.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStarters([...selectedStarters, starter.id])
                        } else {
                          setSelectedStarters(selectedStarters.filter(id => id !== starter.id))
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={starter.id} className="text-sm">
                      {starter.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Compose Your Message</label>
              <Textarea
                placeholder="Start typing your personalized message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              const selectedContent = conversationStarters
                .filter(starter => selectedStarters.includes(starter.id))
                .map(starter => starter.content)
                .join('\n\n')
              setCustomMessage(selectedContent)
            }}>
              <Zap className="h-4 w-4 mr-2" />
              Use Selected Starters
            </Button>
            <Button>
              <Brain className="h-4 w-4 mr-2" />
              AI Enhance Message
            </Button>
            <Button variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
