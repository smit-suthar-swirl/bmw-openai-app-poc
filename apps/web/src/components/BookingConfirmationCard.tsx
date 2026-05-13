import type { BookingConfirmation } from '@bmw-ai/shared';

interface BookingConfirmationCardProps {
  confirmation: BookingConfirmation;
  onBookAnother?: () => void;
}

export function BookingConfirmationCard({ confirmation, onBookAnother }: BookingConfirmationCardProps) {
  const date = new Date(confirmation.preferredDate).toLocaleDateString('en-AE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bmw-card animate-slide-up overflow-hidden">
      {/* Success banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
          <span className="text-emerald-400 text-sm">✓</span>
        </div>
        <div>
          <p className="text-emerald-400 font-semibold text-sm">Booking Confirmed</p>
          <p className="text-emerald-400/70 text-xs">Ref: {confirmation.reference}</p>
        </div>
      </div>

      <div className="p-5">
        {/* Key booking details */}
        <div className="space-y-3 mb-5">
          <BookingRow label="Customer" value={`${confirmation.firstName} ${confirmation.lastName}`} />
          <BookingRow label="Vehicle" value={confirmation.vehicle.name} highlight />
          <BookingRow label="Showroom" value={confirmation.dealer.name} />
          <BookingRow label="Address" value={confirmation.dealer.address} />
          <BookingRow label="Date" value={date} highlight />
          <BookingRow label="Phone" value={confirmation.dealer.phone} />
        </div>

        {/* Status pill */}
        <div className="flex items-center justify-between p-3 bg-bmw-dark rounded-xl border border-bmw-border mb-5">
          <span className="text-bmw-silver text-xs uppercase tracking-widest">Status</span>
          <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs rounded-full font-medium capitalize">
            {confirmation.status}
          </span>
        </div>

        <p className="text-bmw-silver text-xs text-center mb-4">
          A confirmation email will be sent to{' '}
          <span className="text-bmw-light">{confirmation.email}</span>.
          Call{' '}
          <a href={`tel:${confirmation.dealer.phone}`} className="text-bmw-blue hover:underline">
            {confirmation.dealer.phone}
          </a>{' '}
          to reschedule.
        </p>

        {onBookAnother && (
          <button className="bmw-btn-ghost w-full text-sm" onClick={onBookAnother}>
            Book Another Test Drive
          </button>
        )}
      </div>
    </div>
  );
}

function BookingRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-bmw-silver text-xs uppercase tracking-widest w-20 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-bmw-blue' : 'text-bmw-light'}`}>{value}</span>
    </div>
  );
}
