# MagentaA11y MCP Server

Provides accessibility acceptance criteria from [MagentaA11y](https://github.com/tmobile/magentaA11y) via MCP protocol.

**Local:** stdio transport for Claude Desktop, Cursor, VSCode  
**Remote:** HTTP transport deployed to Netlify serverless functions

Parses markdown into `content.json`, loads into memory with Fuse.js search indices for <5ms responses. 11 tools covering 51 web + 42 native components.

## Technology Stack

This MCP server uses **Netlify Edge Functions** to provide stateless HTTP transport, exposing MCP tools via JSON-RPC protocol at the `/mcp` endpoint. The `netlify/functions/api.js` handler implements the full MCP lifecycle—initialization, tool listing, and tool execution—while managing in-memory content loading and CORS. Clients connect using `mcp-remote@next`, an NPX-installable proxy that bridges the HTTP transport to MCP-compatible IDEs like VSCode, Claude Desktop, and Cursor. This architecture enables zero-config remote deployment: push to GitHub, connect to Netlify, and any MCP client can instantly access the tools via `npx mcp-remote@next https://your-site.netlify.app/mcp`.

## Available Tools

**Web:** `list_web_components`, `get_web_component`, `search_web_criteria`  
**Native:** `list_native_components`, `get_native_component`, `search_native_criteria`  
**Formats:** `get_component_gherkin`, `get_component_condensed`, `get_component_developer_notes`, `get_component_native_notes`, `list_component_formats`

## Quick Start

```bash
npm install && npm run build
```

**Local MCP:** Configure IDE with stdio transport (see below)  
**Remote MCP:** Deploy to Netlify for HTTP transport access

## MCP Configuration
Add absolute path to `build/index.js` in your IDE config:

### VSCode (Local)
**File:** `%APPDATA%\Code\User\mcp.json`
```json
{
  "MagentaA11y MCP": {
    "type": "stdio",
    "command": "node",
    "args": ["/ABSOLUTE/PATH/TO/magentaa11y-mcp/build/index.js"]
  }
}
```

### VSCode (Remote - Netlify)
**File:** `%APPDATA%\Code\User\mcp.json`
```json
{
  "MagentaA11y MCP": {
    "command": "npx",
    "args": ["mcp-remote@next", "https://your-site.netlify.app/mcp"]
  }
}
```
Replace `your-site.netlify.app` with your actual Netlify deployment URL.

**Restart IDE after configuration.**

## Commands

`npm run build` - Full build  
`npm run sync` - Update content  
`npm start` - Test MCP (stdio)

## Deployment

Push to GitHub and connect to Netlify. The `netlify.toml` and `netlify/functions/api.js` are configured for stateless HTTP transport at `/mcp` endpoint.

**Note:** Remote MCP clients use `mcp-remote@next` proxy for maximum compatibility with the HTTP transport.

## Resources

[MagentaA11y](https://www.magentaa11y.com/) • [MCP](https://modelcontextprotocol.io/) • [WCAG](https://www.w3.org/WAI/WCAG21/quickref/)

**License:** MIT
