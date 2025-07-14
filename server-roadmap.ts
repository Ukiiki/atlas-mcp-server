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
// Remove dotenv import since we're getting env vars from Claude config
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Load environment variables from .env file
// dotenv.config({ path: path.join(__dirname, '..', '.env') });

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

interface SocialMedia {
  Id: string;
  ProfileId: string;
  SocialMediaType: string;
  URL: string;
  [key: string]: any;
}

interface ProfileDocument {
  Id: string;
  ProfileId: string;
  DocumentName: string;
  DocumentType: string;
  DocumentUrl: string;
  UploadDate: string;
  [key: string]: any;
}

interface CustomField {
  Id: string;
  FieldName: string;
  FieldValue: string;
  ProfileId: string;
  [key: string]: any;
}

interface EmailMessage {
  Id: string;
  Subject: string;
  Body: string;
  ToEmail: string;
  FromEmail: string;
  SentDate: string;
  Status: string;
  [key: string]: any;
}

interface SMSMessage {
  Id: string;
  Message: string;
  ToPhone: string;
  FromPhone: string;
  SentDate: string;
  Status: string;
  [key: string]: any;
}

interface CommunicationTemplate {
  Id: string;
  Name: string;
  Type: string;
  Subject?: string;
  Body: string;
  IsActive: boolean;
  [key: string]: any;
}

interface PortalMessage {
  Id: string;
  Subject: string;
  Message: string;
  ToMemberId: string;
  FromUserId: string;
  SentDate: string;
  ReadDate?: string;
  IsRead: boolean;
  [key: string]: any;
}

interface CommunicationHistory {
  Id: string;
  MemberId: string;
  Type: string;
  Subject: string;
  Message: string;
  SentDate: string;
  Status: string;
  [key: string]: any;
}

interface ConversationFlow {
  Id: string;
  Name: string;
  Type: string;
  Purpose: string;
  AgentPersonality: string;
  IsActive: boolean;
  Prompts: ConversationPrompt[];
  CreatedDate: string;
  [key: string]: any;
}

interface ConversationPrompt {
  Id: string;
  Step: number;
  Message: string;
  ExpectedDataType: string;
  ValidationRules?: any;
  FollowUpRules?: any;
  [key: string]: any;
}

interface ConversationSession {
  Id: string;
  FlowId: string;
  ProfileId: string;
  StartDate: string;
  Status: string;
  CurrentStep: number;
  Context: any;
  Messages: ConversationMessage[];
  ExtractedData: any;
  [key: string]: any;
}

interface ConversationMessage {
  Id: string;
  SessionId: string;
  Sender: string;
  Message: string;
  Timestamp: string;
  MessageType: string;
  [key: string]: any;
}

interface AIAgent {
  Id: string;
  Name: string;
  Personality: string;
  Purpose: string;
  SystemPrompt: string;
  Tone: string;
  Capabilities: string[];
  [key: string]: any;
}

interface ConversationOutcome {
  Id: string;
  SessionId: string;
  OutcomeType: string;
  ExtractedData: any;
  Status: string;
  CreatedDate: string;
  ProcessedDate?: string;
  [key: string]: any;
}

interface EventRegistration {
  Id: string;
  EventId: string;
  ProfileId: string;
  RegistrationDate: string;
  Status: string;
  AttendeeCount: number;
  SourceType: string;
  ConversationSessionId?: string;
  [key: string]: any;
}

interface CommitteeSignup {
  Id: string;
  CommitteeId: string;
  ProfileId: string;
  SignupDate: string;
  Status: string;
  Position?: string;
  SourceType: string;
  ConversationSessionId?: string;
  [key: string]: any;
}

interface EventWaitlist {
  Id: string;
  EventId: string;
  ProfileId: string;
  WaitlistDate: string;
  Position: number;
  Status: string;
  NotificationSent: boolean;
  [key: string]: any;
}

interface EventFeedback {
  Id: string;
  EventId: string;
  ProfileId: string;
  Rating: number;
  Comments?: string;
  FeedbackDate: string;
  IsAnonymous: boolean;
  [key: string]: any;
}

interface EventResource {
  Id: string;
  EventId: string;
  ResourceName: string;
  ResourceType: string;
  ResourceUrl?: string;
  Description?: string;
  IsRequired: boolean;
  [key: string]: any;
}

interface EventSpeaker {
  Id: string;
  EventId: string;
  SpeakerName: string;
  SpeakerTitle?: string;
  SpeakerCompany?: string;
  SpeakerBio?: string;
  SpeakerPhoto?: string;
  ContactEmail?: string;
  [key: string]: any;
}

interface EventCapacity {
  Id: string;
  EventId: string;
  MaxAttendees: number;
  CurrentAttendees: number;
  WaitlistEnabled: boolean;
  WaitlistCount: number;
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

