import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib"

interface CreateRentalRequest {
  agentId: string
  agentName: string
  renterAddress: string
  duration: string
  cost: number
  transactionSignature: string
}

// Rate limiting: 20 rental creations per hour per IP
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 100,
})

// Valid duration options
const VALID_DURATIONS = ['1h', '1d', '1w'] as const
type ValidDuration = typeof VALID_DURATIONS[number]

// Agent configurations
const AGENT_CONFIGS = {
  'vision-ai-pro': { name: 'Vision AI Pro', baseCost: 0.8, maxUsage: 1000 },
  'code-master': { name: 'Code Master', baseCost: 0.6, maxUsage: 800 },
  'data-analyst': { name: 'Data Analyst', baseCost: 0.7, maxUsage: 900 },
  'content-creator': { name: 'Content Creator', baseCost: 0.5, maxUsage: 600 },
} as const

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    try {
      await limiter.check(20, ip) // 20 rental creations per hour
    } catch {
      return NextResponse.json(
        { success: false, error: "Rental creation rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    // Parse and validate request body
    let body: CreateRentalRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    // Input validation
    const validation = validateRequestBody(body)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Verify transaction signature
    const transactionVerification = await verifySolanaTransaction(
      body.transactionSignature,
      body.renterAddress,
      body.cost
    )

    if (!transactionVerification.valid) {
      return NextResponse.json(
        { success: false, error: transactionVerification.error },
        { status: 400 }
      )
    }

    // Calculate rental end time
    const startTime = new Date()
    const endTime = calculateEndTime(body.duration, startTime)

    // Generate secure access token
    const accessToken = generateSecureAccessToken()

    // Create rental record
    const rental = {
      id: `rental_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId: body.agentId,
      agentName: body.agentName,
      renterAddress: body.renterAddress,
      ownerAddress: process.env.NEXT_PUBLIC_AGENT_OWNER_ADDRESS || 'DefaultOwnerAddress',
      duration: body.duration,
      cost: body.cost,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: "active" as const,
      accessToken,
      transactionSignature: body.transactionSignature,
      transactionVerified: true,
      usageLimit: AGENT_CONFIGS[body.agentId as keyof typeof AGENT_CONFIGS]?.maxUsage || 1000,
      usageCount: 0,
      createdAt: startTime.toISOString(),
      metadata: {
        requestId: `rental_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ip: ip,
        userAgent: request.headers.get('user-agent'),
        agentConfig: AGENT_CONFIGS[body.agentId as keyof typeof AGENT_CONFIGS],
      },
    }

    // Store in database (mock implementation - replace with real DB)
    console.log("Created rental:", {
      ...rental,
      accessToken: rental.accessToken.substring(0, 10) + '...' // Don't log full token
    })

    // In production, save to database here
    // await saveRentalToDatabase(rental)

    return NextResponse.json({
      success: true,
      rental: {
        id: rental.id,
        agentId: rental.agentId,
        agentName: rental.agentName,
        startTime: rental.startTime,
        endTime: rental.endTime,
        status: rental.status,
        usageLimit: rental.usageLimit,
        metadata: {
          duration: rental.duration,
          cost: rental.cost,
          transactionVerified: rental.transactionVerified,
        },
      },
      accessToken: rental.accessToken, // Only return token in response
      message: "Rental created successfully. Use the access token to interact with the agent.",
    })

  } catch (error) {
    console.error("Error creating rental:", error)

    let status = 500
    let errorMessage = "Failed to create rental"

    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        status = 400
        errorMessage = error.message
      } else if (error.message.includes('transaction')) {
        status = 400
        errorMessage = "Transaction verification failed"
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    )
  }
}

function validateRequestBody(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: "Request body must be a valid JSON object" }
  }

  const { agentId, agentName, renterAddress, duration, cost, transactionSignature } = body

  // Validate agent ID
  if (!agentId || typeof agentId !== 'string' || !AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS]) {
    return { valid: false, error: "Invalid agent ID. Must be one of: " + Object.keys(AGENT_CONFIGS).join(', ') }
  }

  // Validate agent name
  if (!agentName || typeof agentName !== 'string' || agentName.length < 2 || agentName.length > 100) {
    return { valid: false, error: "Agent name must be a string between 2-100 characters" }
  }

  // Validate renter address (Solana)
  if (!renterAddress || typeof renterAddress !== 'string' || !isValidSolanaAddress(renterAddress)) {
    return { valid: false, error: "Valid Solana wallet address is required" }
  }

  // Validate duration
  if (!duration || !VALID_DURATIONS.includes(duration as ValidDuration)) {
    return { valid: false, error: "Duration must be one of: " + VALID_DURATIONS.join(', ') }
  }

  // Validate cost
  if (typeof cost !== 'number' || cost <= 0 || cost > 10) {
    return { valid: false, error: "Cost must be a positive number less than 10 SOL" }
  }

  // Validate transaction signature
  if (!transactionSignature || typeof transactionSignature !== 'string' || transactionSignature.length < 64) {
    return { valid: false, error: "Valid transaction signature is required" }
  }

  return { valid: true }
}

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

async function verifySolanaTransaction(
  signature: string,
  expectedAddress: string,
  expectedAmount: number
): Promise<{ valid: boolean; error?: string }> {
  // In production, this would verify the transaction on Solana blockchain
  // For now, we'll do basic validation

  // Check signature format (base58 encoded)
  if (!/^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(signature)) {
    return { valid: false, error: "Invalid transaction signature format" }
  }

  // Mock verification - in production, check:
  // 1. Transaction exists on blockchain
  // 2. Sender matches expectedAddress
  // 3. Amount matches expectedAmount
  // 4. Recipient is the agent owner
  // 5. Transaction is confirmed

  // For demo purposes, accept all valid signatures
  console.log(`Verifying transaction: ${signature} for address ${expectedAddress} amount ${expectedAmount} SOL`)

  return { valid: true }
}

function calculateEndTime(duration: string, startTime: Date = new Date()): Date {
  const endTime = new Date(startTime)
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
    default:
      endTime.setHours(endTime.getHours() + 1)
  }
  return endTime
}

function generateSecureAccessToken(): string {
  // Generate a cryptographically secure token
  const randomBytes = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes)
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Convert to base64url format
  const base64 = btoa(String.fromCharCode(...randomBytes))
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  return `agent_${base64url}_${Date.now()}`
}
