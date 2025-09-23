"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Progress } from "@/components/ui"
import { AgentMarketplace } from "./agent-marketplace"
import { RentalSystem } from "./rental-system"
import { AgentAccessControl } from "./agent-access-control"
import { WalletConnection } from "./wallet-connection"
import { SpecializedDashboards } from "./specialized-dashboards"
import {
  Store,
  Wallet,
  Shield,
  Activity,
  TrendingUp,
  Users,
  Coins,
  Clock,
  BarChart3,
  Zap,
  Star,
  Calendar,
  DollarSign,
  X,
  Trophy,
} from "lucide-react"

interface DashboardStats {
  totalRentals: number
  activeRentals: number
  totalSpent: number
  totalEarned: number
  averageRating: number
  totalAgents: number
}

interface RentalManagementDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export function RentalManagementDashboard({ isOpen, onClose }: RentalManagementDashboardProps) {
  const { publicKey, connected } = useWallet()
  const [activeTab, setActiveTab] = useState("marketplace")
  const [stats, setStats] = useState<DashboardStats>({
    totalRentals: 0,
    activeRentals: 0,
    totalSpent: 0,
    totalEarned: 0,
    averageRating: 0,
    totalAgents: 0,
  })

  // Mock stats - in production, fetch from your backend
  useEffect(() => {
    if (connected && publicKey) {
      setStats({
        totalRentals: 23,
        activeRentals: 2,
        totalSpent: 12.4,
        totalEarned: 8.7,
        averageRating: 4.8,
        totalAgents: 6,
      })
    }
  }, [connected, publicKey])

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    suffix = "",
  }: {
    title: string
    value: number | string
    icon: any
    color: string
    suffix?: string
  }) => (
    <Card className={`bg-gradient-to-br ${color} border-opacity-30`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">
              {value}
              {suffix}
            </p>
          </div>
          <Icon className="h-8 w-8 text-white opacity-80" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}

      {/* Dashboard Panel */}
      <div
        className={`
        fixed top-0 right-0 h-full w-full max-w-7xl bg-card border-l border-border
        transform transition-all duration-500 ease-out z-50 overflow-y-auto
        ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
      >
        <div className="p-6 h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Rental Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your AI agent rentals and marketplace</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Wallet Status */}
          {!connected && (
            <Card className="mb-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="font-medium text-yellow-100">Connect Your Wallet</p>
                    <p className="text-sm text-yellow-200/80">Connect your Solana wallet to access the marketplace</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          {connected && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <StatCard
                title="Total Rentals"
                value={stats.totalRentals}
                icon={Activity}
                color="from-blue-900/20 to-blue-800/20"
              />
              <StatCard
                title="Active Rentals"
                value={stats.activeRentals}
                icon={Zap}
                color="from-green-900/20 to-green-800/20"
              />
              <StatCard
                title="Total Spent"
                value={stats.totalSpent}
                icon={DollarSign}
                color="from-red-900/20 to-red-800/20"
                suffix=" SOL"
              />
              <StatCard
                title="Total Earned"
                value={stats.totalEarned}
                icon={TrendingUp}
                color="from-purple-900/20 to-purple-800/20"
                suffix=" SOL"
              />
              <StatCard
                title="Avg Rating"
                value={stats.averageRating}
                icon={Star}
                color="from-yellow-900/20 to-yellow-800/20"
                suffix="/5"
              />
              <StatCard
                title="Agents Used"
                value={stats.totalAgents}
                icon={Users}
                color="from-indigo-900/20 to-indigo-800/20"
              />
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Marketplace</span>
              </TabsTrigger>
              <TabsTrigger value="rentals" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">My Rentals</span>
              </TabsTrigger>
              <TabsTrigger value="access" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Access Control</span>
              </TabsTrigger>
              <TabsTrigger value="specialized" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Specialized</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace" className="space-y-6">
              <AgentMarketplace />
            </TabsContent>

            <TabsContent value="rentals" className="space-y-6">
              {connected ? (
                <RentalSystem userAddress={publicKey?.toString()} />
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Wallet Required</h3>
                    <p className="text-muted-foreground mb-4">Connect your wallet to view your rentals</p>
                    <WalletConnection />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="access" className="space-y-6">
              {connected ? (
                <AgentAccessControl />
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Access Control</h3>
                    <p className="text-muted-foreground mb-4">Connect your wallet to manage agent access</p>
                    <WalletConnection />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="specialized" className="space-y-6">
              {connected ? (
                <SpecializedDashboards userAddress={publicKey?.toString()} />
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Specialized Dashboards</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your wallet to access specialized agent dashboards
                    </p>
                    <WalletConnection />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {connected ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Usage Analytics */}
                  <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-400" />
                        Usage Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Vision AI Pro</span>
                          <span className="text-sm font-medium">47 requests</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Code Master</span>
                          <span className="text-sm font-medium">123 requests</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Data Scientist AI</span>
                          <span className="text-sm font-medium">28 requests</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Spending Analytics */}
                  <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-400" />
                        Spending Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-black/20 rounded">
                          <div className="text-lg font-bold text-green-400">8.7 SOL</div>
                          <div className="text-xs text-gray-400">This Month</div>
                        </div>
                        <div className="p-3 bg-black/20 rounded">
                          <div className="text-lg font-bold text-blue-400">3.9 SOL</div>
                          <div className="text-xs text-gray-400">This Week</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Average per rental</span>
                          <span className="text-gray-200">0.54 SOL</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Most expensive</span>
                          <span className="text-gray-200">1.2 SOL</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total saved</span>
                          <span className="text-green-400">2.3 SOL</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-400" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-black/20 rounded">
                          <div className="text-sm font-bold text-green-400">99.8%</div>
                          <div className="text-xs text-gray-400">Uptime</div>
                        </div>
                        <div className="p-2 bg-black/20 rounded">
                          <div className="text-sm font-bold text-blue-400">1.9s</div>
                          <div className="text-xs text-gray-400">Avg Response</div>
                        </div>
                        <div className="p-2 bg-black/20 rounded">
                          <div className="text-sm font-bold text-purple-400">4.8</div>
                          <div className="text-xs text-gray-400">Satisfaction</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-400" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 p-2 bg-black/20 rounded">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Vision AI Pro accessed</div>
                          <div className="text-xs text-gray-400">2 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-black/20 rounded">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Rental extended</div>
                          <div className="text-xs text-gray-400">1 hour ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-black/20 rounded">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">New agent rented</div>
                          <div className="text-xs text-gray-400">3 hours ago</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground mb-4">Connect your wallet to view detailed analytics</p>
                    <WalletConnection />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
