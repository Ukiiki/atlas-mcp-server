#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Atlas MemberClicks API Configuration
const AUTH_URL = process.env.ATLAS_AUTH_URL || 'https://www.weblinkauth.com/connect/token';
const API_BASE_URL = process.env.ATLAS_API_BASE_URL || 'https://api-v1.weblinkconnect.com/api-v1';
const CLIENT_ID = process.env.ATLAS_CLIENT_ID || 'CarlsbadChamber';
const CLIENT_SECRET = process.env.ATLAS_CLIENT_SECRET;
const TENANT = process.env.ATLAS_TENANT || 'carlsbad';

// Validate required environment variables
if (!CLIENT_SECRET) {
  console.error('Error: ATLAS_CLIENT_SECRET environment variable is required');
  process.exit(1);
}

// Types for API responses
interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface Member {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone?: string;
  Company?: string;
  Title?: string;
  Status: string;
  MembershipType?: string;
  JoinDate?: string;
  [key: string]: any;
}

interface Committee {
  Id: string;
  Name: string;
  Description?: string;
  IsActive: boolean;
  [key: string]: any;
}

interface CommitteeMember {
  Id: string;
  CommitteeId: string;
  ProfileId: string;
  Position?: string;
  JoinDate?: string;
  [key: string]: any;
}

interface Event {
  EventId: string;
  EventName: string;
  Descr?: string;
  StartDate: string;
  EndDate: string;
  Location?: string;
  EventType?: string;
  AttendingAttendees?: number;
  PendingAttendees?: number;
  PotentialAttendees?: number;
  TotalInvoiced?: number;
  ProfileId?: number;
  [key: string]: any;
}

interface BusinessListing {
  Id: string;
  Name: string;
  Description?: string;
  Address1?: string;
  City?: string;
  State?: string;
  Zip?: string;
  Phone?: string;
  Email?: string;
  Website?: string;
  CategoryId?: string;
  ListingTypeId?: string;
  [key: string]: any;
}

interface ListingCategory {
  Id: string;
  Category: string;
  StandardCategoryID?: number;
  Description?: string;
  [key: string]: any;
}

interface ListingType {
  Id: string;
  Name: string;
  Description?: string;
  [key: string]: any;
}

interface Contact {
  Id: string;
  FirstName: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  Company?: string;
  ProfileId?: string;
  [key: string]: any;
}

