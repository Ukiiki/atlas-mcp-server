# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### MCP Server (Root)
```bash
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled MCP server
npm run dev        # Build and run in one command
npm run web        # Start the web interface
npm run clean      # Remove dist/ folder
npm run rebuild    # Clean and build
```

### Frontend (atlas-frontend/)
```bash
cd atlas-frontend
npm run dev        # Start Next.js development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

### Utility Scripts
```bash
node get_listings_count.js  # Get count of active/inactive business listings
```

## Architecture Overview

This is a **dual-architecture system** that bridges legacy chamber management data to modern platforms:

### 1. MCP Server (Model Context Protocol)
- **File**: `server.ts` - Main MCP server implementation
- **Purpose**: Provides AI assistants with direct access to Atlas MemberClicks API
- **Authentication**: OAuth2 client credentials flow with automatic token refresh
- **Tools Available**: 15+ MCP tools for member, committee, event, and listing management

### 2. Next.js Frontend (`atlas-frontend/`)
- **Purpose**: Modern web dashboard for chamber staff
- **Features**: Member management, event tracking, business directory, AI assistant
- **AI Integration**: CopilotKit for conversational UI
- **Styling**: TailwindCSS with Lucide React icons

### 3. Legacy Web Interface (`web/`)
- **Purpose**: Simple HTML/CSS/JS dashboard
- **Server**: Express.js (`web-server.js`)
- **Status**: Legacy implementation, prefer Next.js frontend

## Key APIs and Data Sources

### Atlas MemberClicks Integration
- **API Base**: `https://api-v1.weblinkconnect.com/api-v1`
- **Authentication**: OAuth2 with client credentials
- **Tenant**: Carlsbad Chamber of Commerce
- **Pagination**: Uses `PageSize` and `PageNumber` parameters
- **Rate Limits**: Automatic token refresh before expiration

### Environment Configuration
Required environment variables:
```bash
ATLAS_CLIENT_SECRET=<secret>
ATLAS_CLIENT_ID=CarlsbadChamber
ATLAS_TENANT=carlsbad
```

## MCP Tools Architecture

The MCP server exposes these tools to AI assistants:

### Member Management
- `get_members` - Retrieve all member profiles with filtering
- `get_member_by_id` - Get specific member details
- `add_member` - Add new members
- `update_member_profile` - Update existing member information
- `suspend_member` - Suspend/deactivate members
- `get_new_members` - Get recently joined members

### Committee Operations
- `get_committees` - Retrieve all committees
- `get_committee_members` - Get committee membership
- `get_committee_with_members` - Committee details with members

### Event Management
- `get_events` - Retrieve events with pagination and filtering

### Business Directory
- `get_business_listings` - Paginated business listings
- `get_listing_categories` - Business categories

### System Operations
- `check_member_notifications` - Monitor for new members and suggest workflows
- `get_comprehensive_intelligence` - Dashboard analytics

## Code Patterns and Conventions

### TypeScript Structure
- **Interfaces**: Real Atlas API types defined for all responses
- **Error Handling**: Comprehensive error handling with detailed messages
- **Authentication**: Token caching with automatic refresh
- **Pagination**: Implemented for all list endpoints to handle large datasets

### Frontend Patterns
- **Components**: React functional components with TypeScript
- **Styling**: TailwindCSS utility classes
- **State Management**: React hooks and context
- **API Integration**: Direct API routes that proxy to Atlas

### Authentication Flow
1. Environment variables provide client credentials
2. Token obtained via OAuth2 client credentials flow
3. Token cached with expiration tracking
4. Automatic refresh before expiration
5. All API requests include `Authorization: Bearer <token>` and `x-tenant: carlsbad`

## Special Considerations

### Pagination Implementation
All listing endpoints support pagination. The pattern is:
```typescript
let allItems = []
let pageNumber = 1
const pageSize = 500
let hasMore = true

while (hasMore) {
  const response = await makeAtlasRequest(endpoint, {
    PageSize: pageSize.toString(),
    PageNumber: pageNumber.toString()
  })
  const items = response.Result || response || []
  allItems = allItems.concat(items)
  hasMore = items.length === pageSize
  pageNumber++
}
```

### Data Transformation
Atlas API data is transformed for frontend consumption:
- `Active` field becomes `status: "Active"|"Inactive"`
- Address components combined into full address strings
- Business names fallback through multiple fields
- Missing data gets sensible defaults

### Security Notes
- API credentials stored in environment variables only
- No sensitive data in client-side code
- OAuth2 tokens cached server-side only
- All API calls proxied through backend

## Integration Workflows

This system is designed for complete member management workflows:
1. **New Member Detection** - Automatic monitoring via `check_member_notifications`
2. **Profile Enrichment** - Ready for Clay integration
3. **Data Storage** - Structured for Airtable synchronization  
4. **Social Media** - Prepared for automated posting
5. **Email Automation** - Ready for CEO welcome emails

## Deployment Notes

### MCP Server Deployment
- Requires Node.js 18+
- Build with `npm run build` creates `dist/server.js`
- Environment variables must be configured
- Run with `npm start`

### Frontend Deployment  
- Standard Next.js deployment
- Environment variables in `.env.local`
- Build with `npm run build`
- Deploy to Vercel, Coolify, or VPS

### Database/Storage
- No local database required
- All data comes from Atlas MemberClicks API
- Consider implementing caching for production use