# Setting Up Atlas MCP Server with Claude Desktop

## Quick Setup for This Computer (macOS)

### 1. Set up Environment Variables

First, create a `.env` file with your credentials:
```bash
cd /Users/ukiiki/atlas-mcp-server
cp .env.example .env
```

Edit `.env` with your actual credentials:
```env
ATLAS_CLIENT_SECRET=your_actual_client_secret_here
ATLAS_CLIENT_ID=CarlsbadChamber
ATLAS_TENANT=carlsbad
```

### 2. Build the Server
```bash
cd /Users/ukiiki/atlas-mcp-server
npm run build
```

### 3. Configure Claude Desktop

The Claude Desktop configuration file is located at:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Option A: Copy the entire configuration (includes credentials)**
```bash
cp claude_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Option B: Add to existing configuration**
If you already have other MCP servers configured, add this to your existing `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "atlas-mcp-server": {
      "command": "node",
      "args": ["/Users/ukiiki/atlas-mcp-server/dist/server.js"],
      "env": {
        "ATLAS_CLIENT_SECRET": "1bd58eb5-f765-4fee-a139-312c9d4dead2",
        "ATLAS_CLIENT_ID": "CarlsbadChamber",
        "ATLAS_TENANT": "carlsbad"
      }
    }
  }
}
```

### 4. Restart Claude Desktop
Close and reopen Claude Desktop completely for the changes to take effect.

### 5. Test the Connection
In Claude Desktop, you should now be able to use tools like:
- `get_members` - Get all Atlas MemberClicks members
- `get_committees` - Get all committees
- `check_member_notifications` - Check for new members

---

## Setup on Different Computers

### For macOS

1. **Copy the project folder** to the new computer
2. **Install Node.js** (18 or higher) from https://nodejs.org
3. **Install dependencies and build:**
   ```bash
   cd /path/to/atlas-mcp-server
   npm install
   npm run build
   ```
4. **Configure Claude Desktop:**
   ```bash
   # Create config directory if it doesn't exist
   mkdir -p ~/Library/Application\ Support/Claude
   
   # Update the path in claude_config.json to match the new location
   # Then copy it:
   cp claude_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```
5. **Restart Claude Desktop**

### For Windows

1. **Copy the project folder** to the new computer
2. **Install Node.js** (18 or higher) from https://nodejs.org
3. **Install dependencies and build:**
   ```cmd
   cd C:\path\to\atlas-mcp-server
   npm install
   npm run build
   ```
4. **Configure Claude Desktop:**
   
   Configuration file location: `%APPDATA%\Claude\claude_desktop_config.json`
   
   Create/edit the file with:
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
5. **Restart Claude Desktop**

### For Linux

1. **Copy the project folder** to the new computer
2. **Install Node.js** (18 or higher):
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Or download from https://nodejs.org
   ```
3. **Install dependencies and build:**
   ```bash
   cd /path/to/atlas-mcp-server
   npm install
   npm run build
   ```
4. **Configure Claude Desktop:**
   
   Configuration file location: `~/.config/Claude/claude_desktop_config.json`
   
   ```bash
   # Create config directory if it doesn't exist
   mkdir -p ~/.config/Claude
   
   # Create/edit the configuration file
   cat > ~/.config/Claude/claude_desktop_config.json << 'EOF'
   {
     "mcpServers": {
       "atlas-mcp-server": {
         "command": "node",
         "args": ["/path/to/atlas-mcp-server/dist/server.js"],
         "env": {}
       }
     }
   }
   EOF
   ```
5. **Restart Claude Desktop**

---

## Transferring the Project

### Method 1: Copy Files Directly
1. Zip the entire `/Users/ukiiki/atlas-mcp-server` folder
2. Extract on the new computer
3. Follow the setup instructions above for the target OS

### Method 2: Git Repository (Recommended)
1. **Initialize git repo:**
   ```bash
   cd /Users/ukiiki/atlas-mcp-server
   git init
   git add .
   git commit -m "Initial Atlas MCP Server setup"
   ```

2. **Push to GitHub/GitLab:**
   ```bash
   # Create repo on GitHub, then:
   git remote add origin https://github.com/yourusername/atlas-mcp-server.git
   git push -u origin main
   ```

3. **Clone on new computer:**
   ```bash
   git clone https://github.com/yourusername/atlas-mcp-server.git
   cd atlas-mcp-server
   npm install
   npm run build
   ```

---

## Troubleshooting

### Server Not Starting
1. Check Node.js version: `node --version` (should be 18+)
2. Rebuild the project: `npm run rebuild`
3. Check for errors: `npm run dev`

### Claude Desktop Not Finding Server
1. Verify the path in `claude_desktop_config.json` is correct
2. Ensure the `dist/server.js` file exists
3. Check Claude Desktop logs in the application

### Permission Issues (macOS/Linux)
```bash
chmod +x dist/server.js
```

### Path Issues on Windows
- Use forward slashes `/` or double backslashes `\\` in JSON
- Avoid spaces in paths, or use quotes

---

## Testing the Setup

Once configured, test in Claude Desktop:

1. **Basic test:**
   ```
   Can you get all members from Atlas MemberClicks?
   ```

2. **Committee test:**
   ```
   Show me all committees and their members
   ```

3. **New member monitoring:**
   ```
   Check for any new members in the last 3 days
   ```

The tools should now be available and working with your Atlas MemberClicks data!
