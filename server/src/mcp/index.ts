import 'dotenv/config';
import { startMcpServer } from './mcpServer.js';

startMcpServer().catch((err) => {
  process.stderr.write(`MCP Server fatal error: ${err}\n`);
  process.exit(1);
});
