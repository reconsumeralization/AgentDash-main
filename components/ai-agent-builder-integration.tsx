"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import {
  Bot,
  Sparkles,
  Zap,
  Brain,
  Settings,
  Play,
  Square,
  Plus,
  Edit,
  Save,
  Code,
  MessageSquare,
  Database,
  Shield,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  capabilities: string[];
  status: 'draft' | 'training' | 'ready' | 'running' | 'error';
  prompt: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
  lastTrained: string;
  performance: {
    accuracy: number;
    responseTime: number;
    successRate: number;
  };
}

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  basePrompt: string;
  iconName: string;
}

export function AIAgentBuilderIntegration() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [_selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [_isTraining, setIsTraining] = useState(false);
  const [activeTab, setActiveTab] = useState('agents');
  const [newAgent, setNewAgent] = useState<Partial<AIAgent>>({
    name: '',
    description: '',
    model: 'gpt-4',
    capabilities: [],
    prompt: '',
    temperature: 0.7,
    maxTokens: 2048
  });

  // Agent templates from Postman AI Agent Builder
  const agentTemplates: AgentTemplate[] = [
    {
      id: 'api-tester',
      name: 'API Tester',
      description: 'Automated API testing and validation agent',
      category: 'Testing',
      capabilities: ['API Testing', 'Response Validation', 'Error Detection'],
      basePrompt: 'You are an expert API tester. Analyze API responses, validate schemas, and detect potential issues.',
      iconName: "Shield"
    },
    {
      id: 'code-generator',
      name: 'Code Generator',
      description: 'AI-powered code generation and refactoring',
      category: 'Development',
      capabilities: ['Code Generation', 'Refactoring', 'Documentation'],
      basePrompt: 'You are a senior software engineer. Generate clean, efficient, and well-documented code.',
      iconName: "Code"
    },
    {
      id: 'data-analyzer',
      name: 'Data Analyzer',
      description: 'Intelligent data analysis and insights',
      category: 'Analytics',
      capabilities: ['Data Analysis', 'Pattern Recognition', 'Reporting'],
      basePrompt: 'You are a data science expert. Analyze datasets, identify patterns, and provide actionable insights.',
      iconName: "Database"
    },
    {
      id: 'chatbot-builder',
      name: 'Chatbot Builder',
      description: 'Conversational AI agent development',
      category: 'Communication',
      capabilities: ['Natural Language', 'Conversation Flow', 'Intent Recognition'],
      basePrompt: 'You are a conversational AI specialist. Design engaging chat experiences and handle user interactions.',
      iconName: "MessageSquare"
    },
    {
      id: 'workflow-orchestrator',
      name: 'Workflow Orchestrator',
      description: 'Complex workflow automation and coordination',
      category: 'Automation',
      capabilities: ['Workflow Design', 'Task Coordination', 'Error Handling'],
      basePrompt: 'You are a workflow automation expert. Design efficient processes and coordinate complex task sequences.',
      iconName: "Zap"
    }
  ];

  // Function to get icon component by name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Shield": return Shield;
      case "Code": return Code;
      case "Database": return Database;
      case "MessageSquare": return MessageSquare;
      case "Zap": return Zap;
      default: return Bot;
    }
  };

  // Sample agents for demonstration
  useEffect(() => {
    setAgents([
      {
        id: '1',
        name: 'API Health Monitor',
        description: 'Monitors API endpoints and alerts on failures',
        model: 'gpt-4',
        capabilities: ['API Testing', 'Monitoring', 'Alerting'],
        status: 'running',
        prompt: 'Monitor API health and provide detailed failure analysis...',
        temperature: 0.3,
        maxTokens: 1024,
        createdAt: '2024-01-15T10:00:00Z',
        lastTrained: '2024-01-16T08:00:00Z',
        performance: {
          accuracy: 98.5,
          responseTime: 245,
          successRate: 99.2
        }
      },
      {
        id: '2',
        name: 'Code Review Assistant',
        description: 'AI-powered code review and improvement suggestions',
        model: 'gpt-4-turbo',
        capabilities: ['Code Analysis', 'Security Review', 'Performance Optimization'],
        status: 'ready',
        prompt: 'Review code for bugs, security issues, and best practices...',
        temperature: 0.2,
        maxTokens: 2048,
        createdAt: '2024-01-14T15:30:00Z',
        lastTrained: '2024-01-15T12:00:00Z',
        performance: {
          accuracy: 94.8,
          responseTime: 180,
          successRate: 97.1
        }
      },
      {
        id: '3',
        name: 'Data Pipeline Builder',
        description: 'Creates automated data processing workflows',
        model: 'gpt-4',
        capabilities: ['ETL Design', 'Data Transformation', 'Pipeline Optimization'],
        status: 'training',
        prompt: 'Design efficient data processing pipelines...',
        temperature: 0.5,
        maxTokens: 1536,
        createdAt: '2024-01-16T09:00:00Z',
        lastTrained: '2024-01-16T09:00:00Z',
        performance: {
          accuracy: 0,
          responseTime: 0,
          successRate: 0
        }
      }
    ]);
  }, []);

  const handleCreateAgent = () => {
    setIsCreatingAgent(true);
    setNewAgent({
      name: '',
      description: '',
      model: 'gpt-4',
      capabilities: [],
      prompt: '',
      temperature: 0.7,
      maxTokens: 2048
    });
  };

  const handleSaveAgent = () => {
    if (!newAgent.name || !newAgent.description) return;

    const agent: AIAgent = {
      id: Date.now().toString(),
      name: newAgent.name!,
      description: newAgent.description!,
      model: newAgent.model!,
      capabilities: newAgent.capabilities!,
      status: 'draft',
      prompt: newAgent.prompt!,
      temperature: newAgent.temperature!,
      maxTokens: newAgent.maxTokens!,
      createdAt: new Date().toISOString(),
      lastTrained: new Date().toISOString(),
      performance: {
        accuracy: 0,
        responseTime: 0,
        successRate: 0
      }
    };

    setAgents(prev => [...prev, agent]);
    setIsCreatingAgent(false);
  };

  const handleTrainAgent = async (agent: AIAgent) => {
    setIsTraining(true);
    setSelectedAgent(agent);

    // Simulate training process
    const trainingSteps = [
      'Initializing training environment...',
      'Loading training data...',
      'Preprocessing datasets...',
      'Fine-tuning model parameters...',
      'Validating performance...',
      'Training completed successfully!'
    ];

    for (let i = 0; i < trainingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Update agent status in the list
      setAgents(prev => prev.map(a =>
        a.id === agent.id
          ? { ...a, status: i === trainingSteps.length - 1 ? 'ready' : 'training' as const, lastTrained: new Date().toISOString() }
          : a
      ));
    }

    setIsTraining(false);
  };

  const handleRunAgent = (agent: AIAgent) => {
    setAgents(prev => prev.map(a =>
      a.id === agent.id ? { ...a, status: 'running' } : a
    ));
  };

  const handleStopAgent = (agent: AIAgent) => {
    setAgents(prev => prev.map(a =>
      a.id === agent.id ? { ...a, status: 'ready' } : a
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'ready': return 'bg-blue-500';
      case 'training': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const _getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'training': return <Clock className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Agent Builder</h1>
              <p className="text-gray-600 mt-1">Create and manage intelligent AI agents with Postman&apos;s advanced builder</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleCreateAgent}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
            <Button variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">My Agents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Bot className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                          <span className="text-sm text-gray-600 capitalize">{agent.status}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{agent.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.capabilities.length - 3}
                      </Badge>
                    )}
                  </div>

                  {agent.status !== 'draft' && (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {agent.performance.accuracy.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          {agent.performance.responseTime}ms
                        </div>
                        <div className="text-xs text-gray-500">Response</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-purple-600">
                          {agent.performance.successRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Success</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    {agent.status === 'ready' && (
                      <Button
                        onClick={() => handleRunAgent(agent)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                    )}
                    {agent.status === 'running' && (
                      <Button
                        onClick={() => handleStopAgent(agent)}
                        size="sm"
                        variant="destructive"
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    )}
                    {agent.status === 'draft' && (
                      <Button
                        onClick={() => handleTrainAgent(agent)}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        Train
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentTemplates.map((template) => {
              const IconComponent = getIconComponent(template.iconName);
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{template.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {template.capabilities.map((capability) => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{agents.length}</div>
                <p className="text-sm text-gray-600 mt-1">Active AI agents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Running Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {agents.filter(a => a.status === 'running').length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Avg Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {(agents.reduce((acc, a) => acc + a.performance.accuracy, 0) / agents.length).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Across all agents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Training Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {agents.filter(a => a.status === 'training').length}
                </div>
                <p className="text-sm text-gray-600 mt-1">In progress</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Agent Modal */}
      {isCreatingAgent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Create New AI Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter agent name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select
                    value={newAgent.model}
                    onValueChange={(value) => setNewAgent(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this agent does"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">System Prompt</Label>
                <Textarea
                  id="prompt"
                  value={newAgent.prompt}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Define the agent's behavior and capabilities"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature: {newAgent.temperature}</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newAgent.temperature}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={newAgent.maxTokens}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsCreatingAgent(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAgent} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  Create Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
