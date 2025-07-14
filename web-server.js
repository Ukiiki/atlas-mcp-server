#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    }

    async callMCPTool(toolName, args = {}) {
        return new Promise((resolve, reject) => {
            const requestId = ++this.requestId;
            
            // Create MCP request
            const request = {
                jsonrpc: '2.0',
                id: requestId,
                method: 'tools/call',
                params: {
                    name: toolName,
                    arguments: args
                }
            };

            // Spawn MCP server process
            const mcpProcess = spawn('node', [path.join(__dirname, 'dist/server.js')], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    ATLAS_CLIENT_SECRET: process.env.ATLAS_CLIENT_SECRET || '1bd58eb5-f765-4fee-a139-312c9d4dead2',
                    ATLAS_CLIENT_ID: process.env.ATLAS_CLIENT_ID || 'CarlsbadChamber',
                    ATLAS_TENANT: process.env.ATLAS_TENANT || 'carlsbad'
                }
            });

            let responseData = '';
            let errorData = '';

            mcpProcess.stdout.on('data', (data) => {
                responseData += data.toString();
            });

            mcpProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            mcpProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const response = JSON.parse(responseData);
                        if (response.error) {
                            reject(new Error(response.error.message));
                        } else {
                            resolve(response.result);
                        }
                    } catch (parseError) {
                        reject(new Error('Failed to parse MCP response'));
                    }
                } else {
                    reject(new Error(`MCP process exited with code ${code}: ${errorData}`));
                }
            });

            // Send request to MCP server
            mcpProcess.stdin.write(JSON.stringify(request) + '\n');
            mcpProcess.stdin.end();
        });
    }

    async getMembers(restrictToMember = true) {
        try {
            const result = await this.callMCPTool('get_members', { restrictToMember });
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
            const result = await this.callMCPTool('get_events_with_attendance', { pageSize });
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
            const result = await this.callMCPTool('get_comprehensive_member_intelligence');
            return JSON.parse(result.content[0].text);
        } catch (error) {
            console.error('Error getting comprehensive intelligence:', error);
            return null;
        }
    }

    async addMember(memberData) {
        try {
            const result = await this.callMCPTool('add_member', { memberData });
            return JSON.parse(result.content[0].text);
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    }

    async suspendMember(memberId) {
        try {
            const result = await this.callMCPTool('suspend_member', { id: memberId });
            return JSON.parse(result.content[0].text);
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