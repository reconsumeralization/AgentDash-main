"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  Settings,
  Minimize2,
  Maximize2,
  X,
  Zap,
  Brain,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Camera,
  Image,
  FileText,
  Link,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  Network,
  Users,
  Database,
  Globe,
  Smartphone,
  Laptop,
  Mail,
  Phone,
  Video,
  Music,
  Gamepad2,
  BookOpen,
  Code,
  Palette,
  Shield,
  Lock,
  Unlock,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Upload,
  Share,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Archive,
  Trash2,
  Edit,
  Copy,
  MoreHorizontal,
  Search,
  Filter,
  Sort,
  Grid,
  List,
  Map,
  Layers,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  TrendingDown,
  Award,
  Trophy,
  Crown,
  Key,
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Pause,
  Play,
  Stop,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Camera as CameraIcon,
  Image as ImageIcon,
  FileText as FileTextIcon,
  Link as LinkIcon,
  Smile as SmileIcon,
  Frown as FrownIcon,
  Meh as MehIcon
} from "lucide-react"
import { cn } from "@/lib"
import { useContextSurfacer } from '@/lib'
import { PsychographicPreset, UserPersona, Project, KnowledgeBase } from '@/lib/supabase'

interface ConversationalMessage {
  id: string
  type: 'user' | 'agent' | 'system' | 'action'
  content: string
  timestamp: Date
  context?: string
  actions?: ConversationalAction[]
  metadata?: {
    confidence?: number
    intent?: string
    sentiment?: 'positive' | 'negative' | 'neutral'
    entities?: Record<string, any>
    suggestions?: string[]
    attachments?: FileAttachment[]
  }
  agentId?: string
  agentName?: string
  agentPersona?: PsychographicPreset
}

interface ConversationalAction {
  id: string
  label: string
  action: string
  type: 'primary' | 'secondary' | 'danger'
  icon?: string
  parameters?: Record<string, any>
  requiresConfirmation?: boolean
}

interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url?: string
  preview?: string
}

interface AgentCapability {
  id: string
  name: string
  description: string
  icon: string
  category: 'knowledge' | 'network' | 'project' | 'analytics' | 'automation'
  parameters?: Record<string, any>
}

interface EnhancedConversationalInterfaceProps {
  userId: string
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  persistent?: boolean
  voiceEnabled?: boolean
  multiModal?: boolean
  agentPersonas?: PsychographicPreset[]
  userPersona?: UserPersona
}

const systemCapabilities: AgentCapability[] = [
  {
    id: 'knowledge-management',
    name: 'Knowledge Management',
    description: 'Manage knowledge bases, upload files, and organize information',
    icon: 'Database',
    category: 'knowledge',
    parameters: { canUpload: true, canSearch: true, canOrganize: true }
  },
  {
    id: 'network-analysis',
    name: 'Network Analysis',
    description: 'Analyze connections, visualize networks, and identify opportunities',
    icon: 'Network',
    category: 'network',
    parameters: { canVisualize: true, canAnalyze: true, canRecommend: true }
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Create projects, manage files, and coordinate team collaboration',
    icon: 'Target',
    category: 'project',
    parameters: { canCreate: true, canManage: true, canCollaborate: true }
  },
  {
    id: 'persona-management',
    name: 'Persona Management',
    description: 'Create and manage psychographic presets and user personas',
    icon: 'Users',
    category: 'analytics',
    parameters: { canCreate: true, canAnalyze: true, canSegment: true }
  },
  {
    id: 'linkedin-automation',
    name: 'LinkedIn Automation',
    description: 'Automate LinkedIn activities, manage connections, and optimize outreach',
    icon: 'Globe',
    category: 'automation',
    parameters: { canConnect: true, canPost: true, canAnalyze: true }
  }
]