  async activateMember(id: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/activate`, 'POST');
  }

  async deactivateMember(id: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/deactivate`, 'POST');
  }

  async changeMembershipType(id: string, membershipTypeId: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/membershiptype`, 'PUT', { MembershipTypeId: membershipTypeId });
  }

  async getMembershipTypes(): Promise<any[]> {
    return this.makeRequest('/MembershipTypes');
  }

  async getMemberStatuses(): Promise<any[]> {
    return this.makeRequest('/MemberStatuses');
  }

  async changeMemberStatus(id: string, statusId: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/status`, 'PUT', { StatusId: statusId });
  }

  async bulkUpdateMemberStatus(memberIds: string[], statusId: string): Promise<any> {
    return this.makeRequest('/profiles/bulkstatus', 'PUT', { 
      ProfileIds: memberIds,
      StatusId: statusId 
    });
  }

  async getMemberRenewalStatus(id: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/renewal`);
  }

  async setMemberRenewalDate(id: string, renewalDate: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/renewal`, 'PUT', { RenewalDate: renewalDate });
  }

  // Enhanced Member Profile Methods
  async uploadMemberPhoto(id: string, photoData: any): Promise<any> {
    return this.makeRequest(`/profiles/${id}/photo`, 'POST', photoData);
  }

  async getMemberPhoto(id: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/photo`);
  }

  async deleteMemberPhoto(id: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/photo`, 'DELETE');
  }

  async getMemberSocialMedia(id: string): Promise<SocialMedia[]> {
    return this.makeRequest(`/profiles/${id}/socialmedia`);
  }

  async addMemberSocialMedia(id: string, socialMediaData: Partial<SocialMedia>): Promise<SocialMedia> {
    return this.makeRequest(`/profiles/${id}/socialmedia`, 'POST', socialMediaData);
  }

  async updateMemberSocialMedia(id: string, socialMediaId: string, socialMediaData: Partial<SocialMedia>): Promise<SocialMedia> {
    return this.makeRequest(`/profiles/${id}/socialmedia/${socialMediaId}`, 'PUT', socialMediaData);
  }

  async deleteMemberSocialMedia(id: string, socialMediaId: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/socialmedia/${socialMediaId}`, 'DELETE');
  }

  async getMemberDocuments(id: string): Promise<ProfileDocument[]> {
    return this.makeRequest(`/profiles/${id}/documents`);
  }

  async uploadMemberDocument(id: string, documentData: any): Promise<ProfileDocument> {
    return this.makeRequest(`/profiles/${id}/documents`, 'POST', documentData);
  }

  async deleteMemberDocument(id: string, documentId: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/documents/${documentId}`, 'DELETE');
  }

  async getMemberCustomFields(id: string): Promise<CustomField[]> {
    return this.makeRequest(`/profiles/${id}/customfields`);
  }

  async updateMemberCustomField(id: string, fieldId: string, fieldValue: string): Promise<CustomField> {
    return this.makeRequest(`/profiles/${id}/customfields/${fieldId}`, 'PUT', { FieldValue: fieldValue });
  }

  async getMemberPreferences(id: string): Promise<any> {
    return this.makeRequest(`/profiles/${id}/preferences`);
  }

  async updateMemberPreferences(id: string, preferences: any): Promise<any> {
    return this.makeRequest(`/profiles/${id}/preferences`, 'PUT', preferences);
  }

  async getMemberActivityLog(id: string): Promise<any[]> {
    return this.makeRequest(`/profiles/${id}/activity`);
  }

  async searchMembersByAdvancedCriteria(criteria: any): Promise<Member[]> {
    return this.makeRequest('/profiles/search', 'POST', criteria);
  }

  // Communication Management Methods
  async sendEmailToMember(memberId: string, subject: string, body: string, fromEmail?: string): Promise<EmailMessage> {
    return this.makeRequest('/communications/email', 'POST', {
      ToMemberId: memberId,
      Subject: subject,
      Body: body,
      FromEmail: fromEmail
    });
  }

  async sendBulkEmail(memberIds: string[], subject: string, body: string, fromEmail?: string): Promise<any> {
    return this.makeRequest('/communications/email/bulk', 'POST', {
      ToMemberIds: memberIds,
      Subject: subject,
      Body: body,
      FromEmail: fromEmail
    });
  }

  async sendSMSToMember(memberId: string, message: string, fromPhone?: string): Promise<SMSMessage> {
    return this.makeRequest('/communications/sms', 'POST', {
      ToMemberId: memberId,
      Message: message,
      FromPhone: fromPhone
    });
  }

  async sendBulkSMS(memberIds: string[], message: string, fromPhone?: string): Promise<any> {
    return this.makeRequest('/communications/sms/bulk', 'POST', {
      ToMemberIds: memberIds,
      Message: message,
      FromPhone: fromPhone
    });
  }

  async sendPortalMessage(memberId: string, subject: string, message: string, fromUserId: string): Promise<PortalMessage> {
    return this.makeRequest('/communications/portal', 'POST', {
      ToMemberId: memberId,
      Subject: subject,
      Message: message,
      FromUserId: fromUserId
    });
  }

  async getMemberCommunicationHistory(memberId: string): Promise<CommunicationHistory[]> {
    return this.makeRequest(`/communications/history/${memberId}`);
  }

  async getCommunicationTemplates(type?: string): Promise<CommunicationTemplate[]> {
    const params = type ? `?type=${type}` : '';
    return this.makeRequest(`/communications/templates${params}`);
  }

  async createCommunicationTemplate(templateData: Partial<CommunicationTemplate>): Promise<CommunicationTemplate> {
    return this.makeRequest('/communications/templates', 'POST', templateData);
  }

  async updateCommunicationTemplate(id: string, templateData: Partial<CommunicationTemplate>): Promise<CommunicationTemplate> {
    return this.makeRequest(`/communications/templates/${id}`, 'PUT', templateData);
  }

  async deleteCommunicationTemplate(id: string): Promise<any> {
    return this.makeRequest(`/communications/templates/${id}`, 'DELETE');
  }

  async getMemberPortalMessages(memberId: string): Promise<PortalMessage[]> {
    return this.makeRequest(`/communications/portal/${memberId}/messages`);
  }

  async markPortalMessageAsRead(messageId: string): Promise<any> {
    return this.makeRequest(`/communications/portal/messages/${messageId}/read`, 'PUT');
  }

  async sendEmailUsingTemplate(templateId: string, memberId: string, variables?: any): Promise<EmailMessage> {
    return this.makeRequest('/communications/email/template', 'POST', {
      TemplateId: templateId,
      ToMemberId: memberId,
      Variables: variables
    });
  }

  async sendSMSUsingTemplate(templateId: string, memberId: string, variables?: any): Promise<SMSMessage> {
    return this.makeRequest('/communications/sms/template', 'POST', {
      TemplateId: templateId,
      ToMemberId: memberId,
      Variables: variables
    });
  }

  async getCommunicationStats(): Promise<any> {
    return this.makeRequest('/communications/stats');
  }

  async getMemberNotificationPreferences(memberId: string): Promise<any> {
    return this.makeRequest(`/communications/preferences/${memberId}`);
  }

  async updateMemberNotificationPreferences(memberId: string, preferences: any): Promise<any> {
    return this.makeRequest(`/communications/preferences/${memberId}`, 'PUT', preferences);
  }

  // Conversational AI Registration System
  async getConversationFlows(type?: string): Promise<ConversationFlow[]> {
    const params = type ? `?type=${type}` : '';
    return this.makeRequest(`/conversations/flows${params}`);
  }

  async createConversationFlow(flowData: Partial<ConversationFlow>): Promise<ConversationFlow> {
    return this.makeRequest('/conversations/flows', 'POST', flowData);
  }

  async updateConversationFlow(id: string, flowData: Partial<ConversationFlow>): Promise<ConversationFlow> {
    return this.makeRequest(`/conversations/flows/${id}`, 'PUT', flowData);
  }

  async deleteConversationFlow(id: string): Promise<any> {
    return this.makeRequest(`/conversations/flows/${id}`, 'DELETE');
  }

  async startConversationSession(flowId: string, memberId: string, context?: any): Promise<ConversationSession> {
    return this.makeRequest('/conversations/sessions', 'POST', {
      FlowId: flowId,
      ProfileId: memberId,
      Context: context
    });
  }

  async getConversationSession(sessionId: string): Promise<ConversationSession> {
    return this.makeRequest(`/conversations/sessions/${sessionId}`);
  }

  async sendConversationMessage(sessionId: string, message: string, sender: string = 'member'): Promise<ConversationMessage> {
    return this.makeRequest('/conversations/messages', 'POST', {
      SessionId: sessionId,
      Message: message,
      Sender: sender
    });
  }

  async processConversationResponse(sessionId: string, userMessage: string): Promise<any> {
    return this.makeRequest('/conversations/process', 'POST', {
      SessionId: sessionId,
      UserMessage: userMessage
    });
  }

  async getAIAgents(): Promise<AIAgent[]> {
    return this.makeRequest('/conversations/agents');
  }

  async createAIAgent(agentData: Partial<AIAgent>): Promise<AIAgent> {
    return this.makeRequest('/conversations/agents', 'POST', agentData);
  }

  async updateAIAgent(id: string, agentData: Partial<AIAgent>): Promise<AIAgent> {
    return this.makeRequest(`/conversations/agents/${id}`, 'PUT', agentData);
  }

  async getMemberConversationSessions(memberId: string, status?: string): Promise<ConversationSession[]> {
    const params = status ? `?status=${status}` : '';
    return this.makeRequest(`/conversations/sessions/member/${memberId}${params}`);
  }

  async completeConversationSession(sessionId: string): Promise<ConversationOutcome> {
    return this.makeRequest(`/conversations/sessions/${sessionId}/complete`, 'POST');
  }

  async getConversationOutcomes(outcomeType?: string): Promise<ConversationOutcome[]> {
    const params = outcomeType ? `?type=${outcomeType}` : '';
    return this.makeRequest(`/conversations/outcomes${params}`);
  }

  async processConversationOutcome(outcomeId: string): Promise<any> {
    return this.makeRequest(`/conversations/outcomes/${outcomeId}/process`, 'POST');
  }

  // Enhanced Registration Methods
  async registerMemberForEventViaConversation(sessionId: string, eventId: string, registrationData: any): Promise<EventRegistration> {
    return this.makeRequest('/registrations/events/conversation', 'POST', {
      ConversationSessionId: sessionId,
      EventId: eventId,
      RegistrationData: registrationData
    });
  }

  async signupMemberForCommitteeViaConversation(sessionId: string, committeeId: string, signupData: any): Promise<CommitteeSignup> {
    return this.makeRequest('/registrations/committees/conversation', 'POST', {
      ConversationSessionId: sessionId,
      CommitteeId: committeeId,
      SignupData: signupData
    });
  }

  async getRegistrationsByConversation(sessionId: string): Promise<any[]> {
    return this.makeRequest(`/registrations/conversation/${sessionId}`);
  }

  async simulateConversation(flowId: string, testMessages: string[]): Promise<any> {
    return this.makeRequest('/conversations/simulate', 'POST', {
      FlowId: flowId,
      TestMessages: testMessages
    });
  }

  async getConversationAnalytics(): Promise<any> {
    return this.makeRequest('/conversations/analytics');
  }

  async getPopularConversationFlows(): Promise<any> {
    return this.makeRequest('/conversations/analytics/popular-flows');
  }

  async getConversationCompletionRates(): Promise<any> {
    return this.makeRequest('/conversations/analytics/completion-rates');
  }

  // Advanced Event Management Methods
  async createEvent(eventData: Partial<Event>): Promise<Event> {
    return this.makeRequest('/events', 'POST', eventData);
  }

  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    return this.makeRequest(`/events/${eventId}`, 'PUT', eventData);
  }

  async deleteEvent(eventId: string): Promise<any> {
    return this.makeRequest(`/events/${eventId}`, 'DELETE');
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return this.makeRequest(`/events/${eventId}/registrations`);
  }

  async registerMemberForEvent(eventId: string, memberId: string, registrationData: any): Promise<EventRegistration> {
    return this.makeRequest(`/events/${eventId}/register`, 'POST', {
      ProfileId: memberId,
      ...registrationData
    });
  }

  async unregisterMemberFromEvent(eventId: string, memberId: string): Promise<any> {
    return this.makeRequest(`/events/${eventId}/unregister`, 'POST', {
      ProfileId: memberId
    });
  }

  async getEventWaitlist(eventId: string): Promise<EventWaitlist[]> {
    return this.makeRequest(`/events/${eventId}/waitlist`);
  }

  async addMemberToWaitlist(eventId: string, memberId: string): Promise<EventWaitlist> {
    return this.makeRequest(`/events/${eventId}/waitlist`, 'POST', {
      ProfileId: memberId
    });
  }

  async removeMemberFromWaitlist(eventId: string, memberId: string): Promise<any> {
    return this.makeRequest(`/events/${eventId}/waitlist/${memberId}`, 'DELETE');
  }

  async processWaitlistNotifications(eventId: string, numberOfSpots: number): Promise<any> {
    return this.makeRequest(`/events/${eventId}/waitlist/notify`, 'POST', {
      NumberOfSpots: numberOfSpots
    });
  }

  async getEventFeedback(eventId: string): Promise<EventFeedback[]> {
    return this.makeRequest(`/events/${eventId}/feedback`);
  }

  async submitEventFeedback(eventId: string, memberId: string, feedbackData: Partial<EventFeedback>): Promise<EventFeedback> {
    return this.makeRequest(`/events/${eventId}/feedback`, 'POST', {
      ProfileId: memberId,
      ...feedbackData
    });
  }

  async getEventResources(eventId: string): Promise<EventResource[]> {
    return this.makeRequest(`/events/${eventId}/resources`);
  }

  async addEventResource(eventId: string, resourceData: Partial<EventResource>): Promise<EventResource> {
    return this.makeRequest(`/events/${eventId}/resources`, 'POST', resourceData);
  }

  async updateEventResource(eventId: string, resourceId: string, resourceData: Partial<EventResource>): Promise<EventResource> {
    return this.makeRequest(`/events/${eventId}/resources/${resourceId}`, 'PUT', resourceData);
  }

  async deleteEventResource(eventId: string, resourceId: string): Promise<any> {
    return this.makeRequest(`/events/${eventId}/resources/${resourceId}`, 'DELETE');
  }

  async getEventSpeakers(eventId: string): Promise<EventSpeaker[]> {
    return this.makeRequest(`/events/${eventId}/speakers`);
  }

  async addEventSpeaker(eventId: string, speakerData: Partial<EventSpeaker>): Promise<EventSpeaker> {
    return this.makeRequest(`/events/${eventId}/speakers`, 'POST', speakerData);
  }

  async updateEventSpeaker(eventId: string, speakerId: string, speakerData: Partial<EventSpeaker>): Promise<EventSpeaker> {
    return this.makeRequest(`/events/${eventId}/speakers/${speakerId}`, 'PUT', speakerData);
  }

  async deleteEventSpeaker(eventId: string, speakerId: string): Promise<any> {
    return this.makeRequest(`/events/${eventId}/speakers/${speakerId}`, 'DELETE');
  }

  async getEventCapacity(eventId: string): Promise<EventCapacity> {
    return this.makeRequest(`/events/${eventId}/capacity`);
  }

  async updateEventCapacity(eventId: string, capacityData: Partial<EventCapacity>): Promise<EventCapacity> {
    return this.makeRequest(`/events/${eventId}/capacity`, 'PUT', capacityData);
  }

  async sendEventReminders(eventId: string, reminderType: string): Promise<any> {
    return this.makeRequest(`/events/${eventId}/reminders`, 'POST', {
      ReminderType: reminderType
    });
  }

  async getEventAnalytics(eventId: string): Promise<any> {
    return this.makeRequest(`/events/${eventId}/analytics`);
  }

  async duplicateEvent(eventId: string, newEventData: any): Promise<Event> {
    return this.makeRequest(`/events/${eventId}/duplicate`, 'POST', newEventData);
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    return this.makeRequest(`/events/date-range?start=${startDate}&end=${endDate}`);
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    return this.makeRequest(`/events/category/${category}`);
  }

  async getEventsByLocation(location: string): Promise<Event[]> {
    return this.makeRequest(`/events/location?location=${encodeURIComponent(location)}`);
  }

  async cancelEvent(eventId: string, reason: string): Promise<any> {
    return this.makeRequest(`/events/${eventId}/cancel`, 'POST', {
      CancellationReason: reason
    });
  }

  async reactivateEvent(eventId: string): Promise<any> {
    return this.makeRequest(`/events/${eventId}/reactivate`, 'POST');
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
    name: 'carls-bad-mcp-server',
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
      {
        name: 'activate_member',
        description: 'Activate a member account',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID to activate',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'deactivate_member',
        description: 'Deactivate a member account',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID to deactivate',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'change_membership_type',
        description: 'Change a member\'s membership type',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID to update',
            },
            membershipTypeId: {
              type: 'string',
              description: 'The new membership type ID',
            },
          },
          required: ['id', 'membershipTypeId'],
        },
      },
      {
        name: 'get_membership_types',
        description: 'Get all available membership types',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_member_statuses',
        description: 'Get all available member statuses',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'change_member_status',
        description: 'Change a member\'s status',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID to update',
            },
            statusId: {
              type: 'string',
              description: 'The new status ID',
            },
          },
          required: ['id', 'statusId'],
        },
      },
      {
        name: 'bulk_update_member_status',
        description: 'Update status for multiple members at once',
        inputSchema: {
          type: 'object',
          properties: {
            memberIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of member IDs to update',
            },
            statusId: {
              type: 'string',
              description: 'The new status ID for all members',
            },
          },
          required: ['memberIds', 'statusId'],
        },
      },
      {
        name: 'get_member_renewal_status',
        description: 'Get renewal status for a specific member',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID to check renewal status',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'set_member_renewal_date',
        description: 'Set or update a member\'s renewal date',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID to update',
            },
            renewalDate: {
              type: 'string',
              description: 'The new renewal date (ISO format)',
            },
          },
          required: ['id', 'renewalDate'],
        },
      },
      {
        name: 'upload_member_photo',
        description: 'Upload a profile photo for a member',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
            photoData: {
              type: 'object',
              description: 'Photo upload data',
            },
          },
          required: ['id', 'photoData'],
        },
      },
      {
        name: 'get_member_photo',
        description: 'Get member profile photo',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_member_photo',
        description: 'Delete member profile photo',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_member_social_media',
        description: 'Get member social media profiles',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'add_member_social_media',
        description: 'Add social media profile to member',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
            socialMediaData: {
              type: 'object',
              description: 'Social media profile data',
              properties: {
                SocialMediaType: { type: 'string' },
                URL: { type: 'string' },
              },
              required: ['SocialMediaType', 'URL'],
            },
          },
          required: ['id', 'socialMediaData'],
        },
      },
      {
        name: 'update_member_social_media',
        description: 'Update member social media profile',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
            socialMediaId: {
              type: 'string',
              description: 'The social media profile ID',
            },
            socialMediaData: {
              type: 'object',
              description: 'Updated social media data',
            },
          },
          required: ['id', 'socialMediaId', 'socialMediaData'],
        },
      },
      {
        name: 'delete_member_social_media',
        description: 'Delete member social media profile',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
            socialMediaId: {
              type: 'string',
              description: 'The social media profile ID',
            },
          },
          required: ['id', 'socialMediaId'],
        },
      },
      {
        name: 'get_member_documents',
        description: 'Get member uploaded documents',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'upload_member_document',
        description: 'Upload a document for a member',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
            documentData: {
              type: 'object',
              description: 'Document upload data',
            },
          },
          required: ['id', 'documentData'],
        },
      },
      {
        name: 'delete_member_document',
        description: 'Delete member document',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
            documentId: {
              type: 'string',
              description: 'The document ID',
            },
          },
          required: ['id', 'documentId'],
        },
      },
      {
        name: 'get_member_custom_fields',
        description: 'Get member custom field values',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_member_custom_field',
        description: 'Update member custom field value',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
            fieldId: {
              type: 'string',
              description: 'The custom field ID',
            },
            fieldValue: {
              type: 'string',
              description: 'The new field value',
            },
          },
          required: ['id', 'fieldId', 'fieldValue'],
        },
      },
      {
        name: 'get_member_preferences',
        description: 'Get member preferences and settings',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_member_preferences',
        description: 'Update member preferences and settings',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
            preferences: {
              type: 'object',
              description: 'Updated preferences data',
            },
          },
          required: ['id', 'preferences'],
        },
      },
      {
        name: 'get_member_activity_log',
        description: 'Get member activity and engagement history',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The member ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'search_members_advanced',
        description: 'Advanced member search with custom criteria',
        inputSchema: {
          type: 'object',
          properties: {
            criteria: {
              type: 'object',
              description: 'Advanced search criteria',
            },
          },
          required: ['criteria'],
        },
      },
      {
        name: 'send_email_to_member',
        description: 'Send email to individual member',
        inputSchema: {
          type: 'object',
          properties: {
            memberId: {
              type: 'string',
              description: 'The member ID to send email to',
            },
            subject: {
              type: 'string',
              description: 'Email subject',
            },
            body: {
              type: 'string',
              description: 'Email body content',
            },
            fromEmail: {
              type: 'string',
              description: 'Optional sender email address',
            },
          },
          required: ['memberId', 'subject', 'body'],
        },
      },
      {
        name: 'send_bulk_email',
        description: 'Send email to multiple members',
        inputSchema: {
          type: 'object',
          properties: {
            memberIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of member IDs to send email to',
            },
            subject: {
              type: 'string',
              description: 'Email subject',
            },
            body: {
              type: 'string',
              description: 'Email body content',
            },
            fromEmail: {
              type: 'string',
              description: 'Optional sender email address',
            },
          },
          required: ['memberIds', 'subject', 'body'],
        },
      },
      {
        name: 'send_sms_to_member',
        description: 'Send SMS to individual member',
        inputSchema: {
          type: 'object',
          properties: {
            memberId: {
              type: 'string',
              description: 'The member ID to send SMS to',
            },
            message: {
              type: 'string',
              description: 'SMS message content',
            },
            fromPhone: {
              type: 'string',
              description: 'Optional sender phone number',
            },
          },
          required: ['memberId', 'message'],
        },
      },
      {
        name: 'send_bulk_sms',
        description: 'Send SMS to multiple members',
        inputSchema: {
          type: 'object',
          properties: {
            memberIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of member IDs to send SMS to',
            },
            message: {
              type: 'string',
              description: 'SMS message content',
            },
            fromPhone: {
              type: 'string',
              description: 'Optional sender phone number',
            },
          },
          required: ['memberIds', 'message'],
        },
      },
      {
        name: 'send_portal_message',
        description: 'Send message to member portal',
        inputSchema: {
          type: 'object',
          properties: {
            memberId: {
              type: 'string',
              description: 'The member ID to send message to',
            },
            subject: {
              type: 'string',
              description: 'Message subject',
            },
            message: {
              type: 'string',
              description: 'Message content',
            },
            fromUserId: {
              type: 'string',
              description: 'Sender user ID',
            },
          },
          required: ['memberId', 'subject', 'message', 'fromUserId'],
        },
      },
      {
        name: 'get_member_communication_history',
        description: 'Get communication history for a member',
        inputSchema: {
          type: 'object',
          properties: {
            memberId: {
              type: 'string',
              description: 'The member ID',
            },
          },
          required: ['memberId'],
        },
      },
      {
        name: 'get_communication_templates',
        description: 'Get all communication templates',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Optional filter by template type (email, sms, portal)',
            },
          },
        },
      },
      {
        name: 'create_communication_template',
        description: 'Create new communication template',
        inputSchema: {
          type: 'object',
          properties: {
            templateData: {
              type: 'object',
              description: 'Template data',
              properties: {
                Name: { type: 'string' },
                Type: { type: 'string' },
                Subject: { type: 'string' },
                Body: { type: 'string' },
                IsActive: { type: 'boolean' },
              },
              required: ['Name', 'Type', 'Body'],
            },
          },
          required: ['templateData'],
        },
      },
      {
        name: 'update_communication_template',
        description: 'Update existing communication template',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Template ID',
            },
            templateData: {
              type: 'object',
              description: 'Updated template data',
            },
          },
          required: ['id', 'templateData'],
        },
      },
      {
        name: 'delete_communication_template',
        description: 'Delete communication template',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Template ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_member_portal_messages',
        description: 'Get portal messages for a member',
        inputSchema: {
          type: 'object',
          properties: {
            memberId: {
              type: 'string',
              description: 'The member ID',
            },
          },
          required: ['memberId'],
        },
      },
      {
        name: 'mark_portal_message_read',
        description: 'Mark portal message as read',
        inputSchema: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'The message ID',
            },
          },
          required: ['messageId'],
        },
      },
      {
        name: 'send_email_using_template',
        description: 'Send email using template',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'Template ID',
            },
            memberId: {
              type: 'string',
              description: 'Member ID',
            },
            variables: {
              type: 'object',
              description: 'Template variables',
            },
          },
          required: ['templateId', 'memberId'],
        },
      },
      {
        name: 'send_sms_using_template',
        description: 'Send SMS using template',
        inputSchema: {
          type: 'object',
          properties: {
            templateId: {
              type: 'string',
              description: 'Template ID',
            },
            memberId: {
              type: 'string',
              description: 'Member ID',
            },
            variables: {
              type: 'object',
              description: 'Template variables',
            },
          },
          required: ['templateId', 'memberId'],
        },
      },
      {
        name: 'get_communication_stats',
        description: 'Get communication statistics and analytics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_member_notification_preferences',
        description: 'Get member notification preferences',
        inputSchema: {
          type: 'object',
          properties: {
            memberId: {
              type: 'string',
              description: 'The member ID',
            },
          },
          required: ['memberId'],
        },
      },
      {
        name: 'update_member_notification_preferences',
        description: 'Update member notification preferences',
        inputSchema: {
          type: 'object',
          properties: {
            memberId: {
              type: 'string',
              description: 'The member ID',
            },
            preferences: {
              type: 'object',
              description: 'Updated preferences',
            },
          },
          required: ['memberId', 'preferences'],
        },
      },
      {
        name: 'get_conversation_flows',
        description: 'Get all conversation flows or filter by type',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Optional filter by flow type (event, committee, onboarding, feedback)',
            },
          },
        },
      },
      {
        name: 'create_conversation_flow',
        description: 'Create a new conversation flow',
        inputSchema: {
          type: 'object',
          properties: {
            flowData: {
              type: 'object',
              description: 'Conversation flow data',
              properties: {
                Name: { type: 'string' },
                Type: { type: 'string' },
                Purpose: { type: 'string' },
                AgentPersonality: { type: 'string' },
                IsActive: { type: 'boolean' },
                Prompts: { type: 'array' },
              },
              required: ['Name', 'Type', 'Purpose', 'AgentPersonality'],
            },
          },
          required: ['flowData'],
        },
      },
      {
        name: 'update_conversation_flow',
        description: 'Update existing conversation flow',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Flow ID',
            },
            flowData: {
              type: 'object',
              description: 'Updated flow data',
            },
          },
          required: ['id', 'flowData'],
        },
      },
      {
        name: 'delete_conversation_flow',
        description: 'Delete conversation flow',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Flow ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'start_conversation_session',
        description: 'Start a new conversation session with a member',
        inputSchema: {
          type: 'object',
          properties: {
            flowId: {
              type: 'string',
              description: 'Conversation flow ID',
            },
            memberId: {
              type: 'string',
              description: 'Member ID',
            },
            context: {
              type: 'object',
              description: 'Optional conversation context (event info, etc.)',
            },
          },
          required: ['flowId', 'memberId'],
        },
      },
      {
        name: 'get_conversation_session',
        description: 'Get conversation session details',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'send_conversation_message',
        description: 'Send a message in conversation session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID',
            },
            message: {
              type: 'string',
              description: 'Message content',
            },
            sender: {
              type: 'string',
              description: 'Message sender (member, agent, admin)',
              default: 'member',
            },
          },
          required: ['sessionId', 'message'],
        },
      },
      {
        name: 'process_conversation_response',
        description: 'Process member response and generate AI reply',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID',
            },
            userMessage: {
              type: 'string',
              description: 'Member\'s message',
            },
          },
          required: ['sessionId', 'userMessage'],
        },
      },
      {
        name: 'get_ai_agents',
        description: 'Get all AI agent personalities',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_ai_agent',
        description: 'Create new AI agent personality',
        inputSchema: {
          type: 'object',
          properties: {
            agentData: {
              type: 'object',
              description: 'AI agent data',
              properties: {
                Name: { type: 'string' },
                Personality: { type: 'string' },
                Purpose: { type: 'string' },
                SystemPrompt: { type: 'string' },
                Tone: { type: 'string' },
                Capabilities: { type: 'array' },
              },
              required: ['Name', 'Personality', 'Purpose', 'SystemPrompt'],
            },
          },
          required: ['agentData'],
        },
      },
      {
        name: 'update_ai_agent',
        description: 'Update AI agent personality',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Agent ID',
            },
            agentData: {
              type: 'object',
              description: 'Updated agent data',
            },
          },
          required: ['id', 'agentData'],
        },
      },
      {
        name: 'get_member_conversation_sessions',
        description: 'Get conversation sessions for a member',
        inputSchema: {
          type: 'object',
          properties: {
            memberId: {
              type: 'string',
              description: 'Member ID',
            },
            status: {
              type: 'string',
              description: 'Optional filter by session status',
            },
          },
          required: ['memberId'],
        },
      },
      {
        name: 'complete_conversation_session',
        description: 'Complete conversation session and process outcome',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'get_conversation_outcomes',
        description: 'Get conversation outcomes for processing',
        inputSchema: {
          type: 'object',
          properties: {
            outcomeType: {
              type: 'string',
              description: 'Optional filter by outcome type',
            },
          },
        },
      },
      {
        name: 'process_conversation_outcome',
        description: 'Process conversation outcome into registration/signup',
        inputSchema: {
          type: 'object',
          properties: {
            outcomeId: {
              type: 'string',
              description: 'Outcome ID',
            },
          },
          required: ['outcomeId'],
        },
      },
      {
        name: 'register_member_via_conversation',
        description: 'Register member for event via conversation',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Conversation session ID',
            },
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            registrationData: {
              type: 'object',
              description: 'Registration data extracted from conversation',
            },
          },
          required: ['sessionId', 'eventId', 'registrationData'],
        },
      },
      {
        name: 'signup_member_for_committee_via_conversation',
        description: 'Sign up member for committee via conversation',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Conversation session ID',
            },
            committeeId: {
              type: 'string',
              description: 'Committee ID',
            },
            signupData: {
              type: 'object',
              description: 'Signup data extracted from conversation',
            },
          },
          required: ['sessionId', 'committeeId', 'signupData'],
        },
      },
      {
        name: 'get_registrations_by_conversation',
        description: 'Get all registrations created from a conversation',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Conversation session ID',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'simulate_conversation',
        description: 'Simulate conversation flow for testing',
        inputSchema: {
          type: 'object',
          properties: {
            flowId: {
              type: 'string',
              description: 'Flow ID to simulate',
            },
            testMessages: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of test messages to simulate',
            },
          },
          required: ['flowId', 'testMessages'],
        },
      },
      {
        name: 'get_conversation_analytics',
        description: 'Get conversation system analytics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_popular_conversation_flows',
        description: 'Get most popular conversation flows',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_conversation_completion_rates',
        description: 'Get conversation completion rate analytics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_event',
        description: 'Create a new event',
        inputSchema: {
          type: 'object',
          properties: {
            eventData: {
              type: 'object',
              description: 'Event data',
              properties: {
                EventName: { type: 'string' },
                Descr: { type: 'string' },
                StartDate: { type: 'string' },
                EndDate: { type: 'string' },
                Location: { type: 'string' },
                EventType: { type: 'string' },
              },
              required: ['EventName', 'StartDate', 'EndDate'],
            },
          },
          required: ['eventData'],
        },
      },
      {
        name: 'update_event',
        description: 'Update existing event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            eventData: {
              type: 'object',
              description: 'Updated event data',
            },
          },
          required: ['eventId', 'eventData'],
        },
      },
      {
        name: 'delete_event',
        description: 'Delete an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
          },
          required: ['eventId'],
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
              description: 'Event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'register_member_for_event',
        description: 'Register member for event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            memberId: {
              type: 'string',
              description: 'Member ID',
            },
            registrationData: {
              type: 'object',
              description: 'Registration details',
            },
          },
          required: ['eventId', 'memberId', 'registrationData'],
        },
      },
      {
        name: 'unregister_member_from_event',
        description: 'Unregister member from event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            memberId: {
              type: 'string',
              description: 'Member ID',
            },
          },
          required: ['eventId', 'memberId'],
        },
      },
      {
        name: 'get_event_waitlist',
        description: 'Get event waitlist',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'add_member_to_waitlist',
        description: 'Add member to event waitlist',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            memberId: {
              type: 'string',
              description: 'Member ID',
            },
          },
          required: ['eventId', 'memberId'],
        },
      },
      {
        name: 'remove_member_from_waitlist',
        description: 'Remove member from event waitlist',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            memberId: {
              type: 'string',
              description: 'Member ID',
            },
          },
          required: ['eventId', 'memberId'],
        },
      },
      {
        name: 'process_waitlist_notifications',
        description: 'Process waitlist notifications for available spots',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            numberOfSpots: {
              type: 'number',
              description: 'Number of available spots',
            },
          },
          required: ['eventId', 'numberOfSpots'],
        },
      },
      {
        name: 'get_event_feedback',
        description: 'Get feedback for an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'submit_event_feedback',
        description: 'Submit feedback for an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            memberId: {
              type: 'string',
              description: 'Member ID',
            },
            feedbackData: {
              type: 'object',
              description: 'Feedback data',
              properties: {
                Rating: { type: 'number' },
                Comments: { type: 'string' },
                IsAnonymous: { type: 'boolean' },
              },
              required: ['Rating'],
            },
          },
          required: ['eventId', 'memberId', 'feedbackData'],
        },
      },
      {
        name: 'get_event_resources',
        description: 'Get resources for an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'add_event_resource',
        description: 'Add resource to an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            resourceData: {
              type: 'object',
              description: 'Resource data',
              properties: {
                ResourceName: { type: 'string' },
                ResourceType: { type: 'string' },
                ResourceUrl: { type: 'string' },
                Description: { type: 'string' },
                IsRequired: { type: 'boolean' },
              },
              required: ['ResourceName', 'ResourceType'],
            },
          },
          required: ['eventId', 'resourceData'],
        },
      },
      {
        name: 'update_event_resource',
        description: 'Update event resource',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            resourceId: {
              type: 'string',
              description: 'Resource ID',
            },
            resourceData: {
              type: 'object',
              description: 'Updated resource data',
            },
          },
          required: ['eventId', 'resourceId', 'resourceData'],
        },
      },
      {
        name: 'delete_event_resource',
        description: 'Delete event resource',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            resourceId: {
              type: 'string',
              description: 'Resource ID',
            },
          },
          required: ['eventId', 'resourceId'],
        },
      },
      {
        name: 'get_event_speakers',
        description: 'Get speakers for an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'add_event_speaker',
        description: 'Add speaker to an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            speakerData: {
              type: 'object',
              description: 'Speaker data',
              properties: {
                SpeakerName: { type: 'string' },
                SpeakerTitle: { type: 'string' },
                SpeakerCompany: { type: 'string' },
                SpeakerBio: { type: 'string' },
                ContactEmail: { type: 'string' },
              },
              required: ['SpeakerName'],
            },
          },
          required: ['eventId', 'speakerData'],
        },
      },
      {
        name: 'update_event_speaker',
        description: 'Update event speaker',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            speakerId: {
              type: 'string',
              description: 'Speaker ID',
            },
            speakerData: {
              type: 'object',
              description: 'Updated speaker data',
            },
          },
          required: ['eventId', 'speakerId', 'speakerData'],
        },
      },
      {
        name: 'delete_event_speaker',
        description: 'Delete event speaker',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            speakerId: {
              type: 'string',
              description: 'Speaker ID',
            },
          },
          required: ['eventId', 'speakerId'],
        },
      },
      {
        name: 'get_event_capacity',
        description: 'Get event capacity information',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'update_event_capacity',
        description: 'Update event capacity settings',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            capacityData: {
              type: 'object',
              description: 'Capacity data',
              properties: {
                MaxAttendees: { type: 'number' },
                WaitlistEnabled: { type: 'boolean' },
              },
            },
          },
          required: ['eventId', 'capacityData'],
        },
      },
      {
        name: 'send_event_reminders',
        description: 'Send event reminders to attendees',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            reminderType: {
              type: 'string',
              description: 'Reminder type (1day, 1week, custom)',
            },
          },
          required: ['eventId', 'reminderType'],
        },
      },
      {
        name: 'get_event_analytics',
        description: 'Get detailed analytics for an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'duplicate_event',
        description: 'Duplicate an existing event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID to duplicate',
            },
            newEventData: {
              type: 'object',
              description: 'New event data (name, dates, etc.)',
            },
          },
          required: ['eventId', 'newEventData'],
        },
      },
      {
        name: 'get_events_by_date_range',
        description: 'Get events within a date range',
        inputSchema: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              description: 'Start date (ISO format)',
            },
            endDate: {
              type: 'string',
              description: 'End date (ISO format)',
            },
          },
          required: ['startDate', 'endDate'],
        },
      },
      {
        name: 'get_events_by_category',
        description: 'Get events by category',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Event category',
            },
          },
          required: ['category'],
        },
      },
      {
        name: 'get_events_by_location',
        description: 'Get events by location',
        inputSchema: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'Event location',
            },
          },
          required: ['location'],
        },
      },
      {
        name: 'cancel_event',
        description: 'Cancel an event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            reason: {
              type: 'string',
              description: 'Cancellation reason',
            },
          },
          required: ['eventId', 'reason'],
        },
      },
      {
        name: 'reactivate_event',
        description: 'Reactivate a cancelled event',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
          },
          required: ['eventId'],
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

      case 'activate_member': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Member ID is required');
        }
        const result = await atlasAPI.activateMember(args.id);
        return {
          content: [
            {
              type: 'text',
              text: `Member activated successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'deactivate_member': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Member ID is required');
        }
        const result = await atlasAPI.deactivateMember(args.id);
        return {
          content: [
            {
              type: 'text',
              text: `Member deactivated successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'change_membership_type': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Member ID is required');
        }
        if (!('membershipTypeId' in args) || typeof args.membershipTypeId !== 'string') {
          throw new Error('Membership type ID is required');
        }
        const result = await atlasAPI.changeMembershipType(args.id, args.membershipTypeId);
        return {
          content: [
            {
              type: 'text',
              text: `Membership type changed successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_membership_types': {
        const membershipTypes = await atlasAPI.getMembershipTypes();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(membershipTypes, null, 2),
            },
          ],
        };
      }

      case 'get_member_statuses': {
        const memberStatuses = await atlasAPI.getMemberStatuses();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(memberStatuses, null, 2),
            },
          ],
        };
      }

      case 'change_member_status': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Member ID is required');
        }
        if (!('statusId' in args) || typeof args.statusId !== 'string') {
          throw new Error('Status ID is required');
        }
        const result = await atlasAPI.changeMemberStatus(args.id, args.statusId);
        return {
          content: [
            {
              type: 'text',
              text: `Member status changed successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'bulk_update_member_status': {
        if (!args || typeof args !== 'object' || !('memberIds' in args) || !Array.isArray(args.memberIds)) {
          throw new Error('Member IDs array is required');
        }
        if (!('statusId' in args) || typeof args.statusId !== 'string') {
          throw new Error('Status ID is required');
        }
        const result = await atlasAPI.bulkUpdateMemberStatus(args.memberIds as string[], args.statusId);
        return {
          content: [
            {
              type: 'text',
              text: `Bulk status update completed successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_member_renewal_status': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Member ID is required');
        }
        const renewalStatus = await atlasAPI.getMemberRenewalStatus(args.id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(renewalStatus, null, 2),
            },
          ],
        };
      }

      case 'set_member_renewal_date': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Member ID is required');
        }
        if (!('renewalDate' in args) || typeof args.renewalDate !== 'string') {
          throw new Error('Renewal date is required');
        }
        const result = await atlasAPI.setMemberRenewalDate(args.id, args.renewalDate);
        return {
          content: [
            {
              type: 'text',
              text: `Member renewal date updated successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'send_email_to_member': {
        if (!args || typeof args !== 'object' || !('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        if (!('subject' in args) || typeof args.subject !== 'string') {
          throw new Error('Subject is required');
        }
        if (!('body' in args) || typeof args.body !== 'string') {
          throw new Error('Body is required');
        }
        const fromEmail = args.fromEmail && typeof args.fromEmail === 'string' ? args.fromEmail : undefined;
        const result = await atlasAPI.sendEmailToMember(args.memberId, args.subject, args.body, fromEmail);
        return {
          content: [
            {
              type: 'text',
              text: `Email sent successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'send_bulk_email': {
        if (!args || typeof args !== 'object' || !('memberIds' in args) || !Array.isArray(args.memberIds)) {
          throw new Error('Member IDs array is required');
        }
        if (!('subject' in args) || typeof args.subject !== 'string') {
          throw new Error('Subject is required');
        }
        if (!('body' in args) || typeof args.body !== 'string') {
          throw new Error('Body is required');
        }
        const fromEmail = args.fromEmail && typeof args.fromEmail === 'string' ? args.fromEmail : undefined;
        const result = await atlasAPI.sendBulkEmail(args.memberIds as string[], args.subject, args.body, fromEmail);
        return {
          content: [
            {
              type: 'text',
              text: `Bulk email sent successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'send_sms_to_member': {
        if (!args || typeof args !== 'object' || !('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        if (!('message' in args) || typeof args.message !== 'string') {
          throw new Error('Message is required');
        }
        const fromPhone = args.fromPhone && typeof args.fromPhone === 'string' ? args.fromPhone : undefined;
        const result = await atlasAPI.sendSMSToMember(args.memberId, args.message, fromPhone);
        return {
          content: [
            {
              type: 'text',
              text: `SMS sent successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'send_bulk_sms': {
        if (!args || typeof args !== 'object' || !('memberIds' in args) || !Array.isArray(args.memberIds)) {
          throw new Error('Member IDs array is required');
        }
        if (!('message' in args) || typeof args.message !== 'string') {
          throw new Error('Message is required');
        }
        const fromPhone = args.fromPhone && typeof args.fromPhone === 'string' ? args.fromPhone : undefined;
        const result = await atlasAPI.sendBulkSMS(args.memberIds as string[], args.message, fromPhone);
        return {
          content: [
            {
              type: 'text',
              text: `Bulk SMS sent successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'send_portal_message': {
        if (!args || typeof args !== 'object' || !('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        if (!('subject' in args) || typeof args.subject !== 'string') {
          throw new Error('Subject is required');
        }
        if (!('message' in args) || typeof args.message !== 'string') {
          throw new Error('Message is required');
        }
        if (!('fromUserId' in args) || typeof args.fromUserId !== 'string') {
          throw new Error('From User ID is required');
        }
        const result = await atlasAPI.sendPortalMessage(args.memberId, args.subject, args.message, args.fromUserId);
        return {
          content: [
            {
              type: 'text',
              text: `Portal message sent successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_member_communication_history': {
        if (!args || typeof args !== 'object' || !('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        const history = await atlasAPI.getMemberCommunicationHistory(args.memberId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(history, null, 2),
            },
          ],
        };
      }

      case 'get_communication_templates': {
        const type = args && typeof args === 'object' && 'type' in args && typeof args.type === 'string' ? args.type : undefined;
        const templates = await atlasAPI.getCommunicationTemplates(type);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(templates, null, 2),
            },
          ],
        };
      }

      case 'create_communication_template': {
        if (!args || typeof args !== 'object' || !('templateData' in args) || typeof args.templateData !== 'object') {
          throw new Error('Template data is required');
        }
        const result = await atlasAPI.createCommunicationTemplate(args.templateData as Partial<CommunicationTemplate>);
        return {
          content: [
            {
              type: 'text',
              text: `Template created successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'update_communication_template': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Template ID is required');
        }
        if (!('templateData' in args) || typeof args.templateData !== 'object') {
          throw new Error('Template data is required');
        }
        const result = await atlasAPI.updateCommunicationTemplate(args.id, args.templateData as Partial<CommunicationTemplate>);
        return {
          content: [
            {
              type: 'text',
              text: `Template updated successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'delete_communication_template': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Template ID is required');
        }
        const result = await atlasAPI.deleteCommunicationTemplate(args.id);
        return {
          content: [
            {
              type: 'text',
              text: `Template deleted successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_member_portal_messages': {
        if (!args || typeof args !== 'object' || !('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        const messages = await atlasAPI.getMemberPortalMessages(args.memberId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(messages, null, 2),
            },
          ],
        };
      }

      case 'mark_portal_message_read': {
        if (!args || typeof args !== 'object' || !('messageId' in args) || typeof args.messageId !== 'string') {
          throw new Error('Message ID is required');
        }
        const result = await atlasAPI.markPortalMessageAsRead(args.messageId);
        return {
          content: [
            {
              type: 'text',
              text: `Message marked as read: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'send_email_using_template': {
        if (!args || typeof args !== 'object' || !('templateId' in args) || typeof args.templateId !== 'string') {
          throw new Error('Template ID is required');
        }
        if (!('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        const variables = args.variables && typeof args.variables === 'object' ? args.variables : undefined;
        const result = await atlasAPI.sendEmailUsingTemplate(args.templateId, args.memberId, variables);
        return {
          content: [
            {
              type: 'text',
              text: `Email sent using template: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'send_sms_using_template': {
        if (!args || typeof args !== 'object' || !('templateId' in args) || typeof args.templateId !== 'string') {
          throw new Error('Template ID is required');
        }
        if (!('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        const variables = args.variables && typeof args.variables === 'object' ? args.variables : undefined;
        const result = await atlasAPI.sendSMSUsingTemplate(args.templateId, args.memberId, variables);
        return {
          content: [
            {
              type: 'text',
              text: `SMS sent using template: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_communication_stats': {
        const stats = await atlasAPI.getCommunicationStats();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      case 'get_member_notification_preferences': {
        if (!args || typeof args !== 'object' || !('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        const preferences = await atlasAPI.getMemberNotificationPreferences(args.memberId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(preferences, null, 2),
            },
          ],
        };
      }

      case 'update_member_notification_preferences': {
        if (!args || typeof args !== 'object' || !('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        if (!('preferences' in args) || typeof args.preferences !== 'object') {
          throw new Error('Preferences data is required');
        }
        const result = await atlasAPI.updateMemberNotificationPreferences(args.memberId, args.preferences);
        return {
          content: [
            {
              type: 'text',
              text: `Notification preferences updated successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_conversation_flows': {
        const type = args && typeof args === 'object' && 'type' in args && typeof args.type === 'string' ? args.type : undefined;
        const flows = await atlasAPI.getConversationFlows(type);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(flows, null, 2),
            },
          ],
        };
      }

      case 'create_conversation_flow': {
        if (!args || typeof args !== 'object' || !('flowData' in args) || typeof args.flowData !== 'object') {
          throw new Error('Flow data is required');
        }
        const result = await atlasAPI.createConversationFlow(args.flowData as Partial<ConversationFlow>);
        return {
          content: [
            {
              type: 'text',
              text: `Conversation flow created successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'update_conversation_flow': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Flow ID is required');
        }
        if (!('flowData' in args) || typeof args.flowData !== 'object') {
          throw new Error('Flow data is required');
        }
        const result = await atlasAPI.updateConversationFlow(args.id, args.flowData as Partial<ConversationFlow>);
        return {
          content: [
            {
              type: 'text',
              text: `Conversation flow updated successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'delete_conversation_flow': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Flow ID is required');
        }
        const result = await atlasAPI.deleteConversationFlow(args.id);
        return {
          content: [
            {
              type: 'text',
              text: `Conversation flow deleted successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'start_conversation_session': {
        if (!args || typeof args !== 'object' || !('flowId' in args) || typeof args.flowId !== 'string') {
          throw new Error('Flow ID is required');
        }
        if (!('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        const context = args.context && typeof args.context === 'object' ? args.context : undefined;
        const result = await atlasAPI.startConversationSession(args.flowId, args.memberId, context);
        return {
          content: [
            {
              type: 'text',
              text: `Conversation session started: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_conversation_session': {
        if (!args || typeof args !== 'object' || !('sessionId' in args) || typeof args.sessionId !== 'string') {
          throw new Error('Session ID is required');
        }
        const session = await atlasAPI.getConversationSession(args.sessionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(session, null, 2),
            },
          ],
        };
      }

      case 'send_conversation_message': {
        if (!args || typeof args !== 'object' || !('sessionId' in args) || typeof args.sessionId !== 'string') {
          throw new Error('Session ID is required');
        }
        if (!('message' in args) || typeof args.message !== 'string') {
          throw new Error('Message is required');
        }
        const sender = args.sender && typeof args.sender === 'string' ? args.sender : 'member';
        const result = await atlasAPI.sendConversationMessage(args.sessionId, args.message, sender);
        return {
          content: [
            {
              type: 'text',
              text: `Message sent: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'process_conversation_response': {
        if (!args || typeof args !== 'object' || !('sessionId' in args) || typeof args.sessionId !== 'string') {
          throw new Error('Session ID is required');
        }
        if (!('userMessage' in args) || typeof args.userMessage !== 'string') {
          throw new Error('User message is required');
        }
        const result = await atlasAPI.processConversationResponse(args.sessionId, args.userMessage);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_ai_agents': {
        const agents = await atlasAPI.getAIAgents();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(agents, null, 2),
            },
          ],
        };
      }

      case 'create_ai_agent': {
        if (!args || typeof args !== 'object' || !('agentData' in args) || typeof args.agentData !== 'object') {
          throw new Error('Agent data is required');
        }
        const result = await atlasAPI.createAIAgent(args.agentData as Partial<AIAgent>);
        return {
          content: [
            {
              type: 'text',
              text: `AI agent created successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'update_ai_agent': {
        if (!args || typeof args !== 'object' || !('id' in args) || typeof args.id !== 'string') {
          throw new Error('Agent ID is required');
        }
        if (!('agentData' in args) || typeof args.agentData !== 'object') {
          throw new Error('Agent data is required');
        }
        const result = await atlasAPI.updateAIAgent(args.id, args.agentData as Partial<AIAgent>);
        return {
          content: [
            {
              type: 'text',
              text: `AI agent updated successfully: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_member_conversation_sessions': {
        if (!args || typeof args !== 'object' || !('memberId' in args) || typeof args.memberId !== 'string') {
          throw new Error('Member ID is required');
        }
        const status = args.status && typeof args.status === 'string' ? args.status : undefined;
        const sessions = await atlasAPI.getMemberConversationSessions(args.memberId, status);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(sessions, null, 2),
            },
          ],
        };
      }

      case 'complete_conversation_session': {
        if (!args || typeof args !== 'object' || !('sessionId' in args) || typeof args.sessionId !== 'string') {
          throw new Error('Session ID is required');
        }
        const result = await atlasAPI.completeConversationSession(args.sessionId);
        return {
          content: [
            {
              type: 'text',
              text: `Conversation session completed: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_conversation_outcomes': {
        const outcomeType = args && typeof args === 'object' && 'outcomeType' in args && typeof args.outcomeType === 'string' ? args.outcomeType : undefined;
        const outcomes = await atlasAPI.getConversationOutcomes(outcomeType);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(outcomes, null, 2),
            },
          ],
        };
      }

      case 'process_conversation_outcome': {
        if (!args || typeof args !== 'object' || !('outcomeId' in args) || typeof args.outcomeId !== 'string') {
          throw new Error('Outcome ID is required');
        }
        const result = await atlasAPI.processConversationOutcome(args.outcomeId);
        return {
          content: [
            {
              type: 'text',
              text: `Conversation outcome processed: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'register_member_via_conversation': {
        if (!args || typeof args !== 'object' || !('sessionId' in args) || typeof args.sessionId !== 'string') {
          throw new Error('Session ID is required');
        }
        if (!('eventId' in args) || typeof args.eventId !== 'string') {
          throw new Error('Event ID is required');
        }
        if (!('registrationData' in args) || typeof args.registrationData !== 'object') {
          throw new Error('Registration data is required');
        }
        const result = await atlasAPI.registerMemberForEventViaConversation(args.sessionId, args.eventId, args.registrationData);
        return {
          content: [
            {
              type: 'text',
              text: `Member registered via conversation: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'signup_member_for_committee_via_conversation': {
        if (!args || typeof args !== 'object' || !('sessionId' in args) || typeof args.sessionId !== 'string') {
          throw new Error('Session ID is required');
        }
        if (!('committeeId' in args) || typeof args.committeeId !== 'string') {
          throw new Error('Committee ID is required');
        }
        if (!('signupData' in args) || typeof args.signupData !== 'object') {
          throw new Error('Signup data is required');
        }
        const result = await atlasAPI.signupMemberForCommitteeViaConversation(args.sessionId, args.committeeId, args.signupData);
        return {
          content: [
            {
              type: 'text',
              text: `Member signed up for committee via conversation: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_registrations_by_conversation': {
        if (!args || typeof args !== 'object' || !('sessionId' in args) || typeof args.sessionId !== 'string') {
          throw new Error('Session ID is required');
        }
        const registrations = await atlasAPI.getRegistrationsByConversation(args.sessionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(registrations, null, 2),
            },
          ],
        };
      }

      case 'simulate_conversation': {
        if (!args || typeof args !== 'object' || !('flowId' in args) || typeof args.flowId !== 'string') {
          throw new Error('Flow ID is required');
        }
        if (!('testMessages' in args) || !Array.isArray(args.testMessages)) {
          throw new Error('Test messages array is required');
        }
        const result = await atlasAPI.simulateConversation(args.flowId, args.testMessages as string[]);
        return {
          content: [
            {
              type: 'text',
              text: `Conversation simulation results: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_conversation_analytics': {
        const analytics = await atlasAPI.getConversationAnalytics();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analytics, null, 2),
            },
          ],
        };
      }

      case 'get_popular_conversation_flows': {
        const popularFlows = await atlasAPI.getPopularConversationFlows();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(popularFlows, null, 2),
            },
          ],
        };
      }

      case 'get_conversation_completion_rates': {
        const completionRates = await atlasAPI.getConversationCompletionRates();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(completionRates, null, 2),
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
  console.error('Carl\'s Bad MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
