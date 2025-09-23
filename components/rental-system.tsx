"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import { toast } from "sonner"
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Coins,
  Shield,
  Activity,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"

interface RentalContract {
  id: string
  agentId: string
  agentName: string
  renterAddress: string
  ownerAddress: string
  startTime: Date
  endTime: Date
  duration: string
  cost: number
  status: "active" | "expired" | "cancelled" | "pending"
  transactionSignature: string
  accessToken: string
  usageStats: {
    requests: number
    responseTime: number
    uptime: number
  }
}

interface RentalSystemProps {
  userAddress?: string
}

export function RentalSystem({ userAddress }: RentalSystemProps) {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [rentals, setRentals] = useState<RentalContract[]>([])
  const [loading, setLoading] = useState(false)
  const [processingRental, setProcessingRental] = useState<string | null>(null)

  // Mock rental data - in production this would come from your backend/blockchain
  useEffect(() => {
    if (publicKey) {
      const mockRentals: RentalContract[] = [
        {
          id: "rental-1",
          agentId: "vision-ai-pro",
          agentName: "Vision AI Pro",
          renterAddress: publicKey.toString(),
          ownerAddress: "11111111111111111111111111111112",
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          endTime: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
          duration: "1d",
          cost: 0.8,
          status: "active",
          transactionSignature: "5KJp7z8X9Y2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H",
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          usageStats: {
            requests: 47,
            responseTime: 1.8,
            uptime: 99.9,
          },
        },
        {
          id: "rental-2",
          agentId: "code-master",
          agentName: "Code Master",
          renterAddress: publicKey.toString(),
          ownerAddress: "11111111111111111111111111111112",
          startTime: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
          endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          duration: "1d",
          cost: 0.6,
          status: "expired",
          transactionSignature: "4JIo6y7W8X1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G",
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          usageStats: {
            requests: 123,
            responseTime: 1.4,
            uptime: 99.8,
          },
        },
      ]
      setRentals(mockRentals)
    }
  }, [publicKey])

  const createRentalContract = async (
    agentId: string,
    agentName: string,
    duration: string,
    cost: number,
    ownerAddress: string,
  ) => {
    if (!publicKey || !sendTransaction) {
      toast.error("Wallet not connected")
      return null
    }

    setProcessingRental(agentId)
    setLoading(true)

    try {
      // Create payment transaction
      const ownerPubkey = new PublicKey(ownerAddress)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: ownerPubkey,
          lamports: cost * LAMPORTS_PER_SOL,
        }),
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, "confirmed")

      // Create rental contract
      const now = new Date()
      const endTime = new Date(now)

      switch (duration) {
        case "1h":
          endTime.setHours(endTime.getHours() + 1)
          break
        case "1d":
          endTime.setDate(endTime.getDate() + 1)
          break
        case "1w":
          endTime.setDate(endTime.getDate() + 7)
          break
      }

      const newRental: RentalContract = {
        id: `rental-${Date.now()}`,
        agentId,
        agentName,
        renterAddress: publicKey.toString(),
        ownerAddress,
        startTime: now,
        endTime,
        duration,
        cost,
        status: "active",
        transactionSignature: signature,
        accessToken: generateAccessToken(),
        usageStats: {
          requests: 0,
          responseTime: 0,
          uptime: 100,
        },
      }

      setRentals((prev) => [newRental, ...prev])
      toast.success(`Successfully rented ${agentName}!`)
      return newRental
    } catch (error) {
      console.error("Rental creation error:", error)
      toast.error("Failed to create rental contract")
      return null
    } finally {
      setProcessingRental(null)
      setLoading(false)
    }
  }

  const extendRental = async (rentalId: string, additionalDuration: string, additionalCost: number) => {
    const rental = rentals.find((r) => r.id === rentalId)
    if (!rental || !publicKey || !sendTransaction) return

    setProcessingRental(rentalId)
    setLoading(true)

    try {
      // Process payment for extension
      const ownerPubkey = new PublicKey(rental.ownerAddress)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: ownerPubkey,
          lamports: additionalCost * LAMPORTS_PER_SOL,
        }),
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, "confirmed")

      // Update rental contract
      const newEndTime = new Date(rental.endTime)
      switch (additionalDuration) {
        case "1h":
          newEndTime.setHours(newEndTime.getHours() + 1)
          break
        case "1d":
          newEndTime.setDate(newEndTime.getDate() + 1)
          break
        case "1w":
          newEndTime.setDate(newEndTime.getDate() + 7)
          break
      }

      setRentals((prev) =>
        prev.map((r) =>
          r.id === rentalId
            ? {
                ...r,
                endTime: newEndTime,
                cost: r.cost + additionalCost,
                status: "active",
              }
            : r,
        ),
      )

      toast.success("Rental extended successfully!")
    } catch (error) {
      console.error("Extension error:", error)
      toast.error("Failed to extend rental")
    } finally {
      setProcessingRental(null)
      setLoading(false)
    }
  }

  const cancelRental = async (rentalId: string) => {
    setRentals((prev) => prev.map((r) => (r.id === rentalId ? { ...r, status: "cancelled" } : r)))
    toast.success("Rental cancelled")
  }

  const generateAccessToken = () => {
    return `agent_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`
  }

  const getStatusColor = (status: RentalContract["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-900/30 text-green-400 border-green-500/30"
      case "expired":
        return "bg-red-900/30 text-red-400 border-red-500/30"
      case "cancelled":
        return "bg-gray-900/30 text-gray-400 border-gray-500/30"
      case "pending":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: RentalContract["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "expired":
        return <XCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getRemainingTime = (endTime: Date) => {
    const now = new Date()
    const remaining = endTime.getTime() - now.getTime()

    if (remaining <= 0) return "Expired"

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h remaining`
    }

    return `${hours}h ${minutes}m remaining`
  }

  const getTimeProgress = (startTime: Date, endTime: Date) => {
    const now = new Date()
    const total = endTime.getTime() - startTime.getTime()
    const elapsed = now.getTime() - startTime.getTime()
    return Math.min(Math.max((elapsed / total) * 100, 0), 100)
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Rentals</h2>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {rentals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Rentals</h3>
            <p className="text-muted-foreground">Visit the marketplace to rent your first AI agent</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rentals.map((rental) => (
            <Card key={rental.id} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-100">{rental.agentName}</CardTitle>
                    <p className="text-xs text-gray-400">Agent ID: {rental.agentId}</p>
                  </div>
                  <Badge className={getStatusColor(rental.status)}>
                    {getStatusIcon(rental.status)}
                    <span className="ml-1 capitalize">{rental.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rental Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Calendar className="h-3 w-3" />
                      Duration
                    </div>
                    <div className="font-medium text-gray-200">{rental.duration}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Coins className="h-3 w-3" />
                      Cost
                    </div>
                    <div className="font-medium text-yellow-400">{rental.cost} SOL</div>
                  </div>
                </div>

                {/* Time Progress */}
                {rental.status === "active" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Time Remaining</span>
                      <span>{getRemainingTime(rental.endTime)}</span>
                    </div>
                    <Progress value={getTimeProgress(rental.startTime, rental.endTime)} className="h-2" />
                  </div>
                )}

                {/* Usage Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-black/20 rounded">
                    <div className="text-sm font-bold text-blue-400">{rental.usageStats.requests}</div>
                    <div className="text-xs text-gray-400">Requests</div>
                  </div>
                  <div className="p-2 bg-black/20 rounded">
                    <div className="text-sm font-bold text-green-400">{rental.usageStats.responseTime}s</div>
                    <div className="text-xs text-gray-400">Avg Response</div>
                  </div>
                  <div className="p-2 bg-black/20 rounded">
                    <div className="text-sm font-bold text-purple-400">{rental.usageStats.uptime}%</div>
                    <div className="text-xs text-gray-400">Uptime</div>
                  </div>
                </div>

                {/* Access Token */}
                <div className="p-3 bg-black/20 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-gray-200">Access Token</span>
                  </div>
                  <div className="text-xs font-mono text-gray-400 break-all">{rental.accessToken.slice(0, 32)}...</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {rental.status === "active" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => extendRental(rental.id, "1h", 0.05)}
                        disabled={processingRental === rental.id}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {processingRental === rental.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Extend +1h"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelRental(rental.id)}
                        className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {rental.status === "expired" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        createRentalContract(rental.agentId, rental.agentName, "1h", 0.05, rental.ownerAddress)
                      }
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      Rent Again
                    </Button>
                  )}
                </div>

                {/* Transaction Link */}
                <div className="text-xs text-gray-500">
                  <span>TX: </span>
                  <span className="font-mono">{rental.transactionSignature.slice(0, 16)}...</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Export the createRentalContract function for use in other components
export type { RentalContract }
