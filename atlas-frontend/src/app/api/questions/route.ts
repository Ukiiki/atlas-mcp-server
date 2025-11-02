import { NextRequest, NextResponse } from 'next/server'
import { approvalStore } from '@/lib/approvals'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unanswered = searchParams.get('unanswered') === 'true'

    let questions
    if (unanswered) {
      questions = approvalStore.getUnansweredQuestions()
    } else {
      questions = approvalStore.getAllQuestions()
    }

    return NextResponse.json({
      success: true,
      data: questions,
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, options } = body

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    const questionData = approvalStore.createQuestion({
      question,
      options,
    })

    return NextResponse.json({
      success: true,
      data: questionData,
    })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
