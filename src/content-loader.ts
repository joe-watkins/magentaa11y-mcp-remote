/**
 * Content loading and indexing system for MagentaA11y content
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Fuse from 'fuse.js';

// Get the directory of this module - use a function to avoid duplicate declarations
function getContentJsonPath(): string {
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  return path.join(dirname, '..', 'data', 'content.json');
}

const CONTENT_JSON_PATH = getContentJsonPath();

export interface ContentItem {
  label: string;
  name: string;
  type?: string;
  generalNotes?: string;
  gherkin?: string;
  condensed?: string;
  criteria?: string;
  videos?: string;
  androidDeveloperNotes?: string;
  iosDeveloperNotes?: string;
  developerNotes?: string;
  categoryName?: string;
  categoryLabel?: string;
}

export interface ContentCategory {
  label: string;
  name: string;
  children: ContentItem[];
}

export interface ContentStructure {
  web: ContentCategory[];
  native: ContentCategory[];
  'how-to-test': ContentCategory[];
}

export interface ComponentMetadata {
  name: string;
  displayName: string;
  category: string;
  platform: 'web' | 'native';
  hasGherkin?: boolean;
  hasCondensed?: boolean;
  hasDeveloperNotes?: boolean;
  hasAndroidNotes?: boolean;
  hasIOSNotes?: boolean;
}

export interface SearchResult {
  component: string;
  displayName: string;
  category: string;
  categoryLabel: string;
  matches: SearchMatch[];
  relevance: number;
}

export interface SearchMatch {
  field: string;
  snippet: string;
}

export class ContentLoader {
  private content: ContentStructure | null = null;
  private webSearchIndex: Fuse<ContentItem> | null = null;
  private nativeSearchIndex: Fuse<ContentItem> | null = null;
  private indexed = false;

  /**
   * Initialize and index all content
   */
  async initialize(): Promise<void> {
    if (this.indexed) return;

    try {
      const contentRaw = await fs.readFile(CONTENT_JSON_PATH, 'utf-8');
      this.content = JSON.parse(contentRaw) as ContentStructure;

      // Create search indices
      this.webSearchIndex = this.createSearchIndex('web');
      this.nativeSearchIndex = this.createSearchIndex('native');
      
      this.indexed = true;
      
      const webCount = this.content.web.reduce((count, category) => count + category.children.length, 0);
      const nativeCount = this.content.native.reduce((count, category) => count + category.children.length, 0);
      
      console.error(`Indexed ${webCount} web and ${nativeCount} native components from content.json`);
    } catch (error) {
      console.error('Error loading content.json:', error);
      throw new Error('Failed to initialize content. Ensure content.json exists in magentaA11y/src/shared/');
    }
  }

  /**
   * Create search index for a platform
   */
  private createSearchIndex(platform: 'web' | 'native'): Fuse<ContentItem> {
    if (!this.content) throw new Error('Content not loaded');

    const items: ContentItem[] = [];
    const categories = this.content[platform];

    for (const category of categories) {
      for (const item of category.children) {
        items.push({
          ...item,
          categoryName: category.name,
          categoryLabel: category.label,
        } as ContentItem & { categoryName: string; categoryLabel: string });
      }
    }

    return new Fuse(items, {
      keys: [
        { name: 'label', weight: 0.3 },
        { name: 'name', weight: 0.3 },
        { name: 'generalNotes', weight: 0.1 },
        { name: 'gherkin', weight: 0.1 },
        { name: 'condensed', weight: 0.1 },
        { name: 'developerNotes', weight: 0.1 }
      ],
      threshold: 0.3,
    });
  }

  /**
   * Format component name for display
   */
  private formatDisplayName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * List components for a platform
   */
  listComponents(platform: 'web' | 'native', category?: string): ComponentMetadata[] {
    if (!this.content) throw new Error('Content not loaded');

    const categories = this.content[platform];
    const components: ComponentMetadata[] = [];

    for (const cat of categories) {
      if (category && cat.name !== category) continue;

      for (const item of cat.children) {
        components.push({
          name: item.name,
          displayName: item.label,
          category: cat.name,
          platform,
          hasGherkin: !!item.gherkin,
          hasCondensed: !!item.condensed,
          hasDeveloperNotes: !!item.developerNotes,
          hasAndroidNotes: !!item.androidDeveloperNotes,
          hasIOSNotes: !!item.iosDeveloperNotes,
        });
      }
    }

    return components.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get categories for a platform
   */
  getCategories(platform: 'web' | 'native'): string[] {
    if (!this.content) throw new Error('Content not loaded');
    
    return this.content[platform].map(cat => cat.name).sort();
  }

  /**
   * Get component details
   */
  async getComponent(platform: 'web' | 'native', componentName: string): Promise<ContentItem> {
    if (!this.content) throw new Error('Content not loaded');

    const categories = this.content[platform];
    
    for (const category of categories) {
      const component = category.children.find(item => item.name === componentName);
      if (component) {
        return {
          ...component,
          categoryName: category.name,
          categoryLabel: category.label,
        };
      }
    }

    throw new Error(`Component "${componentName}" not found`);
  }

  /**
   * Get specific content format for a component
   */
  async getComponentContent(platform: 'web' | 'native', componentName: string, format: 'gherkin' | 'condensed' | 'developerNotes' | 'androidDeveloperNotes' | 'iosDeveloperNotes'): Promise<string> {
    const component = await this.getComponent(platform, componentName);
    
    const content = component[format];
    if (!content) {
      throw new Error(`${format} content not available for component "${componentName}"`);
    }
    
    return content;
  }



  /**
   * Search components
   */
  async search(platform: 'web' | 'native', query: string, maxResults: number = 10): Promise<SearchResult[]> {
    const searchIndex = platform === 'web' ? this.webSearchIndex : this.nativeSearchIndex;
    if (!searchIndex) throw new Error('Search index not initialized');

    const results = searchIndex.search(query, { limit: maxResults });

    return results.map(result => {
      const item = result.item;
      const matches: SearchMatch[] = [];

      // Extract matches from different fields
      if (result.matches) {
        for (const match of result.matches) {
          if (match.value && match.key) {
            const snippet = this.extractSnippet(match.value, query);
            matches.push({
              field: match.key,
              snippet,
            });
          }
        }
      }

      return {
        component: item.name,
        displayName: item.label,
        category: item.categoryName || '',
        categoryLabel: item.categoryLabel || '',
        matches,
        relevance: 1 - (result.score || 0),
      };
    });
  }

  /**
   * Extract snippet around query match
   */
  private extractSnippet(text: string, query: string, maxLength: number = 200): string {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);
    
    if (index === -1) return text.substring(0, maxLength);
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 150);
    
    let snippet = text.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
  }

  /**
   * Get similar component names for suggestions
   */
  getSimilarComponents(platform: 'web' | 'native', componentName: string, limit: number = 5): string[] {
    const components = this.listComponents(platform);
    
    const fuse = new Fuse(components, {
      keys: ['name', 'displayName'],
      threshold: 0.5,
    });

    const results = fuse.search(componentName);
    return results.slice(0, limit).map(r => r.item.name);
  }

  /**
   * Get all available formats for a component
   */
  getAvailableFormats(platform: 'web' | 'native', componentName: string): string[] {
    try {
      const components = this.listComponents(platform);
      const component = components.find(c => c.name === componentName);
      
      if (!component) return [];
      
      const formats: string[] = [];
      if (component.hasGherkin) formats.push('gherkin');
      if (component.hasCondensed) formats.push('condensed');
      if (component.hasDeveloperNotes) formats.push('developerNotes');
      if (component.hasAndroidNotes) formats.push('androidDeveloperNotes');
      if (component.hasIOSNotes) formats.push('iosDeveloperNotes');
      
      return formats;
    } catch {
      return [];
    }
  }
}

