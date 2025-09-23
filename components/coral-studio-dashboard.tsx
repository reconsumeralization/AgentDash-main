"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Input } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Plus, 
  Settings, 
  Users, 
  MessageSquare, 
  Activity,
  Zap,
  Brain,
  Network,
  Monitor,
  Database,
  Code2,
  Terminal
} from "lucide-react"

interface Agent {
  id: string
  name: string
  status: 'disconnected' | 'connecting' | 'listening' | 'busy' | 'dead'
  description: string
  capabilities: string[]
  lastSeen: Date
  messageCount: number
}

interface Thread {
  id: string
  name: string
  participants: string[]
  lastMessage: string
  timestamp: Date
  status: 'active' | 'completed' | 'error'
}

interface Session {
  id: string
  name: string
  agents: string[]
  status: 'running' | 'stopped' | 'error'
  startTime: Date
  messageCount: number
}

export function CoralStudioDashboard() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Search Agent',
      status: 'listening',
      description: 'Performs web searches and information retrieval',
      capabilities: ['web_search', 'data_extraction', 'url_analysis'],
      lastSeen: new Date(),
      messageCount: 47
    },
    {
      id: '2',
      name: 'Math Agent',
      status: 'busy',
      description: 'Handles mathematical calculations and problem solving',
      capabilities: ['calculations', 'equations', 'statistical_analysis'],
      lastSeen: new Date(Date.now() - 30000),
      messageCount: 23
    },
    {
      id: '3',
      name: 'Interface Agent',
      status: 'listening',
      description: 'Routes tasks and coordinates between agents',
      capabilities: ['task_routing', 'coordination', 'message_processing'],
      lastSeen: new Date(),
      messageCount: 156
    },
    {
      id: '4',
      name: 'Code Agent',
      status: 'connecting',
      description: 'Generates and analyzes code',
      capabilities: ['code_generation', 'code_review', 'debugging'],
      lastSeen: new Date(Date.now() - 120000),
      messageCount: 89
    }
  ])

  const [threads, setThreads] = useState<Thread[]>([
    {
      id: '1',
      name: 'User Query Processing',
      participants: ['Interface Agent', 'Search Agent', 'Math Agent'],
      lastMessage: 'Search completed. Mathematical analysis in progress.',
      timestamp: new Date(),
      status: 'active'
    },
    {
      id: '2',
      name: 'Code Review Session',
      participants: ['Code Agent', 'Interface Agent'],
      lastMessage: 'Code analysis complete. Recommendations generated.',
      timestamp: new Date(Date.now() - 180000),
      status: 'completed'
    }
  ])

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      name: 'Multi-Agent Analysis',
      agents: ['Search Agent', 'Math Agent', 'Interface Agent'],
      status: 'running',
      startTime: new Date(Date.now() - 600000),
      messageCount: 89
    }
  ])

  const [isCoralStudioRunning, setIsCoralStudioRunning] = useState(false)

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'listening': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'connecting': return 'bg-blue-500'
      case 'disconnected': return 'bg-gray-500'
      case 'dead': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: Agent['status']) => {
    switch (status) {
      case 'listening': return 'Listening'
      case 'busy': return 'Busy'
      case 'connecting': return 'Connecting'
      case 'disconnected': return 'Disconnected'
      case 'dead': return 'Dead'
      default: return 'Unknown'
    }
  }

  const startCoralStudio = () => {
    setIsCoralStudioRunning(true)
    // In a real implementation, this would start the Coral Studio process
    console.log('Starting Coral Studio...')
  }

  const stopCoralStudio = () => {
    setIsCoralStudioRunning(false)
    console.log('Stopping Coral Studio...')
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Coral Studio
          </h2>
          <p className="text-muted-foreground">
            Visual interface for Coral Protocol agent orchestration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isCoralStudioRunning ? "default" : "secondary"} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isCoralStudioRunning ? 'bg-green-500' : 'bg-gray-500'}`} />
            {isCoralStudioRunning ? 'Running' : 'Stopped'}
          </Badge>
          {!isCoralStudioRunning ? (
            <Button onClick={startCoralStudio} size="sm" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Studio
            </Button>
          ) : (
            <Button onClick={stopCoralStudio} size="sm" variant="outline" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              Stop Studio
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="threads" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Threads
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      {agent.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                      <Badge variant="outline" className="text-xs">
                        {getStatusBadge(agent.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Capabilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((capability) => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Messages: {agent.messageCount}</span>
                    <span>Last seen: {agent.lastSeen.toLocaleTimeString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Play className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Threads Tab */}
        <TabsContent value="threads" className="space-y-4">
          <div className="space-y-4">
            {threads.map((thread) => (
              <Card key={thread.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {thread.name}
                    </CardTitle>
                    <Badge variant={thread.status === 'active' ? 'default' : 'secondary'}>
                      {thread.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Participants:</span>
                      <div className="flex gap-1">
                        {thread.participants.map((participant) => (
                          <Badge key={participant} variant="outline" className="text-xs">
                            {participant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm font-medium mb-1">Last Message:</div>
                      <div className="text-sm text-muted-foreground">{thread.lastMessage}</div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Started: {thread.timestamp.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Refresh
                        </Button>
                        <Button size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Sessions</h3>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Session
            </Button>
          </div>
          
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-primary" />
                      {session.name}
                    </CardTitle>
                    <Badge variant={session.status === 'running' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Agents:</span>
                      <div className="flex gap-1">
                        {session.agents.map((agent) => (
                          <Badge key={agent} variant="outline" className="text-xs">
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Messages:</span>
                        <span className="ml-2 font-medium">{session.messageCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 font-medium">
                          {Math.floor((Date.now() - session.startTime.getTime()) / 60000)}m
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Activity className="h-3 w-3 mr-1" />
                        Monitor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Real-time Logs</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button size="sm" variant="outline">
                  <Database className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <ScrollArea className="h-96">
                  <div className="space-y-2 font-mono text-sm">
                    <div className="text-green-600">
                      [2024-01-15 14:30:25] Interface Agent: Task routed to Search Agent
                    </div>
                    <div className="text-blue-600">
                      [2024-01-15 14:30:26] Search Agent: Starting web search for "Coral Protocol"
                    </div>
                    <div className="text-green-600">
                      [2024-01-15 14:30:28] Search Agent: Search completed, 15 results found
                    </div>
                    <div className="text-blue-600">
                      [2024-01-15 14:30:29] Interface Agent: Routing results to Math Agent for analysis
                    </div>
                    <div className="text-yellow-600">
                      [2024-01-15 14:30:30] Math Agent: Processing statistical data
                    </div>
                    <div className="text-green-600">
                      [2024-01-15 14:30:32] Math Agent: Analysis complete, sending results to Interface Agent
                    </div>
                    <div className="text-purple-600">
                      [2024-01-15 14:30:33] Interface Agent: Final response compiled and sent to user
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
