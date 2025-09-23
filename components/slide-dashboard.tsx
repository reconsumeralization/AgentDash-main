"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Label } from "@/components/ui"
import { Switch } from "@/components/ui"
import { Slider } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { VirtualFileSystem } from "@/components/virtual-file-system"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import {
  Settings,
  Activity,
  Brain,
  Zap,
  Shield,
  Database,
  X,
  TrendingUp,
  Cpu,
  HardDrive,
  FolderIcon,
  DollarSign,
  Eye,
  Server,
} from "lucide-react"

interface SlideDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export function SlideDashboard({ isOpen, onClose }: SlideDashboardProps) {
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([2048])
  const [isAutoMode, setIsAutoMode] = useState(true)
  const [isSecureMode, setIsSecureMode] = useState(true)
  const [selectedModel, setSelectedModel] = useState("gemma-3-27b")
  const [modelUsage, setModelUsage] = useState({ tokens: 15420, cost: 4.63 })

  const availableModels = [
    { id: "gemma-3-27b", name: "Gemma-3-27b-it", provider: "Google", capabilities: ["reasoning", "code"] },
    { id: "qwen2-5-vl-72b", name: "Qwen2.5-VL-72B", provider: "Qwen", capabilities: ["vision", "multimodal"] },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />}

      {/* Dashboard */}
      <div
        className={`
        fixed lg:relative top-0 left-0 h-full w-96 bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border
        transform transition-all duration-500 ease-out z-50
        ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full lg:translate-x-0 opacity-0"}
        ${!isOpen ? "lg:-translate-x-full lg:opacity-0" : ""}
      `}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-sidebar-foreground">Control Panel</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden hover:bg-accent/50 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="system" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="system" className="text-xs">
                System
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                AI Config
              </TabsTrigger>
              <TabsTrigger value="models" className="text-xs">
                Models
              </TabsTrigger>
              <TabsTrigger value="files" className="text-xs">
                Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="system" className="space-y-6">
              {/* Status Card */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-card-foreground">CPU Usage</span>
                    </div>
                    <Badge variant="secondary" className="group-hover:bg-primary/10 transition-colors duration-200">
                      23%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-card-foreground">Memory</span>
                    </div>
                    <Badge variant="secondary" className="group-hover:bg-primary/10 transition-colors duration-200">
                      1.2GB
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-card-foreground">Requests/min</span>
                    </div>
                    <Badge variant="secondary" className="group-hover:bg-primary/10 transition-colors duration-200">
                      47
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Auto Mode</Label>
                    </div>
                    <Switch checked={isAutoMode} onCheckedChange={setIsAutoMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Secure Mode</Label>
                    </div>
                    <Switch checked={isSecureMode} onCheckedChange={setIsSecureMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Data Persistence</Label>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02]"
                  >
                    Clear Chat History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02]"
                  >
                    Export Conversation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02]"
                  >
                    Reset to Defaults
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              {/* AI Configuration */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    AI Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center justify-between">
                      Temperature:
                      <span className="text-primary font-mono">{temperature[0]}</span>
                    </Label>
                    <Slider
                      value={temperature}
                      onValueChange={setTemperature}
                      max={2}
                      min={0}
                      step={0.1}
                      className="w-full [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200 [&_[role=slider]]:hover:scale-110"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm flex items-center justify-between">
                      Max Tokens:
                      <span className="text-primary font-mono">{maxTokens[0]}</span>
                    </Label>
                    <Slider
                      value={maxTokens}
                      onValueChange={setMaxTokens}
                      max={4096}
                      min={256}
                      step={256}
                      className="w-full [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200 [&_[role=slider]]:hover:scale-110"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model-select" className="text-sm">
                      Active Model
                    </Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {model.provider}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              {/* Model Usage */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    Current Model Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Model:</span>
                    <Badge variant="secondary">{availableModels.find((m) => m.id === selectedModel)?.name}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-accent/50 rounded-lg">
                      <div className="font-mono text-lg font-bold text-primary">
                        {modelUsage.tokens.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Tokens Used</div>
                    </div>
                    <div className="text-center p-3 bg-accent/50 rounded-lg">
                      <div className="font-mono text-lg font-bold text-primary">${modelUsage.cost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Total Cost</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Model Capacity</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Models */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Available Models
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {availableModels.map((model) => (
                    <div key={model.id} className="p-3 border border-border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{model.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {model.provider}
                          </Badge>
                        </div>
                        {selectedModel === model.id && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability === "vision" && <Eye className="h-3 w-3 mr-1" />}
                            {capability}
                          </Badge>
                        ))}
                      </div>

                      {selectedModel !== model.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedModel(model.id)}
                          className="w-full text-xs"
                        >
                          Switch to {model.name}
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Enterprise Features */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Enterprise Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Zero-Retention Data</span>
                    <Badge variant="outline" className="text-xs">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Auto-Scaling</span>
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Usage-Based Pricing</span>
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Optimized
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FolderIcon className="h-4 w-4 text-primary" />
                    File Manager
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96 overflow-hidden">
                    <VirtualFileSystem />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
