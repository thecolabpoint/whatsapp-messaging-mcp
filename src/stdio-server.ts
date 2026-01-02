#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './logging/logger.js';
import './config/env.js';
import { createMcpServer } from './mcp.js';

async function main(): Promise<void> {
  const mcp = createMcpServer();
  const transport = new StdioServerTransport();

  await mcp.connect(transport);

  logger.info('Messaging MCP server is running (STDIO transport)');
}

main().catch((err) => {
  logger.error({ err }, 'Fatal error');
  process.exit(1);
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
