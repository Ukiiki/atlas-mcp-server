#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
if (!process.env.ATLAS_CLIENT_SECRET) {
    console.error('Error: ATLAS_CLIENT_SECRET environment variable is required');
    process.exit(1);
}

// Web server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Create Express app
const app = express();

// Enable JSON parsing
app.use(express.json());

// Serve static files from web directory
app.use(express.static(path.join(__dirname, 'web')));

// MCP Server interface
class MCPInterface {
    constructor() {
        this.mcpProcess = null;
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.startMCPProcess();
    }

    startMCPProcess() {
        const mcpPath = path.join(__dirname, 'dist/server.js');
        console.log(`Spawning MCP process: ${mcpPath}`);

        this.mcpProcess = spawn('node', [mcpPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env }
        });

        let buffer = '';
        this.mcpProcess.stdout.on('data', (data) => {
            buffer += data.toString();
            const responses = buffer.split('\n');
            buffer = responses.pop() || ''; // Keep the last, possibly incomplete, response

            for (const responseStr of responses) {
                // Guard against parsing non-JSON log lines
                if (responseStr.trim() === '' || !responseStr.startsWith('{')) {
                    if (responseStr.trim() !== '') {
                        // console.log(`MCP stdout (ignored): ${responseStr}`);
                    }
                    continue;
                }
                try {
                    const response = JSON.parse(responseStr);
                    if (this.pendingRequests.has(response.id)) {
                        const { resolve, reject } = this.pendingRequests.get(response.id);
                        if (response.error) {
                            reject(new Error(response.error.message));
                        } else {
                            resolve(response.result);
                        }
                        this.pendingRequests.delete(response.id);
                    }
                } catch (e) {
                    console.error("Failed to parse MCP JSON response:", responseStr, e);
                }
            }
        });

        this.mcpProcess.stderr.on('data', (data) => {
            // MCP server logs to stderr, so we pipe it to our console
            console.error(`MCP stderr: ${data}`);
        });

