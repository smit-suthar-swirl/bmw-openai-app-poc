import type { ComparisonResult } from '@bmw-ai/shared';

interface ComparisonTableProps {
  result: ComparisonResult;
}

export function ComparisonTable({ result }: ComparisonTableProps) {
  const { vehicleA: a, vehicleB: b, winner } = result;

  const rows: Array<{
    label: string;
    valueA: string;
    valueB: string;
    winnerName: string | null;
    higherIsBetter?: boolean;
  }> = [
    {
      label: 'Price (MSRP)',
      valueA: `$${a.price.toLocaleString()}`,
      valueB: `$${b.price.toLocaleString()}`,
      winnerName: winner.price,
    },
    {
      label: 'Horsepower',
      valueA: `${a.horsepower} hp`,
      valueB: `${b.horsepower} hp`,
      winnerName: winner.horsepower,
      higherIsBetter: true,
    },
    {
      label: '0-100 km/h',
      valueA: `${a.acceleration}s`,
      valueB: `${b.acceleration}s`,
      winnerName: winner.acceleration,
    },
    ...(winner.range !== null
      ? [
          {
            label: 'Electric Range',
            valueA: a.range ? `${a.range} km` : 'N/A',
            valueB: b.range ? `${b.range} km` : 'N/A',
            winnerName: winner.range,
            higherIsBetter: true as const,
          },
        ]
      : []),
    {
      label: 'Seating',
      valueA: `${a.seating} passengers`,
      valueB: `${b.seating} passengers`,
      winnerName: winner.seating,
      higherIsBetter: true,
    },
  ];

  return (
    <div className="bmw-card animate-slide-up">
      {/* Header */}
      <div className="grid grid-cols-3 bg-bmw-dark border-b border-bmw-border">
        <div className="p-4 text-bmw-silver text-xs uppercase tracking-widest">Specification</div>
        <div className="p-4 text-center border-x border-bmw-border">
          <div className="font-bold text-bmw-light text-sm">{a.name}</div>
          <div className="text-bmw-blue text-xs mt-0.5">${a.price.toLocaleString()}</div>
        </div>
        <div className="p-4 text-center">
          <div className="font-bold text-bmw-light text-sm">{b.name}</div>
          <div className="text-bmw-blue text-xs mt-0.5">${b.price.toLocaleString()}</div>
        </div>
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`grid grid-cols-3 border-b border-bmw-border last:border-0 ${
            i % 2 === 0 ? '' : 'bg-bmw-dark/30'
          }`}
        >
          <div className="p-4 text-bmw-silver text-sm flex items-center">{row.label}</div>

          <ValueCell
            value={row.valueA}
            isWinner={row.winnerName === a.name}
          />
          <ValueCell
            value={row.valueB}
            isWinner={row.winnerName === b.name}
            noBorderLeft
          />
        </div>
      ))}

      {/* Summary */}
      <div className="p-4 bg-bmw-dark/50 border-t border-bmw-border">
        <p className="text-bmw-silver text-xs text-center">
          Comparison between{' '}
          <span className="text-bmw-light font-medium">{a.name}</span> and{' '}
          <span className="text-bmw-light font-medium">{b.name}</span>
          {a.isElectric !== b.isElectric && (
            <span className="ml-1">
              ({a.isElectric ? a.name : b.name} is fully electric)
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function ValueCell({
  value,
  isWinner,
  noBorderLeft,
}: {
  value: string;
  isWinner: boolean;
  noBorderLeft?: boolean;
}) {
  return (
    <div
      className={`p-4 text-center flex items-center justify-center gap-2 ${
        !noBorderLeft ? 'border-x border-bmw-border' : ''
      } ${isWinner ? 'bg-bmw-blue/10' : ''}`}
    >
      <span className={`text-sm font-medium ${isWinner ? 'text-bmw-blue' : 'text-bmw-light'}`}>
        {value}
      </span>
      {isWinner && (
        <span className="text-emerald-400 text-xs">✓</span>
      )}
    </div>
  );
}
