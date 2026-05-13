import 'dotenv/config';
import { createApp } from './app.js';

const port = parseInt(process.env.PORT ?? '3001', 10);
const app = createApp();

app.listen(port, () => {
  console.log(`\n🚗 BMW AI Server v3.0 running at http://localhost:${port}`);
  console.log(`   Health:        http://localhost:${port}/health`);
  console.log(`   MCP (HTTP):    http://localhost:${port}/mcp`);
  console.log(`   OpenAPI spec:  http://localhost:${port}/openapi.yaml`);
  console.log(`   App manifest:  http://localhost:${port}/app-manifest.json`);
  console.log('\n6 MCP tools: search · compare · pricing · showrooms · booking · recommend');
  if (process.env.NGROK_URL) {
    console.log(`\n🌐 Public ngrok URL: ${process.env.NGROK_URL}`);
    console.log(`   ChatGPT MCP: ${process.env.NGROK_URL}/mcp`);
  }
  console.log('');
});
