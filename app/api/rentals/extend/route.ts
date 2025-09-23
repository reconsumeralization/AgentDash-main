import { type NextRequest, NextResponse } from "next/server"

interface ExtendRentalRequest {
  rentalId: string
  additionalDuration: string
  additionalCost: number
  transactionSignature: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtendRentalRequest = await request.json()

    // Validate the transaction signature
    // In production, verify the payment transaction on Solana

    // Update rental in database
    const updatedRental = {
      id: body.rentalId,
      extendedAt: new Date().toISOString(),
      additionalDuration: body.additionalDuration,
      additionalCost: body.additionalCost,
      newEndTime: calculateNewEndTime(body.additionalDuration),
      extensionTransaction: body.transactionSignature,
    }

    console.log("Extended rental:", updatedRental)

    return NextResponse.json({
      success: true,
      rental: updatedRental,
    })
  } catch (error) {
    console.error("Error extending rental:", error)
    return NextResponse.json({ success: false, error: "Failed to extend rental" }, { status: 500 })
  }
}

function calculateNewEndTime(additionalDuration: string): string {
  const now = new Date()
  switch (additionalDuration) {
    case "1h":
      now.setHours(now.getHours() + 1)
      break
    case "1d":
      now.setDate(now.getDate() + 1)
      break
    case "1w":
      now.setDate(now.getDate() + 7)
      break
    default:
      now.setHours(now.getHours() + 1)
  }
  return now.toISOString()
}
