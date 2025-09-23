import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib"

interface AgentAccessRequest {
  token: string
  agentId: string
  input: string
  userAddress: string
}

// Rate limiting: 100 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    try {
      await limiter.check(100, ip) // 100 requests per minute
    } catch {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    // Parse and validate request body
    let body: AgentAccessRequest
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

    // Validate access token
    const tokenValidation = await validateAccessToken(body.token, body.userAddress)
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { success: false, error: tokenValidation.error },
        { status: tokenValidation.status || 403 }
      )
    }

    // Process agent request with timeout
    const agentResponse = await Promise.race([
      processAgentRequest(body.agentId, body.input, body.token),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Agent request timeout')), 30000)
      )
    ]).catch(error => {
      console.error("Agent processing error:", error)
      throw new Error("Agent processing failed or timed out")
    })

    // Update usage statistics
    await updateTokenUsage(body.token)

    // Log successful request (for analytics)
    console.log(`Agent ${body.agentId} accessed by ${body.userAddress} at ${new Date().toISOString()}`)

    return NextResponse.json({
      success: true,
      response: agentResponse,
      usage: {
        requestCount: tokenValidation.tokenData!.usageCount + 1,
        remainingRequests: Math.max(0, tokenValidation.tokenData!.usageLimit - tokenValidation.tokenData!.usageCount - 1),
        resetTime: tokenValidation.tokenData!.expiresAt.toISOString(),
      },
      metadata: {
        agentId: body.agentId,
        processingTime: Date.now(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    })

  } catch (error) {
    console.error("Agent access error:", error)

    // Determine error type for appropriate status code
    let status = 500
    let errorMessage = "Failed to access agent"

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        status = 408
        errorMessage = "Agent request timed out"
      } else if (error.message.includes('validation')) {
        status = 400
        errorMessage = error.message
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

  const { token, agentId, input, userAddress } = body

  if (!token || typeof token !== 'string' || token.length < 10) {
    return { valid: false, error: "Valid access token is required" }
  }

  if (!agentId || typeof agentId !== 'string' || agentId.length < 2) {
    return { valid: false, error: "Valid agent ID is required" }
  }

  if (!input || typeof input !== 'string' || input.length === 0 || input.length > 10000) {
    return { valid: false, error: "Input must be a non-empty string (max 10000 characters)" }
  }

  if (!userAddress || typeof userAddress !== 'string' || !isValidSolanaAddress(userAddress)) {
    return { valid: false, error: "Valid Solana wallet address is required" }
  }

  return { valid: true }
}

function isValidSolanaAddress(address: string): boolean {
  // Basic Solana address validation (32 bytes base58 encoded)
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

async function validateAccessToken(token: string, userAddress: string): Promise<{
  valid: boolean;
  error?: string;
  status?: number;
  tokenData?: any;
}> {
  // Mock validation - in production, check database and blockchain
  const mockTokens = [
    {
      token: "agent_vision_ai_pro_1234567890abcdef",
      agentId: "vision-ai-pro",
      userAddress,
      expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
      usageCount: 47,
      usageLimit: 1000,
      status: "active",
    },
  ]

  const tokenData = mockTokens.find((t) => t.token === token && t.userAddress === userAddress)

  if (!tokenData) {
    return { valid: false, error: "Invalid access token", status: 403 }
  }

  if (tokenData.status !== "active") {
    return { valid: false, error: `Token is ${tokenData.status}`, status: 403 }
  }

  if (new Date() > tokenData.expiresAt) {
    return { valid: false, error: "Token has expired", status: 403 }
  }

  if (tokenData.usageCount >= tokenData.usageLimit) {
    return { valid: false, error: "Usage limit exceeded", status: 429 }
  }

  return { valid: true, tokenData }
}

async function processAgentRequest(agentId: string, input: string, token: string) {
  // Mock agent processing - in production, route to actual AI models
  const responses = {
    "vision-ai-pro": `Vision Analysis Result:\n\nAnalyzed input: "${input}"\n\nDetected: Multiple objects with high confidence\nProcessing time: 1.8s\nAccuracy: 98.5%`,
    "code-master": `Code Analysis:\n\nInput: "${input}"\n\nSuggestions:\n- Optimize performance\n- Add error handling\n- Improve readability\n\nQuality Score: 8.7/10`,
    default: `Agent Response:\n\nProcessed: "${input}"\n\nResult: Task completed successfully\nConfidence: 96.2%`,
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return responses[agentId as keyof typeof responses] || responses.default
}

async function updateTokenUsage(token: string) {
  // Mock usage update - in production, update database
  console.log(`Updated usage for token: ${token}`)
  return true
}
