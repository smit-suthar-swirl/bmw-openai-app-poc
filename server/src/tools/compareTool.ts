import { vehicleService } from '../services/vehicleService.js';
import { formatComparisonResult } from '../utils/formatters.js';

export const compareToolDefinition = {
  name: 'compare_bmw_models',
  description:
    'Compare two BMW vehicles side-by-side on price, horsepower, acceleration, electric range, and seating. Use for "Compare BMW M4 vs BMW i4" or "BMW X5 vs BMW XM".',
  inputSchema: {
    type: 'object' as const,
    properties: {
      modelA: { type: 'string', description: 'First BMW model (e.g., "BMW M4", "i7", "X5")' },
      modelB: { type: 'string', description: 'Second BMW model (e.g., "BMW i4", "XM", "X3")' },
    },
    required: ['modelA', 'modelB'],
  },
};

export async function executeCompareTool(params: { modelA: string; modelB: string }) {
  const result = await vehicleService.compare(params.modelA, params.modelB);
  const textSummary = formatComparisonResult(result);

  return {
    content: [
      { type: 'text' as const, text: textSummary },
      { type: 'text' as const, text: JSON.stringify({ type: 'comparison', comparison: result }) },
    ],
    result,
  };
}
