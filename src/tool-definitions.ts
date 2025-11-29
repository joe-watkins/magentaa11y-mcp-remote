/**
 * Shared MCP Tool Definitions
 * Used by both stdio (local) and HTTP (Netlify) transports
 */

export const TOOL_DEFINITIONS = [
  // Web Platform Tools
  {
    name: 'list_web_components',
    description: 'List all available web accessibility components from MagentaA11y. Optionally filter by category (e.g., controls, forms, components).',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category filter (e.g., "controls", "forms", "components")',
        },
      },
    },
  },
  {
    name: 'get_web_component',
    description: 'Get detailed accessibility criteria for a specific web component. Returns acceptance criteria, WCAG mappings, code examples, and implementation guidelines.',
    inputSchema: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          description: 'Component name (e.g., "button", "checkbox", "text-input")',
        },
        include_code_examples: {
          type: 'boolean',
          description: 'Include code examples in response (default: true)',
          default: true,
        },
      },
      required: ['component'],
    },
  },
  {
    name: 'search_web_criteria',
    description: 'Search web accessibility criteria using keywords. Find criteria related to WCAG guidelines, implementation patterns, or specific accessibility requirements.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term or phrase (e.g., "focus indicator", "aria-label")',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  // Native Platform Tools
  {
    name: 'list_native_components',
    description: 'List all available native (iOS/Android) accessibility components from MagentaA11y. Optionally filter by category.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category filter (e.g., "controls", "components")',
        },
      },
    },
  },
  {
    name: 'get_native_component',
    description: 'Get detailed accessibility criteria for a specific native component. Returns iOS and Android implementation details, platform-specific properties, and code examples.',
    inputSchema: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          description: 'Component name (e.g., "button", "switch", "picker")',
        },
        include_code_examples: {
          type: 'boolean',
          description: 'Include platform-specific code examples (default: true)',
          default: true,
        },
      },
      required: ['component'],
    },
  },
  {
    name: 'search_native_criteria',
    description: 'Search native accessibility criteria using keywords. Find platform-specific implementation details for iOS (VoiceOver) and Android (TalkBack).',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term or phrase (e.g., "voiceover", "talkback", "accessibility label")',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  // Content Format Tools
  {
    name: 'get_component_gherkin',
    description: 'Get Gherkin-style acceptance criteria for a component. These are detailed Given/When/Then scenarios for testing accessibility.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['web', 'native'],
          description: 'Platform (web or native)',
        },
        component: {
          type: 'string',
          description: 'Component name (e.g., "button", "checkbox")',
        },
      },
      required: ['platform', 'component'],
    },
  },
  {
    name: 'get_component_condensed',
    description: 'Get condensed acceptance criteria for a component. These are shorter, more focused testing instructions.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['web', 'native'],
          description: 'Platform (web or native)',
        },
        component: {
          type: 'string',
          description: 'Component name (e.g., "button", "checkbox")',
        },
      },
      required: ['platform', 'component'],
    },
  },
  {
    name: 'get_component_developer_notes',
    description: 'Get developer implementation notes for a component. Includes code examples, WCAG mappings, and technical guidance.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['web', 'native'],
          description: 'Platform (web or native)',
        },
        component: {
          type: 'string',
          description: 'Component name (e.g., "button", "checkbox")',
        },
      },
      required: ['platform', 'component'],
    },
  },
  {
    name: 'get_component_native_notes',
    description: 'Get platform-specific developer notes for native components (iOS or Android implementation details).',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['ios', 'android'],
          description: 'Native platform (ios or android)',
        },
        component: {
          type: 'string',
          description: 'Component name (e.g., "button", "switch")',
        },
      },
      required: ['platform', 'component'],
    },
  },
  {
    name: 'list_component_formats',
    description: 'List all available content formats for a specific component (e.g., gherkin, condensed, developer notes).',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['web', 'native'],
          description: 'Platform (web or native)',
        },
        component: {
          type: 'string',
          description: 'Component name (e.g., "button", "checkbox")',
        },
      },
      required: ['platform', 'component'],
    },
  },
];
