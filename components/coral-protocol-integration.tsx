"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { ScrollArea } from "@/components/ui"
import { 
  Network, 
  Zap, 
  Users, 
  MessageSquare, 
  Activity,
  Play,
  Pause,
  Square,
  Plus,
  Settings,
  Monitor,
  Database,
  Globe,
  Shield,
  Brain,
  Code2,
  Search,
  Calculator,
  FileText
} from "lucide-react"

interface CoralAgent {
  id: string
  name: string
  description: string
  status: 'available' | 'running' | 'busy' | 'offline'
  capabilities: string[]
  endpoint: string
  version: string
  provider: string
  pricing: {
    type: 'free' | 'paid' | 'subscription'
    cost?: number
    currency?: string
  }
  rating: number
  usage: number
}

interface CoralRegistry {
  agents: CoralAgent[]
  totalAgents: number
  activeAgents: number
  categories: string[]
}

export function CoralProtocolIntegration() {
  const [registry, setRegistry] = useState<CoralRegistry>({
    agents: [
      {
        id: 'coral-search-001',
        name: 'Coral Search Agent',
        description: 'Advanced web search and information retrieval agent with real-time data processing',
        status: 'available',
        capabilities: ['web_search', 'data_extraction', 'url_analysis', 'content_summarization'],
        endpoint: 'coral://search-agent:8080',
        version: '2.1.0',
        provider: 'Coral Labs',
        pricing: { type: 'paid', cost: 0.05, currency: 'USD' },
        rating: 4.8,
        usage: 1250
      },
      {
        id: 'coral-math-002',
        name: 'Coral Math Solver',
        description: 'Mathematical computation and problem-solving agent with symbolic math support',
        status: 'running',
        capabilities: ['calculations', 'equations', 'statistical_analysis', 'graph_plotting'],
        endpoint: 'coral://math-agent:8081',
        version: '1.9.2',
        provider: 'MathCorp',
        pricing: { type: 'free' },
        rating: 4.9,
        usage: 3420
      },
      {
        id: 'coral-code-003',
        name: 'Coral Code Generator',
        description: 'AI-powered code generation and analysis agent supporting multiple languages',
        status: 'available',
        capabilities: ['code_generation', 'code_review', 'debugging', 'refactoring'],
        endpoint: 'coral://code-agent:8082',
        version: '3.0.1',
        provider: 'DevTools Inc',
        pricing: { type: 'subscription', cost: 29, currency: 'USD' },
        rating: 4.7,
        usage: 2100
      },
      {
        id: 'coral-doc-004',
        name: 'Coral Documentation Agent',
        description: 'Automated documentation generation and technical writing assistant',
        status: 'busy',
        capabilities: ['doc_generation', 'api_docs', 'tutorial_creation', 'content_editing'],
        endpoint: 'coral://doc-agent:8083',
        version: '1.5.3',
        provider: 'DocCorp',
        pricing: { type: 'paid', cost: 0.02, currency: 'USD' },
        rating: 4.6,
        usage: 890
      }
    ],
    totalAgents: 156,
    activeAgents: 89,
    categories: ['Search', 'Math', 'Code', 'Documentation', 'Analysis', 'Creative']
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isConnected, setIsConnected] = useState(false)

  const filteredAgents = registry.agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           agent.capabilities.some(cap => cap.toLowerCase().includes(selectedCategory.toLowerCase()))
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: CoralAgent['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'running': return 'bg-blue-500'
      case 'busy': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: CoralAgent['status']) => {
    switch (status) {
      case 'available': return 'Available'
      case 'running': return 'Running'
      case 'busy': return 'Busy'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  const getPricingDisplay = (pricing: CoralAgent['pricing']) => {
    switch (pricing.type) {
      case 'free': return 'Free'
      case 'paid': return `$${pricing.cost}/${pricing.currency}`
      case 'subscription': return `$${pricing.cost}/month`
      default: return 'Unknown'
    }
  }

  const connectToCoral = () => {
    setIsConnected(true)
    console.log('Connecting to Coral Protocol...')
  }

  const disconnectFromCoral = () => {
    setIsConnected(false)
    console.log('Disconnecting from Coral Protocol...')
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Coral Protocol Registry
          </h2>
          <p className="text-muted-foreground">
            Discover and integrate agents from the Coral ecosystem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          {!isConnected ? (
            <Button onClick={connectToCoral} size="sm" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Connect to Coral
            </Button>
          ) : (
            <Button onClick={disconnectFromCoral} size="sm" variant="outline" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              Disconnect
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{registry.totalAgents}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{registry.activeAgents}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Now</p>
                <p className="text-2xl font-bold">{filteredAgents.filter(a => a.status === 'available').length}</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{registry.categories.length}</p>
              </div>
              <Database className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search agents by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {registry.categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {agent.capabilities.includes('web_search') && <Search className="h-5 w-5 text-blue-500" />}
                    {agent.capabilities.includes('calculations') && <Calculator className="h-5 w-5 text-green-500" />}
                    {agent.capabilities.includes('code_generation') && <Code2 className="h-5 w-5 text-purple-500" />}
                    {agent.capabilities.includes('doc_generation') && <FileText className="h-5 w-5 text-orange-500" />}
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
                    {agent.capabilities.slice(0, 3).map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-xs">
                        {capability.replace('_', ' ')}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.capabilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium">{agent.provider}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">{agent.version}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium">{agent.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({agent.usage} uses)</span>
                  </div>
                  <Badge variant={agent.pricing.type === 'free' ? 'default' : 'outline'} className="text-xs">
                    {getPricingDisplay(agent.pricing)}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Plus className="h-3 w-3 mr-1" />
                    Integrate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Integration Status */}
      {isConnected && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="font-medium text-green-800">Connected to Coral Protocol</p>
                <p className="text-sm text-green-600">
                  You can now discover, integrate, and orchestrate agents from the Coral ecosystem
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
