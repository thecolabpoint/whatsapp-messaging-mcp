import http from 'node:http';
import { logger } from './logging/logger.js';
import './config/env.js';
import { env } from './config/env.js';
import { createMcpServer, createTransport } from './mcp.js';

async function main(): Promise<void> {
  const mcp = createMcpServer();
  const transport = createTransport();
  await mcp.connect(transport);

  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' || req.method === 'GET' || req.method === 'DELETE') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', async () => {
        const parsed = body ? JSON.parse(body) : undefined;
        await transport.handleRequest(req as any, res as any, parsed);
      });
      return;
    }
    res.statusCode = 405;
    res.end('Method Not Allowed');
  });

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Messaging MCP server is running (HTTP/SSE transport)');
  });
}

main().catch((err) => {
  logger.error({ err }, 'Fatal error');
  process.exit(1);
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
