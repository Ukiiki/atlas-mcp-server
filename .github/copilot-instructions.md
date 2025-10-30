# Atlas Bridge System - AI Development Guide

This guide helps AI coding agents understand the Atlas Bridge System architecture and development patterns.

## System Architecture

### 1. MCP Server (Core)
- Location: `/server.ts`
- Purpose: Model Context Protocol server providing AI assistants access to Atlas MemberClicks API
- Key Features:
  - OAuth2 authentication with automatic token refresh
  - Type-safe API interface with real Atlas types
  - 15+ MCP tools for chamber operations

### 2. Next.js Frontend
- Location: `/atlas-frontend/`
- Stack: Next.js, React, TypeScript, TailwindCSS
- Key Components:
  ```
  src/
  ├── app/             # Next.js app router pages
  ├── components/      # Shared React components
  ├── hooks/          # Custom React hooks
  └── lib/            # API client and utilities
  ```

### 3. Legacy Web Interface
- Location: `/web/`
- Stack: Express.js, HTML, CSS, JavaScript
- Status: Maintenance only, prefer Next.js frontend

## Critical Workflows

### Development
```bash
# MCP Server
npm run dev          # Build and run server
npm run rebuild      # Clean and rebuild

# Next.js Frontend
cd atlas-frontend
npm run dev         # Start development server
```

### Authentication Flow
1. Set required environment variables:
   ```
   ATLAS_CLIENT_SECRET=<secret>
   ATLAS_CLIENT_ID=CarlsbadChamber
   ATLAS_TENANT=carlsbad
   ```
2. OAuth2 token auto-refreshes before expiration
3. All API calls include `Authorization: Bearer <token>` and `x-tenant: carlsbad`

## Key Patterns & Conventions

### Data Flow
1. Client API requests → Next.js API routes
2. API routes → MCP Server tools
3. MCP Server → Atlas MemberClicks API
4. Response transformed for frontend consumption

### API Response Handling
```typescript
// Example pattern for paginated data
while (hasMore) {
  const response = await makeAtlasRequest(endpoint, {
    PageSize: pageSize.toString(),
    PageNumber: pageNumber.toString()
  })
  allItems = allItems.concat(response.Result || response || [])
  hasMore = items.length === pageSize
  pageNumber++
}
```

### Data Transformation Conventions
- `Active` field becomes `status: "Active"|"Inactive"`
- Combine address components into full strings
- Business names use fallback chain
- Set sensible defaults for missing data

### Error Handling
1. Type-safe request validation
2. Detailed error messages with context
3. Graceful API failure recovery
4. Automatic token refresh on expiration

## Integration Points

### External Systems
1. Atlas MemberClicks API
   - Base URL: `https://api-v1.weblinkconnect.com/api-v1`
   - OAuth2 authentication
   - Pagination using `PageSize` and `PageNumber`

2. CopilotKit (AI Assistant)
   - Location: `atlas-frontend/src/components/CopilotChat.tsx`
   - Integrates with frontend for conversational UI

### Cross-Component Communication
- Frontend uses React hooks and context for state
- API client (`lib/api.ts`) handles data transformation
- MCP tools expose standardized chamber operations

## Common Operations

### Member Management
```typescript
// Get member profiles
const members = await atlasAPI.getMembers(restrictToMember)

// Add new member
const newMember = await atlasAPI.createMember({
  FirstName: "...",
  LastName: "...",
  Email: "..."
})
```

### Event Management
```typescript
// Get upcoming events
const events = await atlasAPI.getEvents(pageSize)

// Create registration
const registration = await atlasAPI.createEventRegistration({
  EventId: "...",
  ProfileId: "...",
  AttendeeCount: 1
})
```

## Security Considerations

1. Never expose API credentials in client code
2. All sensitive operations go through MCP server
3. Input validation on all API endpoints
4. Environment variables for secrets only