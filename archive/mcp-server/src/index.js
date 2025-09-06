#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class FlashcardMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'flashcard-research-synthesizer',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name');

      const resources = projects?.map(project => ({
        uri: `mcp://projects/${project.id}`,
        mimeType: 'application/json',
        name: `Project: ${project.name}`,
        description: `Research cards for project "${project.name}"`,
      })) || [];

      return { resources };
    });

    // Read specific resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      if (uri.startsWith('mcp://projects/')) {
        const projectId = uri.replace('mcp://projects/', '');
        
        // Get project with all cards and attachments
        const { data: project } = await supabase
          .from('projects')
          .select(`
            *,
            cards (
              *,
              attachments (*)
            )
          `)
          .eq('id', projectId)
          .single();

        if (!project) {
          throw new McpError(ErrorCode.InvalidRequest, `Project not found: ${projectId}`);
        }

        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(project, null, 2),
          }],
        };
      }

      if (uri.startsWith('mcp://cards/')) {
        const cardId = uri.replace('mcp://cards/', '');
        
        const { data: card } = await supabase
          .from('cards')
          .select(`
            *,
            attachments (*),
            projects (name)
          `)
          .eq('id', cardId)
          .single();

        if (!card) {
          throw new McpError(ErrorCode.InvalidRequest, `Card not found: ${cardId}`);
        }

        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(card, null, 2),
          }],
        };
      }

      throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'synthesize',
            description: 'Synthesize research findings from a project into a structured narrative with citations',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: 'string',
                  description: 'UUID of the project to synthesize',
                },
                citationStyle: {
                  type: 'string',
                  enum: ['apa', 'mla', 'chicago', 'numeric'],
                  default: 'apa',
                  description: 'Citation style to use',
                },
                stylePreset: {
                  type: 'string',
                  enum: ['academic', 'executive', 'narrative', 'technical'],
                  default: 'academic',
                  description: 'Writing style preset',
                },
              },
              required: ['projectId'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'synthesize') {
        return await this.handleSynthesize(args);
      }

      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    });
  }

  async handleSynthesize(args) {
    const { projectId, citationStyle = 'apa', stylePreset = 'academic' } = args;

    try {
      // Get project with all cards and attachments
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          cards (
            *,
            attachments (*)
          )
        `)
        .eq('id', projectId)
        .single();

      if (error || !project) {
        throw new McpError(ErrorCode.InvalidRequest, `Project not found: ${projectId}`);
      }

      // Prepare synthesis data
      const synthesisData = {
        project: {
          name: project.name,
          cardCount: project.cards.length,
        },
        cards: project.cards.map(card => ({
          body: card.body,
          reference: card.reference,
          attachments: card.attachments,
          created_at: card.created_at,
        })),
        parameters: {
          citationStyle,
          stylePreset,
        },
      };

      // Create synthesis prompt
      const prompt = this.createSynthesisPrompt(synthesisData);

      // Store synthesis request (optional)
      await supabase
        .from('syntheses')
        .insert({
          project_id: projectId,
          markdown: 'Synthesis in progress...',
          bibliography: [],
        });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            projectName: project.name,
            cardCount: project.cards.length,
            synthesisPrompt: prompt,
            data: synthesisData,
          }, null, 2),
        }],
      };

    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Synthesis failed: ${error.message}`);
    }
  }

  createSynthesisPrompt(data) {
    const { project, cards, parameters } = data;
    
    return `# Research Synthesis Request

## Project: ${project.name}
**Cards to synthesize:** ${project.cardCount}
**Citation style:** ${parameters.citationStyle}
**Style preset:** ${parameters.stylePreset}

## Instructions:
Please synthesize the following research findings into a coherent narrative. Include proper citations and identify any gaps in the research.

## Research Cards:
${cards.map((card, index) => `
### Card ${index + 1}
**Finding:** ${card.body}
${card.reference ? `**Reference:** ${JSON.stringify(card.reference, null, 2)}` : ''}
${card.attachments?.length ? `**Attachments:** ${card.attachments.length} files` : ''}
---
`).join('\n')}

## Expected Output:
Return a JSON object with:
- markdown: The synthesized narrative
- bibliography: Array of formatted citations  
- toc: Table of contents
- gaps: Identified research gaps or contradictions
`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Flashcard MCP Server running on stdio');
  }
}

// Start the server
const server = new FlashcardMCPServer();
server.run().catch(console.error);

