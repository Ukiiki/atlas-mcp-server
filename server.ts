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
  Id: string;
  Name: string;
  Description?: string;
  StartDate: string;
  EndDate: string;
  Location?: string;
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
    return this.makeRequest(`/Events/?PageSize=${pageSize}`);
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const events = await this.getEvents();
    const now = new Date();
    return events.filter(event => new Date(event.StartDate) > now);
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
