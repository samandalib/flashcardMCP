# Flashcard MCP Server

Model Context Protocol (MCP) server for the Flashcard Research Synthesizer.

## Features

- **Resources**: Access projects and cards via MCP URIs
- **Tools**: Synthesize research findings into structured narratives

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp env.example .env
# Edit .env with your Supabase credentials
```

3. Run the server:
```bash
npm start
```

## MCP Resources

- `mcp://projects/{id}` - Get project with all cards and attachments
- `mcp://cards/{id}` - Get specific card with attachments

## MCP Tools

### synthesize
Synthesize research findings from a project into a structured narrative.

**Parameters:**
- `projectId` (required) - UUID of the project
- `citationStyle` (optional) - Citation style: 'apa', 'mla', 'chicago', 'numeric' 
- `stylePreset` (optional) - Writing style: 'academic', 'executive', 'narrative', 'technical'

**Returns:**
JSON object with synthesis data and formatted prompt for LLM processing.

## Usage with Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "flashcard-research": {
      "command": "node",
      "args": ["path/to/mcp-server/src/index.js"],
      "env": {
        "SUPABASE_URL": "your-url",
        "SUPABASE_SERVICE_ROLE_KEY": "your-key"
      }
    }
  }
}
```

