import type { BMWVehicle } from '@bmw-ai/shared';

interface VehicleCardProps {
  vehicle: BMWVehicle;
  onCompare?: (vehicle: BMWVehicle) => void;
  onViewPricing?: (vehicle: BMWVehicle) => void;
  onBookTestDrive?: (vehicle: BMWVehicle) => void;
  compact?: boolean;
}

export function VehicleCard({ vehicle, onCompare, onViewPricing, onBookTestDrive, compact }: VehicleCardProps) {
  const formatPrice = (p: number) => `$${p.toLocaleString()}`;

  return (
    <div className="bmw-card group hover:border-bmw-blue transition-all duration-300 animate-slide-up">
      {/* Vehicle Image Area */}
      <div className="relative h-44 bg-gradient-to-br from-bmw-dark to-bmw-black overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bmw-card via-transparent to-transparent z-10" />

        {/* Type & Electric badges */}
        <div className="absolute top-3 left-3 z-20 flex gap-2">
          <span className="px-2 py-1 bg-bmw-blue/90 text-white text-xs font-semibold rounded-md tracking-wider uppercase">
            {vehicle.type}
          </span>
          {vehicle.isElectric && (
            <span className="px-2 py-1 bg-emerald-500/90 text-white text-xs font-semibold rounded-md tracking-wider uppercase">
              EV
            </span>
          )}
        </div>

        {/* Car silhouette placeholder (image would load from actual CDN in prod) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CarSilhouette type={vehicle.type} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Name & Price */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-bmw-light text-lg leading-tight">{vehicle.name}</h3>
            <p className="text-bmw-silver text-xs mt-0.5 uppercase tracking-wider">{vehicle.type}</p>
          </div>
          <div className="text-right">
            <div className="text-bmw-blue font-bold text-lg">{formatPrice(vehicle.price)}</div>
            <div className="text-bmw-silver text-xs">Starting MSRP</div>
          </div>
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <SpecCell label="HP" value={`${vehicle.horsepower}`} unit="hp" />
          <SpecCell label="0-100" value={`${vehicle.acceleration}s`} />
          <SpecCell
            label={vehicle.isElectric ? 'Range' : 'Seats'}
            value={vehicle.isElectric ? `${vehicle.range}` : `${vehicle.seating}`}
            unit={vehicle.isElectric ? 'km' : 'pax'}
          />
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-bmw-silver text-xs leading-relaxed mb-4 line-clamp-2">
            {vehicle.description}
          </p>
        )}

        {/* Top Features */}
        {!compact && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {vehicle.features.slice(0, 3).map((f) => (
              <span key={f} className="spec-badge truncate max-w-[140px]" title={f}>
                {f}
              </span>
            ))}
            {vehicle.features.length > 3 && (
              <span className="spec-badge text-bmw-blue">+{vehicle.features.length - 3} more</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {onViewPricing && (
            <button className="bmw-btn-primary flex-1 text-xs" onClick={() => onViewPricing(vehicle)}>
              View Pricing
            </button>
          )}
          {onCompare && (
            <button className="bmw-btn-ghost flex-1 text-xs" onClick={() => onCompare(vehicle)}>
              Compare
            </button>
          )}
          {onBookTestDrive && (
            <button
              className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-medium border border-bmw-blue/40 text-bmw-blue hover:bg-bmw-blue/10 transition-all duration-200"
              onClick={() => onBookTestDrive(vehicle)}
            >
              Book Test Drive
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SpecCell({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="bg-bmw-dark rounded-xl p-2.5 text-center">
      <div className="text-bmw-silver text-[10px] uppercase tracking-widest mb-1">{label}</div>
      <div className="text-bmw-light font-bold text-sm">
        {value}
        {unit && <span className="text-bmw-silver font-normal text-[10px] ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

function CarSilhouette({ type }: { type: BMWVehicle['type'] }) {
  const isSUV = type === 'SUV';
  const isCoupe = type === 'Coupe';

  return (
    <svg
      viewBox="0 0 200 80"
      className="w-48 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
      fill="currentColor"
    >
      {isSUV ? (
        // SUV silhouette
        <path d="M20,55 L20,35 Q20,25 35,20 L60,15 L140,15 L165,25 Q175,30 178,35 L178,55 Q175,60 168,60 L160,60 Q160,55 155,55 Q148,55 148,60 L52,60 Q52,55 47,55 Q40,55 40,60 L28,60 Q22,60 20,55 Z" />
      ) : isCoupe ? (
        // Coupe silhouette
        <path d="M20,58 L22,40 Q25,25 50,20 L90,15 L130,15 Q155,18 165,30 L178,45 L178,58 Q175,62 168,62 L160,62 Q160,57 155,57 Q148,57 148,62 L52,62 Q52,57 47,57 Q40,57 40,62 L28,62 Q22,62 20,58 Z" />
      ) : (
        // Sedan silhouette
        <path d="M18,58 L20,38 Q22,28 42,22 L75,16 L130,16 L158,25 Q170,32 172,42 L175,58 Q172,62 165,62 L157,62 Q157,57 152,57 Q145,57 145,62 L55,62 Q55,57 50,57 Q43,57 43,62 L30,62 Q22,62 18,58 Z" />
      )}
      {/* Wheels */}
      <circle cx="50" cy="62" r="10" className="fill-current" />
      <circle cx="150" cy="62" r="10" className="fill-current" />
    </svg>
  );
}
