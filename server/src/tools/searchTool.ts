import type { SearchParams, SearchResult } from '@bmw-ai/shared';
import { vehicleService } from '../services/vehicleService.js';
import { formatSearchResult } from '../utils/formatters.js';

export const searchToolDefinition = {
  name: 'search_bmw_models',
  description:
    'Search BMW vehicle models by type (SUV, Sedan, EV, Coupe, Sports), price range, performance, or natural language. Use for "best BMW SUV under $100k", "electric BMW cars", "fastest BMW", "family BMW".',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: { type: 'string', description: 'Natural language query (e.g. "electric BMW under $80k")' },
      type: { type: 'string', enum: ['SUV', 'Sedan', 'Coupe', 'EV', 'Sports'] },
      maxPrice: { type: 'number', description: 'Maximum price in USD' },
      minPrice: { type: 'number', description: 'Minimum price in USD' },
      isElectric: { type: 'boolean', description: 'Filter to electric-only vehicles' },
      minHorsepower: { type: 'number', description: 'Minimum horsepower' },
      minSeating: { type: 'number', description: 'Minimum seating capacity' },
    },
  },
};

export async function executeSearchTool(params: SearchParams) {
  const result = await vehicleService.search(params);
  const textSummary = formatSearchResult(result);

  return {
    content: [
      { type: 'text' as const, text: textSummary },
      { type: 'text' as const, text: JSON.stringify({ type: 'vehicle_list', vehicles: result.vehicles }) },
    ],
    result,
  };
}
