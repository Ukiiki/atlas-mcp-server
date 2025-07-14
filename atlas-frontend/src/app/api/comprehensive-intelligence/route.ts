import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    revenue: 125000,
    growth: 8.5,
    memberRetention: 92,
    eventAttendance: 78
  })
}
