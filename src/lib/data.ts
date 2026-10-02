import Papa from 'papaparse';

export const GENERATIONS = ['Gen Z', 'Millennials', 'Gen X', 'Boomers'] as const;
export type Generation = (typeof GENERATIONS)[number];
export const YEARS = [2000, 2005, 2010, 2015, 2020, 2023] as const;
export type Metric = 'unemployment' | 'earnings' | 'participation';
export type ValueKey = Metric | 'realEarnings';
export const GENERATION_INFO: Record<Generation, { color: string; dash: string; label: string }> = {
  'Gen Z': { color: '#b45136', dash: '', label: 'The newest chapter' },
  Millennials: { color: '#496c53', dash: '7 3', label: 'Finding their footing' },
  'Gen X': { color: '#527c9c', dash: '3 3', label: 'The middle chapter' },
  Boomers: { color: '#937444', dash: '10 3 2 3', label: 'A changing relationship' },
};
export const METRICS: Record<Metric, { label: string; title: string; description: string }> = {
  unemployment: {
    label: 'Unemployment',
    title: 'A shared economy. Different experiences.',
    description: 'Unemployment rate · percentage of the labor force',
  },
  earnings: {
    label: 'Weekly earnings',
    title: 'The distance between paychecks.',
    description: 'Median weekly earnings · US dollars',
  },
  participation: {
    label: 'Participation',
    title: 'Who’s taking part in the workforce?',
    description: 'Labor force participation · percentage of the population',
  },
};
export interface Observation {
  year: number;
  generation: Generation;
  unemployment: number;
  participation: number;
  earnings: number | null;
  realEarnings: number | null;
}
export interface Industry {
  year: number;
  generation: Generation;
  industry: string;
  share: number;
}
export interface Dataset {
  observations: Observation[];
  industries: Industry[];
}
export interface Filters {
  metric: Metric;
  generations: Generation[];
  start: number;
  end: number;
  real: boolean;
}

function parseCsv(text: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });
  if (result.errors.length || !result.data.length)
    throw new Error('A dataset is empty or contains malformed CSV.');
  return result.data;
}
function numeric(value: string | undefined, field: string, maximum = Infinity): number {
  if (!value?.trim()) throw new Error(`Missing ${field} value.`);
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > maximum) throw new Error(`Invalid ${field} value.`);
  return n;
}
function identity(row: Record<string, string>) {
  const generation = row.Generation?.trim() as Generation;
  if (!GENERATIONS.includes(generation)) throw new Error('Unknown generation in dataset.');
  const year = numeric(row.Year, 'year');
  if (!Number.isInteger(year) || year < 1900 || year > 2100)
    throw new Error('Invalid observation year.');
  return { year, generation };
}
export function buildDataset(employment: string, earnings: string, industries: string): Dataset {
  const wageMap = new Map<string, { earnings: number; realEarnings: number }>();
  for (const row of parseCsv(earnings)) {
    const { year, generation } = identity(row);
    const key = `${year}-${generation}`;
    if (wageMap.has(key)) throw new Error('Duplicate earnings observation.');
    wageMap.set(key, {
      earnings: numeric(row.Median_Weekly_Earnings, 'earnings'),
      realEarnings: numeric(row.Real_Earnings_2023_Dollars, 'real earnings'),
    });
  }
  const seen = new Set<string>();
  const observations = parseCsv(employment)
    .map((row) => {
      const { year, generation } = identity(row);
      const key = `${year}-${generation}`;
      if (seen.has(key)) throw new Error('Duplicate employment observation.');
      seen.add(key);
      return {
        year,
        generation,
        unemployment: numeric(row.Unemployment_Rate, 'unemployment', 100),
        participation: numeric(row.Labor_Force_Participation_Rate, 'participation', 100),
        earnings: wageMap.get(key)?.earnings ?? null,
        realEarnings: wageMap.get(key)?.realEarnings ?? null,
      };
    })
    .sort((a, b) => a.year - b.year);
  const industryKeys = new Set<string>();
  const industryRows = parseCsv(industries).map((row) => {
    const id = identity(row);
    if (!row.Industry?.trim()) throw new Error('Missing industry name.');
    const key = `${id.year}-${id.generation}-${row.Industry}`;
    if (industryKeys.has(key)) throw new Error('Duplicate industry observation.');
    industryKeys.add(key);
    return {
      ...id,
      industry: row.Industry.trim(),
      share: numeric(row.Employment_Share, 'industry share', 100),
    };
  });
  return { observations, industries: industryRows };
}
export function readFilters(search: string): Filters {
  const params = new URLSearchParams(search);
  const metric = params.get('metric') as Metric;
  const generations = GENERATIONS.filter((g) => params.get('generations')?.split(',').includes(g));
  const start = Number(params.get('from') ?? 2000);
  const end = Number(params.get('to') ?? 2023);
  const validStart = YEARS.some((y) => y === start) ? start : 2000;
  const validEnd = YEARS.some((y) => y === end) ? end : 2023;
  return {
    metric: Object.hasOwn(METRICS, metric) ? metric : 'unemployment',
    generations: generations.length ? generations : [...GENERATIONS],
    start: Math.min(validStart, validEnd),
    end: Math.max(validStart, validEnd),
    real: params.get('prices') === 'real',
  };
}
export function filterSearch(filters: Filters) {
  const params = new URLSearchParams();
  params.set('metric', filters.metric);
  params.set('generations', filters.generations.join(','));
  params.set('from', String(filters.start));
  params.set('to', String(filters.end));
  if (filters.real) params.set('prices', 'real');
  return params.toString();
}
export function selectObservations(data: Observation[], filters: Filters) {
  return data.filter(
    (row) =>
      filters.generations.includes(row.generation) &&
      row.year >= filters.start &&
      row.year <= filters.end,
  );
}
export function formatValue(value: number | null | undefined, key: ValueKey): string {
  if (value == null) return '—';
  return key === 'earnings' || key === 'realEarnings'
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value)
    : `${value.toFixed(1)}%`;
}
export function formatDelta(value: number, key: ValueKey) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return key === 'earnings' || key === 'realEarnings'
    ? `${sign}${formatValue(Math.abs(value), key)}`
    : `${sign}${Math.abs(value).toFixed(1)} pp`;
}
export function exportCsv(observations: Observation[], key: ValueKey) {
  return Papa.unparse(
    observations.map((row) => ({
      Year: row.year,
      Generation: row.generation,
      Metric: key,
      Value: row[key],
      Unit:
        key === 'realEarnings'
          ? '2023 USD per week'
          : key === 'earnings'
            ? 'nominal USD per week'
            : 'percent',
      Dataset_status: 'Archived demonstration data; provenance unverified',
    })),
    { escapeFormulae: true },
  );
}
