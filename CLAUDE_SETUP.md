# Setting Up the Atlas MCP Server

This guide provides instructions for setting up the Atlas MCP (Model-Context-Protocol) server to connect with your Atlas MemberClicks data and use it within Claude Desktop.

## 1. Prerequisites

- **Node.js**: Version 18 or higher. You can download it from [https://nodejs.org](https://nodejs.org).
- **Git**: For cloning the repository.
- **Claude Desktop**: The application where you will use the server.

## 2. Installation

First, clone the repository to your local machine and install the dependencies.

```bash
# Clone the repository
git clone https://github.com/your-username/atlas-mcp-server.git

# Navigate into the project directory
cd atlas-mcp-server

# Install dependencies
npm install

# Compile the TypeScript code
npm run build
```

This will create a `dist` directory containing the compiled `server.js` file.

## 3. Configuration

The server requires API credentials to connect to Atlas MemberClicks. There are two ways to provide these credentials, depending on how you run the server.

### Method A: For Local Development (using `.env`)

If you want to run the server directly from your terminal (e.g., for testing), you can use a `.env` file.

1.  **Create a `.env` file** by copying the example file:
    ```bash
    cp .env.example .env
    ```

2.  **Edit the `.env` file** with your actual credentials:
    ```env
    # Atlas MemberClicks API Configuration
    ATLAS_CLIENT_SECRET=your_client_secret_here
    OPENAI_API_KEY=your_openai_api_key_here
    ATLAS_CLIENT_ID=CarlsbadChamber
    ATLAS_TENANT=carlsbad
    ```

3.  **Run the server**:
    ```bash
    npm start
    ```

### Method B: For Claude Desktop Integration

To use the server with Claude Desktop, you must add it to the `claude_desktop_config.json` file. This is the **recommended method** for using the server with Claude.

1.  **Locate your Claude Desktop configuration file.** The location varies by operating system:
    *   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
    *   **Windows**: `%APPDATA%\\Claude\\claude_desktop_config.json`
    *   **Linux**: `~/.config/Claude/claude_desktop_config.json`

2.  **Edit the configuration file.** If the file doesn't exist, create it. Add the following JSON structure. If you already have other servers configured, add `atlas-mcp-server` to the `mcpServers` object.

    **IMPORTANT**: You must replace `/path/to/your/atlas-mcp-server` with the actual, absolute path to where you cloned the project on your computer.

    ```json
    {
      "mcpServers": {
        "atlas-mcp-server": {
          "command": "node",
          "args": ["/path/to/your/atlas-mcp-server/dist/server.js"],
          "env": {
            "ATLAS_CLIENT_SECRET": "your_atlas_client_secret_here",
            "ATLAS_CLIENT_ID": "CarlsbadChamber",
            "ATLAS_TENANT": "carlsbad",
            "OPENAI_API_KEY": "your_openai_api_key_here"
          }
        }
      }
    }
    ```
    *   **Windows Path Example**: `C:\\Users\\YourUser\\projects\\atlas-mcp-server\\dist\\server.js` (note the double backslashes `\\`).
    *   **macOS/Linux Path Example**: `/Users/youruser/projects/atlas-mcp-server/dist/server.js`.

3.  **Restart Claude Desktop.** Close and reopen the application completely for the changes to take effect.

## 4. Troubleshooting

### "Error: ATLAS_CLIENT_SECRET environment variable is required"

This is the most common error and means the server did not receive the required credentials.

-   **If using Claude Desktop**: This error happens because the `env` block in your `claude_desktop_config.json` is either missing, empty, or does not contain `ATLAS_CLIENT_SECRET`. Double-check your configuration from **Step 3, Method B**.
-   **If using local development**: Your `.env` file is likely missing or does not contain the `ATLAS_CLIENT_SECRET` variable.

### Server Not Starting in Claude Desktop

1.  **Verify the path**: Ensure the path in the `args` section of `claude_desktop_config.json` is the correct and absolute path to the `dist/server.js` file.
2.  **Check for `dist/server.js`**: Make sure you have run `npm run build` and the file exists.
3.  **Check Claude Desktop logs**: The application may have logs that provide more details.

### General Issues

-   **Check Node.js version**: Run `node --version` in your terminal to ensure you are using version 18 or higher.
-   **Rebuild the project**: Run `npm run rebuild` to clean and rebuild the project from scratch.

## 5. Testing the Connection

Once the server is configured and running in Claude Desktop, you can test it with prompts like:

-   `Can you get all members from Atlas MemberClicks?`
-   `Show me all committees and their members.`
-   `Check for any new members in the last 3 days.`

If the tools appear and return data, your setup is successful!
