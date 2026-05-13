import type { RecommendationResult } from '@bmw-ai/shared';
import { InventoryBadge } from './InventoryBadge.tsx';

interface Props {
  result: RecommendationResult;
  onViewPricing?: (name: string) => void;
  onCompare?: (name: string) => void;
  onBook?: (name: string) => void;
}

export function RecommendationCard({ result, onViewPricing, onCompare, onBook }: Props) {
  const { topPick, alternatives, reasoning, matchScore, inventory } = result;

  const scoreColor =
    matchScore >= 80 ? 'text-green-400' : matchScore >= 60 ? 'text-yellow-400' : 'text-bmw-silver';

  return (
    <div className="space-y-4">
      {/* Top pick */}
      <div className="bg-bmw-dark border border-bmw-blue/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-bmw-blue uppercase tracking-widest font-medium mb-1">
              Top Recommendation
            </p>
            <h3 className="text-xl font-bold text-bmw-light">{topPick.name}</h3>
            <p className="text-bmw-silver text-sm mt-1">{topPick.type} · {topPick.seating} seats</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`text-2xl font-bold ${scoreColor}`}>{matchScore}</p>
            <p className="text-bmw-silver text-xs">/ 100 match</p>
          </div>
        </div>

        {/* Key specs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bmw-darker rounded-xl p-3 text-center">
            <p className="text-bmw-blue text-base font-semibold">${topPick.price.toLocaleString()}</p>
            <p className="text-bmw-silver text-xs mt-0.5">Starting price</p>
          </div>
          <div className="bg-bmw-darker rounded-xl p-3 text-center">
            <p className="text-bmw-blue text-base font-semibold">{topPick.horsepower}hp</p>
            <p className="text-bmw-silver text-xs mt-0.5">Power</p>
          </div>
          <div className="bg-bmw-darker rounded-xl p-3 text-center">
            <p className="text-bmw-blue text-base font-semibold">{topPick.acceleration}s</p>
            <p className="text-bmw-silver text-xs mt-0.5">0-100 km/h</p>
          </div>
        </div>

        {/* Range (EV only) */}
        {topPick.isElectric && topPick.range && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-green-400 text-sm font-medium">⚡ {topPick.range}km electric range</span>
          </div>
        )}

        {/* Why this BMW */}
        <div>
          <p className="text-bmw-silver text-xs uppercase tracking-wider mb-2">Why this BMW</p>
          <ul className="space-y-1.5">
            {reasoning.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-bmw-light">
                <span className="text-bmw-blue mt-0.5 flex-shrink-0">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* UAE Inventory */}
        {inventory.length > 0 && (
          <div>
            <p className="text-bmw-silver text-xs uppercase tracking-wider mb-2">UAE Inventory</p>
            <div className="flex flex-wrap gap-2">
              {inventory.map((inv) => (
                <InventoryBadge key={inv.city} status={inv} />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {onViewPricing && (
            <button
              onClick={() => onViewPricing(topPick.name)}
              className="bmw-btn-primary px-4 py-2 text-sm"
            >
              Full Specs
            </button>
          )}
          {onCompare && alternatives.length > 0 && (
            <button
              onClick={() => onCompare(topPick.name)}
              className="px-4 py-2 bg-bmw-darker border border-bmw-border rounded-xl text-bmw-light text-sm hover:border-bmw-blue hover:text-bmw-blue transition-all duration-200"
            >
              Compare
            </button>
          )}
          {onBook && (
            <button
              onClick={() => onBook(topPick.name)}
              className="px-4 py-2 bg-bmw-darker border border-bmw-border rounded-xl text-bmw-light text-sm hover:border-bmw-blue hover:text-bmw-blue transition-all duration-200"
            >
              Book Test Drive
            </button>
          )}
        </div>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="bg-bmw-dark border border-bmw-border rounded-2xl p-4">
          <p className="text-bmw-silver text-xs uppercase tracking-wider mb-3">Also Consider</p>
          <div className="space-y-2">
            {alternatives.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between py-2 border-b border-bmw-border last:border-0"
              >
                <div>
                  <p className="text-bmw-light text-sm font-medium">{v.name}</p>
                  <p className="text-bmw-silver text-xs">{v.type} · {v.horsepower}hp</p>
                </div>
                <div className="text-right">
                  <p className="text-bmw-blue text-sm font-semibold">${v.price.toLocaleString()}</p>
                  {onViewPricing && (
                    <button
                      onClick={() => onViewPricing(v.name)}
                      className="text-bmw-silver text-xs hover:text-bmw-blue transition-colors mt-0.5"
                    >
                      View specs →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
