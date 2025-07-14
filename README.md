# Atlas Bridge System

A Next.js chamber management platform with AI-powered assistance for extracting and managing chamber data. This system serves as a bridge to help chambers migrate their data from legacy systems to modern platforms.

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

The system uses environment variables for configuration. All sensitive credentials should be stored in environment files and never committed to the repository.

### Environment Setup

1. **Backend (MCP Server):**
   ```bash
   cp .env.example .env
   # Edit .env with your API credentials
   ```

2. **Frontend (Next.js):**
   ```bash
   cd atlas-frontend
   cp .env.local.example .env.local
   # Add your OpenAI API key and other config
   ```

## Authentication

The server handles OAuth2 authentication automatically using the client credentials flow. Access tokens are automatically refreshed before expiration.

## Frontend Deployment

The `atlas-frontend` directory contains a Next.js application that provides a modern web interface for chamber management.

### Quick Start
```bash
cd atlas-frontend
npm install
npm run dev
```

### Production Build
```bash
cd atlas-frontend
npm run build
npm start
```

### Features
- 📊 **Dashboard** - Chamber analytics and member overview
- 👥 **Member Management** - View and manage member profiles  
- 📅 **Event Management** - Track chamber events and registrations
- 💰 **Payment Tracking** - Monitor invoices and payments
- 🤖 **AI Assistant** - CopilotKit integration for intelligent interactions

## System Architecture

This bridge system consists of:

### **Backend (MCP Server)**
- Model Context Protocol server for API integration
- Secure authentication and data extraction
- Real-time chamber data synchronization

### **Frontend (Next.js)**  
- Modern React-based dashboard
- CopilotKit AI assistant integration
- Responsive design for all devices
- Real-time data visualization

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

## Deployment

This system is designed for easy deployment to modern hosting platforms:

- **Coolify** - Self-hosted deployment platform
- **Vercel** - Automatic Next.js deployments  
- **Docker** - Containerized deployment
- **VPS** - Traditional server hosting

See `README_FRONTEND.md` for detailed deployment instructions.
