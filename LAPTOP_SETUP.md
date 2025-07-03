# Setting Up Atlas MCP Server on Your Laptop

## Quick Laptop Setup Guide

### Option 1: From GitHub (Recommended)
1. **Push to GitHub first** (from this computer):
   ```bash
   # Create repo at https://github.com/yourusername/atlas-mcp-server
   git remote add origin https://github.com/yourusername/atlas-mcp-server.git
   git branch -M main
   git push -u origin main
   ```

2. **On your laptop**, clone and setup:
   ```bash
   git clone https://github.com/yourusername/atlas-mcp-server.git
   cd atlas-mcp-server
   npm install
   npm run build
   ```

### Option 2: Direct Transfer
1. **Copy this folder** `/Users/ukiiki/atlas-mcp-server` to your laptop
2. **On your laptop**:
   ```bash
   cd /path/to/atlas-mcp-server
   npm install
   npm run build
   ```

## Configure Claude Desktop on Laptop

### For macOS Laptop:
```bash
# Update the path in claude_config.json to match your laptop path
# Then copy it:
cp claude_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### For Windows Laptop:
1. **Edit `claude_config.json`** and change the path:
   ```json
   {
     "mcpServers": {
       "atlas-mcp-server": {
         "command": "node",
         "args": ["C:\\path\\to\\atlas-mcp-server\\dist\\server.js"],
         "env": {}
       }
     }
   }
   ```

2. **Copy to Claude config location**:
   ```cmd
   copy claude_config.json %APPDATA%\Claude\claude_desktop_config.json
   ```

### For Linux Laptop:
1. **Update path in claude_config.json**
2. **Copy config**:
   ```bash
   mkdir -p ~/.config/Claude
   cp claude_config.json ~/.config/Claude/claude_desktop_config.json
   ```

## Test on Laptop
1. **Restart Claude Desktop**
2. **Ask Claude**: *"Can you get all members from Atlas MemberClicks?"*

## Prerequisites for Laptop
- **Node.js 18+** (download from https://nodejs.org)
- **Claude Desktop** installed
- **Internet connection** for Atlas API access

## Troubleshooting
- **Path issues**: Make sure the path in `claude_config.json` points to your laptop's actual folder location
- **Permission issues**: Run `chmod +x dist/server.js` on macOS/Linux
- **Build errors**: Delete `node_modules` and run `npm install` again

Your Atlas MCP Server will be ready on your laptop!
