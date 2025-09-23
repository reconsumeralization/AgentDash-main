"use client"

import { useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { Button } from "@/components/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Badge } from "@/components/ui"
import { toast } from "sonner"
import { Loader2, Send, CheckCircle, XCircle } from "lucide-react"

interface TransactionHandlerProps {
  recipientAddress: string
  amount: number
  purpose: string
  onSuccess?: (signature: string) => void
  onError?: (error: string) => void
}

export function SolanaTransactionHandler({
  recipientAddress,
  amount,
  purpose,
  onSuccess,
  onError,
}: TransactionHandlerProps) {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<{
    signature: string
    status: "pending" | "confirmed" | "failed"
    timestamp: Date
  } | null>(null)

  const handleTransaction = async () => {
    if (!publicKey || !sendTransaction) {
      toast.error("Wallet not connected")
      return
    }

    setIsProcessing(true)

    try {
      // Create recipient public key
      const recipientPubkey = new PublicKey(recipientAddress)

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Send transaction
      const signature = await sendTransaction(transaction, connection)

      setLastTransaction({
        signature,
        status: "pending",
        timestamp: new Date(),
      })

      toast.success("Transaction sent! Confirming...")

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, "confirmed")

      if (confirmation.value.err) {
        throw new Error("Transaction failed")
      }

      setLastTransaction((prev) => (prev ? { ...prev, status: "confirmed" } : null))
      toast.success(`Payment successful! ${purpose}`)
      onSuccess?.(signature)
    } catch (error) {
      console.error("Transaction error:", error)
      setLastTransaction((prev) => (prev ? { ...prev, status: "failed" } : null))
      const errorMessage = error instanceof Error ? error.message : "Transaction failed"
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-900/30 text-green-400 border-green-500/30"
      case "failed":
        return "bg-red-900/30 text-red-400 border-red-500/30"
      default:
        return "bg-yellow-900/30 text-yellow-400 border-yellow-500/30"
    }
  }

  return (
    <Card className="w-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-indigo-100">Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Purpose:</span>
            <span className="text-indigo-300">{purpose}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Amount:</span>
            <span className="font-mono text-yellow-400">{amount} SOL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Recipient:</span>
            <span className="font-mono text-purple-300">
              {`${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-6)}`}
            </span>
          </div>
        </div>

        <Button
          onClick={handleTransaction}
          disabled={isProcessing || !publicKey}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Payment
            </>
          )}
        </Button>

        {lastTransaction && (
          <div className="space-y-2 p-3 bg-black/20 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Last Transaction:</span>
              <Badge className={getStatusColor(lastTransaction.status)}>
                {getStatusIcon(lastTransaction.status)}
                <span className="ml-1 capitalize">{lastTransaction.status}</span>
              </Badge>
            </div>
            <div className="text-xs font-mono text-gray-500">{lastTransaction.signature.slice(0, 20)}...</div>
            <div className="text-xs text-gray-500">{lastTransaction.timestamp.toLocaleTimeString()}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
