import type { BMWVehicle, ComparisonResult, PricingResult, SearchResult } from '@bmw-ai/shared';

export function formatVehicleShort(v: BMWVehicle): string {
  const range = v.range ? ` | Range: ${v.range}km` : '';
  return `• ${v.name} — $${v.price.toLocaleString('en-US')} | ${v.horsepower}hp | 0-100: ${v.acceleration}s${range}`;
}

export function formatSearchResult(result: SearchResult): string {
  if (result.vehicles.length === 0) {
    return `No BMW models found${result.query ? ` for "${result.query}"` : ''}. Try searching for SUV, EV, performance, or a specific model name.`;
  }

  const lines = [
    `Found ${result.totalFound} BMW model${result.totalFound > 1 ? 's' : ''}${result.query ? ` for "${result.query}"` : ''}:\n`,
    ...result.vehicles.map(formatVehicleShort),
  ];

  if (result.totalPages > 1) {
    lines.push(`\nPage ${result.page} of ${result.totalPages}`);
  }

  return lines.join('\n');
}

export function formatComparisonResult(result: ComparisonResult): string {
  const { vehicleA: a, vehicleB: b, winner } = result;

  const rangeRow =
    a.range !== null || b.range !== null
      ? `\nRange:        ${a.range ? `${a.range}km` : 'N/A'} vs ${b.range ? `${b.range}km` : 'N/A'}  → ${winner.range ?? 'N/A'} wins`
      : '';

  return `
BMW Comparison: ${a.name} vs ${b.name}
${'─'.repeat(50)}
Price:        $${a.price.toLocaleString('en-US')} vs $${b.price.toLocaleString('en-US')}  → ${winner.price} is cheaper
Horsepower:   ${a.horsepower}hp vs ${b.horsepower}hp  → ${winner.horsepower} wins
Acceleration: ${a.acceleration}s vs ${b.acceleration}s (0-100)  → ${winner.acceleration} wins${rangeRow}
Seating:      ${a.seating} seats vs ${b.seating} seats  → ${winner.seating} wins
${'─'.repeat(50)}
`.trim();
}

export function formatPricingResult(result: PricingResult): string {
  const { vehicle: v } = result;
  const range = v.range ? `\nElectric Range:   ${v.range} km` : '';

  return `
BMW ${v.name} — Pricing & Specifications
${'─'.repeat(45)}
Category:         ${result.category}
Price:            ${result.formattedPrice}
Type:             ${v.type}${v.isElectric ? ' (Electric)' : ''}
Horsepower:       ${v.horsepower} hp
0-100 km/h:       ${v.acceleration} seconds
Seating:          ${v.seating} passengers${range}
Value:            ${result.pricePerHorsepower}
${'─'.repeat(45)}
${v.description}
`.trim();
}