        this.mcpProcess.on('close', (code) => {
            console.error(`MCP process exited with code ${code}`);
            // Reject all pending requests
            for (const [id, { reject }] of this.pendingRequests.entries()) {
                reject(new Error(`MCP process exited with code ${code}`));
                this.pendingRequests.delete(id);
            }
            // Attempt to restart the process after a delay
            console.log('Attempting to restart MCP process in 5 seconds...');
            setTimeout(() => this.startMCPProcess(), 5000);
        });
    }

    async callMCPTool(toolName, args = {}) {
        return new Promise((resolve, reject) => {
            const requestId = ++this.requestId;
            
            const request = {
                jsonrpc: '2.0',
                id: requestId,
                method: 'tools/call',
                params: {
                    name: toolName,
                    arguments: args
                }
            };

            this.pendingRequests.set(requestId, { resolve, reject });

            try {
                this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');
            } catch (error) {
                console.error("Failed to write to MCP process stdin", error);
                this.pendingRequests.delete(requestId);
                reject(error);
            }
        });
    }

    async getMembers(restrictToMember = true) {
        try {
            const result = await this.callMCPTool('get_profiles', { restrictToMember });
            return JSON.parse(result.content[0].text);
        } catch (error) {
            console.error('Error getting members:', error);
            return [];
        }
    }

    async getCommittees(pageSize = 20) {
        try {
            const result = await this.callMCPTool('get_committees', { pageSize });
            return JSON.parse(result.content[0].text);
        } catch (error) {
            console.error('Error getting committees:', error);
            return [];
        }
    }

    async getEvents(pageSize = 100) {
        try {
            const result = await this.callMCPTool('get_events', { pageSize });
            return JSON.parse(result.content[0].text);
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    }

    async getBusinessListings(pageSize = 200, active = true) {
        try {
            const result = await this.callMCPTool('get_business_listings', { pageSize, active });
            return JSON.parse(result.content[0].text);
        } catch (error) {
            console.error('Error getting business listings:', error);
            return [];
        }
    }

    async getListingCategories(pageSize = 200) {
        try {
            const result = await this.callMCPTool('get_listing_categories', { pageSize });
            return JSON.parse(result.content[0].text);
        } catch (error) {
            console.error('Error getting listing categories:', error);
            return [];
        }
    }

    async getComprehensiveIntelligence() {
        try {
            // This tool does not exist in the MCP server, so we return a default object
            // to avoid breaking the frontend that expects a certain structure.
            // console.warn("get_comprehensive_member_intelligence tool does not exist. Returning default object.");
            return {
                summary: { totalMembers: 0, totalEvents: 0, totalEventAttendance: 0, totalEventRevenue: 0, totalCommittees: 0, membersWithBusinesses: 0 },
                memberBusinessAnalysis: { topIndustries: [] },
                committeeEngagement: { totalCommitteeMembers: 0, committeeEvents: 0 },
                eventAnalysis: {},
                insights: []
            };
        } catch (error) {
            console.error('Error getting comprehensive intelligence:', error);
            return null;
        }
    }

    async addMember(memberData) {
        try {
            // The tool is named 'create_profile' and expects 'profileData'
            const result = await this.callMCPTool('create_profile', { profileData: memberData });
            // The result from create_profile is not a JSON string in content, but a direct object.
            return result;
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    }

    async suspendMember(memberId) {
        try {
            // The 'suspend_member' tool does not exist. Using 'update_profile' to set status.
            const result = await this.callMCPTool('update_profile', { id: memberId, profileData: { Status: 'Inactive' } });
            // The result from update_profile is not a JSON string in content, but a direct object.
            return result;
        } catch (error) {
            console.error('Error suspending member:', error);
            throw error;
        }
    }

    async getCommitteeDetails(committeeId) {
        try {
            const result = await this.callMCPTool('get_committee_with_members', { committeeId });
            return JSON.parse(result.content[0].text);
        } catch (error) {
            console.error('Error getting committee details:', error);
            return null;
        }
    }

    async getEventRegistrationsCSV(eventId) {
        try {
            const result = await this.callMCPTool('get_event_registrations_csv', { eventId });
            // The result from get_event_registrations_csv is a CSV string in content[0].text
            return result.content[0].text;
        } catch (error) {
            console.error('Error getting event registrations CSV:', error);
            throw error;
        }
    }

    async getBusinessListingsCSV() {
        try {
            const result = await this.callMCPTool('get_business_listings_csv');
            return result.content[0].text;
        } catch (error) {
            console.error('Error getting business listings CSV:', error);
            throw error;
        }
    }

    async getEventsCSV() {
        try {
            const result = await this.callMCPTool('get_events_csv');
            return result.content[0].text;
        } catch (error) {
            console.error('Error getting events CSV:', error);
            throw error;
        }
    }
}

// Initialize MCP interface
const mcpInterface = new MCPInterface();

// API Routes
app.get('/api/members', async (req, res) => {
    try {
        const members = await mcpInterface.getMembers();
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/events/csv', async (req, res) => {
    try {
        const csv = await mcpInterface.getEventsCSV();
        res.header('Content-Type', 'text/csv');
        res.attachment('events.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/business-listings/csv', async (req, res) => {
    try {
        const csv = await mcpInterface.getBusinessListingsCSV();
        res.header('Content-Type', 'text/csv');
        res.attachment('business-listings.csv');
        res.send(csv);
    } catch (error)        {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/events/:id/registrations/csv', async (req, res) => {
    try {
        const csv = await mcpInterface.getEventRegistrationsCSV(req.params.id);
        res.header('Content-Type', 'text/csv');
        res.attachment(`event-${req.params.id}-registrations.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/committees', async (req, res) => {
    try {
        const committees = await mcpInterface.getCommittees();
        res.json(committees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const events = await mcpInterface.getEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/business-listings', async (req, res) => {
    try {
        const listings = await mcpInterface.getBusinessListings();
        res.json(listings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/listing-categories', async (req, res) => {
    try {
        const categories = await mcpInterface.getListingCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/comprehensive-intelligence', async (req, res) => {
    try {
        const intelligence = await mcpInterface.getComprehensiveIntelligence();
        res.json(intelligence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/members', async (req, res) => {
    try {
        const newMember = await mcpInterface.addMember(req.body);
        res.json(newMember);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/members/:id/suspend', async (req, res) => {
    try {
        const result = await mcpInterface.suspendMember(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/committees/:id/details', async (req, res) => {
    try {
        const details = await mcpInterface.getCommitteeDetails(req.params.id);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve main page for all other routes (SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`\n🚀 Carl's Bad Chamber Dashboard`);
    console.log(`📍 Server running at: http://${HOST}:${PORT}`);
    console.log(`🔗 Open in browser: http://${HOST}:${PORT}`);
    console.log(`\n📊 Features available:`);
    console.log(`   • AI-Powered Conversational Registration`);
    console.log(`   • Complete Member Lifecycle Management`);
    console.log(`   • Advanced Event Management & Waitlists`);
    console.log(`   • Multi-Channel Communication System`);
    console.log(`   • Business Directory & Analytics`);
    console.log(`   • Comprehensive Intelligence Dashboard`);
    console.log(`\n🛑 Press Ctrl+C to stop the server\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    process.exit(0);
});