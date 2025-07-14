import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for now - replace with actual MCP server call
    const committees = [
      {
        id: '1',
        name: 'Economic Development Committee',
        description: 'Focuses on promoting business growth and economic opportunities in Carlsbad',
        memberCount: 12,
        members: []
      },
      {
        id: '2',
        name: 'Tourism & Marketing Committee',
        description: 'Promotes Carlsbad as a destination for visitors and businesses',
        memberCount: 8,
        members: []
      },
      {
        id: '3',
        name: 'Government Affairs Committee',
        description: 'Advocates for business-friendly policies and legislation',
        memberCount: 15,
        members: []
      },
      {
        id: '4',
        name: 'Young Professionals Committee',
        description: 'Networking and development opportunities for young professionals',
        memberCount: 25,
        members: []
      }
    ]

    return NextResponse.json(committees)
  } catch (error) {
    console.error('Error fetching committees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch committees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const committeeData = await request.json()
    
    // Mock response - replace with actual MCP server call
    const newCommittee = {
      id: Date.now().toString(),
      ...committeeData,
      memberCount: 0,
      members: []
    }

    return NextResponse.json(newCommittee, { status: 201 })
  } catch (error) {
    console.error('Error adding committee:', error)
    return NextResponse.json(
      { error: 'Failed to add committee' },
      { status: 500 }
    )
  }
}
