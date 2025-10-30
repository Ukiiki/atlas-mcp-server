import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages, dashboardStats } = await request.json()

    const systemPrompt = `You are the Catalyst Rise AI Assistant - the world's most advanced chamber management AI assistant.

🎯 CORE SPECIALTIES:
1. Member Management - Registration, onboarding, directory updates
2. Event Coordination - Planning, scheduling, attendance tracking  
3. Financial Operations - Payment processing, billing, invoicing
4. Analytics & Reporting - Generate insights, trends, custom reports
5. Real-time Dashboard Updates - Live stats and KPI monitoring

📊 CURRENT DASHBOARD STATS:
- Total Members: ${dashboardStats?.totalMembers || 0}
- Active Events: ${dashboardStats?.activeEvents || 0}
- Pending Payments: ${dashboardStats?.pendingPayments || 0}
- Monthly Revenue: $${dashboardStats?.monthlyRevenue || 0}

🚀 ADVANCED CAPABILITIES:
- Provide actionable insights based on current chamber data
- Suggest member engagement strategies
- Help plan events based on member preferences
- Analyze financial trends and payment patterns
- Create reports and recommendations

🎨 COMMUNICATION STYLE:
- Be helpful, professional, and proactive
- Provide specific, actionable advice
- Reference current dashboard data when relevant
- Suggest concrete next steps for chamber management tasks
- Be concise but thorough in responses

Always be proactive in suggesting relevant actions and providing helpful insights that make chamber management effortless and intuitive.

Current context: Catalyst Rise Chamber Management Dashboard - Ready for advanced chamber operations!`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ content: assistantMessage })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
