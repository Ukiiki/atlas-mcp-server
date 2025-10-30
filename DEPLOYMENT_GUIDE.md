# Catalyst Rise - Complete Deployment Guide

## 🎉 What We Fixed

Your chat was using **fake tools** that couldn't actually do anything. Now it's connected to your real MCP server with 30+ powerful tools that can:
- Query actual member data from Atlas
- Get real event information
- Access business listings
- Perform chamber management tasks
- Generate reports with live data

## 🚀 Quick Local Test

The dev server should be running at `http://localhost:3000`

**Test the chat:**
1. Click the chat button (bottom right)
2. Ask: "How many members do we have?"
3. Ask: "Show me upcoming events"
4. Ask: "Get member analytics"

The AI will now use **real MCP tools** to fetch actual data!

---

## 📦 Production Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Perfect for:** Fast deployment, automatic SSL, custom domains

#### Step 1: Prepare Your Repository
```bash
cd /Users/ukiiki/Desktop/DESKTOP/atlas-mcp-server
git init
git add .
git commit -m "Initial commit - Catalyst Rise with working MCP chat"
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### Step 2: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repo
4. Set Root Directory: `atlas-frontend`
5. Add Environment Variables:
   ```
   OPENAI_API_KEY=your_openai_key
   ATLAS_CLIENT_SECRET=1bd58eb5-f765-4fee-a139-312c9d4dead2
   ATLAS_CLIENT_ID=CarlsbadChamber
   ATLAS_TENANT=carlsbad
   NEXT_PUBLIC_COPILOT_API_KEY=ck_pub_9f16aed96191e5c7d0d9676062c79419
   ```
6. Click "Deploy"
7. Your site will be live at: `https://your-app.vercel.app`

#### Step 3: Add Custom Domain
1. In Vercel dashboard → Settings → Domains
2. Add your domain (e.g., `catalystrise.com`)
3. Update your domain's DNS records as instructed
4. SSL is automatic!

---

### Option 2: Railway (For Backend MCP Server)

**Perfect for:** Hosting your MCP server backend

#### Deploy MCP Server
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo
4. Add Environment Variables:
   ```
   ATLAS_CLIENT_SECRET=1bd58eb5-f765-4fee-a139-312c9d4dead2
   ATLAS_CLIENT_ID=CarlsbadChamber
   ATLAS_TENANT=carlsbad
   PORT=3001
   ```
5. Your MCP server will be at: `https://your-app.railway.app`

#### Connect Frontend to Backend
Update `atlas-frontend/.env.production`:
```bash
ATLAS_API_URL=https://your-app.railway.app
```

---

### Option 3: Self-Hosted VPS (Full Control)

**Perfect for:** Complete control, privacy, cost efficiency

#### Requirements
- Ubuntu 20.04+ VPS
- Domain name
- 2GB+ RAM

#### Step 1: Server Setup
```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx
```

#### Step 2: Deploy Application
```bash
# Clone your repo
git clone <your-repo-url>
cd atlas-mcp-server

# Install dependencies
npm install
cd atlas-frontend && npm install && cd ..

# Build frontend
cd atlas-frontend
npm run build
cd ..

# Set up environment variables
nano .env
# Add all your API keys and secrets

# Start with PM2
pm2 start npm --name "atlas-frontend" -- run start --prefix atlas-frontend
pm2 save
pm2 startup
```

#### Step 3: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/catalystrise
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/catalystrise /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 Security Checklist

- [ ] Never commit `.env` files to Git
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL (automatic with Vercel)
- [ ] Restrict API access to your domain
- [ ] Set up rate limiting
- [ ] Monitor API usage

---

## 🧪 Testing Your Deployment

Once deployed, test these scenarios:

### 1. Basic Chat Functionality
```
User: "Hello"
Expected: AI responds with greeting
```

### 2. Member Data Access
```
User: "How many members do we have?"
Expected: AI uses get_members tool and returns actual count
```

### 3. Event Information
```
User: "Show me upcoming events"
Expected: AI uses get_events tool and lists real events
```

### 4. Analytics
```
User: "Give me chamber analytics"
Expected: AI uses get_comprehensive_intelligence and shows stats
```

---

## 🐛 Troubleshooting

### Chat not responding?
- Check browser console for errors
- Verify OpenAI API key is set
- Check `/api/copilotkit` endpoint is accessible

### Tools not working?
- Ensure all API endpoints are responding
- Check Atlas API credentials
- Verify CORS is configured correctly

### "Cannot connect to MCP Server"?
- MCP server runs on stdio (local only)
- Tools are exposed through Next.js API routes
- Check that API routes are working

---

## 📊 Monitoring

### Track Usage
- OpenAI Dashboard: Monitor API usage and costs
- Vercel Analytics: Track page views and performance
- Server Logs: Monitor for errors

### Cost Estimates
- **OpenAI API**: ~$0.01-0.10 per conversation
- **Vercel**: Free for hobby projects, $20/month Pro
- **Railway**: ~$5-20/month depending on usage

---

## 🎯 Next Steps

1. **Test locally** - Make sure chat works with real data
2. **Get API keys** - OpenAI key for production
3. **Choose hosting** - Vercel is easiest to start
4. **Deploy** - Follow the steps above
5. **Add domain** - Point your domain to the deployment
6. **Test live** - Verify everything works in production

---

## 💡 Pro Tips

- Start with Vercel for fastest deployment
- Use Railway for backend if needed
- Monitor API costs closely
- Set up error tracking (Sentry)
- Create backup strategy for data

---

1

**Common Issues:**
1. TypeScript errors → Run `npm run build` to check
2. API failures → Check environment variables
3. CORS errors → Update API route configurations

**The chat is now connected to real tools! 🎉**

Instead of fake tools that just returned mock data, your AI can now:
✅ Query actual Atlas MemberClicks data
✅ Access real member information
✅ Get live event details
✅ Generate reports from current data
✅ Perform real chamber management tasks
