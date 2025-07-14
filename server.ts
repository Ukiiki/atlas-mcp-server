#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

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

// Types for API responses - REAL ATLAS TYPES ONLY
interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface Profile {
  ProfileId: number;
  OrgInd: boolean;
  Member: boolean;
  Prospect: boolean;
  Email: string;
  ReportName: string;
  OrgName: string;
  Prefix: string;
  FirstName: string;
  LastName: string;
  Title: string;
  WorkPhone: string;
  HomePhone: string;
  CellPhone: string;
  PhoneDefault: string;
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  Zip: string;
  MainRelatedProfileName?: string;
  MainRelatedProfileId: number;
  ProfileTypeId: number;
  Website: string;
  DateChanged: string;
  County: string;
  Country: string;
  MemberTypeIconColor: string;
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

interface Registration {
  RegistrationId: string;
  EventId: string;
  ProfileId: string;
  RegistrationDate: string;
  Status: string;
  AttendeeCount: number;
  [key: string]: any;
}

interface Invoice {
  InvoiceNum: string;
  ProfileId: string;
  InvoiceDate: string;
  DueDate: string;
  Amount: number;
  Status: string;
  [key: string]: any;
}

interface Payment {
  PaymentId: string;
  InvoiceNum: string;
  Amount: number;
  PaymentDate: string;
  PaymentType: string;
  [key: string]: any;
}

interface CustomField {
  CustomFieldId: string;
  ProfileId: string;
  FieldName: string;
  FieldValue: string;
  FieldType: string;
  [key: string]: any;
}

interface MemberActivity {
  ActivityId: string;
  ProfileId: string;
  ActivityType: string;
  Description: string;
  ActivityDate: string;
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

interface Image {
  ImageId: string;
  FileName: string;
  Description?: string;
  Url: string;
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

  // ===== PROFILE MANAGEMENT =====
  async getProfiles(restrictToMember: boolean = true, pageSize: number = 100): Promise<Profile[]> {
    const params = new URLSearchParams();
    if (restrictToMember) params.append('RestrictToMember', 'true');
    if (pageSize) params.append('PageSize', pageSize.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest(`/profiles${queryString}`);
  }

  async getProfileById(id: string): Promise<Profile> {
    return this.makeRequest(`/profiles/${id}`);
  }

  async createProfile(profileData: Partial<Profile>): Promise<Profile> {
    return this.makeRequest('/profiles', 'POST', profileData);
  }

  async updateProfile(id: string, profileData: Partial<Profile>): Promise<Profile> {
    return this.makeRequest(`/profiles/${id}`, 'PUT', profileData);
  }

  // ===== PROFILE CUSTOM FIELDS =====
  async getProfileCustomFields(profileId: string): Promise<CustomField[]> {
    return this.makeRequest(`/Profile/${profileId}/CustomFields`);
  }

  async createProfileCustomField(profileId: string, customFieldData: Partial<CustomField>): Promise<CustomField> {
    return this.makeRequest(`/Profile/${profileId}/CustomFields`, 'POST', customFieldData);
  }

  async updateProfileCustomField(profileId: string, customFieldId: string, customFieldData: Partial<CustomField>): Promise<CustomField> {
    return this.makeRequest(`/Profile/${profileId}/CustomFields/${customFieldId}`, 'PUT', customFieldData);
  }

  async getCustomFieldById(id: string): Promise<CustomField> {
    return this.makeRequest(`/Profile/CustomField/${id}`);
  }

  async createCustomField(customFieldData: Partial<CustomField>): Promise<CustomField> {
    return this.makeRequest('/Profile/CustomField', 'POST', customFieldData);
  }

  async updateCustomField(customFieldData: Partial<CustomField>): Promise<CustomField> {
    return this.makeRequest('/Profile/CustomField', 'PUT', customFieldData);
  }

  // ===== PROFILE MEMBER ACTIVITY =====
  async getProfileMemberActivity(profileId: string): Promise<MemberActivity[]> {
    return this.makeRequest(`/Profile/${profileId}/MemberActivity`);
  }

  async createMemberActivity(activityData: Partial<MemberActivity>): Promise<MemberActivity> {
    return this.makeRequest('/MemberActivity', 'POST', activityData);
  }

  async updateMemberActivity(activityData: Partial<MemberActivity>): Promise<MemberActivity> {
    return this.makeRequest('/MemberActivity', 'PUT', activityData);
  }

  // ===== COMMITTEE MANAGEMENT =====
  async getCommittees(pageSize: number = 20): Promise<Committee[]> {
    return this.makeRequest(`/Committees?PageSize=${pageSize}`);
  }

  async getCommitteeMembers(): Promise<CommitteeMember[]> {
    return this.makeRequest('/CommitteeMembers');
  }

  async getCommitteeMembersByCommitteeId(committeeId: string): Promise<CommitteeMember[]> {
    return this.makeRequest(`/CommitteeMembers?CommitteeId=${committeeId}`);
  }

  async getCommitteeById(id: string): Promise<Committee> {
    return this.makeRequest(`/Committee/${id}`);
  }

  // ===== EVENT MANAGEMENT =====
  async getEvents(pageSize: number = 100): Promise<Event[]> {
    return this.makeRequest(`/Events?PageSize=${pageSize}`);
  }


  // ===== EVENT REGISTRATION SYSTEM =====
  async createEventRegistration(registrationData: Partial<Registration>): Promise<Registration> {
    return this.makeRequest('/Event/Registrations', 'POST', registrationData);
  }

  async getEventRegistration(id: string): Promise<Registration> {
    return this.makeRequest(`/Event/Registration/${id}`);
  }

  async getEventRegistrationUpdateDto(id: string): Promise<any> {
    return this.makeRequest(`/Event/Registration/${id}/UpdateDto`);
  }

  async getEventRegistrationRevenueDetails(id: string): Promise<any> {
    return this.makeRequest(`/Event/Registration/${id}/RevenueDetails`);
  }

  async updateEventRegistration(id: string, registrationData: Partial<Registration>): Promise<Registration> {
    return this.makeRequest(`/Event/Registration/${id}`, 'PUT', registrationData);
  }

  async getEventRegistrations(eventId: string): Promise<Registration[]> {
    return this.makeRequest(`/Event/${eventId}/Registrations`);
  }

  async getEventRegistrationsCSV(eventId: string): Promise<string> {
    return this.makeRequest(`/Event/${eventId}/Registrations/csv`);
  }

  async getEventAttendees(eventId: string): Promise<any[]> {
    return this.makeRequest(`/Event/${eventId}/Attendees`);
  }

  async flagEventItemsAsAttended(data: any): Promise<any> {
    return this.makeRequest('/EventAttendees/FlagEventItemsAsAttendedOrNotAttended', 'POST', data);
  }

  // ===== INVOICE MANAGEMENT =====
  async getInvoice(id: string): Promise<Invoice> {
    return this.makeRequest(`/Invoice/${id}`);
  }

  async getInvoices(searchParams?: any): Promise<Invoice[]> {
    const params = searchParams ? `?${new URLSearchParams(searchParams).toString()}` : '';
    return this.makeRequest(`/Invoices${params}`);
  }

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    return this.makeRequest('/Invoices', 'POST', invoiceData);
  }

  async updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<Invoice> {
    return this.makeRequest(`/Invoice/${id}`, 'PUT', invoiceData);
  }

  async createInvoiceLineItem(lineItemData: any): Promise<any> {
    return this.makeRequest('/InvoiceLineItems', 'POST', lineItemData);
  }

  // ===== PAYMENT MANAGEMENT =====
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    return this.makeRequest('/Payments', 'POST', paymentData);
  }

  async getPayment(id: string): Promise<Payment> {
    return this.makeRequest(`/Payment/${id}`);
  }

  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    return this.makeRequest(`/Payments/${invoiceId}`);
  }

  async getPayments(searchParams?: any): Promise<Payment[]> {
    const params = searchParams ? `?${new URLSearchParams(searchParams).toString()}` : '';
    return this.makeRequest(`/Payments${params}`);
  }

  async getActivePaymentTypes(): Promise<any[]> {
    return this.makeRequest('/PaymentTypes/ActivePaymentTypes');
  }

  // ===== BUSINESS LISTINGS =====
  async getBusinessListings(pageSize: number = 200, active: boolean = true): Promise<BusinessListing[]> {
    const params = `?Active=${active}&PageSize=${pageSize}&OrderBy=DateChanged&OrderByExpression=DESC&ObjectState=0`;
    return this.makeRequest(`/Listings${params}`);
  }

  async getListingCategories(pageSize: number = 200, pageNumber: number = 1): Promise<ListingCategory[]> {
    return this.makeRequest(`/ListingCategories?PageSize=${pageSize}&OrderBy=Category&PageNumber=${pageNumber}`);
  }

  async getListingTypes(pageSize: number = 200): Promise<any[]> {
    return this.makeRequest(`/ListingTypes?PageSize=${pageSize}`);
  }

  // ===== CONTACT MANAGEMENT =====
  async getContacts(pageSize: number = 200): Promise<Contact[]> {
    return this.makeRequest(`/Contacts?PageSize=${pageSize}`);
  }

  // ===== IMAGE MANAGEMENT =====
  async getImages(searchParams?: any): Promise<Image[]> {
    const params = searchParams ? `?${new URLSearchParams(searchParams).toString()}` : '';
    return this.makeRequest(`/Images${params}`);
  }

  // ===== UTILITY METHODS =====
  async getNewMembers(daysBack: number = 7): Promise<Profile[]> {
    const response: any = await this.getProfiles();
    // Handle both direct array and wrapped object responses
    const members = Array.isArray(response) ? response : (response.data || response.profiles || []);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    return members.filter((member: any) => 
      member.DateChanged && new Date(member.DateChanged) > cutoffDate
    );
  }

  async getCommitteeWithMembers(committeeId: string): Promise<{ committee: Committee, members: CommitteeMember[] }> {
    const [committeesResponse, members] = await Promise.all([
      this.getCommittees(),
      this.getCommitteeMembersByCommitteeId(committeeId)
    ]);
    
    // Handle both direct array and wrapped object responses
    const committees = Array.isArray(committeesResponse) ? committeesResponse : ((committeesResponse as any).data || (committeesResponse as any).committees || []);
    
    const committee = committees.find((c: any) => c.Id === committeeId);
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
    name: 'atlas-mcp-complete',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools - ONLY REAL ATLAS ENDPOINTS
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ===== PROFILE MANAGEMENT =====
      {
        name: 'get_profiles',
        description: 'Get all member profiles from Atlas',
        inputSchema: {
          type: 'object',
          properties: {
            restrictToMember: {
              type: 'boolean',
              description: 'Whether to restrict results to actual members only',
              default: true,
            },
            pageSize: {
              type: 'number',
              description: 'Number of profiles to retrieve',
              default: 100,
            },
          },
        },
      },
      {
        name: 'get_profile_by_id',
        description: 'Get a specific profile by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The profile ID to retrieve',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'create_profile',
        description: 'Create a new profile',
        inputSchema: {
          type: 'object',
          properties: {
            profileData: {
              type: 'object',
              description: 'The profile data for the new profile',
              properties: {
                FirstName: { type: 'string' },
                LastName: { type: 'string' },
                Email: { type: 'string' },
                Phone: { type: 'string' },
                Company: { type: 'string' },
              },
              required: ['FirstName', 'LastName', 'Email'],
            },
          },
          required: ['profileData'],
        },
      },
      {
        name: 'update_profile',
        description: 'Update an existing profile',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The profile ID to update',
            },
            profileData: {
              type: 'object',
              description: 'The profile data to update',
            },
          },
          required: ['id', 'profileData'],
        },
      },

      // ===== PROFILE CUSTOM FIELDS =====
      {
        name: 'get_profile_custom_fields',
        description: 'Get custom fields for a profile',
        inputSchema: {
          type: 'object',
          properties: {
            profileId: {
              type: 'string',
              description: 'The profile ID',
            },
          },
          required: ['profileId'],
        },
      },
      {
        name: 'create_profile_custom_field',
        description: 'Add a custom field to a profile',
        inputSchema: {
          type: 'object',
          properties: {
            profileId: {
              type: 'string',
              description: 'The profile ID',
            },
            customFieldData: {
              type: 'object',
              description: 'Custom field data',
            },
          },
          required: ['profileId', 'customFieldData'],
        },
      },
      {
        name: 'update_profile_custom_field',
        description: 'Update a profile custom field',
        inputSchema: {
          type: 'object',
          properties: {
            profileId: {
              type: 'string',
              description: 'The profile ID',
            },
            customFieldId: {
              type: 'string',
              description: 'The custom field ID',
            },
            customFieldData: {
              type: 'object',
              description: 'Updated custom field data',
            },
          },
          required: ['profileId', 'customFieldId', 'customFieldData'],
        },
      },

      // ===== PROFILE MEMBER ACTIVITY =====
      {
        name: 'get_profile_member_activity',
        description: 'Get member activity for a profile',
        inputSchema: {
          type: 'object',
          properties: {
            profileId: {
              type: 'string',
              description: 'The profile ID',
            },
          },
          required: ['profileId'],
        },
      },
      {
        name: 'create_member_activity',
        description: 'Create a new member activity record',
        inputSchema: {
          type: 'object',
          properties: {
            activityData: {
              type: 'object',
              description: 'Member activity data',
            },
          },
          required: ['activityData'],
        },
      },
      {
        name: 'update_member_activity',
        description: 'Update a member activity record',
        inputSchema: {
          type: 'object',
          properties: {
            activityData: {
              type: 'object',
              description: 'Updated member activity data',
            },
          },
          required: ['activityData'],
        },
      },

      // ===== COMMITTEE MANAGEMENT =====
      {
        name: 'get_committees',
        description: 'Get all committees',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: {
              type: 'number',
              description: 'Number of committees to retrieve',
              default: 20,
            },
          },
        },
      },
      {
        name: 'get_committee_members',
        description: 'Get all committee members',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_committee_members_by_committee',
        description: 'Get committee members for a specific committee',
        inputSchema: {
          type: 'object',
          properties: {
            committeeId: {
              type: 'string',
              description: 'The committee ID',
            },
          },
          required: ['committeeId'],
        },
      },
      {
        name: 'get_committee_by_id',
        description: 'Get a specific committee by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The committee ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_committee_with_members',
        description: 'Get a committee and all its members',
        inputSchema: {
          type: 'object',
          properties: {
            committeeId: {
              type: 'string',
              description: 'The committee ID',
            },
          },
          required: ['committeeId'],
        },
      },

      // ===== EVENT MANAGEMENT =====
      {
        name: 'get_events',
        description: 'Get all events',
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

      // ===== EVENT REGISTRATION SYSTEM =====
      {
        name: 'create_event_registration',
        description: 'Create a new event registration',
        inputSchema: {
          type: 'object',
          properties: {
            registrationData: {
              type: 'object',
              description: 'Event registration data',
            },
          },
          required: ['registrationData'],
        },
      },
      {
        name: 'get_event_registration',
        description: 'Get a specific event registration',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The registration ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_event_registrations',
        description: 'Get all registrations for an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'The event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'get_event_attendees',
        description: 'Get attendees for an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'The event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'update_event_registration',
        description: 'Update an event registration',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The registration ID',
            },
            registrationData: {
              type: 'object',
              description: 'Updated registration data',
            },
          },
          required: ['id', 'registrationData'],
        },
      },

      // ===== INVOICE MANAGEMENT =====
      {
        name: 'get_invoice',
        description: 'Get a specific invoice',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The invoice ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_invoices',
        description: 'Search for invoices',
        inputSchema: {
          type: 'object',
          properties: {
            searchParams: {
              type: 'object',
              description: 'Search parameters for invoice filtering',
            },
          },
        },
      },
      {
        name: 'create_invoice',
        description: 'Create a new invoice',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceData: {
              type: 'object',
              description: 'Invoice data',
            },
          },
          required: ['invoiceData'],
        },
      },
      {
        name: 'update_invoice',
        description: 'Update an existing invoice',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The invoice ID',
            },
            invoiceData: {
              type: 'object',
              description: 'Updated invoice data',
            },
          },
          required: ['id', 'invoiceData'],
        },
      },

      // ===== PAYMENT MANAGEMENT =====
      {
        name: 'create_payment',
        description: 'Create a new payment',
        inputSchema: {
          type: 'object',
          properties: {
            paymentData: {
              type: 'object',
              description: 'Payment data',
            },
          },
          required: ['paymentData'],
        },
      },
      {
        name: 'get_payment',
        description: 'Get a specific payment',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The payment ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_payments',
        description: 'Search for payments',
        inputSchema: {
          type: 'object',
          properties: {
            searchParams: {
              type: 'object',
              description: 'Search parameters for payment filtering',
            },
          },
        },
      },
      {
        name: 'get_invoice_payments',
        description: 'Get payments for a specific invoice',
        inputSchema: {
          type: 'object',
          properties: {
            invoiceId: {
              type: 'string',
              description: 'The invoice ID',
            },
          },
          required: ['invoiceId'],
        },
      },
      {
        name: 'get_active_payment_types',
        description: 'Get all active payment types',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },

      // ===== BUSINESS LISTINGS =====
      {
        name: 'get_business_listings',
        description: 'Get business listings',
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

      // ===== CONTACT MANAGEMENT =====
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

      // ===== IMAGE MANAGEMENT =====
      {
        name: 'get_images',
        description: 'Search for images',
        inputSchema: {
          type: 'object',
          properties: {
            searchParams: {
              type: 'object',
              description: 'Search parameters for image filtering',
            },
          },
        },
      },

      // ===== UTILITY TOOLS =====
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
    ],
  };
});

