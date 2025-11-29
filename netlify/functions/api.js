// Netlify function for MCP over SSE
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ContentLoader } from '../../build/content-loader.js';
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

const app = express();
const contentLoader = new ContentLoader();
let isInitialized = false;

app.use(cors());
app.use(express.json());

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

// Create MCP server
const server = new Server(
  { name: 'magentaa11y-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
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
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
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
});

// SSE endpoint
app.get('/sse', async (req, res) => {
  if (!isInitialized) await initialize();
  
  const transport = new SSEServerTransport('/message', res);
  await server.connect(transport);
});

// Message endpoint
app.post('/message', async (req, res) => {
  res.status(200).end();
});

// Info
app.get('/', (req, res) => {
  res.json({
    name: 'MagentaA11y MCP Server',
    version: '1.0.0',
    transport: 'SSE',
    endpoints: { sse: '/sse', message: '/message' },
  });
});

export const handler = serverless(app);
