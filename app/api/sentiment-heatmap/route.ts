import { type NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib"

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    try {
      await limiter.check(20, ip) // 20 requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    // Mock sentiment data for demonstration
    const sentimentData = {
      overall: {
        positive: 0.65,
        neutral: 0.25,
        negative: 0.10,
        total: 1250
      },
      timeline: [
        { timestamp: "2024-01-01T00:00:00Z", positive: 0.7, neutral: 0.2, negative: 0.1 },
        { timestamp: "2024-01-02T00:00:00Z", positive: 0.6, neutral: 0.3, negative: 0.1 },
        { timestamp: "2024-01-03T00:00:00Z", positive: 0.8, neutral: 0.15, negative: 0.05 }
      ],
      sources: [
        { name: "LinkedIn", positive: 0.75, neutral: 0.20, negative: 0.05 },
        { name: "Twitter", positive: 0.60, neutral: 0.30, negative: 0.10 },
        { name: "Email", positive: 0.70, neutral: 0.25, negative: 0.05 }
      ]
    }

    return NextResponse.json({
      success: true,
      data: sentimentData,
      timestamp: new Date().toISOString(),
      requestId: `sentiment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    console.error("Sentiment heatmap error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch sentiment data",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
