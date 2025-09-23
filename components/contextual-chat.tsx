"use client"

import React, { useState, useEffect, useRef, useCallback  } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Badge } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
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
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib"
import { useContextSurfacer } from '@/lib'

interface ChatMessage {
  id: string
  type: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  context?: string
  actions?: ChatAction[]
  metadata?: Record<string, any>
}

interface ChatAction {
  id: string
  label: string
  action: string
  type: 'primary' | 'secondary' | 'danger'
}

interface ContextualChatProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'sidebar' | 'floating'
  persistent?: boolean
}

export function ContextualChat({ 
  className, 
  position = 'bottom-right',
  persistent = true 
}: ContextualChatProps) {
  const { 
    contextSurfacer, 
    guidance, 
    adaptiveState,
    updateUserContext,
    updateAgenticContext,
    updateUseCaseContext 
  } = useContextSurfacer()
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Helper functions
  const generateWelcomeMessage = useCallback((): string => {
    const context = contextSurfacer.getContextSummary()
    const { user, useCase } = context

    if (useCase.domain === 'linkedin') {
      return `Hi ${user.role}! I'm here to help with your LinkedIn activities. I can assist with networking, content creation, and professional outreach. What would you like to work on?`
    } else if (useCase.domain === 'vulnerability-research') {
      return `Welcome to your security research workspace! I can help with vulnerability scanning, compliance checking, and security analysis. Ready to secure your systems?`
    } else if (useCase.domain === 'devops') {
      return `Hello! I'm your DevOps assistant. I can help with deployments, monitoring, infrastructure management, and automation. What's on your agenda today?`
    } else {
      return `Hi there! I'm your AI assistant, ready to help with your ${useCase.domain} tasks. I remember your context and can provide personalized recommendations. How can I assist you?`
    }
  }, [contextSurfacer])

  const generateQuickActions = useCallback((): ChatAction[] => {
    const context = contextSurfacer.getContextSummary()
    const { useCase, user } = context

    if (useCase.domain === 'linkedin') {
      return [
        { id: 'connect', label: 'Find Connections', action: 'find_connections', type: 'primary' },
        { id: 'content', label: 'Create Content', action: 'create_content', type: 'secondary' },
        { id: 'analytics', label: 'View Analytics', action: 'view_analytics', type: 'secondary' }
      ]
    } else if (useCase.domain === 'vulnerability-research') {
      return [
        { id: 'scan', label: 'Run Security Scan', action: 'run_security_scan', type: 'primary' },
        { id: 'compliance', label: 'Check Compliance', action: 'check_compliance', type: 'secondary' },
        { id: 'report', label: 'Generate Report', action: 'generate_report', type: 'secondary' }
      ]
    } else if (useCase.domain === 'devops') {
      return [
        { id: 'deploy', label: 'Deploy Application', action: 'deploy_app', type: 'primary' },
        { id: 'monitor', label: 'Check Status', action: 'check_status', type: 'secondary' },
        { id: 'logs', label: 'View Logs', action: 'view_logs', type: 'secondary' }
      ]
    }

    return [
      { id: 'help', label: 'Get Help', action: 'get_help', type: 'primary' },
      { id: 'suggestions', label: 'Smart Suggestions', action: 'get_suggestions', type: 'secondary' }
    ]
  }, [contextSurfacer])

  // Initialize with contextual welcome message
  useEffect(() => {

    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'agent',
      content: generateWelcomeMessage(),
      timestamp: new Date(),
      context: 'welcome',
      actions: generateQuickActions()
    }
    setMessages([welcomeMessage])
  }, [guidance, adaptiveState, contextSurfacer, generateWelcomeMessage, generateQuickActions])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Record user action
    contextSurfacer.recordUserAction('chat_message', 'user_input', 'success', {
      message: inputValue,
      context: contextSurfacer.getContextSummary().useCase.domain
    })

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = generateAgentResponse(inputValue)
      setMessages(prev => [...prev, agentResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // 1-3 second delay
  }

  const generateAgentResponse = (userInput: string): ChatMessage => {
    const context = contextSurfacer.getContextSummary()
    const { useCase, user } = context

    // Simple response generation based on context
    let response = ''
    let actions: ChatAction[] = []

    if (userInput.toLowerCase().includes('help') || userInput.toLowerCase().includes('what can you do')) {
      response = `I can help you with various tasks based on your current context. Here are some things I can do:`
      actions = generateQuickActions()
    } else if (useCase.domain === 'linkedin' && userInput.toLowerCase().includes('connect')) {
      response = `I can help you find and connect with relevant professionals. Let me search for potential connections based on your industry and interests.`
      actions = [
        { id: 'search', label: 'Search Connections', action: 'search_connections', type: 'primary' },
        { id: 'filter', label: 'Apply Filters', action: 'apply_filters', type: 'secondary' }
      ]
    } else if (useCase.domain === 'vulnerability-research' && userInput.toLowerCase().includes('scan')) {
      response = `I'll help you run a comprehensive security scan. This will check for vulnerabilities, misconfigurations, and compliance issues.`
      actions = [
        { id: 'full_scan', label: 'Full Security Scan', action: 'full_security_scan', type: 'primary' },
        { id: 'quick_scan', label: 'Quick Scan', action: 'quick_scan', type: 'secondary' }
      ]
    } else {
      response = `I understand you're asking about "${userInput}". Let me provide some context-aware assistance based on your current ${useCase.domain} workflow.`
      actions = generateQuickActions()
    }

    return {
      id: `agent_${Date.now()}`,
      type: 'agent',
      content: response,
      timestamp: new Date(),
      context: useCase.domain,
      actions
    }
  }

  const handleQuickAction = (action: ChatAction) => {
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      type: 'system',
      content: `Executing: ${action.label}`,
      timestamp: new Date(),
      context: 'system'
    }

    setMessages(prev => [...prev, systemMessage])

    // Record action
    contextSurfacer.recordUserAction(action.action, 'quick_action', 'success', {
      label: action.label,
      type: action.type
    })

    // Simulate action execution
    setTimeout(() => {
      const resultMessage: ChatMessage = {
        id: `result_${Date.now()}`,
        type: 'agent',
        content: `✅ ${action.label} completed successfully!`,
        timestamp: new Date(),
        context: 'result'
      }
      setMessages(prev => [...prev, resultMessage])
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    // In production, integrate with speech recognition API
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-4 right-4'
      case 'bottom-left':
        return 'fixed bottom-4 left-4'
      case 'sidebar':
        return 'h-full'
      case 'floating':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      default:
        return 'fixed bottom-4 right-4'
    }
  }

  const getSizeClasses = () => {
    if (isMinimized) return 'w-80 h-16'
    if (position === 'sidebar') return 'w-full h-full'
    return 'w-96 h-[500px]'
  }

  if (!adaptiveState?.chatIntegration?.enabled) {
    return null
  }

  return (
    <div className={cn(
      getPositionClasses(),
      getSizeClasses(),
      "z-50",
      className
    )}>
      <Card className={cn(
        "h-full flex flex-col",
        adaptiveState.contextualTheme.layoutStyle === 'linkedin' && "border-blue-200 bg-blue-50",
        adaptiveState.contextualTheme.layoutStyle === 'devops' && "border-orange-200 bg-orange-50",
        adaptiveState.contextualTheme.layoutStyle === 'security' && "border-red-200 bg-red-50"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {contextSurfacer.getContextSummary().useCase.domain}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleListening}
              className={cn(isListening && "bg-red-100 text-red-600")}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.type === 'user' && "justify-end"
                      )}
                    >
                      {message.type !== 'user' && (
                        <div className="flex-shrink-0">
                          {message.type === 'agent' ? (
                            <Bot className="h-6 w-6 text-primary" />
                          ) : (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          )}
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[80%] rounded-lg p-3",
                        message.type === 'user' 
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-muted",
                        message.type === 'system' && "bg-yellow-100 text-yellow-800"
                      )}>
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                        
                        {message.actions && message.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.actions.map((action) => (
                              <Button
                                key={action.id}
                                size="sm"
                                variant={action.type === 'primary' ? 'default' : 'outline'}
                                onClick={() => handleQuickAction(action)}
                                className="text-xs"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>

                      {message.type === 'user' && (
                        <div className="flex-shrink-0">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3">
                      <Bot className="h-6 w-6 text-primary" />
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Context: {contextSurfacer.getContextSummary().useCase.domain}</span>
                    <span>Memory: {contextSurfacer.getContextMemory().recentActions.length} actions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    <span>AI Powered</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
