// API integration layer for Atlas Chamber Management System
// Use relative URLs to call Next.js API routes directly
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// TypeScript interfaces for our data
export interface Member {
  id: string
  name: string
  firstName?: string
  lastName?: string
  company?: string
  email: string
  phone?: string
  membershipType?: string
  joinDate?: string
  status: string
  avatar?: string
}

export interface Committee {
  id: string
  name: string
  description?: string
  memberCount?: number
  members?: Member[]
}

export interface Event {
  id: string
  name: string
  date: string
  attendees?: number
  capacity?: number
  description?: string
  location?: string
}

export interface BusinessListing {
  id: string
  name: string
  description?: string
  category?: string
  contact?: {
    email?: string
    phone?: string
    website?: string
  }
  address?: string
}

export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  upcomingEvents: number
  pendingPayments: number
  totalRevenue: number
  monthlyGrowth: number
}

// API client class
class AtlasAPIClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Member methods
  async getMembers(): Promise<Member[]> {
    return this.request<Member[]>('/members')
  }

  async addMember(memberData: Partial<Member>): Promise<Member> {
    return this.request<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    })
  }

  async suspendMember(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/members/${id}/suspend`, {
      method: 'POST',
    })
  }

  // Committee methods
  async getCommittees(): Promise<Committee[]> {
    return this.request<Committee[]>('/committees')
  }

  async getCommitteeDetails(id: string): Promise<Committee> {
    return this.request<Committee>(`/committees/${id}/details`)
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/events')
  }

  // Business listing methods
  async getBusinessListings(): Promise<BusinessListing[]> {
    return this.request<BusinessListing[]>('/business-listings')
  }

  async getListingCategories(): Promise<string[]> {
    return this.request<string[]>('/listing-categories')
  }

  // Dashboard intelligence
  async getComprehensiveIntelligence(): Promise<any> {
    return this.request<any>('/comprehensive-intelligence')
  }

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health')
  }
}

// Export singleton instance
export const atlasAPI = new AtlasAPIClient()

// Utility functions for data transformation
export const transformMemberData = (rawMember: any): Member => ({
  id: rawMember.Id || rawMember.id || '',
  name: rawMember.Name || `${rawMember.FirstName || ''} ${rawMember.LastName || ''}`.trim(),
  firstName: rawMember.FirstName,
  lastName: rawMember.LastName,
  company: rawMember.Company || rawMember.CompanyName,
  email: rawMember.Email || rawMember.PrimaryEmail,
  phone: rawMember.Phone || rawMember.PrimaryPhone,
  membershipType: rawMember.MembershipType || rawMember.Type,
  joinDate: rawMember.JoinDate || rawMember.CreatedDate,
  status: rawMember.Status || 'Active',
  avatar: rawMember.FirstName && rawMember.LastName 
    ? `${rawMember.FirstName[0]}${rawMember.LastName[0]}` 
    : rawMember.Name?.[0]?.toUpperCase() || 'M'
})

export const transformEventData = (rawEvent: any): Event => ({
  id: rawEvent.Id || rawEvent.id || '',
  name: rawEvent.Name || rawEvent.Title || '',
  date: rawEvent.Date || rawEvent.StartDate || rawEvent.EventDate || '',
  attendees: rawEvent.Attendees || rawEvent.RegistrationCount || 0,
  capacity: rawEvent.Capacity || rawEvent.MaxAttendees || 0,
  description: rawEvent.Description || '',
  location: rawEvent.Location || rawEvent.Venue || '',
})

export const transformCommitteeData = (rawCommittee: any): Committee => ({
  id: rawCommittee.Id || rawCommittee.id || '',
  name: rawCommittee.Name || rawCommittee.Title || '',
  description: rawCommittee.Description || '',
  memberCount: rawCommittee.MemberCount || rawCommittee.Members?.length || 0,
  members: rawCommittee.Members?.map(transformMemberData) || [],
})

export const transformBusinessListing = (rawListing: any): BusinessListing => ({
  id: rawListing.Id || rawListing.id || '',
  name: rawListing.Name || rawListing.BusinessName || '',
  description: rawListing.Description || rawListing.BusinessDescription || '',
  category: rawListing.Category || rawListing.BusinessCategory || '',
  contact: {
    email: rawListing.Email || rawListing.ContactEmail,
    phone: rawListing.Phone || rawListing.ContactPhone,
    website: rawListing.Website || rawListing.WebsiteUrl,
  },
  address: rawListing.Address || rawListing.BusinessAddress || '',
})
