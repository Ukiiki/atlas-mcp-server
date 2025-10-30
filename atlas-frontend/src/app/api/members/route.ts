import { NextRequest, NextResponse } from 'next/server'

// Atlas API Configuration
const AUTH_URL = 'https://www.weblinkauth.com/connect/token'
const API_BASE_URL = 'https://api-v1.weblinkconnect.com/api-v1'
const CLIENT_ID = process.env.ATLAS_CLIENT_ID || 'CarlsbadChamber'
const CLIENT_SECRET = process.env.ATLAS_CLIENT_SECRET
const TENANT = process.env.ATLAS_TENANT || 'carlsbad'

// Simple in-memory token cache
let tokenCache: { token: string; expires: number } | null = null

// Transform Atlas profile data to frontend member format
function transformAtlasProfile(profile: any) {
  return {
    id: profile.ProfileId?.toString() || profile.Id || '',
    name: profile.ReportName || `${profile.FirstName || ''} ${profile.LastName || ''}`.trim(),
    firstName: profile.FirstName || '',
    lastName: profile.LastName || '',
    company: profile.OrgName || profile.Company || '',
    email: profile.Email || '',
    phone: profile.WorkPhone || profile.HomePhone || profile.CellPhone || '',
    membershipType: profile.Member ? 'Premium' : 'Standard',
    joinDate: profile.DateChanged || new Date().toISOString(),
    status: profile.Member ? 'Active' : 'Inactive',
    avatar: profile.FirstName && profile.LastName 
      ? `${profile.FirstName[0]}${profile.LastName[0]}` 
      : profile.ReportName?.[0]?.toUpperCase() || 'M'
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
    console.log('Fetching members directly from Atlas API...')
    
    // Create query parameters for member profiles - get all members
    const params = new URLSearchParams({
      RestrictToMember: 'true',
      PageSize: '2000'  // Increased to accommodate all 1,800+ Carlsbad Chamber members
    })
    
    // Call Atlas API directly to get profiles
    const data = await makeAtlasRequest('/profiles', params)
    
    // Handle Atlas API response format - it might return { Result: [...] } or direct array
    const profiles = data.Result || data || []
    
    console.log(`Retrieved ${profiles.length} profiles from Atlas`)

    // Transform Atlas profiles to frontend member format
    const members = profiles.map(transformAtlasProfile)

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members from Atlas:', error)
    
    // Fallback to minimal mock data if Atlas API fails
    const fallbackMembers = [
      {
        id: '1',
        name: 'Carlsbad Chamber',
        firstName: 'Chamber',
        lastName: 'Admin',
        company: 'Carlsbad Chamber of Commerce',
        email: 'admin@carlsbadchamber.org',
        phone: '(760) 931-8400',
        membershipType: 'Admin',
        joinDate: new Date().toISOString(),
        status: 'Active',
        avatar: 'CA'
      }
    ]

    return NextResponse.json(fallbackMembers)
  }
}

export async function POST(request: NextRequest) {
  let memberData: any = {}
  
  try {
    memberData = await request.json()
    
    console.log('Creating new member in Atlas via direct API...', memberData)
    
    // Prepare Atlas profile data format
    const profileData = {
      FirstName: memberData.firstName || '',
      LastName: memberData.lastName || '',
      Email: memberData.email || '',
      WorkPhone: memberData.phone || '',
      OrgName: memberData.company || '',
      Member: true,
      Prospect: false,
      OrgInd: !!memberData.company
    }

    // Make POST request to Atlas API to create profile
    const token = await getAccessToken()
    
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant': TENANT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      throw new Error(`Failed to create profile: ${response.status} ${response.statusText}`)
    }

    const newProfile = await response.json()
    console.log('Created new profile in Atlas:', newProfile)

    // Transform back to frontend format
    const newMember = transformAtlasProfile(newProfile)

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error('Error adding member to Atlas:', error)
    
    // Fallback response if Atlas API fails
    const fallbackMember = {
      id: Date.now().toString(),
      ...memberData,
      status: 'Active',
      joinDate: new Date().toISOString(),
      avatar: memberData.firstName && memberData.lastName 
        ? `${memberData.firstName[0]}${memberData.lastName[0]}` 
        : 'M'
    }

    return NextResponse.json(fallbackMember, { status: 201 })
  }
}
