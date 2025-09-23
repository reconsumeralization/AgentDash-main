"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { WalletConnection } from "./wallet-connection"
import { SolanaTransactionHandler } from "./solana-transaction-handler"
import {
  Search,
  Filter,
  Star,
  Clock,
  Zap,
  Brain,
  Eye,
  Code,
  BarChart3,
  Building,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Coins,
} from "lucide-react"

interface MarketplaceAgent {
  id: string
  name: string
  type: "vision" | "code" | "data" | "enterprise" | "research" | "creative"
  description: string
  capabilities: string[]
  model: string
  pricing: {
    hourly: number
    daily: number
    weekly: number
  }
  rating: number
  totalRentals: number
  availability: "available" | "busy" | "maintenance"
  owner: string
  features: string[]
  performance: {
    responseTime: string
    accuracy: string
    uptime: string
  }
}

interface RentalRequest {
  agentId: string
  duration: "1h" | "1d" | "1w"
  totalCost: number
}

export function AgentMarketplace() {
  const [agents] = useState<MarketplaceAgent[]>([
    {
      id: "vision-ai-pro",
      name: "Vision AI Pro",
      type: "vision",
      description: "Advanced computer vision and image analysis powered by Qwen2.5-VL-72B",
      capabilities: ["Image Analysis", "Object Detection", "OCR", "Visual Q&A", "Scene Understanding"],
      model: "Qwen2.5-VL-72B-Instruct",
      pricing: { hourly: 0.05, daily: 0.8, weekly: 4.5 },
      rating: 4.9,
      totalRentals: 1247,
      availability: "available",
      owner: "AI Labs Inc.",
      features: ["Multi-modal", "Real-time", "High Accuracy", "API Access"],
      performance: { responseTime: "< 2s", accuracy: "98.5%", uptime: "99.9%" },
    },
    {
      id: "code-master",
      name: "Code Master",
      type: "code",
      description: "Expert code generation and analysis using Gemma-3-27B",
      capabilities: ["Code Generation", "Bug Detection", "Code Review", "Refactoring", "Documentation"],
      model: "Gemma-3-27b-it",
      pricing: { hourly: 0.04, daily: 0.6, weekly: 3.8 },
      rating: 4.8,
      totalRentals: 892,
      availability: "available",
      owner: "DevTools Corp",
      features: ["Multi-language", "Real-time", "Code Quality", "Best Practices"],
      performance: { responseTime: "< 1.5s", accuracy: "96.2%", uptime: "99.8%" },
    },
    {
      id: "data-scientist",
      name: "Data Scientist AI",
      type: "data",
      description: "Advanced data analysis and machine learning insights",
      capabilities: ["Data Analysis", "ML Modeling", "Statistical Analysis", "Visualization", "Predictions"],
      model: "Gemma-3-27b-it",
      pricing: { hourly: 0.06, daily: 0.9, weekly: 5.2 },
      rating: 4.7,
      totalRentals: 634,
      availability: "available",
      owner: "DataFlow AI",
      features: ["Advanced Analytics", "ML Pipeline", "Custom Models", "Insights"],
      performance: { responseTime: "< 3s", accuracy: "94.8%", uptime: "99.7%" },
    },
    {
      id: "enterprise-advisor",
      name: "Enterprise Advisor",
      type: "enterprise",
      description: "Strategic business analysis and enterprise solutions",
      capabilities: ["Business Analysis", "Strategy Planning", "Risk Assessment", "Market Research", "Consulting"],
      model: "Qwen2.5-VL-72B-Instruct",
      pricing: { hourly: 0.08, daily: 1.2, weekly: 7.0 },
      rating: 4.9,
      totalRentals: 456,
      availability: "available",
      owner: "Enterprise Solutions",
      features: ["Strategic Insights", "Market Analysis", "Risk Management", "Consulting"],
      performance: { responseTime: "< 2.5s", accuracy: "97.1%", uptime: "99.9%" },
    },
    {
      id: "research-assistant",
      name: "Research Assistant",
      type: "research",
      description: "Comprehensive research and information synthesis",
      capabilities: ["Research", "Information Synthesis", "Report Generation", "Fact Checking", "Citations"],
      model: "Gemma-3-27b-it",
      pricing: { hourly: 0.03, daily: 0.5, weekly: 3.0 },
      rating: 4.6,
      totalRentals: 789,
      availability: "busy",
      owner: "Research Labs",
      features: ["Deep Research", "Fact Verification", "Report Writing", "Citations"],
      performance: { responseTime: "< 4s", accuracy: "95.3%", uptime: "99.5%" },
    },
    {
      id: "creative-genius",
      name: "Creative Genius",
      type: "creative",
      description: "Creative content generation and artistic assistance",
      capabilities: ["Content Creation", "Creative Writing", "Brainstorming", "Design Ideas", "Storytelling"],
      model: "Qwen2.5-VL-72B-Instruct",
      pricing: { hourly: 0.04, daily: 0.7, weekly: 4.0 },
      rating: 4.8,
      totalRentals: 923,
      availability: "available",
      owner: "Creative AI Studio",
      features: ["Creative Content", "Multi-format", "Inspiration", "Originality"],
      performance: { responseTime: "< 2s", accuracy: "93.7%", uptime: "99.6%" },
    },
  ])

  const [filteredAgents, setFilteredAgents] = useState<MarketplaceAgent[]>(agents)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rating")
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null)
  const [rentalRequest, setRentalRequest] = useState<RentalRequest | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)

  useEffect(() => {
    let filtered = agents

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.capabilities.some((cap) => cap.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((agent) => agent.type === selectedType)
    }

    // Sort agents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "price":
          return a.pricing.hourly - b.pricing.hourly
        case "popularity":
          return b.totalRentals - a.totalRentals
        default:
          return 0
      }
    })

    setFilteredAgents(filtered)
  }, [searchTerm, selectedType, sortBy, agents])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vision":
        return <Eye className="h-4 w-4" />
      case "code":
        return <Code className="h-4 w-4" />
      case "data":
        return <BarChart3 className="h-4 w-4" />
      case "enterprise":
        return <Building className="h-4 w-4" />
      case "research":
        return <Search className="h-4 w-4" />
      case "creative":
        return <Sparkles className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-900/30 text-green-400 border-green-500/30"
      case "busy":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/30"
      case "maintenance":
        return "bg-red-900/30 text-red-400 border-red-500/30"
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-500/30"
    }
  }

  const handleRentAgent = (agent: MarketplaceAgent, duration: "1h" | "1d" | "1w") => {
    const cost =
      duration === "1h" ? agent.pricing.hourly : duration === "1d" ? agent.pricing.daily : agent.pricing.weekly

    setRentalRequest({
      agentId: agent.id,
      duration,
      totalCost: cost,
    })
    setSelectedAgent(agent)
  }

  const handleRentalSuccess = (signature: string) => {
    console.log("Rental successful:", signature)
    setRentalRequest(null)
    setSelectedAgent(null)
    // Here you would typically update the agent's availability and user's rentals
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          AI Agent Marketplace
        </h1>
        <p className="text-muted-foreground">Rent specialized AI agents powered by cutting-edge models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wallet Connection */}
          <WalletConnection onWalletConnected={setConnectedWallet} />

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Search</label>
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vision">Vision AI</SelectItem>
                    <SelectItem value="code">Code Generation</SelectItem>
                    <SelectItem value="data">Data Science</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold text-purple-100">{agents.length}</div>
                <div className="text-xs text-purple-300">Available Agents</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold text-green-100">4.8</div>
                <div className="text-xs text-green-300">Avg Rating</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold text-yellow-100">99.7%</div>
                <div className="text-xs text-yellow-300">Avg Uptime</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/30">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold text-blue-100">100%</div>
                <div className="text-xs text-blue-300">Secure</div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(agent.type)}
                      <div>
                        <CardTitle className="text-lg text-gray-100">{agent.name}</CardTitle>
                        <p className="text-xs text-gray-400">{agent.owner}</p>
                      </div>
                    </div>
                    <Badge className={getAvailabilityColor(agent.availability)}>{agent.availability}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">{agent.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      {agent.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {agent.totalRentals} rentals
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {agent.performance.responseTime}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability) => (
                      <Badge key={capability} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.capabilities.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-black/20 rounded">
                      <div className="text-sm font-bold text-yellow-400 flex items-center justify-center gap-1">
                        <Coins className="h-3 w-3" />
                        {agent.pricing.hourly}
                      </div>
                      <div className="text-xs text-gray-400">per hour</div>
                    </div>
                    <div className="p-2 bg-black/20 rounded">
                      <div className="text-sm font-bold text-yellow-400 flex items-center justify-center gap-1">
                        <Coins className="h-3 w-3" />
                        {agent.pricing.daily}
                      </div>
                      <div className="text-xs text-gray-400">per day</div>
                    </div>
                    <div className="p-2 bg-black/20 rounded">
                      <div className="text-sm font-bold text-yellow-400 flex items-center justify-center gap-1">
                        <Coins className="h-3 w-3" />
                        {agent.pricing.weekly}
                      </div>
                      <div className="text-xs text-gray-400">per week</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRentAgent(agent, "1h")}
                      disabled={agent.availability !== "available" || !connectedWallet}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Rent 1h
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRentAgent(agent, "1d")}
                      disabled={agent.availability !== "available" || !connectedWallet}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      Rent 1d
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRentAgent(agent, "1w")}
                      disabled={agent.availability !== "available" || !connectedWallet}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Rent 1w
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Rental Modal */}
      {rentalRequest && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Rent {selectedAgent.name}</h3>
            <p className="text-sm text-muted-foreground">
              Duration: {rentalRequest.duration} • Cost: {rentalRequest.totalCost} SOL
            </p>

            <SolanaTransactionHandler
              recipientAddress="11111111111111111111111111111112" // System program address for demo
              amount={rentalRequest.totalCost}
              purpose={`Rent ${selectedAgent.name} for ${rentalRequest.duration}`}
              onSuccess={handleRentalSuccess}
              onError={() => {
                setRentalRequest(null)
                setSelectedAgent(null)
              }}
            />

            <Button
              variant="outline"
              onClick={() => {
                setRentalRequest(null)
                setSelectedAgent(null)
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