export function EnhancedConversationalInterface({
  userId,
  className,
  position = 'bottom-right',
  persistent = true,
  voiceEnabled = true,
  multiModal = true,
  agentPersonas = [],
  userPersona
}: EnhancedConversationalInterfaceProps) {
  const { 
    contextSurfacer, 
    guidance, 
    adaptiveState,
    updateUserContext,
    updateAgenticContext,
    updateUseCaseContext 
  } = useContextSurfacer()
  
  const [messages, setMessages] = useState<ConversationalMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [activeCapabilities, setActiveCapabilities] = useState<AgentCapability[]>([])
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [emotion, setEmotion] = useState<'positive' | 'negative' | 'neutral'>('neutral')
  const [conversationContext, setConversationContext] = useState<Record<string, any>>({})
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize with contextual welcome message
  useEffect(() => {
    const generateContextualWelcomeMessage = (): string => {
      const context = contextSurfacer.getContextSummary()
      const { useCase, user } = context

      if (userPersona) {
        return `Hello! I'm your AI assistant, specialized in ${userPersona.name}. I understand you're working on ${useCase.domain} and I'm here to help you achieve your goals. I can assist with knowledge management, network analysis, project coordination, and much more. What would you like to work on today?`
      }

      return `Welcome to DefConect! I'm your intelligent assistant, ready to help you with ${useCase.domain} workflows. I can manage your knowledge bases, analyze your network, coordinate projects, and automate LinkedIn activities. How can I assist you today?`
    }

    const generateContextualActions = (): ConversationalAction[] => {
      const context = contextSurfacer.getContextSummary()
      const { useCase } = context

      const baseActions: ConversationalAction[] = [
        {
          id: 'show-knowledge',
          label: 'Show Knowledge Bases',
          action: 'show_knowledge_bases',
          type: 'primary',
          icon: 'Database'
        },
        {
          id: 'analyze-network',
          label: 'Analyze Network',
          action: 'analyze_network',
          type: 'primary',
          icon: 'Network'
        },
        {
          id: 'create-project',
          label: 'Create Project',
          action: 'create_project',
          type: 'secondary',
          icon: 'Target'
        }
      ]

      if (useCase.domain === 'linkedin') {
        baseActions.push({
          id: 'linkedin-automation',
          label: 'LinkedIn Automation',
          action: 'linkedin_automation',
          type: 'primary',
          icon: 'Globe'
        })
      }

      return baseActions
    }

    const generateContextualSuggestions = (): string[] => {
      const context = contextSurfacer.getContextSummary()
      const { useCase } = context

      const suggestions = [
        "Create a new knowledge base",
        "Analyze my network connections",
        "Set up a new project",
        "Upload files to my knowledge base"
      ]

      if (useCase.domain === 'linkedin') {
        suggestions.push(
          "Find potential LinkedIn connections",
          "Analyze my LinkedIn engagement",
          "Set up automated LinkedIn outreach"
        )
      }

      return suggestions
    }

    const welcomeMessage: ConversationalMessage = {
      id: 'welcome',
      type: 'agent',
      content: generateContextualWelcomeMessage(),
      timestamp: new Date(),
      context: 'welcome',
      actions: generateContextualActions(),
      metadata: {
        confidence: 0.9,
        intent: 'welcome',
        sentiment: 'positive',
        suggestions: generateContextualSuggestions()
      },
      agentId: 'system',
      agentName: 'DefConect Assistant',
      agentPersona: userPersona?.psychographic_preset_id ? 
        agentPersonas.find(p => p.id === userPersona.psychographic_preset_id) : 
        agentPersonas[0]
    }
    setMessages([welcomeMessage])
    setActiveCapabilities(systemCapabilities)
  }, [userPersona, agentPersonas, contextSurfacer])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateContextualWelcomeMessage = (): string => {
    const context = contextSurfacer.getContextSummary()
    const { useCase, user } = context

    if (userPersona) {
      return `Hello! I'm your AI assistant, specialized in ${userPersona.name}. I understand you're working on ${useCase.domain} and I'm here to help you achieve your goals. I can assist with knowledge management, network analysis, project coordination, and much more. What would you like to work on today?`
    }

    return `Welcome to DefConect! I'm your intelligent assistant, ready to help you with ${useCase.domain} workflows. I can manage your knowledge bases, analyze your network, coordinate projects, and automate LinkedIn activities. How can I assist you today?`
  }

  const generateContextualActions = (): ConversationalAction[] => {
    const context = contextSurfacer.getContextSummary()
    const { useCase } = context

    const baseActions: ConversationalAction[] = [
      {
        id: 'show-knowledge',
        label: 'Show Knowledge Bases',
        action: 'show_knowledge_bases',
        type: 'primary',
        icon: 'Database'
      },
      {
        id: 'analyze-network',
        label: 'Analyze Network',
        action: 'analyze_network',
        type: 'primary',
        icon: 'Network'
      },
      {
        id: 'create-project',
        label: 'Create Project',
        action: 'create_project',
        type: 'secondary',
        icon: 'Target'
      }
    ]

    if (useCase.domain === 'linkedin') {
      baseActions.push({
        id: 'linkedin-automation',
        label: 'LinkedIn Automation',
        action: 'linkedin_automation',
        type: 'primary',
        icon: 'Globe'
      })
    }

    return baseActions
  }

  const generateContextualSuggestions = (): string[] => {
    const context = contextSurfacer.getContextSummary()
    const { useCase } = context

    const suggestions = [
      "Create a new knowledge base",
      "Analyze my network connections",
      "Set up a new project",
      "Upload files to my knowledge base"
    ]

    if (useCase.domain === 'linkedin') {
      suggestions.push(
        "Find potential LinkedIn connections",
        "Analyze my LinkedIn engagement",
        "Set up automated LinkedIn outreach"
      )
    }

    return suggestions
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: ConversationalMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      metadata: {
        sentiment: emotion,
        attachments: attachments
      }
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setAttachments([])
    setIsTyping(true)

    try {
      // Process message through enhanced AI system
      const response = await processConversationalMessage(inputValue, attachments)
      setMessages(prev => [...prev, response])
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: ConversationalMessage = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        metadata: {
          confidence: 0.5,
          intent: 'error',
          sentiment: 'negative'
        }
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const processConversationalMessage = async (
    message: string, 
    attachments: FileAttachment[]
  ): Promise<ConversationalMessage> => {
    // Simulate AI processing with enhanced context awareness
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const context = contextSurfacer.getContextSummary()
    const { useCase, user } = context

    // Enhanced intent recognition and response generation
    const intent = analyzeIntent(message)
    const response = await generateEnhancedResponse(message, intent, context, attachments)

    return response
  }

  const analyzeIntent = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('create') && lowerMessage.includes('project')) return 'create_project'
    if (lowerMessage.includes('upload') || lowerMessage.includes('file')) return 'upload_file'
    if (lowerMessage.includes('network') || lowerMessage.includes('connection')) return 'analyze_network'
    if (lowerMessage.includes('knowledge') || lowerMessage.includes('base')) return 'knowledge_management'
    if (lowerMessage.includes('persona') || lowerMessage.includes('psychographic')) return 'persona_management'
    if (lowerMessage.includes('linkedin') || lowerMessage.includes('connect')) return 'linkedin_automation'
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) return 'help'
    if (lowerMessage.includes('analyze') || lowerMessage.includes('show me')) return 'analysis'

    return 'general'
  }

  const generateEnhancedResponse = async (
    message: string,
    intent: string,
    context: any,
    attachments: FileAttachment[]
  ): Promise<ConversationalMessage> => {
    let response = ''
    let actions: ConversationalAction[] = []
    let suggestions: string[] = []

    switch (intent) {
      case 'create_project':
        response = `I'll help you create a new project. Let me gather some information about what you'd like to build.`
        actions = [
          {
            id: 'project-wizard',
            label: 'Start Project Wizard',
            action: 'start_project_wizard',
            type: 'primary',
            icon: 'Target'
          },
          {
            id: 'quick-project',
            label: 'Quick Project Setup',
            action: 'quick_project_setup',
            type: 'secondary',
            icon: 'Zap'
          }
        ]
        suggestions = [
          "Create a LinkedIn automation project",
          "Set up a knowledge management project",
          "Start a network analysis project"
        ]
        break

      case 'upload_file':
        response = `I can help you upload files to your knowledge base. You can drag and drop files or use the upload button.`
        actions = [
          {
            id: 'upload-files',
            label: 'Upload Files',
            action: 'upload_files',
            type: 'primary',
            icon: 'Upload'
          },
          {
            id: 'select-knowledge-base',
            label: 'Select Knowledge Base',
            action: 'select_knowledge_base',
            type: 'secondary',
            icon: 'Database'
          }
        ]
        break

      case 'analyze_network':
        response = `I'll analyze your network connections and provide insights about your professional relationships.`
        actions = [
          {
            id: 'network-visualization',
            label: 'Show Network Graph',
            action: 'show_network_visualization',
            type: 'primary',
            icon: 'Network'
          },
          {
            id: 'connection-analysis',
            label: 'Analyze Connections',
            action: 'analyze_connections',
            type: 'secondary',
            icon: 'BarChart3'
          }
        ]
        break

      case 'knowledge_management':
        response = `I can help you manage your knowledge bases, organize information, and find relevant content.`
        actions = [
          {
            id: 'show-knowledge-bases',
            label: 'Show Knowledge Bases',
            action: 'show_knowledge_bases',
            type: 'primary',
            icon: 'Database'
          },
          {
            id: 'search-knowledge',
            label: 'Search Knowledge',
            action: 'search_knowledge',
            type: 'secondary',
            icon: 'Search'
          }
        ]
        break

      case 'persona_management':
        response = `I'll help you create and manage psychographic presets and user personas for better audience targeting.`
        actions = [
          {
            id: 'create-persona',
            label: 'Create Persona',
            action: 'create_persona',
            type: 'primary',
            icon: 'Users'
          },
          {
            id: 'analyze-audience',
            label: 'Analyze Audience',
            action: 'analyze_audience',
            type: 'secondary',
            icon: 'BarChart3'
          }
        ]
        break

      case 'linkedin_automation':
        response = `I can help you automate LinkedIn activities, manage connections, and optimize your professional outreach.`
        actions = [
          {
            id: 'linkedin-dashboard',
            label: 'LinkedIn Dashboard',
            action: 'show_linkedin_dashboard',
            type: 'primary',
            icon: 'Globe'
          },
          {
            id: 'connection-strategy',
            label: 'Connection Strategy',
            action: 'connection_strategy',
            type: 'secondary',
            icon: 'Target'
          }
        ]
        break

      default:
        response = `I understand you're asking about "${message}". Let me provide some context-aware assistance based on your current ${context.useCase.domain} workflow.`
        actions = generateContextualActions()
        suggestions = generateContextualSuggestions()
    }

    return {
      id: `agent_${Date.now()}`,
      type: 'agent',
      content: response,
      timestamp: new Date(),
      context: context.useCase.domain,
      actions,
      metadata: {
        confidence: 0.8,
        intent,
        sentiment: 'positive',
        suggestions
      },
      agentId: selectedAgent || 'system',
      agentName: 'DefConect Assistant'
    }
  }

  const handleQuickAction = async (action: ConversationalAction) => {
    const actionMessage: ConversationalMessage = {
      id: `action_${Date.now()}`,
      type: 'action',
      content: `Executing: ${action.label}`,
      timestamp: new Date(),
      metadata: {
        confidence: 1.0,
        intent: action.action,
        sentiment: 'neutral'
      }
    }

    setMessages(prev => [...prev, actionMessage])

    // Execute the action based on the action type
    await executeAction(action)
  }

  const executeAction = async (action: ConversationalAction) => {
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 1000))

    const response: ConversationalMessage = {
      id: `result_${Date.now()}`,
      type: 'agent',
      content: `✅ ${action.label} completed successfully!`,
      timestamp: new Date(),
      metadata: {
        confidence: 0.9,
        intent: 'action_completed',
        sentiment: 'positive'
      }
    }

    setMessages(prev => [...prev, response])
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const newAttachments: FileAttachment[] = files.map(file => ({
      id: `file_${Date.now()}_${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const handleVoiceToggle = () => {
    setIsListening(!isListening)
    // Implement voice recognition here
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      default:
        return 'bottom-4 right-4'
    }
  }

  return (
    <div className={cn(
      'fixed z-50 transition-all duration-300',
      getPositionClasses(),
      isMinimized ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
      className
    )}>
      <Card className={cn(
        'w-96 h-[600px] shadow-2xl border-2',
        'bg-gradient-to-br from-white to-gray-50',
        'backdrop-blur-sm'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">DefConect Assistant</CardTitle>
                <CardDescription className="text-xs">
                  {selectedAgent ? `Agent: ${selectedAgent}` : 'Multi-Agent System'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {voiceEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceToggle}
                  className={cn(
                    'w-8 h-8 p-0',
                    isListening ? 'text-red-500' : 'text-gray-500'
                  )}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col h-full">
          {/* Messages Area */}
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-2',
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.type !== 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-3 text-sm',
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.type === 'action'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <div>{message.content}</div>
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.actions.map((action) => (
                          <Button
                            key={action.id}
                            variant={action.type === 'primary' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleQuickAction(action)}
                            className="text-xs"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    {message.metadata?.suggestions && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Suggestions:</div>
                        <div className="flex flex-wrap gap-1">
                          {message.metadata.suggestions.map((suggestion, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-gray-200"
                              onClick={() => setInputValue(suggestion)}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {message.type === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Attachments:</div>
              <div className="flex flex-wrap gap-1">
                {attachments.map((attachment) => (
                  <Badge key={attachment.id} variant="outline" className="text-xs">
                    {attachment.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-2">
            {multiModal && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              className="w-8 h-8 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  )
}
