import { NextRequest, NextResponse } from 'next/server'
import { approvalStore } from '@/lib/approvals'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let requests
    if (status === 'pending') {
      requests = approvalStore.getPendingRequests()
    } else {
      requests = approvalStore.getAllRequests()
    }

    return NextResponse.json({
      success: true,
      data: requests,
      stats: approvalStore.getStats(),
    })
  } catch (error) {
    console.error('Error fetching approvals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approvals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, metadata } = body

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const approval = approvalStore.createRequest({
      title,
      description,
      category: category || 'other',
      status: 'pending',
      metadata,
    })

    return NextResponse.json({
      success: true,
      data: approval,
    })
  } catch (error) {
    console.error('Error creating approval:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create approval' },
      { status: 500 }
    )
  }
}
