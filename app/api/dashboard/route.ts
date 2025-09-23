import { NextResponse } from 'next/server'
import { defaultDashboardResponse } from '@/lib'

export async function GET() {
  return NextResponse.json(defaultDashboardResponse)
}
