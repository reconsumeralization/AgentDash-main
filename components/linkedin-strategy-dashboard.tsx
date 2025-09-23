"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Crown, Target, Users } from "lucide-react"

export function LinkedInStrategyDashboard() {
  const networkStats = {
    totalConnections: 1247,
    connectionLimit: 30000,
    connectionsThisWeek: 23,
    pendingInvitations: 5,
    responseRate: 68,
    qualityScore: 87
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            LinkedIn Strategy Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">12</div>
              <div className="text-xs text-gray-400">4-Star Generals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">89</div>
              <div className="text-xs text-gray-400">Cherry-Picked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{networkStats.qualityScore}%</div>
              <div className="text-xs text-gray-400">Network Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{networkStats.responseRate}%</div>
              <div className="text-xs text-gray-400">Response Rate</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
              <span className="text-blue-400">4-Star General Targeting</span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <span className="text-green-400">Cherry-Picking Strategy</span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
              <span className="text-purple-400">Network Optimization</span>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Needs Attention</Badge>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Find 4-Star Generals
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Optimize Network
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}