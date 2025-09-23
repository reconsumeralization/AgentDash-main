"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Network, 
  Users, 
  Target, 
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Filter,
  Search,
  User,
  UserCheck,
  UserX,
  MessageSquare,
  Heart,
  Star,
  Award,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  Clock,
  Activity,
  Zap,
  Brain,
  Database,
  Globe,
  Smartphone,
  Laptop,
  Mail,
  Phone,
  Video,
  Camera,
  Music,
  Gamepad2,
  BookOpen,
  Code,
  Palette,
  Shield,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  X,
  MoreHorizontal
} from "lucide-react"
import { ConnectionIntelligence, NetworkVisualizationData } from '@/lib/supabase'
import { Label } from '@radix-ui/react-label'
import { getSocialSkin } from '@/lib/social-skins'
import { cn } from '@/lib/utils'

interface NetworkVisualizationProps {
  userId: string
  platform?: string
}

interface NetworkNode {
  id: string
  label: string
  type: 'user' | 'tribe' | 'project' | 'connection'
  x: number
  y: number
  size: number
  color: string
  data: any
}

interface NetworkEdge {
  id: string
  source: string
  target: string
  weight: number
  type: 'connection' | 'collaboration' | 'tribe' | 'project'
  color: string
  data: any
}

export function NetworkVisualization({ userId, platform = 'linkedin' }: NetworkVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [networkData, setNetworkData] = useState<NetworkVisualizationData | null>(null)
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [edges, setEdges] = useState<NetworkEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<NetworkEdge | null>(null)
  const [networkType, setNetworkType] = useState<'connections' | 'tribes' | 'projects' | 'collaborations'>('connections')
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'focused'>('overview')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(false)
  const skin = getSocialSkin(platform as any)
  const cardClassName = (...classes: string[]) => cn(skin.card, ...classes)

  // Load network visualization data
  const loadNetworkData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/network-visualization?userId=${userId}&type=${networkType}`)
      const data = await response.json()
      
      if (data.visualization) {
        setNetworkData(data.visualization)
        setNodes(data.visualization.node_data.nodes || [])
        setEdges(data.visualization.edge_data.edges || [])
      } else {
        // Generate mock data for demo
        generateMockNetworkData()
      }
    } catch (error) {
      console.error('Error loading network data:', error)
      generateMockNetworkData()
    } finally {
      setLoading(false)
    }
  }, [userId, networkType, generateMockNetworkData])

  // Generate mock network data for demo
  const generateMockNetworkData = useCallback(() => {
    const mockNodes: NetworkNode[] = [
      {
        id: userId,
        label: 'You',
        type: 'user',
        x: 400,
        y: 300,
        size: 20,
        color: '#3b82f6',
        data: { name: 'You', role: 'User', connections: 25 }
      },
      {
        id: 'user-1',
        label: 'Sarah Chen',
        type: 'user',
        x: 200,
        y: 200,
        size: 15,
        color: '#10b981',
        data: { name: 'Sarah Chen', role: 'Software Engineer', connections: 18, strength: 0.9 }
      },
      {
        id: 'user-2',
        label: 'Marcus Johnson',
        type: 'user',
        x: 600,
        y: 200,
        size: 15,
        color: '#10b981',
        data: { name: 'Marcus Johnson', role: 'Product Manager', connections: 22, strength: 0.8 }
      },
      {
        id: 'user-3',
        label: 'Emily Rodriguez',
        type: 'user',
        x: 200,
        y: 400,
        size: 15,
        color: '#10b981',
        data: { name: 'Emily Rodriguez', role: 'Designer', connections: 15, strength: 0.7 }
      },
      {
        id: 'user-4',
        label: 'David Kim',
        type: 'user',
        x: 600,
        y: 400,
        size: 15,
        color: '#10b981',
        data: { name: 'David Kim', role: 'Data Scientist', connections: 20, strength: 0.6 }
      },
      {
        id: 'tribe-1',
        label: 'Tech Innovators',
        type: 'tribe',
        x: 400,
        y: 100,
        size: 12,
        color: '#8b5cf6',
        data: { name: 'Tech Innovators', members: 12, focus: 'Technology' }
      },
      {
        id: 'project-1',
        label: 'AI Project',
        type: 'project',
        x: 100,
        y: 300,
        size: 10,
        color: '#f59e0b',
        data: { name: 'AI Project', status: 'Active', members: 5 }
      }
    ]

    const mockEdges: NetworkEdge[] = [
      {
        id: 'edge-1',
        source: userId,
        target: 'user-1',
        weight: 0.9,
        type: 'connection',
        color: '#3b82f6',
        data: { strength: 0.9, interactions: 45, lastInteraction: '2024-01-15' }
      },
      {
        id: 'edge-2',
        source: userId,
        target: 'user-2',
        weight: 0.8,
        type: 'connection',
        color: '#3b82f6',
        data: { strength: 0.8, interactions: 32, lastInteraction: '2024-01-14' }
      },
      {
        id: 'edge-3',
        source: userId,
        target: 'user-3',
        weight: 0.7,
        type: 'connection',
        color: '#3b82f6',
        data: { strength: 0.7, interactions: 28, lastInteraction: '2024-01-13' }
      },
      {
        id: 'edge-4',
        source: userId,
        target: 'user-4',
        weight: 0.6,
        type: 'connection',
        color: '#3b82f6',
        data: { strength: 0.6, interactions: 15, lastInteraction: '2024-01-12' }
      },
      {
        id: 'edge-5',
        source: userId,
        target: 'tribe-1',
        weight: 0.8,
        type: 'tribe',
        color: '#8b5cf6',
        data: { role: 'Member', joined: '2024-01-01' }
      },
      {
        id: 'edge-6',
        source: userId,
        target: 'project-1',
        weight: 0.9,
        type: 'project',
        color: '#f59e0b',
        data: { role: 'Founder', status: 'Active' }
      },
      {
        id: 'edge-7',
        source: 'user-1',
        target: 'user-2',
        weight: 0.5,
        type: 'connection',
        color: '#10b981',
        data: { strength: 0.5, mutual: true }
      }
    ]

    setNodes(mockNodes)
    setEdges(mockEdges)
  }, [userId])

  // Draw network on canvas
  const drawNetwork = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply zoom and pan
    ctx.save()
    ctx.scale(zoom, zoom)
    ctx.translate(pan.x, pan.y)

    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)
      const targetNode = nodes.find(n => n.id === edge.target)
      
      if (sourceNode && targetNode) {
        ctx.beginPath()
        ctx.moveTo(sourceNode.x, sourceNode.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        ctx.strokeStyle = edge.color
        ctx.lineWidth = edge.weight * 3
        ctx.globalAlpha = 0.6
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })

    // Draw nodes
    nodes.forEach(node => {
      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI)
      ctx.fillStyle = node.color
      ctx.fill()
      ctx.strokeStyle = selectedNode?.id === node.id ? '#ef4444' : '#ffffff'
      ctx.lineWidth = selectedNode?.id === node.id ? 3 : 1
      ctx.stroke()

      // Node label
      ctx.fillStyle = '#000000'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(node.label, node.x, node.y + node.size + 15)
    })

    ctx.restore()
  }, [nodes, edges, zoom, pan, selectedNode])

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left - pan.x) / zoom
    const y = (event.clientY - rect.top - pan.y) / zoom

    // Find clicked node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return distance <= node.size
    })

    if (clickedNode) {
      setSelectedNode(clickedNode)
      setSelectedEdge(null)
    } else {
      setSelectedNode(null)
      setSelectedEdge(null)
    }
  }

  // Handle mouse wheel for zoom
  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }

  // Handle mouse down for panning
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y })
  }

  // Handle mouse move for panning
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      })
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Get node type icon
  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />
      case 'tribe':
        return <Users className="h-4 w-4" />
      case 'project':
        return <Target className="h-4 w-4" />
      case 'connection':
        return <Network className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  // Get connection strength color
  const getConnectionStrengthColor = (strength: number) => {
    if (strength >= 0.8) return 'text-green-600'
    if (strength >= 0.6) return 'text-yellow-600'
    if (strength >= 0.4) return 'text-orange-600'
    return 'text-red-600'
  }

  useEffect(() => {
    loadNetworkData()
  }, [loadNetworkData])

  useEffect(() => {
    drawNetwork()
  }, [drawNetwork])

  return (
    <div className={cn('space-y-6', skin.surfaceMuted)}> 
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Network Visualization</h2>
          <p className="text-muted-foreground">Graphical visualizations detailing the connections of your users, friends and associates</p>
        </div>
        <div className={cn(skin.tabTrigger, 'flex items-center gap-2')}>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadNetworkData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="space-y-4">
        <Card className={cardClassName()}>
            <CardHeader>
              <CardTitle className="text-lg">Network Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="networkType">Network Type</Label>
                <Select value={networkType} onValueChange={(value: any) => setNetworkType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="connections">Connections</SelectItem>
                    <SelectItem value="tribes">Tribes</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                    <SelectItem value="collaborations">Collaborations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="viewMode">View Mode</Label>
                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="focused">Focused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Zoom: {Math.round(zoom * 100)}%</Label>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}>
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setZoom(1)}>
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}>
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Network Stats</Label>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Nodes:</span>
                    <span className="font-medium">{nodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connections:</span>
                    <span className="font-medium">{edges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Strength:</span>
                    <span className="font-medium">
                      {edges.length > 0 ? Math.round(edges.reduce((sum, edge) => sum + edge.weight, 0) / edges.length * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Node Details */}
          {selectedNode && (
        <Card className={cardClassName()}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {getNodeTypeIcon(selectedNode.type)}
                  {selectedNode.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <Badge variant="outline">{selectedNode.type}</Badge>
                  </div>
                  {selectedNode.data.role && (
                    <div className="flex justify-between text-sm">
                      <span>Role:</span>
                      <span className="font-medium">{selectedNode.data.role}</span>
                    </div>
                  )}
                  {selectedNode.data.connections && (
                    <div className="flex justify-between text-sm">
                      <span>Connections:</span>
                      <span className="font-medium">{selectedNode.data.connections}</span>
                    </div>
                  )}
                  {selectedNode.data.strength && (
                    <div className="flex justify-between text-sm">
                      <span>Strength:</span>
                      <span className={`font-medium ${getConnectionStrengthColor(selectedNode.data.strength)}`}>
                        {Math.round(selectedNode.data.strength * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {selectedNode.data.interactions && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Interactions:</span>
                      <span className="font-medium">{selectedNode.data.interactions}</span>
                    </div>
                    {selectedNode.data.lastInteraction && (
                      <div className="flex justify-between text-sm">
                        <span>Last:</span>
                        <span className="font-medium">{selectedNode.data.lastInteraction}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Network Canvas */}
        <div className="lg:col-span-3">
        <Card className={cardClassName()}>
            <CardHeader>
              <CardTitle className="text-lg">Network Graph</CardTitle>
              <CardDescription>
                Click on nodes to view details. Use mouse wheel to zoom, drag to pan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="border rounded-lg cursor-pointer"
                  onClick={handleCanvasClick}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                    <div className={cn(skin.tabTrigger, 'flex items-center gap-2')}>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Loading network data...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