class AtlasAPI {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  // Authenticate and get access token
  async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'PublicWebApi',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET!,
      response_type: 'token',
      acr_values: `tenant:${TENANT}`
    });

    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json() as AuthResponse;
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

    return this.accessToken;
  }

  // Make authenticated API request
  async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<any> {
    const token = await this.authenticate();
    
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'x-tenant': TENANT,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Member Management Methods
  async getMembers(restrictToMember: boolean = true): Promise<Member[]> {
    const params = restrictToMember ? '?RestrictToMember=true' : '';
    return this.makeRequest(`/profiles${params}`);
  }

  async getMemberById(id: string): Promise<Member> {
    return this.makeRequest(`/profiles/${id}`);
  }

  async updateMemberProfile(id: string, profileData: Partial<Member>): Promise<Member> {
    return this.makeRequest(`/profiles/${id}`, 'PUT', profileData);
  }

  async suspendMember(id: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/suspend`, 'POST');
  }

  async addMember(memberData: Partial<Member>): Promise<Member> {
    return this.makeRequest('/profiles', 'POST', memberData);
  }

  // Committee Management Methods
  async getCommittees(pageSize: number = 20): Promise<Committee[]> {
    return this.makeRequest(`/Committees?PageSize=${pageSize}`);
  }

  async getCommitteeMembers(): Promise<CommitteeMember[]> {
    return this.makeRequest('/CommitteeMembers');
  }

  async getCommitteeMembersByCommitteeId(committeeId: string): Promise<CommitteeMember[]> {
    return this.makeRequest(`/CommitteeMembers?CommitteeId=${committeeId}`);
  }

  // Event Management Methods
  async getEvents(pageSize: number = 100): Promise<Event[]> {
    return this.makeRequest(`/Events?PageSize=${pageSize}`);
  }

  async getEventsV4(pageSize: number = 100): Promise<Event[]> {
    return this.makeRequest(`/Events-v4?PageSize=${pageSize}`);
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const events = await this.getEventsV4();
    const now = new Date();
    return events.filter(event => new Date(event.StartDate) > now);
  }

  async getCommitteeEvents(): Promise<Event[]> {
    const events = await this.getEventsV4();
    return events.filter(event => event.EventType === 'Committee Meetings');
  }

  async getEventAttendanceAnalysis(): Promise<any> {
    const events = await this.getEventsV4();
    const committeeEvents = events.filter(event => event.EventType === 'Committee Meetings');
    const networkingEvents = events.filter(event => event.EventType === 'Networking');
    
    return {
      totalEvents: events.length,
      committeeEvents: committeeEvents.length,
      networkingEvents: networkingEvents.length,
      totalAttendees: events.reduce((sum, event) => sum + (event.AttendingAttendees || 0), 0),
      totalRevenue: events.reduce((sum, event) => sum + (event.TotalInvoiced || 0), 0),
      averageAttendance: events.length > 0 
        ? events.reduce((sum, event) => sum + (event.AttendingAttendees || 0), 0) / events.length 
        : 0,
      eventsByType: events.reduce((acc, event) => {
        const type = event.EventType || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Business Listing Methods
  async getBusinessListings(pageSize: number = 200, active: boolean = true): Promise<BusinessListing[]> {
    const params = `?Active=${active}&PageSize=${pageSize}&OrderBy=DateChanged&OrderByExpression=DESC&ObjectState=0`;
    return this.makeRequest(`/Listings${params}`);
  }

  async getListingCategories(pageSize: number = 200, pageNumber: number = 1): Promise<ListingCategory[]> {
    return this.makeRequest(`/ListingCategories?PageSize=${pageSize}&OrderBy=Category&PageNumber=${pageNumber}`);
  }

  async getListingTypes(pageSize: number = 200): Promise<ListingType[]> {
    return this.makeRequest(`/ListingTypes?PageSize=${pageSize}`);
  }

  async getCategoriesByStandardId(standardCategoryId: number): Promise<ListingCategory[]> {
    return this.makeRequest(`/ListingCategories?PageSize=200&OrderBy=Category&StandardCategoryID=${standardCategoryId}`);
  }

  // Contact Management
  async getContacts(pageSize: number = 200): Promise<Contact[]> {
    return this.makeRequest(`/Contacts?PageSize=${pageSize}`);
  }

  // Enhanced Committee Methods
  async getActiveCommitteeMembers(committeeIds?: string[]): Promise<CommitteeMember[]> {
    let endpoint = '/CommitteeMembers?Active=true';
    if (committeeIds && committeeIds.length > 0) {
      const committeeParams = committeeIds.map(id => `CommitteeIds=${id}`).join('&');
      endpoint += `&${committeeParams}&PageSize=1000`;
    }
    return this.makeRequest(endpoint);
  }

  async getCommitteeById(id: string): Promise<Committee> {
    return this.makeRequest(`/Committee/${id}`);
  }

  // Utility Methods
  async getNewMembers(daysBack: number = 7): Promise<Member[]> {
    const members = await this.getMembers();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    return members.filter(member => 
      member.JoinDate && new Date(member.JoinDate) > cutoffDate
    );
  }

  async getCommitteeWithMembers(committeeId: string): Promise<{ committee: Committee, members: CommitteeMember[] }> {
    const [committees, members] = await Promise.all([
      this.getCommittees(),
      this.getCommitteeMembersByCommitteeId(committeeId)
    ]);
    
    const committee = committees.find(c => c.Id === committeeId);
    if (!committee) {
      throw new Error(`Committee with ID ${committeeId} not found`);
    }

    return { committee, members };
  }

  // Enhanced Analysis Methods
  async getMemberBusinessAnalysis(): Promise<any> {
    const [members, listings, categories] = await Promise.all([
      this.getMembers(),
      this.getBusinessListings(),
      this.getListingCategories()
    ]);

    // Map members to businesses based on ProfileId
    const memberBusinessMap = new Map();
    listings.forEach(listing => {
      if (listing.ProfileId) {
        memberBusinessMap.set(listing.ProfileId.toString(), listing);
      }
    });

    // Create category lookup
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.Id, cat.Category);
    });

    // Analyze member-business relationships
    const memberAnalysis = members.map(member => {
      const business = memberBusinessMap.get(member.Id);
      return {
        member: {
          id: member.Id,
          name: `${member.FirstName} ${member.LastName}`,
          email: member.Email,
          company: member.Company
        },
        business: business || null,
        businessCategory: business && business.CategoryId 
          ? categoryMap.get(business.CategoryId) || 'Unknown'
          : null
      };
    });

    // Industry distribution
    const industryStats = memberAnalysis.reduce((acc, analysis) => {
      const category = analysis.businessCategory || 'No Business Listed';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMembers: members.length,
      membersWithBusinesses: memberAnalysis.filter(a => a.business).length,
      memberAnalysis,
      industryDistribution: industryStats,
      topIndustries: Object.entries(industryStats)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
    };
  }

  async getCommitteeEngagementAnalysis(): Promise<any> {
    const [committees, committeeMembers, events] = await Promise.all([
      this.getCommittees(),
      this.getActiveCommitteeMembers(),
      this.getCommitteeEvents()
    ]);

    // Map events to attendance
    const eventAttendance = events.map(event => ({
      eventId: event.EventId,
      eventName: event.EventName,
      attendees: event.AttendingAttendees || 0,
      pending: event.PendingAttendees || 0,
      potential: event.PotentialAttendees || 0,
      revenue: event.TotalInvoiced || 0
    }));

    // Committee member distribution
    const committeeStats = committees.map(committee => {
      const members = committeeMembers.filter(cm => cm.CommitteeId === committee.Id);
      return {
        committee: committee.Name,
        memberCount: members.length,
        isActive: committee.IsActive
      };
    });

    return {
      totalCommittees: committees.length,
      activeCommittees: committees.filter(c => c.IsActive).length,
      totalCommitteeMembers: committeeMembers.length,
      committeeEvents: events.length,
      totalEventAttendance: eventAttendance.reduce((sum, e) => sum + e.attendees, 0),
      committeeStats,
      eventAttendance
    };
  }

  async getComprehensiveMemberIntelligence(): Promise<any> {
    const [memberBusinessAnalysis, committeeEngagement, eventAnalysis] = await Promise.all([
      this.getMemberBusinessAnalysis(),
      this.getCommitteeEngagementAnalysis(),
      this.getEventAttendanceAnalysis()
    ]);

    return {
      summary: {
        totalMembers: memberBusinessAnalysis.totalMembers,
        membersWithBusinesses: memberBusinessAnalysis.membersWithBusinesses,
        totalCommittees: committeeEngagement.totalCommittees,
        totalEvents: eventAnalysis.totalEvents,
        totalEventAttendance: eventAnalysis.totalAttendees,
        totalEventRevenue: eventAnalysis.totalRevenue
      },
      memberBusinessAnalysis,
      committeeEngagement,
      eventAnalysis,
      insights: {
        memberBusinessPercentage: (memberBusinessAnalysis.membersWithBusinesses / memberBusinessAnalysis.totalMembers * 100).toFixed(1),
        averageEventAttendance: eventAnalysis.averageAttendance.toFixed(1),
        topBusinessCategories: memberBusinessAnalysis.topIndustries.slice(0, 5),
        mostActiveEventTypes: Object.entries(eventAnalysis.eventsByType)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
      }
    };
  }
}

// Initialize API instance
const atlasAPI = new AtlasAPI();

// Create MCP server
const server = new Server(
  {
    name: 'atlas-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_members',
        description: 'Get all member profiles from Atlas MemberClicks',
        inputSchema: {
          type: 'object',
          properties: {
            restrictToMember: {
              type: 'boolean',
              description: 'Whether to restrict results to actual members only',
              default: true,
            },
          },
        },
      },
      {
        name: 'get_member_by_id',
        description: 'Get a specific member by their ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID to retrieve',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_member_profile',
        description: 'Update a member profile with new information',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID to update',
            },
            profileData: {
              type: 'object',
              description: 'The profile data to update',
            },
          },
          required: ['id', 'profileData'],
        },
      },
      {
        name: 'suspend_member',
        description: 'Suspend a member account',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID to suspend',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'add_member',
        description: 'Add a new member to Atlas MemberClicks',
        inputSchema: {
          type: 'object',
          properties: {
            memberData: {
              type: 'object',
              description: 'The member data for the new member',
              properties: {
                FirstName: { type: 'string' },
                LastName: { type: 'string' },
                Email: { type: 'string' },
                Phone: { type: 'string' },
                Company: { type: 'string' },
                Title: { type: 'string' },
              },
              required: ['FirstName', 'LastName', 'Email'],
            },
          },
          required: ['memberData'],
        },
      },
      {
        name: 'get_committees',
        description: 'Get all committees',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: {
              type: 'number',
              description: 'Number of committees to retrieve per page',
              default: 20,
            },
          },
        },
      },
      {
        name: 'get_committee_members',
        description: 'Get all committee members or members for a specific committee',
        inputSchema: {
          type: 'object',
          properties: {
            committeeId: {
              type: 'string',
              description: 'Optional committee ID to filter members by specific committee',
            },
          },
        },
      },
      {
        name: 'get_committee_with_members',
        description: 'Get a committee and all its members in one call',
        inputSchema: {
          type: 'object',
          properties: {
            committeeId: {
              type: 'string',
              description: 'The committee ID to retrieve with members',
            },
          },
          required: ['committeeId'],
        },
      },
      {
        name: 'get_events',
        description: 'Get all events',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: {
              type: 'number',
              description: 'Number of events to retrieve per page',
              default: 100,
            },
            upcomingOnly: {
              type: 'boolean',
              description: 'Whether to return only upcoming events',
              default: false,
            },
          },
        },
      },
      {
        name: 'get_new_members',
        description: 'Get members who joined recently',
        inputSchema: {
          type: 'object',
          properties: {
            daysBack: {
              type: 'number',
              description: 'Number of days back to check for new members',
              default: 7,
            },
          },
        },
      },
      {
        name: 'check_member_notifications',
        description: 'Check for new members to trigger notifications',
        inputSchema: {
          type: 'object',
          properties: {
            daysBack: {
              type: 'number',
              description: 'Number of days back to check for new members',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_business_listings',
        description: 'Get business listings from Atlas directory',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: {
              type: 'number',
              description: 'Number of listings to retrieve',
              default: 200,
            },
            active: {
              type: 'boolean',
              description: 'Whether to get only active listings',
              default: true,
            },
          },
        },
      },
      {
        name: 'get_listing_categories',
        description: 'Get business listing categories',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: {
              type: 'number',
              description: 'Number of categories to retrieve',
              default: 200,
            },
            pageNumber: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_listing_types',
        description: 'Get business listing types',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: {
              type: 'number',
              description: 'Number of listing types to retrieve',
              default: 200,
            },
          },
        },
      },
      {
        name: 'get_contacts',
        description: 'Get contact information',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: {
              type: 'number',
              description: 'Number of contacts to retrieve',
              default: 200,
            },
          },
        },
      },
      {
        name: 'get_events_with_attendance',
        description: 'Get events with enhanced attendance data (Events-v4 endpoint)',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: {
              type: 'number',
              description: 'Number of events to retrieve',
              default: 100,
            },
          },
        },
      },
      {
        name: 'get_committee_events',
        description: 'Get only committee meeting events',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_active_committee_members',
        description: 'Get active committee members, optionally filtered by committee IDs',
        inputSchema: {
          type: 'object',
          properties: {
            committeeIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional array of committee IDs to filter by',
            },
          },
        },
      },
      {
        name: 'get_committee_by_id',
        description: 'Get detailed information about a specific committee',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Committee ID to retrieve',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_event_attendance_analysis',
        description: 'Get comprehensive analysis of event attendance and engagement',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_member_business_analysis',
        description: 'Analyze member-to-business relationships and industry distribution',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_committee_engagement_analysis',
        description: 'Analyze committee membership and engagement patterns',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_comprehensive_member_intelligence',
        description: 'Get complete member intelligence combining business data, committee engagement, and event analytics - perfect for demo queries',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_members': {
        const restrictToMember = args && typeof args === 'object' && 'restrictToMember' in args 
          ? Boolean(args.restrictToMember) 
          : true;
        const members = await atlasAPI.getMembers(restrictToMember);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(members, null, 2),
            },
          ],
        };
      }

      case 'get_member_by_id': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Member ID is required');
        }
        const member = await atlasAPI.getMemberById(args.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(member, null, 2),
            },
          ],
        };
      }

      case 'update_member_profile': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Member ID is required');
        }
        if (!('profileData' in args) || typeof args.profileData !== 'object') {
          throw new Error('Profile data is required');
        }
        const updatedMember = await atlasAPI.updateMemberProfile(args.id, args.profileData as Partial<Member>);
        return {
          content: [
            {
              type: 'text',
              text: `Member profile updated successfully: ${JSON.stringify(updatedMember, null, 2)}`,
            },
          ],
        };
      }

      case 'suspend_member': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Member ID is required');
        }
        const result = await atlasAPI.suspendMember(args.id);
        return {
          content: [
            {
              type: 'text',
              text: `Member suspended successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'add_member': {
        if (!args || typeof args !== 'object' || !('memberData' in args) || typeof args.memberData !== 'object') {
          throw new Error('Member data is required');
        }
        const newMember = await atlasAPI.addMember(args.memberData as Partial<Member>);
        return {
          content: [
            {
              type: 'text',
              text: `New member added successfully: ${JSON.stringify(newMember, null, 2)}`,
            },
          ],
        };
      }

      case 'get_committees': {
        const pageSize = args && typeof args === 'object' && 'pageSize' in args && typeof args.pageSize === 'number' 
          ? args.pageSize 
          : 20;
        const committees = await atlasAPI.getCommittees(pageSize);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(committees, null, 2),
            },
          ],
        };
      }

      case 'get_committee_members': {
        const committeeId = args && typeof args === 'object' && 'committeeId' in args && typeof args.committeeId === 'string'
          ? args.committeeId
          : undefined;
        const members = committeeId
          ? await atlasAPI.getCommitteeMembersByCommitteeId(committeeId)
          : await atlasAPI.getCommitteeMembers();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(members, null, 2),
            },
          ],
        };
      }

      case 'get_committee_with_members': {
        if (!args || typeof args !== 'object' || !('committeeId' in args) || typeof args.committeeId !== 'string') {
          throw new Error('Committee ID is required');
        }
        const result = await atlasAPI.getCommitteeWithMembers(args.committeeId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_events': {
        const pageSize = args && typeof args === 'object' && 'pageSize' in args && typeof args.pageSize === 'number' 
          ? args.pageSize 
          : 100;
        const upcomingOnly = args && typeof args === 'object' && 'upcomingOnly' in args 
          ? Boolean(args.upcomingOnly) 
          : false;
        const events = upcomingOnly
          ? await atlasAPI.getUpcomingEvents()
          : await atlasAPI.getEvents(pageSize);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2),
            },
          ],
        };
      }

      case 'get_new_members': {
        const daysBack = args && typeof args === 'object' && 'daysBack' in args && typeof args.daysBack === 'number' 
          ? args.daysBack 
          : 7;
        const newMembers = await atlasAPI.getNewMembers(daysBack);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(newMembers, null, 2),
            },
          ],
        };
      }

      case 'check_member_notifications': {
        const daysBack = args && typeof args === 'object' && 'daysBack' in args && typeof args.daysBack === 'number' 
          ? args.daysBack 
          : 1;
        const newMembers = await atlasAPI.getNewMembers(daysBack);
        const notificationMessage = newMembers.length > 0
          ? `Found ${newMembers.length} new member(s) in the last ${daysBack} day(s). Ready to trigger workflows for profile enrichment, social media posting, and email notifications.`
          : `No new members found in the last ${daysBack} day(s).`;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                message: notificationMessage,
                newMembersCount: newMembers.length,
                newMembers: newMembers,
                suggestedActions: newMembers.length > 0 ? [
                  'Enrich profiles with Clay',
                  'Store data in Airtable',
                  'Create social media posts',
                  'Draft CEO welcome email',
                  'Send review request'
                ] : []
              }, null, 2),
            },
          ],
        };
      }

      case 'get_business_listings': {
        const pageSize = args && typeof args === 'object' && 'pageSize' in args && typeof args.pageSize === 'number' 
          ? args.pageSize : 200;
        const active = args && typeof args === 'object' && 'active' in args 
          ? Boolean(args.active) : true;
        const listings = await atlasAPI.getBusinessListings(pageSize, active);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(listings, null, 2),
            },
          ],
        };
      }

      case 'get_listing_categories': {
        const pageSize = args && typeof args === 'object' && 'pageSize' in args && typeof args.pageSize === 'number' 
          ? args.pageSize : 200;
        const pageNumber = args && typeof args === 'object' && 'pageNumber' in args && typeof args.pageNumber === 'number' 
          ? args.pageNumber : 1;
        const categories = await atlasAPI.getListingCategories(pageSize, pageNumber);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(categories, null, 2),
            },
          ],
        };
      }

      case 'get_listing_types': {
        const pageSize = args && typeof args === 'object' && 'pageSize' in args && typeof args.pageSize === 'number' 
          ? args.pageSize : 200;
        const types = await atlasAPI.getListingTypes(pageSize);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(types, null, 2),
            },
          ],
        };
      }

      case 'get_contacts': {
        const pageSize = args && typeof args === 'object' && 'pageSize' in args && typeof args.pageSize === 'number' 
          ? args.pageSize : 200;
        const contacts = await atlasAPI.getContacts(pageSize);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contacts, null, 2),
            },
          ],
        };
      }

      case 'get_events_with_attendance': {
        const pageSize = args && typeof args === 'object' && 'pageSize' in args && typeof args.pageSize === 'number' 
          ? args.pageSize : 100;
        const events = await atlasAPI.getEventsV4(pageSize);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2),
            },
          ],
        };
      }

      case 'get_committee_events': {
        const events = await atlasAPI.getCommitteeEvents();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2),
            },
          ],
        };
      }

      case 'get_active_committee_members': {
        const committeeIds = args && typeof args === 'object' && 'committeeIds' in args && Array.isArray(args.committeeIds)
          ? args.committeeIds as string[]
          : undefined;
        const members = await atlasAPI.getActiveCommitteeMembers(committeeIds);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(members, null, 2),
            },
          ],
        };
      }

      case 'get_committee_by_id': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Committee ID is required');
        }
        const committee = await atlasAPI.getCommitteeById(args.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(committee, null, 2),
            },
          ],
        };
      }

      case 'get_event_attendance_analysis': {
        const analysis = await atlasAPI.getEventAttendanceAnalysis();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      }

      case 'get_member_business_analysis': {
        const analysis = await atlasAPI.getMemberBusinessAnalysis();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      }

      case 'get_committee_engagement_analysis': {
        const analysis = await atlasAPI.getCommitteeEngagementAnalysis();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      }

      case 'get_comprehensive_member_intelligence': {
        const intelligence = await atlasAPI.getComprehensiveMemberIntelligence();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(intelligence, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing ${name}: ${errorMessage}`
    );
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Atlas MemberClicks MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
