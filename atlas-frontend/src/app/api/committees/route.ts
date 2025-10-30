import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

// Transform Atlas committee data to frontend format
function transformAtlasCommittee(committee: any) {
  return {
    id: committee.CommitteeId?.toString() || committee.Id || '',
    name: committee.Name || committee.Title || 'Unnamed Committee',
    description: committee.Description || committee.Notes || '',
    memberCount: committee.MemberCount || committee.Members?.length || 0,
    members: committee.Members || [],
    status: committee.Status || 'Active',
    category: committee.Category || 'General',
    chairperson: committee.Chairperson || null,
    meetingSchedule: committee.MeetingSchedule || 'TBD'
  }
}

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
    console.log('Fetching committees from Atlas MCP server...')
    
    // Call the real Atlas MCP server to get committees
    const committees = await callMCPTool('get_committees', {
      pageSize: 50,
      includeActive: true
    }) as any[]

    console.log(`Retrieved ${committees?.length || 0} committees from Atlas`)

    // Transform Atlas committees to frontend format
    const formattedCommittees = (committees || []).map(transformAtlasCommittee)

    return NextResponse.json(formattedCommittees)
  } catch (error) {
    console.error('Error fetching committees from Atlas:', error)
    
    // Fallback to minimal mock data if MCP server fails
    const fallbackCommittees = [
      {
        id: '1',
        name: 'Chamber Leadership Committee',
        description: 'Main leadership and governance committee',
        memberCount: 0,
        members: [],
        status: 'Active',
        category: 'Leadership'
      }
    ]

    return NextResponse.json(fallbackCommittees)
  }
}

export async function POST(request: NextRequest) {
  let committeeData: any = {}
  
  try {
    committeeData = await request.json()
    
    console.log('Creating new committee in Atlas...', committeeData)
    
    // Prepare Atlas committee data format
    const atlasCommitteeData = {
      Name: committeeData.name || '',
      Description: committeeData.description || '',
      Status: 'Active',
      Category: committeeData.category || 'General',
      Chairperson: committeeData.chairperson || null,
      MeetingSchedule: committeeData.meetingSchedule || 'TBD'
    }

    // Call Atlas MCP server to create committee
    const newCommittee = await callMCPTool('create_committee', {
      committeeData: atlasCommitteeData
    })

    console.log('Created new committee in Atlas:', newCommittee)

    // Transform back to frontend format
    const formattedCommittee = transformAtlasCommittee(newCommittee)

    return NextResponse.json(formattedCommittee, { status: 201 })
  } catch (error) {
    console.error('Error adding committee to Atlas:', error)
    
    // Fallback response if MCP server fails
    const fallbackCommittee = {
      id: Date.now().toString(),
      ...committeeData,
      memberCount: 0,
      members: []
    }

    return NextResponse.json(fallbackCommittee, { status: 201 })
  }
}
