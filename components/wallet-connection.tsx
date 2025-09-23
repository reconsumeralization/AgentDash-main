"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Button } from "@/components/ui"
import { Wallet, Coins, Activity, Zap } from "lucide-react"

interface WalletConnectionProps {
  onWalletConnected?: (publicKey: string) => void
}

export function WalletConnection({ onWalletConnected }: WalletConnectionProps) {
  const { publicKey, connected, disconnect } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) return

    setLoading(true)
    try {
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error("Error fetching balance:", error)
    } finally {
      setLoading(false)
    }
  }, [publicKey, connection])

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance()
      onWalletConnected?.(publicKey.toString())
    }
  }, [connected, publicKey, onWalletConnected, fetchBalance])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-purple-100">
          <Wallet className="h-5 w-5" />
          Solana Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-400">Connect your Solana wallet to rent AI agents</p>
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !border-none !rounded-lg !font-medium" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-green-900/30 text-green-400 border-green-500/30">
                <Activity className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="border-red-500/30 text-red-400 hover:bg-red-900/20 bg-transparent"
              >
                Disconnect
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Address:</span>
                <span className="font-mono text-purple-300">{formatAddress(publicKey!.toString())}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Balance:</span>
                <div className="flex items-center gap-1">
                  {loading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Coins className="h-4 w-4 text-yellow-400" />
                      <span className="font-mono text-yellow-400">{balance?.toFixed(4) || "0.0000"} SOL</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={fetchBalance}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Refresh Balance
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
