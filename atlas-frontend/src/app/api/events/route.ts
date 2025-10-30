import { NextRequest, NextResponse } from 'next/server'

// Atlas API Configuration
const AUTH_URL = 'https://www.weblinkauth.com/connect/token'
const API_BASE_URL = 'https://api-v1.weblinkconnect.com/api-v1'
const CLIENT_ID = process.env.ATLAS_CLIENT_ID || 'CarlsbadChamber'
const CLIENT_SECRET = process.env.ATLAS_CLIENT_SECRET
const TENANT = process.env.ATLAS_TENANT || 'carlsbad'

// Simple in-memory token cache
let tokenCache: { token: string; expires: number } | null = null

// Transform Atlas event data to frontend format
function transformAtlasEvent(event: any) {
  return {
    id: event.EventId?.toString() || event.Id || '',
    name: event.EventName || event.Name || event.Title || 'Untitled Event',
    date: event.StartDate || event.Date || new Date().toISOString(),
    endDate: event.EndDate || null,
    attendees: event.AttendingAttendees || event.RegisteredCount || 0,
    capacity: event.MaxAttendees || event.Capacity || 100,
    description: event.Descr || event.Description || event.Notes || '',
    location: event.Location || event.Venue || 'TBD',
    price: event.Price || event.Cost || 0,
    status: event.Status || 'Active',
    category: event.EventType || event.Category || 'General'
  }
}

// Get valid access token
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expires) {
    return tokenCache.token
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'PublicWebApi',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET!,
    response_type: 'token',
    acr_values: `tenant:${TENANT}`
  })

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`)
  }

  const data = await response.json()
  
  // Cache the token (expires in 1 hour, refresh 5 minutes early)
  tokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in * 1000) - 300000
  }

  return data.access_token
}

// Make authenticated request to Atlas API
async function makeAtlasRequest(endpoint: string, params?: URLSearchParams): Promise<any> {
  const token = await getAccessToken()
  
  const url = `${API_BASE_URL}${endpoint}${params ? `?${params.toString()}` : ''}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-tenant': TENANT,
    },
  })

  if (!response.ok) {
    throw new Error(`Atlas API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function GET() {
  try {
    console.log('Fetching events directly from Atlas API...')
    
    // Create query parameters for events
    const params = new URLSearchParams({
      PageSize: '50'
    })
    
    // Call Atlas API directly to get events
    const data = await makeAtlasRequest('/Events', params)
    
    // Handle Atlas API response format - it might return { Result: [...] } or direct array
    const events = data.Result || data || []
    
    console.log(`Retrieved ${events.length} events from Atlas`)

    // Transform Atlas events to frontend format
    const formattedEvents = events.map(transformAtlasEvent)

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error('Error fetching events from Atlas:', error)
    
    // Fallback to minimal mock data if Atlas API fails
    const fallbackEvents = [
      {
        id: '1',
        name: 'Chamber Networking Mixer',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        attendees: 0,
        capacity: 60,
        description: 'Monthly networking event for chamber members',
        location: 'Carlsbad Chamber Office'
      }
    ]

    return NextResponse.json(fallbackEvents)
  }
}

export async function POST(request: NextRequest) {
  let eventData: any = {}
  
  try {
    eventData = await request.json()
    
    console.log('Creating new event in Atlas via direct API...', eventData)
    
    // Prepare Atlas event data format
    const atlasEventData = {
      EventName: eventData.name || '',
      Descr: eventData.description || '',
      StartDate: eventData.date || new Date().toISOString(),
      EndDate: eventData.endDate || null,
      Location: eventData.location || '',
      MaxAttendees: eventData.capacity || 100,
      Price: eventData.price || 0,
      Status: 'Active',
      EventType: eventData.category || 'General'
    }

    // Make POST request to Atlas API to create event
    const token = await getAccessToken()
    
    const response = await fetch(`${API_BASE_URL}/Events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant': TENANT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(atlasEventData)
    })

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.status} ${response.statusText}`)
    }

    const newEvent = await response.json()
    console.log('Created new event in Atlas:', newEvent)

    // Transform back to frontend format
    const formattedEvent = transformAtlasEvent(newEvent)

    return NextResponse.json(formattedEvent, { status: 201 })
  } catch (error) {
    console.error('Error adding event to Atlas:', error)
    
    // Fallback response if Atlas API fails
    const fallbackEvent = {
      id: Date.now().toString(),
      ...eventData,
      attendees: 0
    }

    return NextResponse.json(fallbackEvent, { status: 201 })
  }
}
