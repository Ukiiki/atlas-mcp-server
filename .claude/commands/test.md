# Test Command

Run comprehensive tests on the Carlsbad Chamber application.

## Steps:

1. **Test MCP Server** - Run the MCP server and verify it connects to Atlas API
2. **Test API Routes** - Call each API endpoint in the Next.js frontend:
   - /api/health
   - /api/members
   - /api/committees
   - /api/events
   - /api/listings
   - /api/approvals
   - /api/questions
   - /api/copilotkit
3. **Test Frontend Build** - Build the frontend and check for TypeScript errors
4. **Test Approval System** - Create test approval request and verify it appears in the dashboard
5. **Generate Report** - Summarize test results

Create a detailed test report showing what works and what needs attention.
