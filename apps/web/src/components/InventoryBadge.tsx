import type { InventoryStatus } from '@bmw-ai/shared';

interface Props {
  status: InventoryStatus;
}

export function InventoryBadge({ status }: Props) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
        status.inStock
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : 'bg-red-500/10 border-red-500/30 text-red-400'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status.inStock ? 'bg-green-400' : 'bg-red-400'}`} />
      <span>{status.city}</span>
      {status.inStock ? (
        <span className="text-green-500/70">· {status.quantity} avail.</span>
      ) : (
        <span className="opacity-60">· Out of stock</span>
      )}
    </div>
  );
}
