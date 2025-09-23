"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Download, 
  Plus, 
  Edit, 
  Share,
  Workflow,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  RefreshCw,
  X
} from 'lucide-react';

interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'request' | 'condition' | 'loop' | 'delay' | 'transform' | 'ai' | 'webhook';
  position: { x: number; y: number };
  data: Record<string, unknown>;
  connections: string[];
}

interface FlowConnection {
  id: string;
  source: string;
  target: string;
  type: 'success' | 'error' | 'conditional' | 'data';
}

interface PostmanFlow {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
  status: 'draft' | 'running' | 'paused' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
  runs: number;
  successRate: number;
}

interface PostmanCollection {
  id: string;
  name: string;
  description: string;
  requests: Record<string, unknown>[];
  variables: Record<string, unknown>[];
  auth: Record<string, unknown>;
  events: Record<string, unknown>[];
}

interface PostmanEnvironment {
  id: string;
  name: string;
  variables: Record<string, unknown>[];
}

interface PostmanFlowsIntegrationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function PostmanFlowsIntegration({ isOpen = true, onClose }: PostmanFlowsIntegrationProps = {}) {
  const [activeTab, setActiveTab] = useState('flows');
  const [selectedFlow, setSelectedFlow] = useState<PostmanFlow | null>(null);
  const [flows, setFlows] = useState<PostmanFlow[]>([]);
  const [collections, setCollections] = useState<PostmanCollection[]>([]);
  const [environments, setEnvironments] = useState<PostmanEnvironment[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [flowExecution, setFlowExecution] = useState<Record<string, unknown> | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  // Sample data for demonstration
  useEffect(() => {
    setFlows([
      {
        id: '1',
        name: 'AI API Workflow',
        description: 'Automated workflow for AI API testing and monitoring',
        nodes: [
          { id: 'start', type: 'start', position: { x: 100, y: 100 }, data: {}, connections: ['req1'] },
          { id: 'req1', type: 'request', position: { x: 300, y: 100 }, data: { url: 'https://api.openai.com/v1/chat/completions', method: 'POST' }, connections: ['condition1'] },
          { id: 'condition1', type: 'condition', position: { x: 500, y: 100 }, data: { condition: 'response.status === 200' }, connections: ['transform1', 'error1'] },
          { id: 'transform1', type: 'transform', position: { x: 700, y: 50 }, data: { script: 'return response.data.choices[0].message.content' }, connections: ['end'] },
          { id: 'error1', type: 'end', position: { x: 700, y: 150 }, data: { type: 'error' }, connections: [] },
          { id: 'end', type: 'end', position: { x: 900, y: 100 }, data: { type: 'success' }, connections: [] }
        ],
        connections: [
          { id: 'c1', source: 'start', target: 'req1', type: 'data' },
          { id: 'c2', source: 'req1', target: 'condition1', type: 'data' },
          { id: 'c3', source: 'condition1', target: 'transform1', type: 'success' },
          { id: 'c4', source: 'condition1', target: 'error1', type: 'error' },
          { id: 'c5', source: 'transform1', target: 'end', type: 'data' }
        ],
        status: 'draft',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        runs: 0,
        successRate: 0
      },
      {
        id: '2',
        name: 'Data Processing Pipeline',
        description: 'Multi-step data processing with AI analysis',
        nodes: [
          { id: 'start', type: 'start', position: { x: 100, y: 100 }, data: {}, connections: ['webhook1'] },
          { id: 'webhook1', type: 'webhook', position: { x: 300, y: 100 }, data: { endpoint: '/api/webhook/data' }, connections: ['ai1'] },
          { id: 'ai1', type: 'ai', position: { x: 500, y: 100 }, data: { model: 'gpt-4', prompt: 'Analyze the incoming data' }, connections: ['loop1'] },
          { id: 'loop1', type: 'loop', position: { x: 700, y: 100 }, data: { condition: 'items.length > 0', maxIterations: 100 }, connections: ['delay1'] },
          { id: 'delay1', type: 'delay', position: { x: 900, y: 100 }, data: { duration: 1000 }, connections: ['end'] },
          { id: 'end', type: 'end', position: { x: 1100, y: 100 }, data: { type: 'success' }, connections: [] }
        ],
        connections: [
          { id: 'c1', source: 'start', target: 'webhook1', type: 'data' },
          { id: 'c2', source: 'webhook1', target: 'ai1', type: 'data' },
          { id: 'c3', source: 'ai1', target: 'loop1', type: 'data' },
          { id: 'c4', source: 'loop1', target: 'delay1', type: 'data' },
          { id: 'c5', source: 'delay1', target: 'end', type: 'data' }
        ],
        status: 'running',
        createdAt: '2024-01-14T15:30:00Z',
        updatedAt: '2024-01-15T09:45:00Z',
        runs: 15,
        successRate: 93.3
      }
    ]);

    setCollections([
      {
        id: '1',
        name: 'AI APIs Collection',
        description: 'Collection of AI service APIs for testing and integration',
        requests: [
          { id: '1', name: 'OpenAI Chat Completion', method: 'POST', url: 'https://api.openai.com/v1/chat/completions' },
          { id: '2', name: 'Claude API', method: 'POST', url: 'https://api.anthropic.com/v1/messages' },
          { id: '3', name: 'Gemini API', method: 'POST', url: 'https://generativelanguage.googleapis.com/v1beta/models' }
        ],
        variables: [],
        auth: { type: 'bearer' },
        events: []
      }
    ]);

    setEnvironments([
      {
        id: '1',
        name: 'Development',
        variables: [
          { key: 'OPENAI_API_KEY', value: 'sk-***', enabled: true },
          { key: 'CLAUDE_API_KEY', value: 'sk-ant-***', enabled: true },
          { key: 'BASE_URL', value: 'https://api.example.com', enabled: true }
        ]
      },
      {
        id: '2',
        name: 'Production',
        variables: [
          { key: 'OPENAI_API_KEY', value: 'sk-***', enabled: true },
          { key: 'CLAUDE_API_KEY', value: 'sk-ant-***', enabled: true },
          { key: 'BASE_URL', value: 'https://api.production.com', enabled: true }
        ]
      }
    ]);
  }, []);

  const handleCreateFlow = () => {
    // TODO: Implement flow creation
    console.log('Creating new flow...');
  };

  const handleRunFlow = async (flow: PostmanFlow) => {
    setIsRunning(true);
    setFlowExecution({ flowId: flow.id, status: 'running', startTime: new Date() });
    setExecutionLogs([]);

    // Simulate flow execution
    const logs = [
      'Starting flow execution...',
      'Initializing nodes...',
      'Executing start node...',
      'Making API request...',
      'Processing response...',
      'Applying transformations...',
      'Flow completed successfully!'
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExecutionLogs(prev => [...prev, logs[i]]);
    }

    setIsRunning(false);
    setFlowExecution({ ...flowExecution, status: 'completed', endTime: new Date() });
  };

  const handleStopFlow = () => {
    setIsRunning(false);
    setFlowExecution({ ...flowExecution, status: 'stopped', endTime: new Date() });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Workflow className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Postman Flows Integration</h1>
              <p className="text-gray-600">Visual API workflow builder and automation platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleCreateFlow}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Flow
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-white/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="flows" className="text-xs">Flows</TabsTrigger>
                <TabsTrigger value="collections" className="text-xs">Collections</TabsTrigger>
                <TabsTrigger value="environments" className="text-xs">Environments</TabsTrigger>
              </TabsList>

              <TabsContent value="flows" className="mt-4 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Flow Modules</h3>
                  <Badge variant="secondary">{flows.length}</Badge>
                </div>
                {flows.map((flow) => (
                  <Card 
                    key={flow.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedFlow?.id === flow.id ? 'ring-2 ring-orange-500' : ''
                    }`}
                    onClick={() => setSelectedFlow(flow)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm">{flow.name}</h4>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(flow.status)}`} />
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{flow.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Activity className="h-3 w-3 mr-1" />
                              {flow.runs} runs
                            </span>
                            <span className="flex items-center">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              {flow.successRate}% success
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="collections" className="mt-4 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Collections</h3>
                  <Badge variant="secondary">{collections.length}</Badge>
                </div>
                {collections.map((collection) => (
                  <Card key={collection.id} className="cursor-pointer hover:shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{collection.name}</h4>
                          <p className="text-xs text-gray-600 mb-2">{collection.description}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{collection.requests.length} requests</span>
                            <span>•</span>
                            <span>{collection.variables.length} variables</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="environments" className="mt-4 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Environments</h3>
                  <Badge variant="secondary">{environments.length}</Badge>
                </div>
                {environments.map((env) => (
                  <Card key={env.id} className="cursor-pointer hover:shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{env.name}</h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {env.variables.length} variables
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {env.variables.slice(0, 2).map((variable, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {typeof variable === 'object' && variable && 'key' in variable ? String(variable.key) : 'Variable'}
                              </Badge>
                            ))}
                            {env.variables.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{env.variables.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {selectedFlow ? (
            <div className="flex-1 flex flex-col">
              {/* Flow Header */}
              <div className="border-b bg-white/80 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedFlow.status)}
                      <h2 className="text-xl font-semibold">{selectedFlow.name}</h2>
                      <Badge variant={selectedFlow.status === 'running' ? 'default' : 'secondary'}>
                        {selectedFlow.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleRunFlow(selectedFlow)}
                      disabled={isRunning}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isRunning ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {isRunning ? 'Running...' : 'Run Flow'}
                    </Button>
                    {isRunning && (
                      <Button
                        onClick={handleStopFlow}
                        variant="destructive"
                        size="sm"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">{selectedFlow.description}</p>
              </div>

              {/* Flow Canvas */}
              <div className="flex-1 relative bg-gray-50 overflow-hidden">
                <div className="absolute inset-0 p-8">
                  <div className="relative w-full h-full bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-200">
                    {/* Flow Nodes */}
                    {selectedFlow.nodes.map((node) => (
                      <div
                        key={node.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: node.position.x, top: node.position.y }}
                      >
                        <div className={`
                          w-24 h-16 rounded-lg border-2 flex items-center justify-center text-xs font-medium
                          ${node.type === 'start' ? 'bg-green-100 border-green-500 text-green-700' : ''}
                          ${node.type === 'end' ? 'bg-red-100 border-red-500 text-red-700' : ''}
                          ${node.type === 'request' ? 'bg-blue-100 border-blue-500 text-blue-700' : ''}
                          ${node.type === 'condition' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' : ''}
                          ${node.type === 'ai' ? 'bg-purple-100 border-purple-500 text-purple-700' : ''}
                          ${node.type === 'transform' ? 'bg-orange-100 border-orange-500 text-orange-700' : ''}
                          ${node.type === 'webhook' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : ''}
                          ${node.type === 'delay' ? 'bg-gray-100 border-gray-500 text-gray-700' : ''}
                          ${node.type === 'loop' ? 'bg-pink-100 border-pink-500 text-pink-700' : ''}
                        `}>
                          <div className="text-center">
                            <div className="font-semibold">{node.type}</div>
                            {'url' in node.data && typeof node.data.url === 'string' && (
                              <div className="text-xs opacity-75 truncate w-20">
                                {node.data.url.split('/').pop() || ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Flow Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {selectedFlow.connections.map((connection) => {
                        const sourceNode = selectedFlow.nodes.find(n => n.id === connection.source);
                        const targetNode = selectedFlow.nodes.find(n => n.id === connection.target);
                        
                        if (!sourceNode || !targetNode) return null;

                        const startX = sourceNode.position.x + 48; // Half of node width
                        const startY = sourceNode.position.y + 32; // Half of node height
                        const endX = targetNode.position.x - 48;
                        const endY = targetNode.position.y + 32;

                        return (
                          <line
                            key={connection.id}
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke={connection.type === 'success' ? '#10b981' : connection.type === 'error' ? '#ef4444' : '#6b7280'}
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                          />
                        );
                      })}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill="#6b7280"
                          />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Execution Logs */}
              {flowExecution && (
                <div className="border-t bg-white/80 backdrop-blur-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Execution Logs</h3>
                      <Badge variant={flowExecution.status === 'completed' ? 'default' : 'secondary'}>
                        {String(flowExecution.status)}
                      </Badge>
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm max-h-32 overflow-y-auto">
                      {executionLogs.map((log, index) => (
                        <div key={index} className="mb-1">
                          <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Workflow className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No Flow Selected</h3>
                  <p className="text-muted-foreground">
                    Select a flow from the sidebar to view and edit it
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}