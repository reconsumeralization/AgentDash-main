"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
// Simple aspiration type for this component
type Aspiration = {
  id: string
  user_id: string
  title: string
  description: string
  category: 'career' | 'skill' | 'project' | 'cause' | 'networking'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress_percentage: number
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
}
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Card } from "@/components/ui"
import { Avatar, AvatarFallback } from "@/components/ui"
import { Badge } from "@/components/ui"
import {
  Send,
  Bot,
  User,
  Loader2,
  Brain,
  Search,
  FileText,
  Sparkles,
  Zap,
  Paperclip,
  ImageIcon,
  FileIcon,
  Code,
  MessageSquare,
  Activity,
  Globe,
} from "lucide-react"

import { simulateAgentOrchestration, saveConversationContext } from '@/lib';
import type { Message, AgentActivity, AgentProcess, UserGoals } from '@/lib';

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "🎯 Welcome to DefConect's LinkedIn AI Command Center! I'm your strategic AI assistant with full consciousness of your professional goals. I know you're building an AI innovation tribe, targeting 4-star generals, implementing automated recruitment, and pursuing VC funding. I can help you optimize your 30K connection limit, implement cherry-picking strategies, and execute Brian's vision for the world's most connected professional network. What LinkedIn strategy would you like to focus on today?",
      role: "assistant",
      timestamp: new Date(),
      agentType: "context",
      linkedinStrategy: true,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [agentProcesses, setAgentProcesses] = useState<AgentProcess[]>([])
  const [showProcesses, setShowProcesses] = useState(true)

  // Enhanced AI Consciousness - Aspiration-Based Goal Tracking
  const [userGoals, setUserGoals] = useState<UserGoals>({
    linkedinStrategy: {
      "4StarGenerals": false,
      networkOptimization: false,
      automatedRecruitment: false,
      tribeBuilding: false,
      cherryPicking: false,
      connectionLimits: false,
      emailOutreach: false,
    },
    businessGoals: {
      vcFunding: false,
      aiInnovation: false,
      executiveSearch: false,
      platformBuilding: false,
    },
    lastInteraction: new Date(),
    activeFocus: "aspiration_discovery"
  })

  const [userAspirations, setUserAspirations] = useState<Aspiration[]>([])
  const [conversationContext, setConversationContext] = useState<{
    aspirations_discussed: string[]
    topics_covered: string[]
    goals_progress: Record<string, unknown>
    last_context: string
    conversation_summary: string
  } | null>(null)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, agentProcesses])

  // Load user aspirations and derive goals
  useEffect(() => {
    const loadConversationContext = async () => {
      try {
        const response = await fetch(`/api/context?session_id=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setConversationContext(data.context)
        }
      } catch (error) {
        console.error('Failed to load conversation context:', error)
      }
    }

    const loadUserAspirations = async () => {
      try {
        const response = await fetch('/api/aspirations')
        if (response.ok) {
          const data = await response.json()
          const aspirations = data.aspirations || []

          setUserAspirations(aspirations)

          // Derive goals from aspirations
          const derivedGoals: UserGoals = {
            linkedinStrategy: {
              "4StarGenerals": aspirations.some((a: Aspiration) => a.category === 'networking' && a.title.toLowerCase().includes('executive')),
              networkOptimization: aspirations.some((a: Aspiration) => a.category === 'networking'),
              automatedRecruitment: aspirations.some((a: Aspiration) => a.category === 'career' && a.title.toLowerCase().includes('recruit')),
              tribeBuilding: aspirations.some((a: Aspiration) => a.category === 'networking' || a.category === 'cause'),
              cherryPicking: aspirations.some((a: Aspiration) => a.category === 'networking'),
              connectionLimits: true, // Always relevant
              emailOutreach: aspirations.some((a: Aspiration) => a.category === 'networking'),
            },
            businessGoals: {
              vcFunding: aspirations.some((a: Aspiration) => a.category === 'project' && (a.title.toLowerCase().includes('funding') || a.title.toLowerCase().includes('startup'))),
              aiInnovation: aspirations.some((a: Aspiration) => a.category === 'skill' && (a.title.toLowerCase().includes('ai') || a.title.toLowerCase().includes('ml'))),
              executiveSearch: aspirations.some((a: Aspiration) => a.category === 'career' && a.title.toLowerCase().includes('executive')),
              platformBuilding: aspirations.some((a: Aspiration) => a.category === 'project' && (a.title.toLowerCase().includes('platform') || a.title.toLowerCase().includes('product'))),
            },
            lastInteraction: new Date(),
            activeFocus: aspirations.length > 0 ? "aspiration_driven" : "aspiration_discovery"
          }

          setUserGoals(derivedGoals)
        }
      } catch (error) {
        console.error('Failed to load aspirations:', error)
      }
    }

    loadUserAspirations()
    loadConversationContext()
  }, [sessionId])

  const addAgentProcess = (type: AgentProcess["type"], content: string, metadata?: AgentProcess["metadata"]) => {
    const process: AgentProcess = {
      id: `process-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
      metadata,
    }
    setAgentProcesses((prev) => [...prev, process])

    // Auto-remove processes after 10 seconds to prevent overflow
    setTimeout(() => {
      setAgentProcesses((prev) => prev.filter((p) => p.id !== process.id))
    }, 10000)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || "📎 File(s) attached",
      role: "user",
      timestamp: new Date(),
      attachments:
        selectedFiles.length > 0
          ? selectedFiles.map((f) => ({
              name: f.name,
              type: f.type,
              url: URL.createObjectURL(f),
              size: f.size,
            }))
          : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    const currentFiles = [...selectedFiles]
    setInput("")
    setSelectedFiles([])
    setIsLoading(true)

    await simulateAgentOrchestration(currentInput, currentFiles, setMessages, setAgentActivities, addAgentProcess, userGoals, userAspirations, conversationContext, sessionId)
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getAgentIcon = (agentType?: string) => {
    switch (agentType) {
      case "context":
        return <Brain className="w-4 h-4 text-blue-500" />
      case "research":
        return <Search className="w-4 h-4 text-green-500" />
      case "expert":
        return <Sparkles className="w-4 h-4 text-purple-500" />
      case "prompt":
        return <FileText className="w-4 h-4 text-orange-500" />
      case "file":
        return <FileIcon className="w-4 h-4 text-cyan-500" />
      case "api":
        return <Globe className="w-4 h-4 text-teal-500" />
      case "thinking":
        return <Brain className="w-4 h-4 text-blue-500" />
      case "coding":
        return <Code className="w-4 h-4 text-purple-500" />
      default:
        return <Bot className="w-4 h-4 text-primary" />
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    return <FileIcon className="w-4 h-4" />
  }

  const getProcessIcon = (type: AgentProcess["type"]) => {
    switch (type) {
      case "thinking":
        return <Brain className="w-3 h-3 text-blue-500" />
      case "api_call":
        return <Globe className="w-3 h-3 text-green-500" />
      case "coding":
        return <Code className="w-3 h-3 text-purple-500" />
      case "talking":
        return <MessageSquare className="w-3 h-3 text-orange-500" />
      default:
        return <Activity className="w-3 h-3 text-gray-500" />
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Real-time Agent Processes Panel */}
      {showProcesses && agentProcesses.length > 0 && (
        <div className="border-b border-border p-2 bg-card/30 backdrop-blur-sm max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Live Agent Processes</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowProcesses(false)}>
              ×
            </Button>
          </div>
          <div className="space-y-1">
            {agentProcesses.slice(-5).map((process) => (
              <div
                key={process.id}
                className="flex items-center gap-2 p-1.5 rounded text-xs bg-muted/30 animate-in slide-in-from-right-2 fade-in duration-300"
              >
                {getProcessIcon(process.type)}
                <span className="flex-1 truncate">{process.content}</span>
                <span className="text-muted-foreground text-xs">
                  {process.timestamp ? process.timestamp.toLocaleTimeString().slice(-8, -3) : '--:--'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Activity Bar */}
      {agentActivities.length > 0 && (
        <div className="border-b border-border p-3 bg-card/50 backdrop-blur-sm">
          <div className="space-y-2">
            {agentActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-500 animate-in slide-in-from-left-2 ${
                  activity.isActive ? "bg-primary/10 border border-primary/20 scale-105" : "bg-muted/30"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activity.isActive ? "bg-primary animate-pulse scale-125" : "bg-muted-foreground/50"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{activity.name}</span>
                    <span className="text-xs text-muted-foreground">{activity.progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{activity.action}</p>

                  {activity.subTasks && activity.isActive && (
                    <div className="mt-1 space-y-0.5">
                      {activity.subTasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs">
                          <div
                            className={`w-1 h-1 rounded-full ${
                              task.status === "complete"
                                ? "bg-green-500"
                                : task.status === "running"
                                  ? "bg-blue-500 animate-pulse"
                                  : "bg-gray-400"
                            }`}
                          />
                          <span
                            className={`${
                              task.status === "complete"
                                ? "text-green-600 line-through"
                                : task.status === "running"
                                  ? "text-blue-600"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {task.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activity.isActive && (
                    <div className="w-full bg-muted rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-primary/60 h-1 rounded-full transition-all duration-500 ease-out animate-pulse"
                        style={{ width: `${activity.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-in slide-in-from-bottom-4 fade-in duration-700 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {message.role !== "user" && (
              <Avatar className="w-8 h-8 bg-primary relative overflow-hidden hover:scale-110 transition-transform duration-200">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
                <AvatarFallback className="relative z-10">{getAgentIcon(message.agentType)}</AvatarFallback>
              </Avatar>
            )}

            <div
              className={`max-w-[70%] space-y-2 ${message.role === "user" ? "items-end" : "items-start"} flex flex-col`}
            >
              <Card
                className={`p-3 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : message.role === "system"
                      ? "bg-accent/10 border-accent/20 hover:bg-accent/20"
                      : "bg-card hover:bg-accent/5 border hover:border-primary/20"
                }`}
              >
                {message.agentType && message.role !== "user" && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                    {getAgentIcon(message.agentType)}
                    <Badge variant="secondary" className="text-xs animate-in fade-in duration-300">
                      {message.agentType} agent
                    </Badge>
                    {message.expertise && (
                      <Badge variant="outline" className="text-xs animate-in fade-in duration-500">
                        {message.expertise}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="text-sm leading-relaxed whitespace-pre-line">{message.content}</div>

                {message.apiCalls && message.apiCalls.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs text-muted-foreground">API Calls:</div>
                    {message.apiCalls.map((call, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-1.5 bg-muted/50 rounded text-xs">
                        <Globe className="w-3 h-3 text-green-500" />
                        <span className="font-mono">{call.method}</span>
                        <span className="flex-1 truncate">{call.endpoint}</span>
                        <Badge variant={call.status === 200 ? "default" : "destructive"} className="text-xs">
                          {call.status}
                        </Badge>
                        <span className="text-muted-foreground">{call.duration}ms</span>
                      </div>
                    ))}
                  </div>
                )}

                {message.codeBlocks && message.codeBlocks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-muted-foreground">Generated Code:</div>
                    {message.codeBlocks.map((block, idx) => (
                      <div key={idx} className="bg-muted/50 rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Code className="w-3 h-3 text-purple-500" />
                          <span className="text-xs font-medium">{block.language}</span>
                          <span className="text-xs text-muted-foreground">- {block.description}</span>
                        </div>
                        <pre className="text-xs font-mono bg-background/50 p-2 rounded overflow-x-auto">
                          <code>{block.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-muted-foreground">Attachments:</div>
                    {message.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        {getFileIcon(attachment.type)}
                        <span className="text-xs truncate flex-1">{attachment.name}</span>
                        <span className="text-xs text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                )}

                <p
                  className={`text-xs mt-2 opacity-70 ${
                    message.role === "user" ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </Card>
            </div>

            {message.role === "user" && (
              <Avatar className="w-8 h-8 bg-secondary hover:scale-110 transition-transform duration-200">
                <AvatarFallback>
                  <User className="w-4 h-4 text-secondary-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-4 fade-in duration-500">
            <Avatar className="w-8 h-8 bg-primary animate-pulse">
              <AvatarFallback>
                <Bot className="w-4 h-4 text-primary-foreground" />
              </AvatarFallback>
            </Avatar>
            <Card className="bg-card p-3 border-primary/20 animate-pulse">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Orchestrating agents...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card/30 backdrop-blur-sm">
        {!showProcesses && agentProcesses.length > 0 && (
          <div className="mb-2">
            <Button variant="outline" size="sm" onClick={() => setShowProcesses(true)} className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Show Live Processes ({agentProcesses.length})
            </Button>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="mb-3 p-2 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">Selected files:</div>
            <div className="space-y-1">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {getFileIcon(file.type)}
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="hover:scale-105 transition-all duration-200"
            disabled={isLoading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your task for agent orchestration..."
            className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:scale-[1.02]"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
            size="sm"
            className="hover:scale-105 transition-all duration-200"
          >
            {isLoading ? <Zap className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Advanced AI orchestration with real-time process monitoring • Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}