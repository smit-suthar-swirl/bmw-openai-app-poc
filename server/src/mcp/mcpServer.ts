import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { executeSearchTool } from '../tools/searchTool.js';
import { executeCompareTool } from '../tools/compareTool.js';
import { executePricingTool } from '../tools/pricingTool.js';
import { executeDealerTool } from '../tools/dealerTool.js';
import { executeBookingTool } from '../tools/bookingTool.js';
import { recommendService } from '../recommendations/recommendService.js';

export function createMcpServerInstance(): McpServer {
  const server = new McpServer({
    name: process.env.MCP_SERVER_NAME ?? 'bmw-ai-mcp',
    version: '3.0.0',
  });

  // ── Tool 1: search_bmw_models ──────────────────────────────────────────────
  server.tool(
    'search_bmw_models',
    'Search BMW vehicles by type, price range, performance, or natural language. Use for "best BMW SUV under $100k", "electric BMW", "fastest BMW", "family BMW with 7 seats".',
    {
      query: z.string().optional().describe('Natural language search (e.g., "electric BMW under $80k")'),
      type: z.enum(['SUV', 'Sedan', 'Coupe', 'EV', 'Sports']).optional(),
      maxPrice: z.number().optional().describe('Maximum price in USD'),
      minPrice: z.number().optional().describe('Minimum price in USD'),
      isElectric: z.boolean().optional().describe('Electric vehicles only'),
      minHorsepower: z.number().optional().describe('Minimum horsepower'),
      minSeating: z.number().optional().describe('Minimum seating capacity'),
    },
    async (params) => {
      try {
        const { content } = await executeSearchTool(params);
        return { content };
      } catch (err) {
        return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : 'Search failed'}` }], isError: true };
      }
    }
  );

  // ── Tool 2: compare_bmw_models ─────────────────────────────────────────────
  server.tool(
    'compare_bmw_models',
    'Compare two BMW vehicles side-by-side on price, power, acceleration, range, and seating. Use for "Compare BMW M4 vs BMW i4" or "BMW X5 vs BMW XM".',
    {
      modelA: z.string().describe('First BMW model (e.g., "BMW M4", "i7", "X5")'),
      modelB: z.string().describe('Second BMW model (e.g., "BMW i4", "XM", "X3")'),
    },
    async ({ modelA, modelB }) => {
      try {
        const { content } = await executeCompareTool({ modelA, modelB });
        return { content };
      } catch (err) {
        return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : 'Comparison failed'}` }], isError: true };
      }
    }
  );

  // ── Tool 3: get_bmw_pricing ────────────────────────────────────────────────
  server.tool(
    'get_bmw_pricing',
    'Get full pricing, specifications, and value analysis for a BMW model. Use for "BMW X5 price", "i7 specs", "how much does the BMW M4 cost".',
    {
      model: z.string().describe('BMW model name (e.g., "BMW X5", "i7", "M4 Competition")'),
    },
    async ({ model }) => {
      try {
        const { content } = await executePricingTool({ model });
        return { content };
      } catch (err) {
        return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : 'Pricing lookup failed'}` }], isError: true };
      }
    }
  );

  // ── Tool 4: find_bmw_showrooms ─────────────────────────────────────────────
  server.tool(
    'find_bmw_showrooms',
    'Find BMW showrooms in UAE cities. Returns name, address, phone, opening hours, and Google Maps link. Use for "nearest BMW showroom in Dubai", "BMW dealer Abu Dhabi".',
    {
      city: z.enum(['Dubai', 'Abu Dhabi', 'Sharjah']).optional().describe('City to search in'),
      query: z.string().optional().describe('Free text search'),
    },
    async (params) => {
      try {
        const { content } = await executeDealerTool(params);
        return { content };
      } catch (err) {
        return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : 'Dealer search failed'}` }], isError: true };
      }
    }
  );

  // ── Tool 5: book_test_drive ────────────────────────────────────────────────
  server.tool(
    'book_test_drive',
    'Book a BMW test drive at an authorized UAE showroom. Requires customer name, email, phone, vehicle model, preferred city, and date. Returns booking confirmation with reference number.',
    {
      firstName: z.string().min(2).describe('Customer first name'),
      lastName: z.string().min(2).describe('Customer last name'),
      email: z.string().email().describe('Customer email address'),
      phone: z.string().describe('Phone number with country code (e.g., +971-55-123-4567)'),
      vehicleName: z.string().describe('BMW model for test drive (e.g., "BMW i4", "BMW X5")'),
      dealerCity: z.enum(['Dubai', 'Abu Dhabi', 'Sharjah']).describe('Preferred showroom city'),
      preferredDate: z.string().describe('Preferred date in ISO format (e.g., "2025-08-20")'),
      notes: z.string().optional().describe('Additional notes or requests'),
    },
    async (params) => {
      try {
        const { content } = await executeBookingTool(params);
        return { content };
      } catch (err) {
        return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : 'Booking failed'}` }], isError: true };
      }
    }
  );

  // ── Tool 6: recommend_bmw_vehicle ──────────────────────────────────────────
  server.tool(
    'recommend_bmw_vehicle',
    'Get a personalised BMW vehicle recommendation based on budget, lifestyle, commute, and EV preference. Returns top pick with match score, reasoning, UAE inventory status, and up to 3 alternatives. Use when the user wants guidance rather than a specific model.',
    {
      budget: z.number().optional().describe('Maximum budget in USD (e.g., 90000)'),
      lifestyle: z
        .enum(['family', 'performance', 'eco', 'business', 'adventure'])
        .optional()
        .describe('Lifestyle priority: family | performance | eco | business | adventure'),
      preferElectric: z.boolean().optional().describe('Prefer fully electric vehicles'),
      city: z
        .enum(['Dubai', 'Abu Dhabi', 'Sharjah'])
        .optional()
        .describe('UAE city to check live inventory'),
      dailyCommute: z.number().optional().describe('Daily driving distance in km (important for EV range)'),
      passengers: z.number().optional().describe('Minimum number of passengers required'),
    },
    async (params) => {
      try {
        const result = await recommendService.recommend(params);
        const inv = result.inventory.map((i) => `${i.city}: ${i.inStock ? `✓ ${i.quantity} in stock` : '✗ out of stock'}`).join(' | ');
        const alts = result.alternatives.map((v) => `• ${v.name} ($${v.price.toLocaleString()})`).join('\n');

        const text = [
          `🏆 TOP PICK: ${result.topPick.name}`,
          `   Price: $${result.topPick.price.toLocaleString()} | ${result.topPick.horsepower}hp | 0-100 in ${result.topPick.acceleration}s | ${result.topPick.seating} seats`,
          result.topPick.isElectric && result.topPick.range ? `   Range: ${result.topPick.range}km` : null,
          `   Match Score: ${result.matchScore}/100`,
          '',
          '📋 Why this BMW:',
          ...result.reasoning.map((r) => `   • ${r}`),
          '',
          inv ? `📦 UAE Inventory:\n   ${inv}` : null,
          '',
          result.alternatives.length > 0 ? `🔄 Also Consider:\n${alts}` : null,
        ]
          .filter(Boolean)
          .join('\n');

        return {
          content: [
            { type: 'text', text },
            { type: 'text', text: JSON.stringify({ type: 'recommendation', data: result }) },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : 'Recommendation failed'}` }],
          isError: true,
        };
      }
    }
  );

  return server;
}

export async function startMcpServer() {
  const server = createMcpServerInstance();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('BMW AI MCP Server v3.0 running on stdio (6 tools active)\n');
}
