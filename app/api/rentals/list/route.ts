import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("userAddress")

    if (!userAddress) {
      return NextResponse.json({ success: false, error: "User address required" }, { status: 400 })
    }

    // Mock rental data - in production, fetch from database
    const rentals = [
      {
        id: "rental-1",
        agentId: "vision-ai-pro",
        agentName: "Vision AI Pro",
        renterAddress: userAddress,
        ownerAddress: "11111111111111111111111111111112",
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
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
    ]

    return NextResponse.json({
      success: true,
      rentals,
    })
  } catch (error) {
    console.error("Error fetching rentals:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch rentals" }, { status: 500 })
  }
}
