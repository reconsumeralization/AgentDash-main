/**
 * 🤖 AI CHAT INTERFACE COMPONENT - Intelligent Chat-Based Platform
 * Simple chat-based GUI with intelligent context switching and AI assistance
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Settings, Palette, Zap, Brain, Target, TrendingUp, Users, FileText, Shield, BarChart3, MessageSquare, Sparkles, Lightbulb, CheckCircle, AlertCircle, Clock, Star } from 'lucide-react'
import { AIChatInterface, ChatMessage, ChatContext, ChatAction } from '@/lib'
import { ComprehensiveTribeManager } from '@/lib'

interface AIChatInterfaceProps {
  userId: string
  initialContext?: ChatContext
  onContextSwitch?: (context: ChatContext) => void
  onActionExecuted?: (action: ChatAction) => void
}

export default function AIChatInterfaceComponent({ 
  userId, 
  initialContext, 
  onContextSwitch, 
  onActionExecuted 
}: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentContext, setCurrentContext] = useState<ChatContext>(initialContext || {
    currentDomain: 'general',
    userPreferences: {
      communicationStyle: 'collaborative',
      notificationLevel: 'moderate',
      aiPersonality: 'helpful',
      preferredPlatforms: ['linkedin'],
      tribeFocus: [],
      projectTypes: []
    },
    sessionHistory: [],
    collaborationMode: 'solo'
  })
  const [showSettings, setShowSettings] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [pendingActions, setPendingActions] = useState<ChatAction[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize AI Chat Interface and Tribe Manager
  const [aiChatInterface] = useState(() => {
    // Mock guidance engine for now
    const mockGuidanceEngine = {
      generateCode: async (requirements: any) => ({ code: 'Generated response' })
    }
    return new AIChatInterface(mockGuidanceEngine)
  })

  const [tribeManager] = useState(() => {
    return new ComprehensiveTribeManager(aiChatInterface)
  })

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Welcome to your AI-powered social networking and project management platform! I'm here to help you with:

🎯 **Social Media Management** - LinkedIn, Twitter, Facebook, Instagram
👥 **Tribe & Community Building** - Create and manage professional communities
🚀 **Cross-Platform Projects** - Collaborate across multiple platforms
📊 **Aspirational Analytics** - Discover like-minded professionals
🔒 **Zero Trust File Sharing** - Secure collaboration tools
🤝 **Strategic Partner Communication** - AI-assisted business networking
🛡️ **Enterprise Governance** - Compliance and security management

What would you like to work on today?`,
      timestamp: new Date(),
      context: currentContext,
      metadata: {
        confidence: 1.0,
        intent: 'welcome',
        sentiment: 'positive'
      }
    }
    setMessages([welcomeMessage])
  }, [currentContext])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    try {
      // Process message through AI Chat Interface
      const aiResponse = await aiChatInterface.processMessage(userMessage, userId)
      
      // Update messages
      setMessages(prev => [...prev, aiResponse])
      
      // Update context if changed
      const newContext = aiChatInterface.getCurrentContext()
      if (JSON.stringify(newContext) !== JSON.stringify(currentContext)) {
        setCurrentContext(newContext)
        onContextSwitch?.(newContext)
      }

      // Handle pending actions
      if (aiResponse.actions && aiResponse.actions.length > 0) {
        setPendingActions(aiResponse.actions)
        setShowActions(true)
      }

      // Notify action execution
      aiResponse.actions?.forEach(action => {
        onActionExecuted?.(action)
      })

    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        context: currentContext,
        metadata: {
          confidence: 0.5,
          intent: 'error',
          sentiment: 'neutral'
        }
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleContextSwitch = async (newDomain: string) => {
    try {
      await aiChatInterface.switchContext(newDomain, userId)
      const newContext = aiChatInterface.getCurrentContext()
      setCurrentContext(newContext)
      onContextSwitch?.(newContext)
      
      // Add context switch message
      const switchMessage: ChatMessage = {
        id: `switch_${Date.now()}`,
        role: 'system',
        content: `🎨 Switched to ${newDomain} context. Interface styling and functionality updated.`,
        timestamp: new Date(),
        context: newContext
      }
      setMessages(prev => [...prev, switchMessage])
    } catch (error) {
      console.error('Error switching context:', error)
    }
  }

  const handleActionExecution = async (action: ChatAction) => {
    try {
      // Execute action through appropriate manager
      let result
      switch (action.target) {
        case 'social-media-post':
          result = await executeSocialMediaAction(action)
          break
        case 'project-task':
          result = await executeProjectAction(action)
          break
        case 'tribe-activity':
          result = await executeTribeAction(action)
          break
        case 'file':
          result = await executeFileAction(action)
          break
        case 'analytics':
          result = await executeAnalyticsAction(action)
          break
        default:
          result = { success: true, message: 'Action executed successfully' }
      }

      // Update action status
      const updatedAction = { ...action, status: 'completed' as const, result }
      setPendingActions(prev => prev.map(a => a.id === action.id ? updatedAction : a))

      // Add execution result message
      const resultMessage: ChatMessage = {
        id: `result_${Date.now()}`,
        role: 'action',
        content: `✅ Action completed: ${action.type} ${action.target}`,
        timestamp: new Date(),
        context: currentContext,
        actions: [updatedAction]
      }
      setMessages(prev => [...prev, resultMessage])

    } catch (error) {
      console.error('Error executing action:', error)
      const errorAction = { ...action, status: 'failed' as const, error: error.message }
      setPendingActions(prev => prev.map(a => a.id === action.id ? errorAction : a))
    }
  }

  const executeSocialMediaAction = async (action: ChatAction) => {
    // Implement social media action execution
    return { success: true, postId: 'post_123', platforms: action.parameters.platforms }
  }

  const executeProjectAction = async (action: ChatAction) => {
    // Implement project action execution
    return { success: true, taskId: 'task_123', assignee: action.parameters.assignee }
  }

  const executeTribeAction = async (action: ChatAction) => {
    // Implement tribe action execution
    return { success: true, activityId: 'activity_123', tribeId: action.parameters.tribeId }
  }

  const executeFileAction = async (action: ChatAction) => {
    // Implement file action execution
    return { success: true, shareId: 'share_123', recipients: action.parameters.recipients }
  }

  const executeAnalyticsAction = async (action: ChatAction) => {
    // Implement analytics action execution
    return { success: true, reportId: 'report_123', metrics: action.parameters.metrics }
  }

  const getContextIcon = (domain: string) => {
    const icons: Record<string, React.ReactNode> = {
      'social-media': <MessageSquare className="w-4 h-4" />,
      'project-management': <Target className="w-4 h-4" />,
      'tribe-management': <Users className="w-4 h-4" />,
      'file-sharing': <FileText className="w-4 h-4" />,
      'analytics': <BarChart3 className="w-4 h-4" />,
      'governance': <Shield className="w-4 h-4" />,
      'general': <Brain className="w-4 h-4" />
    }
    return icons[domain] || <Brain className="w-4 h-4" />
  }

  const getContextColor = (domain: string) => {
    const colors: Record<string, string> = {
      'social-media': 'bg-blue-100 text-blue-800 border-blue-200',
      'project-management': 'bg-purple-100 text-purple-800 border-purple-200',
      'tribe-management': 'bg-green-100 text-green-800 border-green-200',
      'file-sharing': 'bg-red-100 text-red-800 border-red-200',
      'analytics': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'governance': 'bg-gray-100 text-gray-800 border-gray-200',
      'general': 'bg-slate-100 text-slate-800 border-slate-200'
    }
    return colors[domain] || colors['general']
  }

  const formatMessage = (message: ChatMessage) => {
    if (message.role === 'system') {
      return (
        <div className="flex items-center justify-center py-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
            {message.content}
          </div>
        </div>
      )
    }

    if (message.role === 'action') {
      return (
        <div className="flex items-center justify-center py-2">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {message.content}
          </div>
        </div>
      )
    }

    return (
      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            message.role === 'user' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          }`}>
            {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
          <div className={`rounded-lg px-4 py-2 ${
            message.role === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-white border border-gray-200 text-gray-800'
          }`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
            {message.metadata && (
              <div className="mt-2 text-xs opacity-70">
                {message.metadata.confidence && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {Math.round(message.metadata.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getContextColor(currentContext.currentDomain)}`}>
                  {getContextIcon(currentContext.currentDomain)}
                  {currentContext.currentDomain.replace('-', ' ')}
                </span>
                {currentContext.activeProject && (
                  <span className="text-xs text-gray-500">
                    Project: {currentContext.activeProject}
                  </span>
                )}
                {currentContext.activeTribe && (
                  <span className="text-xs text-gray-500">
                    Tribe: {currentContext.activeTribe}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            {pendingActions.length > 0 && (
              <button
                onClick={() => setShowActions(!showActions)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Zap className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingActions.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Context Switcher */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Switch Context:</span>
          {['general', 'social-media', 'project-management', 'tribe-management', 'file-sharing', 'analytics', 'governance'].map((domain) => (
            <button
              key={domain}
              onClick={() => handleContextSwitch(domain)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                currentContext.currentDomain === domain
                  ? getContextColor(domain)
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {getContextIcon(domain)}
              {domain.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <div key={message.id}>
              {formatMessage(message)}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                    <span className="text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Actions Panel */}
      {showActions && pendingActions.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Suggested Actions</h3>
            <div className="space-y-2">
              {pendingActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      action.status === 'completed' ? 'bg-green-500' :
                      action.status === 'failed' ? 'bg-red-500' :
                      action.status === 'executing' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      {action.status === 'completed' ? <CheckCircle className="w-4 h-4 text-white" /> :
                       action.status === 'failed' ? <AlertCircle className="w-4 h-4 text-white" /> :
                       action.status === 'executing' ? <Clock className="w-4 h-4 text-white" /> :
                       <Lightbulb className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {action.type} {action.target}
                      </div>
                      <div className="text-xs text-gray-500">
                        {action.parameters && Object.entries(action.parameters).map(([key, value]) => 
                          `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
                        ).join(', ')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleActionExecution(action)}
                    disabled={action.status === 'executing' || action.status === 'completed'}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {action.status === 'executing' ? 'Executing...' :
                     action.status === 'completed' ? 'Completed' :
                     action.status === 'failed' ? 'Retry' :
                     'Execute'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about social media, tribes, projects, or collaboration..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                disabled={isLoading}
              />
              {inputMessage && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
              )}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line. I can help with social media, tribes, projects, file sharing, analytics, and governance.
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">AI Assistant Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700">Communication Style</label>
              <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="collaborative">Collaborative</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">AI Personality</label>
              <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="helpful">Helpful</option>
                <option value="analytical">Analytical</option>
                <option value="creative">Creative</option>
                <option value="strategic">Strategic</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Notification Level</label>
              <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="minimal">Minimal</option>
                <option value="moderate">Moderate</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
