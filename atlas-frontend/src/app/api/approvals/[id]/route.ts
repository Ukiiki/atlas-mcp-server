import { NextRequest, NextResponse } from 'next/server'
import { approvalStore } from '@/lib/approvals'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const approval = approvalStore.getRequest(id)

    if (!approval) {
      return NextResponse.json(
        { success: false, error: 'Approval not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: approval,
    })
  } catch (error) {
    console.error('Error fetching approval:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approval' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      )
    }

    let approval
    if (status === 'approved') {
      approval = approvalStore.approveRequest(id, notes)
    } else {
      approval = approvalStore.rejectRequest(id, notes)
    }

    if (!approval) {
      return NextResponse.json(
        { success: false, error: 'Approval not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: approval,
    })
  } catch (error) {
    console.error('Error updating approval:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update approval' },
      { status: 500 }
    )
  }
}
