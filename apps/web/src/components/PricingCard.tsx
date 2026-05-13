import type { PricingResult } from '@bmw-ai/shared';

interface PricingCardProps {
  result: PricingResult;
  onCompare?: (modelName: string) => void;
}

export function PricingCard({ result, onCompare }: PricingCardProps) {
  const { vehicle: v } = result;

  return (
    <div className="bmw-card animate-slide-up overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-bmw-blue via-bmw-darkblue to-transparent" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-bmw-blue text-xs font-semibold uppercase tracking-widest">
              {result.category}
            </span>
            <h2 className="text-xl font-bold text-bmw-light mt-1">{v.name}</h2>
            <div className="flex gap-2 mt-2">
              <span className="spec-badge">{v.type}</span>
              {v.isElectric && (
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs text-emerald-400">
                  Electric
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-bmw-light">{result.formattedPrice}</div>
            <div className="text-bmw-silver text-xs mt-1">Starting MSRP</div>
          </div>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <PricingSpecRow
            icon="⚡"
            label="Horsepower"
            value={`${v.horsepower} hp`}
            highlight
          />
          <PricingSpecRow
            icon="🏁"
            label="0-100 km/h"
            value={`${v.acceleration} seconds`}
          />
          <PricingSpecRow
            icon="💰"
            label="Value"
            value={result.pricePerHorsepower}
          />
          <PricingSpecRow
            icon="👥"
            label="Seating"
            value={`${v.seating} passengers`}
          />
          {v.range && (
            <PricingSpecRow
              icon="🔋"
              label="Electric Range"
              value={`${v.range} km`}
              highlight
              fullWidth
            />
          )}
        </div>

        {/* Description */}
        <p className="text-bmw-silver text-sm leading-relaxed mb-5">{v.description}</p>

        {/* Features */}
        <div className="mb-5">
          <h4 className="text-bmw-silver text-xs uppercase tracking-widest mb-3">Key Features</h4>
          <div className="grid grid-cols-1 gap-1.5">
            {v.features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-bmw-light">
                <span className="w-1.5 h-1.5 rounded-full bg-bmw-blue flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <button className="bmw-btn-primary flex-1">Build & Price</button>
          {onCompare && (
            <button
              className="bmw-btn-ghost"
              onClick={() => onCompare(v.name)}
            >
              Compare
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingSpecRow({
  icon,
  label,
  value,
  highlight,
  fullWidth,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 bg-bmw-dark rounded-xl p-3 ${
        fullWidth ? 'col-span-2' : ''
      } ${highlight ? 'border border-bmw-blue/30' : 'border border-bmw-border'}`}
    >
      <span className="text-lg">{icon}</span>
      <div>
        <div className="text-bmw-silver text-[10px] uppercase tracking-widest">{label}</div>
        <div className={`font-bold text-sm ${highlight ? 'text-bmw-blue' : 'text-bmw-light'}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
