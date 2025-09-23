import { NextResponse } from "next/server"
import { defaultTemplatesResponse } from "@/lib"

export async function GET() {
  return NextResponse.json(defaultTemplatesResponse)
}
