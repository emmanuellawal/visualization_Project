import { useId, useRef, useState, useEffect } from 'react';
import {
  GENERATION_INFO,
  formatValue,
  type Generation,
  type Observation,
  type ValueKey,
} from '../lib/data';

interface Props {
  rows: Observation[];
  generations: Generation[];
  valueKey: ValueKey;
  years: number[];
  activeYear: number;
  onYearChange: (year: number) => void;
}
export function TrendChart({
  rows,
  generations,
  valueKey,
  years,
  activeYear,
  onYearChange,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const id = useId();
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(entry.contentRect.width, 260)),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const height = width < 500 ? 290 : 330;
  const left = valueKey === 'earnings' || valueKey === 'realEarnings' ? 52 : 37;
  const right = 24,
    top = 26,
    bottom = height - 35;
  const values = rows.map((r) => r[valueKey]).filter((v): v is number => v !== null);
  const rawMax = Math.max(...values, 1);
  const step =
    valueKey === 'earnings' || valueKey === 'realEarnings'
      ? Math.max(100, Math.ceil(rawMax / 4 / 100) * 100)
      : Math.max(2, Math.ceil(rawMax / 4 / 2) * 2);
  const max = step * 4;
  const first = years[0],
    last = years[years.length - 1];
  const x = (year: number) =>
    first === last
      ? (left + width - right) / 2
      : left + ((year - first) / (last - first)) * (width - left - right);
  const y = (value: number) => bottom - (value / max) * (bottom - top);
  function inspect(clientX: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const position = clientX - rect.left;
    onYearChange(
      years.reduce(
        (nearest, year) =>
          Math.abs(x(year) - position) < Math.abs(x(nearest) - position) ? year : nearest,
        first,
      ),
    );
  }
  return (
    <div className="trend-chart" ref={ref}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        onPointerMove={(e) => inspect(e.clientX)}
        onPointerDown={(e) => inspect(e.clientX)}
      >
        <title id={`${id}-title`}>
          {valueKey === 'realEarnings' ? 'Inflation-adjusted earnings' : valueKey} by generation,{' '}
          {first} to {last}
        </title>
        <desc id={`${id}-desc`}>
          Lines connect available observations, not annual estimates. Use the year buttons below for
          exact values, or switch to the data table.
        </desc>
        {[0, 1, 2, 3, 4].map((index) => (
          <g key={index}>
            <line
              x1={left}
              x2={width - right}
              y1={y(index * step)}
              y2={y(index * step)}
              stroke="#e7e9e2"
              strokeDasharray={index ? '3 5' : ''}
            />
            <text x={left - 10} y={y(index * step) + 4} textAnchor="end" className="axis-label">
              {valueKey === 'earnings' || valueKey === 'realEarnings'
                ? `$${index * step}`
                : `${index * step}%`}
            </text>
          </g>
        ))}
        {years.map((year) => (
          <text key={year} x={x(year)} y={height - 8} textAnchor="middle" className="axis-label">
            {year}
          </text>
        ))}
        <line
          x1={x(activeYear)}
          x2={x(activeYear)}
          y1={top - 8}
          y2={bottom}
          stroke="#b6beb5"
          strokeDasharray="4 5"
        />
        {generations.map((generation) => {
          const points = years.map((year) =>
            rows.find((row) => row.year === year && row.generation === generation),
          );
          let gap = true;
          const d = points
            .map((row) => {
              if (!row || row[valueKey] === null) {
                gap = true;
                return '';
              }
              const part = `${gap ? 'M' : 'L'}${x(row.year)},${y(row[valueKey])}`;
              gap = false;
              return part;
            })
            .join(' ');
          const info = GENERATION_INFO[generation];
          return (
            <g key={generation}>
              <path
                d={d}
                fill="none"
                stroke={info.color}
                strokeWidth="2.5"
                strokeDasharray={info.dash}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points
                .filter((row): row is Observation => Boolean(row) && row![valueKey] !== null)
                .map((row) => (
                  <g key={row.year}>
                    {row.year === activeYear && (
                      <circle
                        cx={x(row.year)}
                        cy={y(row[valueKey]!)}
                        r="9"
                        fill={info.color}
                        opacity="0.12"
                      />
                    )}
                    <circle
                      cx={x(row.year)}
                      cy={y(row[valueKey]!)}
                      r={row.year === activeYear ? 4 : 2.7}
                      fill="white"
                      stroke={info.color}
                      strokeWidth="2"
                    >
                      <title>
                        {generation}, {row.year}: {formatValue(row[valueKey], valueKey)}
                      </title>
                    </circle>
                  </g>
                ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Sparkline({
  rows,
  valueKey,
  color,
}: {
  rows: Observation[];
  valueKey: ValueKey;
  color: string;
}) {
  const values = rows.filter((row) => row[valueKey] !== null);
  if (!values.length) return null;
  const max = Math.max(...values.map((row) => row[valueKey]!));
  const min = Math.min(...values.map((row) => row[valueKey]!));
  const first = values[0].year,
    last = values[values.length - 1].year;
  const points = values
    .map(
      (row) =>
        `${first === last ? 60 : 4 + ((row.year - first) / (last - first)) * 112},${33 - ((row[valueKey]! - min) / (max - min || 1)) * 26}`,
    )
    .join(' ');
  return (
    <svg className="sparkline" viewBox="0 0 120 40" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
