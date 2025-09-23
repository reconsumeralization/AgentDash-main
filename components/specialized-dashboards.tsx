"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Tabs, TabsContent } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { Label } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import {
  Trophy,
  Dice6,
  TrendingUp,
  Users,
  Target,
  Zap,
  Brain,
  BarChart3,
  DollarSign,
  Settings,
  RefreshCw,
  Activity,
  Award,
  GamepadIcon,
  Coins,
  LineChart,
  PieChart,
  Sparkles,
  Flame,
  Crown,
  Shield,
  Swords,
  Heart,
  Diamond,
  Spade,
  Club,
} from "lucide-react"

interface SpecializedDashboardsProps {
  userAddress?: string
}

interface AgentTask {
  id: string
  type: string
  status: "running" | "completed" | "pending" | "error"
  progress: number
  result?: any
  startTime: Date
  estimatedCompletion?: Date
}

interface UserPreferences {
  fantasyLeagues: string[]
  favoriteTeams: string[]
  bettingTypes: string[]
  riskTolerance: "low" | "medium" | "high"
  contentFrequency: "realtime" | "hourly" | "daily"
}

export function SpecializedDashboards({ userAddress }: SpecializedDashboardsProps) {
  const [activeCategory, setActiveCategory] = useState("fantasy-sports")
  const [activeTasks, setActiveTasks] = useState<AgentTask[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>({
    fantasyLeagues: ["NFL", "NBA"],
    favoriteTeams: ["Lakers", "Chiefs"],
    bettingTypes: ["spread", "over-under"],
    riskTolerance: "medium",
    contentFrequency: "hourly",
  })

  // Simulate agent tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTasks((prev) =>
        prev.map((task) => ({
          ...task,
          progress: Math.min(100, task.progress + Math.random() * 10),
          status: task.progress >= 100 ? "completed" : task.status,
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const startAgentTask = (type: string, category: string) => {
    const newTask: AgentTask = {
      id: `${Date.now()}-${Math.random()}`,
      type: `${category}: ${type}`,
      status: "running",
      progress: 0,
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + 30000), // 30 seconds
    }
    setActiveTasks((prev) => [...prev, newTask])
  }

  const TaskCard = ({ task }: { task: AgentTask }) => (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                task.status === "running"
                  ? "bg-blue-400 animate-pulse"
                  : task.status === "completed"
                    ? "bg-green-400"
                    : task.status === "error"
                      ? "bg-red-400"
                      : "bg-yellow-400"
              }`}
            />
            <span className="text-sm font-medium">{task.type}</span>
          </div>
          <Badge variant={task.status === "completed" ? "default" : "secondary"}>{task.status}</Badge>
        </div>
        <Progress value={task.progress} className="h-2 mb-2" />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{Math.round(task.progress)}% complete</span>
          <span>{task.status === "running" ? "Processing..." : "Done"}</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant={activeCategory === "fantasy-sports" ? "default" : "outline"}
          onClick={() => setActiveCategory("fantasy-sports")}
          className="h-20 flex-col gap-2"
        >
          <Trophy className="h-6 w-6" />
          <span className="text-xs">Fantasy Sports</span>
        </Button>
        <Button
          variant={activeCategory === "gambling" ? "default" : "outline"}
          onClick={() => setActiveCategory("gambling")}
          className="h-20 flex-col gap-2"
        >
          <Dice6 className="h-6 w-6" />
          <span className="text-xs">Gambling & Betting</span>
        </Button>
        <Button
          variant={activeCategory === "trading" ? "default" : "outline"}
          onClick={() => setActiveCategory("trading")}
          className="h-20 flex-col gap-2"
        >
          <TrendingUp className="h-6 w-6" />
          <span className="text-xs">Trading Signals</span>
        </Button>
        <Button
          variant={activeCategory === "gaming" ? "default" : "outline"}
          onClick={() => setActiveCategory("gaming")}
          className="h-20 flex-col gap-2"
        >
          <GamepadIcon className="h-6 w-6" />
          <span className="text-xs">Gaming Analytics</span>
        </Button>
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Active Agent Tasks ({activeTasks.filter((t) => t.status === "running").length} running)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeTasks.slice(-3).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Category Content */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsContent value="fantasy-sports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fantasy Team Management */}
            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-green-400" />
                  Fantasy Team Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => startAgentTask("Lineup Optimization", "Fantasy Sports")}
                    className="h-16 flex-col gap-1 bg-green-600/20 hover:bg-green-600/30"
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Optimize Lineup</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Waiver Wire Analysis", "Fantasy Sports")}
                    className="h-16 flex-col gap-1 bg-blue-600/20 hover:bg-blue-600/30"
                  >
                    <Target className="h-5 w-5" />
                    <span className="text-xs">Waiver Analysis</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Trade Recommendations", "Fantasy Sports")}
                    className="h-16 flex-col gap-1 bg-purple-600/20 hover:bg-purple-600/30"
                  >
                    <Swords className="h-5 w-5" />
                    <span className="text-xs">Trade Finder</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Injury Impact Analysis", "Fantasy Sports")}
                    className="h-16 flex-col gap-1 bg-red-600/20 hover:bg-red-600/30"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-xs">Injury Reports</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Favorite Leagues</Label>
                  <div className="flex gap-2 flex-wrap">
                    {["NFL", "NBA", "MLB", "NHL", "EPL"].map((league) => (
                      <Badge
                        key={league}
                        variant={preferences.fantasyLeagues.includes(league) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setPreferences((prev) => ({
                            ...prev,
                            fantasyLeagues: prev.fantasyLeagues.includes(league)
                              ? prev.fantasyLeagues.filter((l) => l !== league)
                              : [...prev.fantasyLeagues, league],
                          }))
                        }}
                      >
                        {league}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Fantasy Insights */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Live Fantasy Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm">Top Performer</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">Josh Allen (32.4 pts)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-red-400" />
                      <span className="text-sm">Hot Pickup</span>
                    </div>
                    <span className="text-sm font-bold text-blue-400">Jayden Reed (WR)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">Defense Play</span>
                    </div>
                    <span className="text-sm font-bold text-purple-400">Bills D/ST</span>
                  </div>
                </div>

                <Button
                  onClick={() => startAgentTask("Real-time Player Updates", "Fantasy Sports")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Live Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gambling" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Betting Analytics */}
            <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dice6 className="h-5 w-5 text-red-400" />
                  Betting Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => startAgentTask("Odds Analysis", "Gambling")}
                    className="h-16 flex-col gap-1 bg-red-600/20 hover:bg-red-600/30"
                  >
                    <LineChart className="h-5 w-5" />
                    <span className="text-xs">Odds Analysis</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Value Bet Finder", "Gambling")}
                    className="h-16 flex-col gap-1 bg-green-600/20 hover:bg-green-600/30"
                  >
                    <DollarSign className="h-5 w-5" />
                    <span className="text-xs">Value Bets</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Bankroll Management", "Gambling")}
                    className="h-16 flex-col gap-1 bg-blue-600/20 hover:bg-blue-600/30"
                  >
                    <PieChart className="h-5 w-5" />
                    <span className="text-xs">Bankroll Mgmt</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Live Betting Signals", "Gambling")}
                    className="h-16 flex-col gap-1 bg-purple-600/20 hover:bg-purple-600/30"
                  >
                    <Zap className="h-5 w-5" />
                    <span className="text-xs">Live Signals</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Risk Tolerance</Label>
                  <Select
                    value={preferences.riskTolerance}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setPreferences((prev) => ({ ...prev, riskTolerance: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Conservative</SelectItem>
                      <SelectItem value="medium">Moderate</SelectItem>
                      <SelectItem value="high">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Casino Games */}
            <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Casino Game Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => startAgentTask("Blackjack Strategy", "Casino")}
                    className="h-16 flex-col gap-1 bg-gray-600/20 hover:bg-gray-600/30"
                  >
                    <Spade className="h-5 w-5" />
                    <span className="text-xs">Blackjack</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Poker Hand Analysis", "Casino")}
                    className="h-16 flex-col gap-1 bg-red-600/20 hover:bg-red-600/30"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="text-xs">Poker</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Roulette Patterns", "Casino")}
                    className="h-16 flex-col gap-1 bg-green-600/20 hover:bg-green-600/30"
                  >
                    <Club className="h-5 w-5" />
                    <span className="text-xs">Roulette</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Slot Machine Analysis", "Casino")}
                    className="h-16 flex-col gap-1 bg-yellow-600/20 hover:bg-yellow-600/30"
                  >
                    <Diamond className="h-5 w-5" />
                    <span className="text-xs">Slots</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <span className="text-sm">Hot Table</span>
                    <span className="text-sm font-bold text-red-400">Blackjack #3</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <span className="text-sm">Best Odds</span>
                    <span className="text-sm font-bold text-green-400">Craps Pass Line</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trading Signals */}
            <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                  Trading Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => startAgentTask("Technical Analysis", "Trading")}
                    className="h-16 flex-col gap-1 bg-yellow-600/20 hover:bg-yellow-600/30"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs">Technical Analysis</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Market Sentiment", "Trading")}
                    className="h-16 flex-col gap-1 bg-blue-600/20 hover:bg-blue-600/30"
                  >
                    <Brain className="h-5 w-5" />
                    <span className="text-xs">Sentiment Analysis</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Options Flow", "Trading")}
                    className="h-16 flex-col gap-1 bg-purple-600/20 hover:bg-purple-600/30"
                  >
                    <Activity className="h-5 w-5" />
                    <span className="text-xs">Options Flow</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Risk Assessment", "Trading")}
                    className="h-16 flex-col gap-1 bg-red-600/20 hover:bg-red-600/30"
                  >
                    <Shield className="h-5 w-5" />
                    <span className="text-xs">Risk Analysis</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Crypto Analytics */}
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-cyan-400" />
                  Crypto Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <span className="text-sm">BTC Signal</span>
                    <Badge className="bg-green-600">BULLISH</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <span className="text-sm">ETH Signal</span>
                    <Badge className="bg-yellow-600">NEUTRAL</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <span className="text-sm">SOL Signal</span>
                    <Badge className="bg-green-600">BULLISH</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gaming" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gaming Performance */}
            <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GamepadIcon className="h-5 w-5 text-indigo-400" />
                  Gaming Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => startAgentTask("Performance Analysis", "Gaming")}
                    className="h-16 flex-col gap-1 bg-indigo-600/20 hover:bg-indigo-600/30"
                  >
                    <Award className="h-5 w-5" />
                    <span className="text-xs">Performance</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Strategy Optimization", "Gaming")}
                    className="h-16 flex-col gap-1 bg-purple-600/20 hover:bg-purple-600/30"
                  >
                    <Target className="h-5 w-5" />
                    <span className="text-xs">Strategy</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Meta Analysis", "Gaming")}
                    className="h-16 flex-col gap-1 bg-pink-600/20 hover:bg-pink-600/30"
                  >
                    <Brain className="h-5 w-5" />
                    <span className="text-xs">Meta Analysis</span>
                  </Button>
                  <Button
                    onClick={() => startAgentTask("Team Composition", "Gaming")}
                    className="h-16 flex-col gap-1 bg-cyan-600/20 hover:bg-cyan-600/30"
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Team Comp</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Esports Insights */}
            <Card className="bg-gradient-to-br from-pink-900/20 to-red-900/20 border-pink-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-pink-400" />
                  Esports Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <span className="text-sm">Tournament Prediction</span>
                    <span className="text-sm font-bold text-green-400">T1 vs G2</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                    <span className="text-sm">Player Form</span>
                    <span className="text-sm font-bold text-blue-400">Faker (Hot)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preferences Panel */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" />
            Content Generation Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Update Frequency</Label>
              <Select
                value={preferences.contentFrequency}
                onValueChange={(value: "realtime" | "hourly" | "daily") =>
                  setPreferences((prev) => ({ ...prev, contentFrequency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content Depth</Label>
              <Select defaultValue="detailed">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => startAgentTask("Preference Optimization", "System")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Optimize My Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
