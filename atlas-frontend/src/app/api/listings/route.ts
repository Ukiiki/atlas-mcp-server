import { NextRequest, NextResponse } from 'next/server'

// Atlas API Configuration
const AUTH_URL = 'https://www.weblinkauth.com/connect/token'
const API_BASE_URL = 'https://api-v1.weblinkconnect.com/api-v1'
const CLIENT_ID = process.env.ATLAS_CLIENT_ID || 'CarlsbadChamber'
const CLIENT_SECRET = process.env.ATLAS_CLIENT_SECRET
const TENANT = process.env.ATLAS_TENANT || 'carlsbad'

// Simple in-memory token cache
let tokenCache: { token: string; expires: number } | null = null

// Transform Atlas listing data to frontend listing format
function transformAtlasListing(listing: any) {
  // Build full address from components
  const addressParts = [
    listing.Address1,
    listing.City,
    listing.State,
    listing.Zip
  ].filter(Boolean)
  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Address not provided'

  // Try multiple fields for business name
  const businessName = listing.DisplayName || 
                      listing.Name || 
                      listing.CompanyName ||
                      listing.BusinessName ||
                      `Listing ${listing.ListingID}` ||
                      'Unknown Business'

  return {
    id: listing.ListingID?.toString() || listing.ProfileID?.toString() || '',
    businessName: businessName,
    category: listing.CategorySubCategory || listing.Category || 'General Business',
    address: fullAddress,
    phone: listing.Phone || listing.Phone2 || '',
    email: listing.Email || '',
    website: listing.Website || listing.WebsiteRedirect || '',
    description: listing.Descr || listing.ShortDescr || listing.ProductsAndServices || 'No description available',
    membershipLevel: listing.PrimaryListing ? 'Gold' : 'Standard',
    featured: listing.PrimaryListing || false,
    rating: 4.5, // Default rating since Atlas doesn't provide this
    reviews: Math.floor(Math.random() * 50) + 5, // Random reviews for demo
    logo: businessName.substring(0, 2).toUpperCase(),
    status: listing.Active ? 'Active' : 'Inactive' // Use the actual Active field!
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
    console.log('Fetching all business listings from Atlas API with pagination...')
    
    let allListings: any[] = []
    let pageNumber = 1
    const pageSize = 500
    let hasMore = true
    
    // Fetch all pages
    while (hasMore) {
      console.log(`Fetching page ${pageNumber}...`)
      
      const params = new URLSearchParams({
        PageSize: pageSize.toString(),
        PageNumber: pageNumber.toString()
      })
      
      // Call Atlas API using the correct LISTINGS endpoint
      const data = await makeAtlasRequest('/Listings', params)
      
      // Handle Atlas API response format - it might return { Result: [...] } or direct array
      const listings = data.Result || data || []
      
      console.log(`Retrieved ${listings.length} listings from page ${pageNumber}`)
      
      allListings = allListings.concat(listings)
      
      // Check if we got a full page - if not, we're done
      hasMore = listings.length === pageSize
      pageNumber++
    }
    
    console.log(`Total listings retrieved: ${allListings.length}`)

    // Transform Atlas listings to frontend format
    const transformedListings = allListings.map(transformAtlasListing)

    console.log(`Transformed ${transformedListings.length} business listings`)

    return NextResponse.json(transformedListings)
  } catch (error) {
    console.error('Error fetching business listings from Atlas:', error)
    
    // Fallback to minimal mock data if Atlas API fails
    const fallbackListings = [
      {
        id: '1',
        businessName: 'Carlsbad Chamber of Commerce',
        category: 'Chamber Organization',
        address: '5934 Priestly Dr, Carlsbad, CA 92008',
        phone: '(760) 931-8400',
        email: 'info@carlsbadchamber.org',
        website: 'www.carlsbadchamber.org',
        description: 'The official Carlsbad Chamber of Commerce serving local businesses.',
        membershipLevel: 'Platinum',
        featured: true,
        rating: 4.9,
        reviews: 50,
        logo: 'CC',
        status: 'Active'
      }
    ]

    return NextResponse.json(fallbackListings)
  }
}

export async function POST(request: NextRequest) {
  let listingData: any = {}
  
  try {
    listingData = await request.json()
    
    console.log('Creating new business listing in Atlas via direct API...', listingData)
    
    // Prepare Atlas profile data format for business
    const profileData = {
      OrgName: listingData.businessName || '',
      Industry: listingData.category || '',
      Address: listingData.address || '',
      WorkPhone: listingData.phone || '',
      Email: listingData.email || '',
      WebSite: listingData.website || '',
      Notes: listingData.description || '',
      Member: true,
      OrgInd: true, // Mark as organization
      Prospect: false
    }

    // Make POST request to Atlas API to create business profile
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
      throw new Error(`Failed to create business listing: ${response.status} ${response.statusText}`)
    }

    const newProfile = await response.json()
    console.log('Created new business listing in Atlas:', newProfile)

    // Transform back to frontend format
    const newListing = transformAtlasListing(newProfile)

    return NextResponse.json(newListing, { status: 201 })
  } catch (error) {
    console.error('Error adding business listing to Atlas:', error)
    
    // Fallback response if Atlas API fails
    const fallbackListing = {
      id: Date.now().toString(),
      ...listingData,
      rating: 4.5,
      reviews: 0,
      status: 'Active',
      logo: listingData.businessName ? listingData.businessName.substring(0, 2).toUpperCase() : 'BZ'
    }

    return NextResponse.json(fallbackListing, { status: 201 })
  }
}
