// Netlify function for MCP over HTTP (stateless)
import { ContentLoader } from '../../build/content-loader.js';

const contentLoader = new ContentLoader();
let isInitialized = false;

// Initialize content
let initPromise = null;
const initialize = async () => {
  if (!initPromise) {
    initPromise = contentLoader.initialize().then(() => {
      isInitialized = true;
    });
  }
  return initPromise;
};

// Tool definitions
const tools = [
  {
    name: 'list_web_components',
    description: 'List all available web accessibility components',
    inputSchema: { type: 'object', properties: { category: { type: 'string' } } },
  },
  {
    name: 'get_web_component',
    description: 'Get detailed accessibility criteria for a web component',
    inputSchema: {
      type: 'object',
      properties: { component: { type: 'string' } },
      required: ['component'],
    },
  },
  {
    name: 'search_web_criteria',
    description: 'Search web accessibility criteria',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' }, max_results: { type: 'number', default: 10 } },
      required: ['query'],
    },
  },
  {
    name: 'list_native_components',
    description: 'List all available native accessibility components',
    inputSchema: { type: 'object', properties: { category: { type: 'string' } } },
  },
  {
    name: 'get_native_component',
    description: 'Get detailed accessibility criteria for a native component',
    inputSchema: {
      type: 'object',
      properties: { component: { type: 'string' } },
      required: ['component'],
    },
  },
  {
    name: 'search_native_criteria',
    description: 'Search native accessibility criteria',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' }, max_results: { type: 'number', default: 10 } },
      required: ['query'],
    },
  },
  {
    name: 'get_component_gherkin',
    description: 'Get Gherkin-style acceptance criteria',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['web', 'native'] },
        component: { type: 'string' },
      },
      required: ['platform', 'component'],
    },
  },
  {
    name: 'get_component_condensed',
    description: 'Get condensed acceptance criteria',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['web', 'native'] },
        component: { type: 'string' },
      },
      required: ['platform', 'component'],
    },
  },
  {
    name: 'get_component_developer_notes',
    description: 'Get developer implementation notes',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['web', 'native'] },
        component: { type: 'string' },
      },
      required: ['platform', 'component'],
    },
  },
  {
    name: 'get_component_native_notes',
    description: 'Get platform-specific developer notes',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['ios', 'android'] },
        component: { type: 'string' },
      },
      required: ['platform', 'component'],
    },
  },
  {
    name: 'list_component_formats',
    description: 'List available content formats for a component',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['web', 'native'] },
        component: { type: 'string' },
      },
      required: ['platform', 'component'],
    },
  },
];

// Tool handler
async function handleToolCall(name, args) {
  try {
    switch (name) {
      case 'list_web_components': {
        const components = contentLoader.listComponents('web', args?.category);
        const categories = contentLoader.getCategories('web');
        return { content: [{ type: 'text', text: JSON.stringify({ components, categories }, null, 2) }] };
      }
      case 'get_web_component': {
        const data = await contentLoader.getComponent('web', args.component);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }
      case 'search_web_criteria': {
        const results = await contentLoader.search('web', args.query, args.max_results || 10);
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
      }
      case 'list_native_components': {
        const components = contentLoader.listComponents('native', args?.category);
        const categories = contentLoader.getCategories('native');
        return { content: [{ type: 'text', text: JSON.stringify({ components, categories }, null, 2) }] };
      }
      case 'get_native_component': {
        const data = await contentLoader.getComponent('native', args.component);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }
      case 'search_native_criteria': {
        const results = await contentLoader.search('native', args.query, args.max_results || 10);
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
      }
      case 'get_component_gherkin': {
        const content = await contentLoader.getComponentContent(args.platform, args.component, 'gherkin');
        return { content: [{ type: 'text', text: content }] };
      }
      case 'get_component_condensed': {
        const content = await contentLoader.getComponentContent(args.platform, args.component, 'condensed');
        return { content: [{ type: 'text', text: content }] };
      }
      case 'get_component_developer_notes': {
        const content = await contentLoader.getComponentContent(args.platform, args.component, 'developerNotes');
        return { content: [{ type: 'text', text: content }] };
      }
      case 'get_component_native_notes': {
        const format = args.platform === 'ios' ? 'iosDeveloperNotes' : 'androidDeveloperNotes';
        const content = await contentLoader.getComponentContent('native', args.component, format);
        return { content: [{ type: 'text', text: content }] };
      }
      case 'list_component_formats': {
        const formats = contentLoader.getAvailableFormats(args.platform, args.component);
        const component = await contentLoader.getComponent(args.platform, args.component);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              component: args.component,
              displayName: component.label,
              platform: args.platform,
              availableFormats: formats,
            }, null, 2),
          }],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: error.message }, null, 2) }],
      isError: true,
    };
  }
}

// Netlify serverless function handler
export default async (req) => {
  try {
    // Handle OPTIONS for CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Handle GET for info
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          name: 'MagentaA11y MCP Server',
          version: '1.0.0',
          transport: 'HTTP',
          message: 'Send POST requests to interact with MCP server',
          endpoint: '/mcp'
        }), 
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Initialize content on first request
    if (!isInitialized) await initialize();

    // Parse request body
    const body = await req.json();

    // Handle MCP JSON-RPC requests
    let response;
    
    if (body.method === 'initialize') {
      response = {
        jsonrpc: '2.0',
        id: body.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'magentaa11y-mcp',
            version: '1.0.0'
          }
        }
      };
    }
    else if (body.method === 'tools/list') {
      response = {
        jsonrpc: '2.0',
        id: body.id,
        result: { tools }
      };
    }
    else if (body.method === 'tools/call') {
      const result = await handleToolCall(body.params.name, body.params.arguments);
      response = {
        jsonrpc: '2.0',
        id: body.id,
        result
      };
    }
    else {
      response = {
        jsonrpc: '2.0',
        id: body.id,
        error: {
          code: -32601,
          message: `Method not found: ${body.method}`
        }
      };
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('MCP error:', error);
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
          data: error.message
        },
        id: null
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};

// Export path config
export const config = {
  path: '/mcp'
};
