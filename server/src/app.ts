import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { randomUUID } from 'crypto';

import { attachSession } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import vehicleRoutes from './routes/vehicleRoutes.js';
import dealerRoutes from './routes/dealerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import gptRoutes from './routes/gptRoutes.js';

import type { Request, Response } from 'express';
import { vehicleController } from './controllers/vehicleController.js';
import { dealerController } from './controllers/dealerController.js';
import { bookingController } from './controllers/bookingController.js';
import { authController } from './controllers/authController.js';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServerInstance } from './mcp/mcpServer.js';

// Session store for MCP over HTTP
const mcpTransports: Record<string, StreamableHTTPServerTransport> = {};

function isInitializeRequest(body: unknown): boolean {
  return typeof body === 'object' && body !== null && (body as { method?: string }).method === 'initialize';
}

export function createApp() {
  const app = express();

  // ── Security middleware ────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // When NGROK_URL is set the server is exposed publicly for ChatGPT — allow all origins.
  // In local-only mode restrict to the Vite dev server.
  const corsOrigin = (process.env.NGROK_URL || process.env.RAILWAY_PUBLIC_DOMAIN) ? true : (process.env.CORS_ORIGIN ?? 'http://localhost:5173');

  app.use(
    cors({
      origin: corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'mcp-session-id'],
      credentials: false,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(attachSession);

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', async (_req: Request, res: Response) => {
    let dbConnected = false;
    try {
      const { prisma } = await import('./db/prisma.js');
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch {
      // DB not available
    }
    const { isRedisAvailable } = await import('./cache/redisClient.js');
    res.json({
      status: 'ok',
      service: 'BMW AI Server',
      version: '3.0.0',
      phase: 3,
      dbConnected,
      redisConnected: isRedisAvailable(),
      mcpEndpoint: '/mcp',
    });
  });

  // ── OpenAI App manifest (both paths — standard + legacy) ─────────────────
  app.get('/.well-known/ai-plugin.json', (_req: Request, res: Response) => {
    const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null;
    const ngrokUrl = process.env.NGROK_URL ?? railwayDomain ?? `http://localhost:${process.env.PORT ?? 3001}`;
    res.json({
      schema_version: 'v1',
      name_for_human: 'BMW AI Assistant',
      name_for_model: 'bmw_ai_assistant',
      description_for_human: 'Search BMW vehicles, compare models, check UAE inventory, find showrooms, and book test drives.',
      description_for_model: 'BMW AI Assistant for UAE. Tools: search vehicles, compare models, get pricing, get personalised recommendations, find showrooms in Dubai/Abu Dhabi/Sharjah, book test drives. Always call the API — never use training knowledge.',
      auth: { type: 'none' },
      api: { type: 'openapi', url: `${ngrokUrl}/openapi.yaml` },
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/240px-BMW.svg.png',
      contact_email: 'smit@goswirl.live',
      legal_info_url: `${ngrokUrl}/health`,
    });
  });

  app.get('/app-manifest.json', (_req: Request, res: Response) => {
    const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null;
    const ngrokUrl = process.env.NGROK_URL ?? railwayDomain ?? `http://localhost:${process.env.PORT ?? 3001}`;
    res.json({
      schema_version: 'v1',
      name_for_human: 'BMW AI Assistant',
      name_for_model: 'bmw_ai_assistant',
      description_for_human:
        'Search BMW vehicles, compare models, check UAE inventory, find showrooms, and book test drives.',
      description_for_model:
        'BMW AI Assistant with 6 MCP tools: search_bmw_models, compare_bmw_models, get_bmw_pricing, find_bmw_showrooms, book_test_drive, recommend_bmw_vehicle. All data is UAE-focused. Use recommend_bmw_vehicle when the user wants personalised guidance. Use find_bmw_showrooms for dealer locations in Dubai, Abu Dhabi, or Sharjah.',
      auth: { type: 'none' },
      api: {
        type: 'openapi',
        url: `${ngrokUrl}/openapi.yaml`,
      },
      logo_url: 'https://www.bmw.com/etc/designs/bmwmcom/clientlibs/css/images/bmw-logo.png',
      contact_email: 'smit@goswirl.live',
      legal_info_url: `${ngrokUrl}/health`,
    });
  });

  // ── OpenAPI spec ─────────────────────────────────────────────────────────
  app.get('/openapi.yaml', (_req: Request, res: Response) => {
    const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null;
    const ngrokUrl = process.env.NGROK_URL ?? railwayDomain ?? `http://localhost:${process.env.PORT ?? 3001}`;
    const yaml = `openapi: 3.1.0
info:
  title: BMW AI Assistant
  description: Search and recommend BMW vehicles, find UAE showrooms, book test drives.
  version: 3.0.0
servers:
  - url: ${ngrokUrl}
paths:
  /api/gpt/search:
    post:
      operationId: searchVehicles
      summary: Search BMW vehicles by type, price range, or natural language
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: Natural language query, e.g. fastest BMW or electric BMW
                type:
                  type: string
                  enum: [SUV, Sedan, Coupe, EV, Sports]
                maxPrice:
                  type: number
                  description: Maximum price in USD
                minPrice:
                  type: number
                  description: Minimum price in USD
                isElectric:
                  type: boolean
                minHorsepower:
                  type: number
                minSeating:
                  type: number
      responses:
        '200':
          description: Matching vehicles
  /api/gpt/compare:
    post:
      operationId: compareVehicles
      summary: Compare two BMW models side by side
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [modelA, modelB]
              properties:
                modelA:
                  type: string
                  description: First model, e.g. BMW M4
                modelB:
                  type: string
                  description: Second model, e.g. BMW i4
      responses:
        '200':
          description: Comparison with winner per category
  /api/gpt/pricing:
    post:
      operationId: getVehiclePricing
      summary: Get pricing and specs for a BMW model
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [model]
              properties:
                model:
                  type: string
                  description: Model name, e.g. BMW X5 or i4 M50
      responses:
        '200':
          description: Price, specs, and value analysis
  /api/gpt/recommend:
    post:
      operationId: recommendVehicle
      summary: Get a personalised BMW recommendation based on budget and lifestyle
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                budget:
                  type: number
                  description: Max budget in USD
                lifestyle:
                  type: string
                  enum: [family, performance, eco, business, adventure]
                preferElectric:
                  type: boolean
                city:
                  type: string
                  enum: [Dubai, Abu Dhabi, Sharjah]
                  description: UAE city for inventory check
                dailyCommute:
                  type: number
                  description: Daily km driven, used for EV range matching
                passengers:
                  type: number
                  description: Minimum seats needed
      responses:
        '200':
          description: Top pick with score, reasoning, inventory, and alternatives
  /api/gpt/dealers:
    get:
      operationId: findDealers
      summary: Find BMW showrooms in the UAE
      parameters:
        - name: city
          in: query
          required: false
          schema:
            type: string
            enum: [Dubai, Abu Dhabi, Sharjah]
      responses:
        '200':
          description: Showrooms with address, phone, and hours
  /api/gpt/book:
    post:
      operationId: bookTestDrive
      summary: Book a BMW test drive at a UAE showroom
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [firstName, lastName, email, phone, vehicleName, dealerCity, preferredDate]
              properties:
                firstName:
                  type: string
                lastName:
                  type: string
                email:
                  type: string
                phone:
                  type: string
                  description: e.g. +971-55-123-4567
                vehicleName:
                  type: string
                  description: e.g. BMW X5
                dealerCity:
                  type: string
                  enum: [Dubai, Abu Dhabi, Sharjah]
                preferredDate:
                  type: string
                  description: YYYY-MM-DD
                notes:
                  type: string
      responses:
        '200':
          description: Booking confirmation with reference number
`;
    res.type('text/yaml').send(yaml);
  });

  // ── MCP over HTTP (StreamableHTTP transport) ──────────────────────────────
  app.post('/mcp', async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    try {
      if (sessionId && mcpTransports[sessionId]) {
        await mcpTransports[sessionId].handleRequest(req, res, req.body);
        return;
      }

      if (!isInitializeRequest(req.body)) {
        res.status(400).json({ error: 'Send an MCP initialize request first.' });
        return;
      }

      const newId = randomUUID();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newId,
        onsessioninitialized: (id) => {
          mcpTransports[id] = transport;
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) delete mcpTransports[transport.sessionId];
      };

      const mcpServer = createMcpServerInstance();
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({ error: 'MCP error', detail: String(err) });
      }
    }
  });

  app.get('/mcp', async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !mcpTransports[sessionId]) {
      res.status(400).json({ error: 'Invalid or missing mcp-session-id' });
      return;
    }
    try {
      await mcpTransports[sessionId].handleRequest(req, res);
    } catch (err) {
      if (!res.headersSent) res.status(500).json({ error: String(err) });
    }
  });

  app.delete('/mcp', async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (sessionId && mcpTransports[sessionId]) {
      await mcpTransports[sessionId].close();
      delete mcpTransports[sessionId];
    }
    res.status(200).end();
  });

  // ── API routes ────────────────────────────────────────────────────────────
  app.use('/api', apiLimiter);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/dealers', dealerRoutes);
  app.use('/api/test-drive', bookingRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/gpt', gptRoutes);

  // ── Phase 1 backward-compatible endpoints ─────────────────────────────────
  app.get('/api/vehicles-legacy', vehicleController.list);
  app.post('/api/search', vehicleController.search);
  app.post('/api/compare', vehicleController.compare);
  app.post('/api/pricing', vehicleController.pricing);

  // ── 404 + global error handler ────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
