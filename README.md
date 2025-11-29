# MagentaA11y MCP Server + REST API

Provides accessibility acceptance criteria from [MagentaA11y](https://github.com/tmobile/magentaA11y) via:
1. **MCP Server** (stdio) for Claude Desktop, Cursor, VSCode
2. **REST API** (HTTP) for web apps, LLMs - deployed to Netlify as serverless functions

Parses markdown into `content.json`, loads into memory with Fuse.js search indices for <5ms responses. 11 tools covering 51 web + 42 native components.

## Available Tools

**Web:** `list_web_components`, `get_web_component`, `search_web_criteria`  
**Native:** `list_native_components`, `get_native_component`, `search_native_criteria`  
**Formats:** `get_component_gherkin`, `get_component_condensed`, `get_component_developer_notes`, `get_component_native_notes`, `list_component_formats`

## Quick Start

```bash
npm install && npm run build
```

- **MCP Server**: Configure IDE paths below
- **REST API**: Deploy to Netlify or run `npm run start:api` locally

## MCP Configuration

Add absolute path to `build/index.js` in your IDE config:

### Cursor
**File:** `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
```json
{
  "mcpServers": {
    "magentaa11y": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/magentaa11y-mcp/build/index.js"]
    }
  }
}
```

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
    "type": "sse",
    "url": "https://your-site.netlify.app"
  }
}
```
Replace `your-site.netlify.app` with your actual Netlify deployment URL.

### Claude Desktop (Local)
**File:** `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "magentaa11y": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/magentaa11y-mcp/build/index.js"]
    }
  }
}
```

### Claude Desktop (Remote - Netlify)
**File:** `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "magentaa11y": {
      "url": "https://your-site.netlify.app"
    }
  }
}
```

**Restart IDE after configuration.**

## Commands

`npm run build` - Full build | `npm run sync` - Update content | `npm start` - Test MCP (stdio) | `npm run start:http` - Run HTTP/SSE server locally

## Deployment

Push to GitHub and connect to Netlify. The `netlify.toml` and `netlify/functions/api.js` will automatically set up the MCP server over SSE.

## Resources

[MagentaA11y](https://www.magentaa11y.com/) • [MCP](https://modelcontextprotocol.io/) • [WCAG](https://www.w3.org/WAI/WCAG21/quickref/)

**License:** Apache-2.0
