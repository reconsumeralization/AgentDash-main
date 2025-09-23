"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Label } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Separator } from "@/components/ui"
import {
  SpecializedAgentFactory,
  AgentSpecializationManager,
  SPECIALIZED_AGENT_DOMAINS,
  type SpecializedAgentConfig,
} from "@/lib"
import { agentRegistry } from "@/lib"
import {
  Brain,
  Users,
  Target,
  Gamepad2,
  DollarSign,
  LineChart,
  PenTool,
  Building,
  Play,
  Settings,
  Plus,
  GitBranch,
  Layers,
  Clock,
} from "lucide-react"

const DOMAIN_ICONS = {
  fantasy_sports: Gamepad2,
  gambling_analytics: DollarSign,
  trading_signals: LineChart,
  content_creation: PenTool,
  business_analysis: Building,
}

export function SpecializedAgentDashboard() {
  const [specializedAgents, setSpecializedAgents] = useState<SpecializedAgentConfig[]>([])
  const [selectedDomain, setSelectedDomain] = useState<keyof typeof SPECIALIZED_AGENT_DOMAINS>("FANTASY_SPORTS")
  const [teamName, setTeamName] = useState("")
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [taskInput, setTaskInput] = useState("")
  const [executionMode, setExecutionMode] = useState<"parallel" | "sequential" | "collaborative">("parallel")
  const [isExecuting, setIsExecuting] = useState(false)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    // Load existing specialized agents
    const allAgents = agentRegistry.getAllAgents()
    const specialized = allAgents.filter((agent) => "domain" in agent) as SpecializedAgentConfig[]
    setSpecializedAgents(specialized)
  }, [])

  const handleCreateAgent = () => {
    const agent = SpecializedAgentFactory.createSpecializedAgent(selectedDomain)
    agentRegistry.registerAgent(agent)
    setSpecializedAgents([...specializedAgents, agent])
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return

    const domains = Object.keys(SPECIALIZED_AGENT_DOMAINS) as (keyof typeof SPECIALIZED_AGENT_DOMAINS)[]
    const team = await AgentSpecializationManager.createAgentTeam(
      domains.slice(0, 3), // Create team with first 3 domains
      teamName,
    )

    setSpecializedAgents([...specializedAgents, ...team])
    setTeamName("")
  }

  const handleExecuteTask = async () => {
    if (!taskInput.trim() || selectedAgents.length === 0) return

    setIsExecuting(true)
    try {
      const executionIds = await AgentSpecializationManager.executeTeamTask(selectedAgents, taskInput, executionMode)

      const executionResults = executionIds.map((id) => {
        const execution = agentRegistry.getExecution(id)
        const agent = agentRegistry.getAgent(execution?.agentId || "")
        return {
          executionId: id,
          agentName: agent?.name || "Unknown",
          output: execution?.output || "No output",
          status: execution?.status || "unknown",
        }
      })

      setResults(executionResults)
    } catch (error) {
      console.error("Task execution failed:", error)
    } finally {
      setIsExecuting(false)
    }
  }

  const getAgentInsights = (agentId: string) => {
    return SpecializedAgentFactory.getAgentInsights(agentId)
  }

  const domainTemplate = SPECIALIZED_AGENT_DOMAINS[selectedDomain]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Specialized Agent Framework</h2>
          <p className="text-muted-foreground">
            Create and manage domain-specific AI agents with specialized capabilities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{specializedAgents.length} specialized agents</Badge>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="execute">Execute</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {specializedAgents.map((agent) => {
              const IconComponent = DOMAIN_ICONS[agent.domain as keyof typeof DOMAIN_ICONS] || Brain
              const insights = getAgentInsights(agent.id)

              return (
                <Card key={agent.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-5 h-5" />
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                      </div>
                      <Badge variant="secondary">{agent.domain}</Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {agent.specializations.length} specializations • {agent.knowledgeBase.length} knowledge areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {agent.specializations.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec.replace("_", " ")}
                          </Badge>
                        ))}
                        {agent.specializations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.specializations.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {insights && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>Interactions:</span>
                            <span>{insights.totalInteractions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Learnings:</span>
                            <span>{insights.learnings}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (selectedAgents.includes(agent.id)) {
                              setSelectedAgents(selectedAgents.filter((id) => id !== agent.id))
                            } else {
                              setSelectedAgents([...selectedAgents, agent.id])
                            }
                          }}
                          variant={selectedAgents.includes(agent.id) ? "default" : "outline"}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          {selectedAgents.includes(agent.id) ? "Selected" : "Select"}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Specialized Agent</CardTitle>
                <CardDescription>Choose a domain and create a specialized AI agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Domain</Label>
                  <Select value={selectedDomain} onValueChange={(value: any) => setSelectedDomain(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(SPECIALIZED_AGENT_DOMAINS).map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreateAgent} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Agent
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domain Preview</CardTitle>
                <CardDescription>
                  {selectedDomain.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Specializations</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {domainTemplate.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Knowledge Base</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {domainTemplate.knowledgeBase.map((kb) => (
                      <Badge key={kb} variant="outline" className="text-xs">
                        {kb.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Custom Instructions</Label>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    {domainTemplate.customInstructions.slice(0, 3).map((instruction, i) => (
                      <li key={i}>• {instruction}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Agent Team</CardTitle>
              <CardDescription>Build teams of specialized agents for complex workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="My Analysis Team"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateTeam} className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Create Multi-Domain Team
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execute Team Task</CardTitle>
              <CardDescription>Run tasks across multiple specialized agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selected Agents ({selectedAgents.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAgents.map((agentId) => {
                    const agent = specializedAgents.find((a) => a.id === agentId)
                    return (
                      <Badge key={agentId} variant="secondary">
                        {agent?.name || agentId}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label>Execution Mode</Label>
                <Select value={executionMode} onValueChange={(value: any) => setExecutionMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parallel">
                      <div className="flex items-center">
                        <Layers className="w-4 h-4 mr-2" />
                        Parallel - All agents work simultaneously
                      </div>
                    </SelectItem>
                    <SelectItem value="sequential">
                      <div className="flex items-center">
                        <GitBranch className="w-4 h-4 mr-2" />
                        Sequential - Agents work in order
                      </div>
                    </SelectItem>
                    <SelectItem value="collaborative">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Collaborative - Agents build on each other
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="task-input">Task Description</Label>
                <Textarea
                  id="task-input"
                  placeholder="Analyze the upcoming NFL week and provide fantasy recommendations..."
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleExecuteTask}
                disabled={isExecuting || selectedAgents.length === 0 || !taskInput.trim()}
                className="w-full"
              >
                {isExecuting ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {isExecuting ? "Executing..." : "Execute Task"}
              </Button>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Execution Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{result.agentName}</h4>
                          <Badge variant={result.status === "completed" ? "default" : "secondary"}>
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.output}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {specializedAgents.map((agent) => {
              const insights = getAgentInsights(agent.id)
              if (!insights) return null

              return (
                <Card key={agent.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.domain}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Total Interactions</div>
                          <div className="text-2xl font-bold">{insights.totalInteractions}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Learnings</div>
                          <div className="text-2xl font-bold">{insights.learnings}</div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Feedback Distribution</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Positive</span>
                            <span>{insights.feedbackStats.positive}</span>
                          </div>
                          <Progress
                            value={(insights.feedbackStats.positive / insights.totalInteractions) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Avg Response: {insights.averageResponseLength} chars
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
