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

    // Mock transcript insights data for demonstration
    const transcriptInsights = {
      summary: {
        totalSpeakers: 3,
        totalWords: 2450,
        duration: "45:32",
        mainTopics: ["AI Development", "Machine Learning", "Future Trends"],
        sentiment: {
          overall: 0.78,
          timeline: [
            { time: "00:00", sentiment: 0.8 },
            { time: "15:00", sentiment: 0.75 },
            { time: "30:00", sentiment: 0.82 },
            { time: "45:00", sentiment: 0.76 }
          ]
        }
      },
      speakers: [
        {
          id: "speaker-1",
          name: "Dr. Sarah Chen",
          role: "AI Researcher",
          wordCount: 1200,
          speakingTime: "18:45",
          keyPoints: ["Neural network optimization", "Edge computing applications"],
          sentiment: 0.85
        },
        {
          id: "speaker-2",
          name: "Mark Johnson",
          role: "Product Manager",
          wordCount: 850,
          speakingTime: "15:30",
          keyPoints: ["User experience design", "Market adoption strategies"],
          sentiment: 0.72
        },
        {
          id: "speaker-3",
          name: "Dr. Alex Rivera",
          role: "Data Scientist",
          wordCount: 400,
          speakingTime: "11:17",
          keyPoints: ["Statistical analysis", "Performance metrics"],
          sentiment: 0.76
        }
      ],
      topics: [
        { name: "AI Development", mentions: 45, confidence: 0.92 },
        { name: "Machine Learning", mentions: 38, confidence: 0.88 },
        { name: "Future Trends", mentions: 32, confidence: 0.85 },
        { name: "Data Processing", mentions: 28, confidence: 0.78 }
      ],
      actionItems: [
        "Schedule follow-up meeting for Q1 roadmap",
        "Review AI model performance metrics",
        "Prepare technical documentation",
        "Evaluate partnership opportunities"
      ]
    }

    return NextResponse.json({
      success: true,
      data: transcriptInsights,
      timestamp: new Date().toISOString(),
      requestId: `transcript-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    console.error("Transcript insights error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch transcript insights",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
