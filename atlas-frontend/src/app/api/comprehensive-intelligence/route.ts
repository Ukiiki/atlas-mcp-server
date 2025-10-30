import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

// Call MCP server tool
async function callMCPTool(toolName: string, args: any = {}) {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(process.cwd(), '..', 'server.ts')
    const mcpProcess = spawn('npx', ['tsx', serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    })

    let output = ''
    let errorOutput = ''

    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    }

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    mcpProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`MCP Server error: ${errorOutput}`))
        return
      }

      try {
        // Parse the output to find the JSON response
        const lines = output.split('\n').filter(line => line.trim())
        for (const line of lines) {
          try {
            const response = JSON.parse(line)
            if (response.result && response.result.content) {
              const content = response.result.content[0]?.text
              if (content) {
                resolve(JSON.parse(content))
                return
              }
            }
          } catch (e) {
            // Continue trying other lines
          }
        }
        reject(new Error('No valid response found from MCP server'))
      } catch (error) {
        reject(error)
      }
    })

    mcpProcess.stdin.write(JSON.stringify(request) + '\n')
    mcpProcess.stdin.end()
  })
}

export async function GET() {
  try {
    console.log('Fetching comprehensive analytics from Atlas MCP server...')
    
    // Get analytics from multiple sources in parallel
    const [
      memberStats,
      eventStats,
      financialStats,
      growthStats
    ] = await Promise.allSettled([
      callMCPTool('get_member_analytics', { timeframe: 'current_year' }),
      callMCPTool('get_event_analytics', { timeframe: 'current_year' }),
      callMCPTool('get_financial_analytics', { timeframe: 'current_year' }),
      callMCPTool('get_growth_analytics', { timeframe: 'current_year' })
    ])

    console.log('Retrieved analytics from Atlas')

    // Process results safely with type checking
    const memberData = memberStats.status === 'fulfilled' ? memberStats.value as any : {}
    const eventData = eventStats.status === 'fulfilled' ? eventStats.value as any : {}
    const financialData = financialStats.status === 'fulfilled' ? financialStats.value as any : {}
    const growthData = growthStats.status === 'fulfilled' ? growthStats.value as any : {}

    // Calculate comprehensive analytics from real data
    const analytics = {
      // Financial metrics
      revenue: (financialData?.totalRevenue || financialData?.annualRevenue || 0) as number,
      monthlyRevenue: (financialData?.monthlyRevenue || 0) as number,
      membershipRevenue: (financialData?.membershipRevenue || 0) as number,
      eventRevenue: (financialData?.eventRevenue || 0) as number,
      
      // Growth metrics
      growth: (growthData?.membershipGrowthRate || growthData?.growthPercentage || 0) as number,
      monthlyGrowth: (growthData?.monthlyGrowthRate || 0) as number,
      quarterlyGrowth: (growthData?.quarterlyGrowthRate || 0) as number,
      
      // Member metrics
      totalMembers: (memberData?.totalMembers || memberData?.activeMembers || 0) as number,
      activeMembers: (memberData?.activeMembers || 0) as number,
      newMembers: (memberData?.newMembers || 0) as number,
      memberRetention: (memberData?.retentionRate || 0) as number,
      memberSatisfaction: (memberData?.satisfactionScore || 0) as number,
      
      // Event metrics
      totalEvents: (eventData?.totalEvents || 0) as number,
      upcomingEvents: (eventData?.upcomingEvents || 0) as number,
      eventAttendance: (eventData?.averageAttendanceRate || eventData?.attendancePercentage || 0) as number,
      eventRevenueTotal: (eventData?.totalRevenue || 0) as number,
      
      // Additional insights
      topCommittees: (memberData?.topCommittees || []) as any[],
      popularEvents: (eventData?.popularEvents || []) as any[],
      revenueBySource: (financialData?.revenueBySource || {}) as Record<string, number>,
      membershipTrends: (growthData?.membershipTrends || []) as any[],
      
      // Summary scores
      overallHealth: calculateOverallHealth(
        (memberData?.retentionRate || 0) as number,
        (growthData?.membershipGrowthRate || 0) as number,
        (eventData?.attendancePercentage || 0) as number,
        (financialData?.revenueGrowth || 0) as number
      ),
      
      // Last updated
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching comprehensive analytics from Atlas:', error)
    
    // Fallback to basic mock data if MCP server fails
    const fallbackAnalytics = {
      revenue: 0,
      monthlyRevenue: 0,
      growth: 0,
      totalMembers: 1,
      memberRetention: 0,
      eventAttendance: 0,
      totalEvents: 0,
      overallHealth: 50,
      lastUpdated: new Date().toISOString(),
      error: 'Unable to connect to Atlas server - showing minimal data'
    }

    return NextResponse.json(fallbackAnalytics)
  }
}

// Calculate overall chamber health score (0-100)
function calculateOverallHealth(
  retentionRate: number,
  growthRate: number, 
  attendanceRate: number,
  revenueGrowth: number
): number {
  const weights = {
    retention: 0.3,
    growth: 0.25,
    attendance: 0.25,
    revenue: 0.2
  }
  
  const normalizedRetention = Math.min(retentionRate, 100)
  const normalizedGrowth = Math.max(0, Math.min(growthRate + 50, 100)) // Normalize around 0% growth
  const normalizedAttendance = Math.min(attendanceRate, 100)
  const normalizedRevenue = Math.max(0, Math.min(revenueGrowth + 50, 100)) // Normalize around 0% growth
  
  const healthScore = 
    normalizedRetention * weights.retention +
    normalizedGrowth * weights.growth +
    normalizedAttendance * weights.attendance +
    normalizedRevenue * weights.revenue
  
  return Math.round(healthScore)
}