// Handle tool calls - ONLY REAL ATLAS ENDPOINTS
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // ===== PROFILE MANAGEMENT =====
      case 'get_profiles': {
        const restrictToMember = args && typeof args === 'object' && 'restrictToMember' in args 
          ? Boolean(args.restrictToMember) 
          : true;
        const pageSize = args && typeof args === 'object' && 'pageSize' in args && typeof args.pageSize === 'number' 
          ? args.pageSize 
          : 100;
        const profiles = await atlasAPI.getProfiles(restrictToMember, pageSize);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(profiles, null, 2),
            },
          ],
        };
      }

      case 'get_profile_by_id': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Profile ID is required');
        }
        const profile = await atlasAPI.getProfileById(args.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(profile, null, 2),
            },
          ],
        };
      }

      case 'create_profile': {
        if (!args || typeof args !== 'object' || !('profileData' in args) || typeof args.profileData !== 'object') {
          throw new Error('Profile data is required');
        }
        const newProfile = await atlasAPI.createProfile(args.profileData as Partial<Profile>);
        return {
          content: [
            {
              type: 'text',
              text: `Profile created successfully: ${JSON.stringify(newProfile, null, 2)}`,
            },
          ],
        };
      }

      case 'update_profile': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Profile ID is required');
        }
        if (!('profileData' in args) || typeof args.profileData !== 'object') {
          throw new Error('Profile data is required');
        }
        const updatedProfile = await atlasAPI.updateProfile(args.id, args.profileData as Partial<Profile>);
        return {
          content: [
            {
              type: 'text',
              text: `Profile updated successfully: ${JSON.stringify(updatedProfile, null, 2)}`,
            },
          ],
        };
      }

      // ===== PROFILE CUSTOM FIELDS =====
      case 'get_profile_custom_fields': {
        if (!args || typeof args !== 'object' || !('profileId' in args) || typeof args.profileId !== 'string') {
          throw new Error('Profile ID is required');
        }
        const customFields = await atlasAPI.getProfileCustomFields(args.profileId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customFields, null, 2),
            },
          ],
        };
      }

      case 'create_profile_custom_field': {
        if (!args || typeof args !== 'object' || !('profileId' in args) || typeof args.profileId !== 'string') {
          throw new Error('Profile ID is required');
        }
        if (!('customFieldData' in args) || typeof args.customFieldData !== 'object') {
          throw new Error('Custom field data is required');
        }
        const customField = await atlasAPI.createProfileCustomField(args.profileId, args.customFieldData as Partial<CustomField>);
        return {
          content: [
            {
              type: 'text',
              text: `Custom field created successfully: ${JSON.stringify(customField, null, 2)}`,
            },
          ],
        };
      }

      case 'update_profile_custom_field': {
        if (!args || typeof args !== 'object' || !('profileId' in args) || typeof args.profileId !== 'string') {
          throw new Error('Profile ID is required');
        }
        if (!('customFieldId' in args) || typeof args.customFieldId !== 'string') {
          throw new Error('Custom field ID is required');
        }
        if (!('customFieldData' in args) || typeof args.customFieldData !== 'object') {
          throw new Error('Custom field data is required');
        }
        const customField = await atlasAPI.updateProfileCustomField(args.profileId, args.customFieldId, args.customFieldData as Partial<CustomField>);
        return {
          content: [
            {
              type: 'text',
              text: `Custom field updated successfully: ${JSON.stringify(customField, null, 2)}`,
            },
          ],
        };
      }

      // ===== PROFILE MEMBER ACTIVITY =====
      case 'get_profile_member_activity': {
        if (!args || typeof args !== 'object' || !('profileId' in args) || typeof args.profileId !== 'string') {
          throw new Error('Profile ID is required');
        }
        const activity = await atlasAPI.getProfileMemberActivity(args.profileId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(activity, null, 2),
            },
          ],
        };
      }

      case 'create_member_activity': {
        if (!args || typeof args !== 'object' || !('activityData' in args) || typeof args.activityData !== 'object') {
          throw new Error('Activity data is required');
        }
        const activity = await atlasAPI.createMemberActivity(args.activityData as Partial<MemberActivity>);
        return {
          content: [
            {
              type: 'text',
              text: `Member activity created successfully: ${JSON.stringify(activity, null, 2)}`,
            },
          ],
        };
      }

      case 'update_member_activity': {
        if (!args || typeof args !== 'object' || !('activityData' in args) || typeof args.activityData !== 'object') {
          throw new Error('Activity data is required');
        }
        const activity = await atlasAPI.updateMemberActivity(args.activityData as Partial<MemberActivity>);
        return {
          content: [
            {
              type: 'text',
              text: `Member activity updated successfully: ${JSON.stringify(activity, null, 2)}`,
            },
          ],
        };
      }

      // ===== COMMITTEE MANAGEMENT =====
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
        const members = await atlasAPI.getCommitteeMembers();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(members, null, 2),
            },
          ],
        };
      }

      case 'get_committee_members_by_committee': {
        if (!args || typeof args !== 'object' || !('committeeId' in args) || typeof args.committeeId !== 'string') {
          throw new Error('Committee ID is required');
        }
        const members = await atlasAPI.getCommitteeMembersByCommitteeId(args.committeeId);
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

      // ===== EVENT MANAGEMENT =====
      case 'get_events': {
        const pageSize = args && typeof args === 'object' && 'pageSize' in args && typeof args.pageSize === 'number' 
          ? args.pageSize 
          : 100;
        const events = await atlasAPI.getEvents(pageSize);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2),
            },
          ],
        };
      }


      // ===== EVENT REGISTRATION SYSTEM =====
      case 'create_event_registration': {
        if (!args || typeof args !== 'object' || !('registrationData' in args) || typeof args.registrationData !== 'object') {
          throw new Error('Registration data is required');
        }
        const registration = await atlasAPI.createEventRegistration(args.registrationData as Partial<Registration>);
        return {
          content: [
            {
              type: 'text',
              text: `Event registration created successfully: ${JSON.stringify(registration, null, 2)}`,
            },
          ],
        };
      }

      case 'get_event_registration': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Registration ID is required');
        }
        const registration = await atlasAPI.getEventRegistration(args.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(registration, null, 2),
            },
          ],
        };
      }

      case 'get_event_registrations': {
        if (!args || typeof args !== 'object' || !('eventId' in args) || typeof args.eventId !== 'string') {
          throw new Error('Event ID is required');
        }
        const registrations = await atlasAPI.getEventRegistrations(args.eventId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(registrations, null, 2),
            },
          ],
        };
      }

      case 'get_event_attendees': {
        if (!args || typeof args !== 'object' || !('eventId' in args) || typeof args.eventId !== 'string') {
          throw new Error('Event ID is required');
        }
        const attendees = await atlasAPI.getEventAttendees(args.eventId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(attendees, null, 2),
            },
          ],
        };
      }

      case 'update_event_registration': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Registration ID is required');
        }
        if (!('registrationData' in args) || typeof args.registrationData !== 'object') {
          throw new Error('Registration data is required');
        }
        const registration = await atlasAPI.updateEventRegistration(args.id, args.registrationData as Partial<Registration>);
        return {
          content: [
            {
              type: 'text',
              text: `Event registration updated successfully: ${JSON.stringify(registration, null, 2)}`,
            },
          ],
        };
      }

      // ===== INVOICE MANAGEMENT =====
      case 'get_invoice': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Invoice ID is required');
        }
        const invoice = await atlasAPI.getInvoice(args.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(invoice, null, 2),
            },
          ],
        };
      }

      case 'get_invoices': {
        const searchParams = args && typeof args === 'object' && 'searchParams' in args && typeof args.searchParams === 'object' 
          ? args.searchParams 
          : undefined;
        const invoices = await atlasAPI.getInvoices(searchParams);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(invoices, null, 2),
            },
          ],
        };
      }

      case 'create_invoice': {
        if (!args || typeof args !== 'object' || !('invoiceData' in args) || typeof args.invoiceData !== 'object') {
          throw new Error('Invoice data is required');
        }
        const invoice = await atlasAPI.createInvoice(args.invoiceData as Partial<Invoice>);
        return {
          content: [
            {
              type: 'text',
              text: `Invoice created successfully: ${JSON.stringify(invoice, null, 2)}`,
            },
          ],
        };
      }

      case 'update_invoice': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Invoice ID is required');
        }
        if (!('invoiceData' in args) || typeof args.invoiceData !== 'object') {
          throw new Error('Invoice data is required');
        }
        const invoice = await atlasAPI.updateInvoice(args.id, args.invoiceData as Partial<Invoice>);
        return {
          content: [
            {
              type: 'text',
              text: `Invoice updated successfully: ${JSON.stringify(invoice, null, 2)}`,
            },
          ],
        };
      }

      // ===== PAYMENT MANAGEMENT =====
      case 'create_payment': {
        if (!args || typeof args !== 'object' || !('paymentData' in args) || typeof args.paymentData !== 'object') {
          throw new Error('Payment data is required');
        }
        const payment = await atlasAPI.createPayment(args.paymentData as Partial<Payment>);
        return {
          content: [
            {
              type: 'text',
              text: `Payment created successfully: ${JSON.stringify(payment, null, 2)}`,
            },
          ],
        };
      }

      case 'get_payment': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Payment ID is required');
        }
        const payment = await atlasAPI.getPayment(args.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payment, null, 2),
            },
          ],
        };
      }

      case 'get_payments': {
        const searchParams = args && typeof args === 'object' && 'searchParams' in args && typeof args.searchParams === 'object' 
          ? args.searchParams 
          : undefined;
        const payments = await atlasAPI.getPayments(searchParams);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payments, null, 2),
            },
          ],
        };
      }

      case 'get_invoice_payments': {
        if (!args || typeof args !== 'object' || !('invoiceId' in args) || typeof args.invoiceId !== 'string') {
          throw new Error('Invoice ID is required');
        }
        const payments = await atlasAPI.getInvoicePayments(args.invoiceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payments, null, 2),
            },
          ],
        };
      }

      case 'get_active_payment_types': {
        const paymentTypes = await atlasAPI.getActivePaymentTypes();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(paymentTypes, null, 2),
            },
          ],
        };
      }

      // ===== BUSINESS LISTINGS =====
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

      // ===== CONTACT MANAGEMENT =====
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

      // ===== IMAGE MANAGEMENT =====
      case 'get_images': {
        const searchParams = args && typeof args === 'object' && 'searchParams' in args && typeof args.searchParams === 'object' 
          ? args.searchParams 
          : undefined;
        const images = await atlasAPI.getImages(searchParams);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(images, null, 2),
            },
          ],
        };
      }

      // ===== UTILITY TOOLS =====
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
  console.error('Atlas MCP Complete Server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
