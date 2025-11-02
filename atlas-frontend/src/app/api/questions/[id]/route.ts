import { NextRequest, NextResponse } from 'next/server'
import { approvalStore } from '@/lib/approvals'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const question = approvalStore.getQuestion(id)

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: question,
    })
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch question' },
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
    const { response } = body

    if (!response) {
      return NextResponse.json(
        { success: false, error: 'Response is required' },
        { status: 400 }
      )
    }

    const question = approvalStore.answerQuestion(id, response)

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: question,
    })
  } catch (error) {
    console.error('Error answering question:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to answer question' },
      { status: 500 }
    )
  }
}
