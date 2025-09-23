import { NextResponse } from "next/server"
import { defaultHelpCenterResponse } from "@/lib"

export async function GET() {
  return NextResponse.json(defaultHelpCenterResponse)
}
