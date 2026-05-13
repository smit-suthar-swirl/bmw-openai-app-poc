import type { Dealer } from '@bmw-ai/shared';

interface DealerCardProps {
  dealer: Dealer;
  onBookTestDrive?: (dealer: Dealer) => void;
}

export function DealerCard({ dealer, onBookTestDrive }: DealerCardProps) {
  return (
    <div className="bmw-card group hover:border-bmw-blue transition-all duration-300 animate-slide-up">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-bmw-blue via-bmw-darkblue to-transparent" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-bmw-blue/10 border border-bmw-blue/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-lg">📍</span>
          </div>
          <div>
            <h3 className="font-bold text-bmw-light text-base leading-tight">{dealer.name}</h3>
            <span className="text-xs text-bmw-blue font-medium uppercase tracking-wider">
              {dealer.city}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2.5 mb-5">
          <DetailRow icon="🗺️" label="Address" value={dealer.address} />
          <DetailRow icon="📞" label="Phone" value={dealer.phone} isLink={`tel:${dealer.phone}`} />
          {dealer.email && (
            <DetailRow icon="✉️" label="Email" value={dealer.email} isLink={`mailto:${dealer.email}`} />
          )}
          <DetailRow icon="🕐" label="Hours" value={dealer.openingHours} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {dealer.mapsUrl && (
            <a
              href={dealer.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bmw-btn-ghost flex-1 text-center text-xs"
            >
              Open Maps
            </a>
          )}
          {onBookTestDrive && (
            <button
              className="bmw-btn-primary flex-1 text-xs"
              onClick={() => onBookTestDrive(dealer)}
            >
              Book Test Drive
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  isLink,
}: {
  icon: string;
  label: string;
  value: string;
  isLink?: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="text-bmw-silver text-[10px] uppercase tracking-widest">{label}</div>
        {isLink ? (
          <a
            href={isLink}
            className="text-bmw-blue text-sm hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <span className="text-bmw-light text-sm leading-snug">{value}</span>
        )}
      </div>
    </div>
  );
}
