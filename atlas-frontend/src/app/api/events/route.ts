import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for now - replace with actual MCP server call
    const events = [
      {
        id: '1',
        name: 'Chamber Networking Mixer',
        date: '2025-07-20T18:00:00Z',
        attendees: 45,
        capacity: 60,
        description: 'Monthly networking event for chamber members',
        location: 'Carlsbad Community Center'
      },
      {
        id: '2',
        name: 'Business Development Workshop',
        date: '2025-07-25T09:00:00Z',
        attendees: 23,
        capacity: 30,
        description: 'Learn strategies for growing your business',
        location: 'Chamber Conference Room'
      },
      {
        id: '3',
        name: 'Annual Chamber Gala',
        date: '2025-08-15T19:00:00Z',
        attendees: 120,
        capacity: 150,
        description: 'Annual celebration and awards ceremony',
        location: 'Grand Pacific Hotel'
      }
    ]

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    
    // Mock response - replace with actual MCP server call
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      attendees: 0
    }

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error('Error adding event:', error)
    return NextResponse.json(
      { error: 'Failed to add event' },
      { status: 500 }
    )
  }
}
