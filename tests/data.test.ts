import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  buildDataset,
  readFilters,
  filterSearch,
  selectObservations,
  formatValue,
  formatDelta,
  exportCsv,
} from '../src/lib/data';
const employment = readFileSync(
  new URL('../public/employment_by_generation.csv', import.meta.url),
  'utf8',
);
const earnings = readFileSync(
  new URL('../public/earnings_by_generation.csv', import.meta.url),
  'utf8',
);
const industries = readFileSync(
  new URL('../public/employment_by_industry.csv', import.meta.url),
  'utf8',
);
const data = buildDataset(employment, earnings, industries);

describe('archived dataset integrity', () => {
  it('joins by year and generation, retaining exact provided values', () => {
    expect(data.observations).toHaveLength(22);
    expect(data.industries).toHaveLength(48);
    expect(
      data.observations.find((row) => row.year === 2023 && row.generation === 'Gen Z'),
    ).toEqual({
      year: 2023,
      generation: 'Gen Z',
      unemployment: 5.9,
      participation: 81.7,
      earnings: 634,
      realEarnings: 634,
    });
  });
  it('does not invent early Gen Z observations', () => {
    expect(
      selectObservations(data.observations, readFilters('?generations=Gen+Z&from=2000&to=2005')),
    ).toEqual([]);
    expect(formatValue(null, 'unemployment')).toBe('—');
  });
  it('rejects blank and malformed rates instead of silently replacing them with zero', () => {
    expect(() =>
      buildDataset(employment.replace(',3.0,77.2', ',,77.2'), earnings, industries),
    ).toThrow('Missing unemployment');
    expect(() =>
      buildDataset(employment.replace(',3.0,77.2', ',bad,77.2'), earnings, industries),
    ).toThrow('Invalid unemployment');
    expect(() =>
      buildDataset(employment.replace(',3.0,77.2', ',101,77.2'), earnings, industries),
    ).toThrow('Invalid unemployment');
  });
  it('rejects duplicated join keys', () => {
    expect(() =>
      buildDataset(employment + '\n' + employment.split('\n')[1], earnings, industries),
    ).toThrow('Duplicate employment');
  });
  it('keeps missing earnings as null', () => {
    const shortened = earnings
      .split('\n')
      .filter((line) => !line.startsWith('2023,Gen Z,'))
      .join('\n');
    expect(
      buildDataset(employment, shortened, industries).observations.find(
        (row) => row.year === 2023 && row.generation === 'Gen Z',
      )?.earnings,
    ).toBeNull();
  });
});
describe('filters and exports', () => {
  it('round-trips a shared view and bounds invalid URL input', () => {
    const filters = readFilters(
      '?metric=earnings&generations=Gen+Z,Gen+X&from=2010&to=2020&prices=real',
    );
    expect(readFilters('?' + filterSearch(filters))).toEqual(filters);
    expect(readFilters('?metric=__proto__&from=nope&to=3000&generations=fake')).toEqual(
      readFilters(''),
    );
    expect(readFilters('?from=2023&to=2000')).toMatchObject({ start: 2000, end: 2023 });
  });
  it('exports exactly the filtered rows with units and a provenance warning', () => {
    const rows = selectObservations(data.observations, readFilters('?generations=Gen+Z&from=2020'));
    expect(rows).toHaveLength(2);
    const csv = exportCsv(rows, 'realEarnings');
    expect(csv).toContain('2020,Gen Z,realEarnings,648,2023 USD per week');
    expect(csv).toContain('provenance unverified');
    expect(csv).not.toContain('Boomers');
  });
  it('uses percentage-point deltas and dollar units', () => {
    expect(formatDelta(-12.4, 'unemployment')).toBe('−12.4 pp');
    expect(formatDelta(245, 'earnings')).toBe('+$245');
    expect(formatValue(1124, 'realEarnings')).toBe('$1,124');
  });
});
