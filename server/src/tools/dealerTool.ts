import type { Dealer, DealerSearchResult } from '@bmw-ai/shared';
import { dealerService } from '../services/dealerService.js';

export const dealerToolDefinition = {
  name: 'find_bmw_showrooms',
  description:
    'Find BMW showrooms and dealerships by city. Returns dealer name, address, phone, opening hours, and Google Maps link. Use for "nearest BMW showroom in Dubai", "BMW dealer Abu Dhabi", or "BMW showrooms".',
  inputSchema: {
    type: 'object' as const,
    properties: {
      city: {
        type: 'string',
        description: 'City name to search in (e.g., "Dubai", "Abu Dhabi", "Sharjah")',
      },
      query: {
        type: 'string',
        description: 'Free text search query (e.g., "nearest showroom")',
      },
    },
  },
};

export function formatDealerResult(result: DealerSearchResult): string {
  if (result.dealers.length === 0) {
    return `No BMW showrooms found${result.city ? ` in ${result.city}` : ''}. Available cities: Dubai, Abu Dhabi, Sharjah.`;
  }

  const header = `Found ${result.totalFound} BMW showroom${result.totalFound > 1 ? 's' : ''}${result.city ? ` in ${result.city}` : ''}:\n`;
  const lines = result.dealers.map((d) =>
    [
      `📍 ${d.name}`,
      `   Address:  ${d.address}`,
      `   Phone:    ${d.phone}`,
      `   Hours:    ${d.openingHours}`,
      d.mapsUrl ? `   Maps:     ${d.mapsUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  );

  return header + lines.join('\n\n');
}

export async function executeDealerTool(params: { city?: string; query?: string }) {
  const result = await dealerService.search(params);
  const textSummary = formatDealerResult(result);

  return {
    content: [
      { type: 'text' as const, text: textSummary },
      { type: 'text' as const, text: JSON.stringify({ type: 'dealer_list', dealers: result.dealers }) },
    ],
    result,
  };
}
