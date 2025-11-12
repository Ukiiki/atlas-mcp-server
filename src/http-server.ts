#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Atlas MemberClicks API Configuration
const AUTH_URL = process.env.ATLAS_AUTH_URL || 'https://www.weblinkauth.com/connect/token';
const API_BASE_URL = process.env.ATLAS_API_BASE_URL || 'https://api-v1.weblinkconnect.com/api-v1';
const CLIENT_ID = (process.env.ATLAS_CLIENT_ID || 'CarlsbadChamber').trim();
const CLIENT_SECRET = process.env.ATLAS_CLIENT_SECRET?.trim();
const TENANT = (process.env.ATLAS_TENANT || 'carlsbad').trim();

// Validate required environment variables
if (!CLIENT_SECRET) {
  console.error('Error: ATLAS_CLIENT_SECRET environment variable is required');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: ['https://www.catalystrise.com', 'http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Token cache
let tokenCache: { token: string; expires: number } | null = null;

// Authenticate and get access token
async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expires) {
    return tokenCache.token;
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

  const data: any = await response.json();
  tokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in * 1000) - 60000, // Refresh 1 minute early
  };

  return data.access_token;
}

// Make authenticated API request
async function makeAtlasRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<any> {
  const token = await getAccessToken();

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
    const errorText = await response.text();
    throw new Error(`Atlas API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      hasClientId: !!CLIENT_ID,
      hasClientSecret: !!CLIENT_SECRET,
      hasTenant: !!TENANT,
      tenant: TENANT
    }
  });
});

// Generic Atlas proxy endpoint
app.get('/api/atlas/*', async (req, res) => {
  try {
    const endpoint = req.path.replace('/api/atlas', '');
    const queryString = new URLSearchParams(req.query as any).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

    const data = await makeAtlasRequest(fullEndpoint);
    res.json(data);
  } catch (error: any) {
    console.error('Atlas API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Profiles endpoints
app.get('/api/profiles', async (req, res) => {
  try {
    const params = new URLSearchParams();
    if (req.query.RestrictToMember) params.append('RestrictToMember', req.query.RestrictToMember as string);
    if (req.query.PageSize) params.append('PageSize', req.query.PageSize as string);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await makeAtlasRequest(`/profiles${queryString}`);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profiles/:id', async (req, res) => {
  try {
    const data = await makeAtlasRequest(`/profiles/${req.params.id}`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profiles', async (req, res) => {
  try {
    const data = await makeAtlasRequest('/profiles', 'POST', req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profiles/:id', async (req, res) => {
  try {
    const data = await makeAtlasRequest(`/profiles/${req.params.id}`, 'PUT', req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Events endpoints
app.get('/api/events', async (req, res) => {
  try {
    const pageSize = req.query.PageSize || '100';
    const data = await makeAtlasRequest(`/Events?PageSize=${pageSize}`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Committees endpoints
app.get('/api/committees', async (req, res) => {
  try {
    const pageSize = req.query.PageSize || '20';
    const data = await makeAtlasRequest(`/Committees?PageSize=${pageSize}`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/committee-members', async (req, res) => {
  try {
    const committeeId = req.query.CommitteeId;
    const endpoint = committeeId
      ? `/CommitteeMembers?CommitteeId=${committeeId}`
      : '/CommitteeMembers';
    const data = await makeAtlasRequest(endpoint);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Invoices endpoints
app.get('/api/invoices', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query as any);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await makeAtlasRequest(`/Invoices${queryString}`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const data = await makeAtlasRequest(`/Invoice/${req.params.id}`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const data = await makeAtlasRequest('/Invoices', 'POST', req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Business Listings endpoints
app.get('/api/listings', async (req, res) => {
  try {
    const active = req.query.Active || 'true';
    const pageSize = req.query.PageSize || '200';
    const data = await makeAtlasRequest(`/Listings?Active=${active}&PageSize=${pageSize}&OrderBy=DateChanged&OrderByExpression=DESC`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/listing-categories', async (req, res) => {
  try {
    const pageSize = req.query.PageSize || '200';
    const data = await makeAtlasRequest(`/ListingCategories?PageSize=${pageSize}&OrderBy=Category`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Contacts endpoints
app.get('/api/contacts', async (req, res) => {
  try {
    const pageSize = req.query.PageSize || '200';
    const data = await makeAtlasRequest(`/Contacts?PageSize=${pageSize}`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Payments endpoints
app.get('/api/payments', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query as any);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await makeAtlasRequest(`/Payments${queryString}`);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const data = await makeAtlasRequest('/Payments', 'POST', req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Atlas MCP HTTP Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Tenant: ${TENANT}`);
  console.log(`✅ Ready to accept requests`);
});
