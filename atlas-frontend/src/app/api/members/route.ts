import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for now - replace with actual MCP server call
    const members = [
      {
        id: '1',
        name: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        company: 'Smith Industries',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        membershipType: 'Premium',
        joinDate: '2024-01-15',
        status: 'Active',
        avatar: 'JS'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        firstName: 'Sarah',
        lastName: 'Johnson',
        company: 'Tech Solutions LLC',
        email: 'sarah.j@techsolutions.com',
        phone: '(555) 987-6543',
        membershipType: 'Standard',
        joinDate: '2024-02-20',
        status: 'Active',
        avatar: 'SJ'
      },
      {
        id: '3',
        name: 'Mike Davis',
        firstName: 'Mike',
        lastName: 'Davis',
        company: 'Davis Consulting',
        email: 'mike@davisconsulting.com',
        phone: '(555) 456-7890',
        membershipType: 'Premium',
        joinDate: '2024-03-10',
        status: 'Active',
        avatar: 'MD'
      }
    ]

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberData = await request.json()
    
    // Mock response - replace with actual MCP server call
    const newMember = {
      id: Date.now().toString(),
      ...memberData,
      status: 'Active',
      joinDate: new Date().toISOString(),
      avatar: memberData.firstName && memberData.lastName 
        ? `${memberData.firstName[0]}${memberData.lastName[0]}` 
        : 'M'
    }

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error('Error adding member:', error)
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    )
  }
}
