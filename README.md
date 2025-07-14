# Carl's Bad MCP Server

A Model Context Protocol (MCP) server that provides AI-powered chamber management integration with the Atlas MemberClicks API for managing members, committees, and events.

## Features

### Member Management
- `get_members` - Retrieve all member profiles
- `get_member_by_id` - Get specific member details by ID
- `add_member` - Add new members to the system
- `update_member_profile` - Update existing member information
- `suspend_member` - Suspend/deactivate member accounts
- `get_new_members` - Get recently joined members

### Committee Management
- `get_committees` - Retrieve all committees
- `get_committee_members` - Get all committee members or filter by specific committee
- `get_committee_with_members` - Get committee details along with all its members

### Event Management
- `get_events` - Retrieve all events with pagination
- Support for filtering upcoming events only

### Notifications & Workflows
- `check_member_notifications` - Monitor for new members and suggest workflow actions
- Integration-ready for Clay profile enrichment, Airtable storage, social media posting, and email notifications

## Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the server:
```bash
npm start
```

### Development

For development with automatic rebuilding:
```bash
npm run dev
```

To clean the build directory:
```bash
npm run clean
```

To rebuild from scratch:
```bash
npm run rebuild
```

## Configuration

The server uses environment variables for configuration. Required variables:

- **ATLAS_CLIENT_SECRET**: Your Atlas MemberClicks client secret (required)
- **ATLAS_CLIENT_ID**: Your client ID (default: CarlsbadChamber)
- **ATLAS_TENANT**: Your tenant name (default: carlsbad)
- **ATLAS_AUTH_URL**: Auth endpoint (default: https://www.weblinkauth.com/connect/token)
- **ATLAS_API_BASE_URL**: API endpoint (default: https://api-v1.weblinkconnect.com/api-v1)

### Environment Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env with your credentials:**
   ```env
   ATLAS_CLIENT_SECRET=your_actual_client_secret_here
   ATLAS_CLIENT_ID=CarlsbadChamber
   ATLAS_TENANT=carlsbad
   ```

## Authentication

The server handles OAuth2 authentication automatically using the client credentials flow. Access tokens are automatically refreshed before expiration.

## Usage with MCP Clients

Once running, the server can be connected to MCP clients like Cline, Claude Desktop, or other MCP-compatible applications. The server exposes tools for all the member, committee, and event management functions.

### Example Tool Calls

```typescript
// Get all members
use_mcp_tool("atlas-mcp-server", "get_members", {})

// Get new members from last 3 days
use_mcp_tool("atlas-mcp-server", "get_new_members", { "daysBack": 3 })

// Get specific committee with members
use_mcp_tool("atlas-mcp-server", "get_committee_with_members", { "committeeId": "123" })

// Add new member
use_mcp_tool("atlas-mcp-server", "add_member", {
  "memberData": {
    "FirstName": "John",
    "LastName": "Doe", 
    "Email": "john.doe@example.com",
    "Company": "Example Corp"
  }
})

// Check for new members and get workflow suggestions
use_mcp_tool("atlas-mcp-server", "check_member_notifications", { "daysBack": 1 })
```

## API Coverage

This MCP server provides access to the following Atlas MemberClicks API endpoints:
- `/profiles` - Member profile management
- `/Committees` - Committee information
- `/CommitteeMembers` - Committee membership
- `/Events` - Event management

## Workflow Integration

The server is designed to integrate with your complete member management workflow:

1. **New Member Detection** - Monitor for new member registrations
2. **Profile Enrichment** - Ready for Clay integration to enhance profiles
3. **Data Storage** - Structured for Airtable synchronization
4. **Social Media** - Prepared for automated social media posting
5. **Email Automation** - Ready for CEO welcome emails and review requests

## Error Handling

The server includes comprehensive error handling:
- Automatic token refresh on expiration
- Detailed error messages for debugging
- Type-safe request/response handling
- Graceful handling of API failures

## Development Notes

- Built with TypeScript for type safety
- Uses the official MCP SDK
- Implements proper OAuth2 flow with automatic token management
- Modular design for easy extension
- Full support for all required Atlas MemberClicks operations

## Support

For issues or questions about Carl's Bad MCP Server or the Atlas MemberClicks API, refer to their documentation:
- [Getting Started](https://api-v1.weblinkconnect.com/api-v1/getting-started/)
- [API Resources](https://api-v1.weblinkconnect.com/api-v1/api-resources/)
- [Profile Resources](https://api-v1.weblinkconnect.com/api-v1/api-resources/Profile)
