import { vehicleService } from '../services/vehicleService.js';
import { formatPricingResult } from '../utils/formatters.js';

export const pricingToolDefinition = {
  name: 'get_bmw_pricing',
  description:
    'Get detailed pricing, specifications, and value analysis for a specific BMW model. Use for "BMW X5 price", "How much does the i7 cost?", "BMW M4 specs".',
  inputSchema: {
    type: 'object' as const,
    properties: {
      model: {
        type: 'string',
        description: 'BMW model name (e.g., "BMW X5", "i7", "M4 Competition", "BMW XM")',
      },
    },
    required: ['model'],
  },
};

export async function executePricingTool(params: { model: string }) {
  const result = await vehicleService.getPricing(params.model);
  const textSummary = formatPricingResult(result);

  return {
    content: [
      { type: 'text' as const, text: textSummary },
      { type: 'text' as const, text: JSON.stringify({ type: 'pricing', pricing: result }) },
    ],
    result,
  };
}
