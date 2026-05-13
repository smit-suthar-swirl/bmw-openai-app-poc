import type { SearchParams, BMWVehicle } from '@bmw-ai/shared';

interface FilterPanelProps {
  params: SearchParams;
  onChange: (params: SearchParams) => void;
  onApply: () => void;
  onReset: () => void;
}

const VEHICLE_TYPES: BMWVehicle['type'][] = ['SUV', 'Sedan', 'Coupe', 'EV', 'Sports'];

const PRICE_PRESETS = [
  { label: 'Under $50k', maxPrice: 50000 },
  { label: '$50k–$80k', minPrice: 50000, maxPrice: 80000 },
  { label: '$80k–$120k', minPrice: 80000, maxPrice: 120000 },
  { label: 'Over $120k', minPrice: 120000 },
];

export function FilterPanel({ params, onChange, onApply, onReset }: FilterPanelProps) {
  function set(key: keyof SearchParams, value: unknown) {
    onChange({ ...params, [key]: value });
  }

  function toggle(key: keyof SearchParams, value: unknown) {
    onChange({ ...params, [key]: params[key] === value ? undefined : value });
  }

  function applyPricePreset(preset: { minPrice?: number; maxPrice?: number }) {
    onChange({ ...params, minPrice: preset.minPrice, maxPrice: preset.maxPrice });
  }

  const hasFilters = !!(
    params.type ||
    params.isElectric !== undefined ||
    params.maxPrice ||
    params.minPrice ||
    params.minHorsepower ||
    params.minSeating
  );

  return (
    <div className="bmw-card p-4 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-bmw-light font-semibold text-sm">Advanced Filters</h3>
        {hasFilters && (
          <button
            onClick={onReset}
            className="text-bmw-silver text-xs hover:text-bmw-blue transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Body type */}
      <div>
        <p className="text-bmw-silver text-xs uppercase tracking-widest mb-2">Body Type</p>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggle('type', type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                params.type === type
                  ? 'bg-bmw-blue border-bmw-blue text-white'
                  : 'bg-transparent border-bmw-border text-bmw-silver hover:border-bmw-blue hover:text-bmw-blue'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Powertrain */}
      <div>
        <p className="text-bmw-silver text-xs uppercase tracking-widest mb-2">Powertrain</p>
        <div className="flex gap-2">
          <FilterChip
            label="Electric Only"
            active={params.isElectric === true}
            onClick={() => onChange({ ...params, isElectric: params.isElectric === true ? undefined : true })}
          />
          <FilterChip
            label="Combustion / Hybrid"
            active={params.isElectric === false}
            onClick={() => onChange({ ...params, isElectric: params.isElectric === false ? undefined : false })}
          />
        </div>
      </div>

      {/* Price presets */}
      <div>
        <p className="text-bmw-silver text-xs uppercase tracking-widest mb-2">Budget</p>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => {
            const active =
              params.minPrice === preset.minPrice && params.maxPrice === preset.maxPrice;
            return (
              <button
                key={preset.label}
                onClick={() =>
                  active
                    ? onChange({ ...params, minPrice: undefined, maxPrice: undefined })
                    : applyPricePreset(preset)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  active
                    ? 'bg-bmw-blue border-bmw-blue text-white'
                    : 'bg-transparent border-bmw-border text-bmw-silver hover:border-bmw-blue hover:text-bmw-blue'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Manual price inputs */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <label className="text-bmw-silver text-[10px] uppercase tracking-widest block mb-1">Min Price ($)</label>
            <input
              type="number"
              className="bmw-input text-xs py-2"
              placeholder="0"
              value={params.minPrice ?? ''}
              onChange={(e) => set('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div>
            <label className="text-bmw-silver text-[10px] uppercase tracking-widest block mb-1">Max Price ($)</label>
            <input
              type="number"
              className="bmw-input text-xs py-2"
              placeholder="Any"
              value={params.maxPrice ?? ''}
              onChange={(e) => set('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>
      </div>

      {/* Min horsepower */}
      <div>
        <p className="text-bmw-silver text-xs uppercase tracking-widest mb-2">
          Min Horsepower{params.minHorsepower ? `: ${params.minHorsepower}hp` : ''}
        </p>
        <input
          type="range"
          min={0}
          max={700}
          step={50}
          value={params.minHorsepower ?? 0}
          onChange={(e) => set('minHorsepower', Number(e.target.value) || undefined)}
          className="w-full accent-bmw-blue"
        />
        <div className="flex justify-between text-bmw-silver text-[10px] mt-1">
          <span>Any</span>
          <span>300hp</span>
          <span>500hp</span>
          <span>700hp</span>
        </div>
      </div>

      {/* Min seating */}
      <div>
        <p className="text-bmw-silver text-xs uppercase tracking-widest mb-2">Min Seating</p>
        <div className="flex gap-2">
          {[2, 4, 5, 7].map((n) => (
            <FilterChip
              key={n}
              label={`${n}+`}
              active={params.minSeating === n}
              onClick={() => onChange({ ...params, minSeating: params.minSeating === n ? undefined : n })}
            />
          ))}
        </div>
      </div>

      {/* Apply */}
      <button className="bmw-btn-primary w-full" onClick={onApply}>
        Apply Filters
      </button>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
        active
          ? 'bg-bmw-blue border-bmw-blue text-white'
          : 'bg-transparent border-bmw-border text-bmw-silver hover:border-bmw-blue hover:text-bmw-blue'
      }`}
    >
      {label}
    </button>
  );
}
