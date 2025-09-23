"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { toast } from "sonner"
import {
  Shield,
  Lock,
  Unlock,
  Key,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
  Copy,
  Loader2,
  Activity,
} from "lucide-react"

interface AccessToken {
  token: string
  agentId: string
  agentName: string
  expiresAt: Date
  permissions: string[]
  usageLimit: number
  usageCount: number
  status: "active" | "expired" | "suspended"
}

interface AgentSession {
  id: string
  agentId: string
  agentName: string
  startTime: Date
  lastActivity: Date
  requestCount: number
  status: "active" | "idle" | "terminated"
}

interface AgentAccessControlProps {
  onAgentAccess?: (agentId: string, token: string) => void
}

export function AgentAccessControl({ onAgentAccess }: AgentAccessControlProps) {
  const { publicKey } = useWallet()
  const [accessTokens, setAccessTokens] = useState<AccessToken[]>([])
  const [activeSessions, setActiveSessions] = useState<AgentSession[]>([])
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [agentInput, setAgentInput] = useState<string>("")
  const [agentResponse, setAgentResponse] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showTokens, setShowTokens] = useState<{ [key: string]: boolean }>({})

  // Mock access tokens - in production, fetch from your backend
  useEffect(() => {
    if (publicKey) {
      const mockTokens: AccessToken[] = [
        {
          token: "agent_vision_ai_pro_1234567890abcdef",
          agentId: "vision-ai-pro",
          agentName: "Vision AI Pro",
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
          permissions: ["image_analysis", "object_detection", "ocr", "visual_qa"],
          usageLimit: 1000,
          usageCount: 47,
          status: "active",
        },
        {
          token: "agent_code_master_abcdef1234567890",
          agentId: "code-master",
          agentName: "Code Master",
          expiresAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago (expired)
          permissions: ["code_generation", "bug_detection", "code_review", "refactoring"],
          usageLimit: 500,
          usageCount: 123,
          status: "expired",
        },
      ]
      setAccessTokens(mockTokens)

      const mockSessions: AgentSession[] = [
        {
          id: "session-1",
          agentId: "vision-ai-pro",
          agentName: "Vision AI Pro",
          startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          requestCount: 12,
          status: "active",
        },
      ]
      setActiveSessions(mockSessions)
    }
  }, [publicKey])

  const validateAccessToken = async (token: string): Promise<boolean> => {
    const accessToken = accessTokens.find((t) => t.token === token)
    if (!accessToken) {
      toast.error("Invalid access token")
      return false
    }

    if (accessToken.status !== "active") {
      toast.error(`Access token is ${accessToken.status}`)
      return false
    }

    if (new Date() > accessToken.expiresAt) {
      toast.error("Access token has expired")
      setAccessTokens((prev) => prev.map((t) => (t.token === token ? { ...t, status: "expired" } : t)))
      return false
    }

    if (accessToken.usageCount >= accessToken.usageLimit) {
      toast.error("Usage limit exceeded")
      return false
    }

    return true
  }

  const accessAgent = async (agentId: string, token: string, input: string) => {
    setIsProcessing(true)

    try {
      const isValid = await validateAccessToken(token)
      if (!isValid) return

      // Simulate agent processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock agent response based on agent type
      let response = ""
      const agent = accessTokens.find((t) => t.token === token)

      if (agent?.agentId === "vision-ai-pro") {
        response = `Vision Analysis Result:\n\nI've analyzed your input: "${input}"\n\nDetected objects: Person, Car, Building\nConfidence: 98.5%\nScene: Urban street scene\nRecommendations: Good lighting, clear visibility`
      } else if (agent?.agentId === "code-master") {
        response = `Code Analysis Result:\n\nInput: "${input}"\n\nSuggestions:\n- Use const instead of let for immutable variables\n- Add error handling for async operations\n- Consider using TypeScript for better type safety\n\nCode quality score: 8.5/10`
      } else {
        response = `Agent Response:\n\nProcessed your request: "${input}"\n\nResult: Task completed successfully\nProcessing time: 1.8s\nConfidence: 96.2%`
      }

      setAgentResponse(response)

      // Update usage count
      setAccessTokens((prev) => prev.map((t) => (t.token === token ? { ...t, usageCount: t.usageCount + 1 } : t)))

      // Update session activity
      setActiveSessions((prev) =>
        prev.map((s) =>
          s.agentId === agentId
            ? {
                ...s,
                lastActivity: new Date(),
                requestCount: s.requestCount + 1,
                status: "active",
              }
            : s,
        ),
      )

      onAgentAccess?.(agentId, token)
      toast.success("Agent accessed successfully")
    } catch (error) {
      console.error("Agent access error:", error)
      toast.error("Failed to access agent")
    } finally {
      setIsProcessing(false)
    }
  }

  const terminateSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: "terminated" } : s)))
    toast.success("Session terminated")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const toggleTokenVisibility = (token: string) => {
    setShowTokens((prev) => ({ ...prev, [token]: !prev[token] }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900/30 text-green-400 border-green-500/30"
      case "expired":
        return "bg-red-900/30 text-red-400 border-red-500/30"
      case "suspended":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/30"
      case "terminated":
        return "bg-gray-900/30 text-gray-400 border-gray-500/30"
      case "idle":
        return "bg-blue-900/30 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "expired":
        return <XCircle className="h-4 w-4" />
      case "suspended":
        return <AlertTriangle className="h-4 w-4" />
      case "terminated":
        return <Lock className="h-4 w-4" />
      case "idle":
        return <Clock className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date()
    const remaining = expiresAt.getTime() - now.getTime()

    if (remaining <= 0) return "Expired"

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }

    return `${hours}h ${minutes}m`
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Agent Access Control
        </h2>
        <p className="text-muted-foreground">Manage your AI agent access tokens and sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Tokens */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Access Tokens
          </h3>

          {accessTokens.map((token) => (
            <Card key={token.token} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-100">{token.agentName}</CardTitle>
                    <p className="text-xs text-gray-400">Agent ID: {token.agentId}</p>
                  </div>
                  <Badge className={getStatusColor(token.status)}>
                    {getStatusIcon(token.status)}
                    <span className="ml-1 capitalize">{token.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Token Display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Access Token</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleTokenVisibility(token.token)}
                        className="h-6 w-6 p-0"
                      >
                        {showTokens[token.token] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(token.token)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2 bg-black/20 rounded border border-gray-700">
                    <code className="text-xs font-mono text-gray-300">
                      {showTokens[token.token] ? token.token : `${token.token.slice(0, 16)}...`}
                    </code>
                  </div>
                </div>

                {/* Token Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-gray-400">Usage</div>
                    <div className="font-medium text-gray-200">
                      {token.usageCount} / {token.usageLimit}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">Expires</div>
                    <div className="font-medium text-gray-200">{formatTimeRemaining(token.expiresAt)}</div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Permissions</div>
                  <div className="flex flex-wrap gap-1">
                    {token.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedToken(token.token)}
                    disabled={token.status !== "active"}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Unlock className="h-3 w-3 mr-1" />
                    Use Token
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agent Interface */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Agent Interface
          </h3>

          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-100">Secure Agent Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Access Token</label>
                <Input
                  placeholder="Enter your access token..."
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Input</label>
                <Textarea
                  placeholder="Enter your request for the AI agent..."
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button
                onClick={() => {
                  const token = accessTokens.find((t) => t.token === selectedToken)
                  if (token) {
                    accessAgent(token.agentId, selectedToken, agentInput)
                  }
                }}
                disabled={!selectedToken || !agentInput || isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Access Agent
                  </>
                )}
              </Button>

              {agentResponse && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Agent Response</label>
                  <div className="p-3 bg-black/20 rounded border border-gray-700">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">{agentResponse}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active sessions</p>
              ) : (
                activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 border border-border rounded-lg space-y-2 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(session.status)}
                        <span className="text-sm font-medium">{session.agentName}</span>
                      </div>
                      <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>Started: {session.startTime.toLocaleTimeString()}</div>
                      <div>Requests: {session.requestCount}</div>
                    </div>

                    {session.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => terminateSession(session.id)}
                        className="w-full border-red-500/30 text-red-400 hover:bg-red-900/20"
                      >
                        Terminate Session
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
