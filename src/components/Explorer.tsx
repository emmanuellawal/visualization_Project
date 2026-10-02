import { useEffect, useState, type CSSProperties } from 'react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Info,
  LayoutGrid,
  Link2,
  RotateCcw,
  Table2,
  TrendingUp,
} from 'lucide-react';
import { TrendChart, Sparkline } from './TrendChart';
import { IndustryPanel } from './IndustryPanel';
import {
  GENERATIONS,
  GENERATION_INFO,
  YEARS,
  METRICS,
  exportCsv,
  filterSearch,
  formatDelta,
  formatValue,
  readFilters,
  selectObservations,
  type Dataset,
  type Filters,
  type Generation,
  type Metric,
  type ValueKey,
} from '../lib/data';
export function Explorer({ data }: { data: Dataset }) {
  const [filters, setFilters] = useState<Filters>(() => readFilters(window.location.search));
  const [display, setDisplay] = useState<'chart' | 'table'>('chart');
  const [inspectedYear, setInspectedYear] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState('');
  const [shareFallback, setShareFallback] = useState('');
  useEffect(() => {
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${filterSearch(filters)}${window.location.hash}`,
    );
  }, [filters]);
  useEffect(() => {
    const handlePop = () => setFilters(readFilters(window.location.search));
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);
  const rows = selectObservations(data.observations, filters);
  const years = YEARS.filter((year) => year >= filters.start && year <= filters.end);
  const activeYear =
    inspectedYear !== null && years.some((year) => year === inspectedYear)
      ? inspectedYear
      : filters.end;
  const valueKey: ValueKey =
    filters.metric === 'earnings' && filters.real ? 'realEarnings' : filters.metric;
  const config = METRICS[filters.metric];
  const selectedRows = rows.filter((row) => row.year === activeYear);
  const snapshot = filters.generations.map((generation) => {
    const generationRows = rows.filter(
      (row) => row.generation === generation && row[valueKey] !== null,
    );
    return { generation, generationRows, first: generationRows[0], latest: generationRows.at(-1) };
  });
  const primary = snapshot[0];
  const delta =
    primary.first && primary.latest ? primary.latest[valueKey]! - primary.first[valueKey]! : null;
  function update(next: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...next }));
    setShareStatus('');
    setShareFallback('');
  }
  function toggleGeneration(generation: Generation) {
    const selected = filters.generations.includes(generation);
    if (selected && filters.generations.length === 1) return;
    update({
      generations: GENERATIONS.filter((g) =>
        g === generation ? !selected : filters.generations.includes(g),
      ),
    });
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus('Link copied. Your filters are included.');
      setShareFallback('');
    } catch {
      setShareFallback(window.location.href);
      setShareStatus('Copy the link below to share this view.');
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([exportCsv(rows, valueKey)], { type: 'text/csv;charset=utf-8;' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `cohort-demo-${valueKey}-${filters.start}-${filters.end}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <section id="explorer" className="explorer" aria-labelledby="explorer-title">
        <div className="explorer-heading">
          <div>
            <span className="eyebrow">01 / THE BIG PICTURE</span>
            <h2 id="explorer-title">The workforce, in perspective.</h2>
          </div>
          <div className="export-actions">
            <button className="button subtle" onClick={share}>
              <Link2 size={15} />
              Share view
            </button>
            <button className="button" onClick={download}>
              <ArrowDownToLine size={15} />
              Export CSV
            </button>
          </div>
        </div>
        <div className="share-message" role="status">
          {shareStatus}
        </div>
        {shareFallback && (
          <label className="share-fallback">
            Shareable link
            <input
              readOnly
              value={shareFallback}
              onFocus={(event) => event.currentTarget.select()}
            />
          </label>
        )}
        <div className="filter-bar">
          <div className="generation-filter" role="group" aria-label="Generations to compare">
            {GENERATIONS.map((generation) => {
              const selected = filters.generations.includes(generation);
              return (
                <button
                  key={generation}
                  className={`generation-chip ${selected ? 'selected' : ''}`}
                  aria-pressed={selected}
                  aria-disabled={selected && filters.generations.length === 1}
                  onClick={() => toggleGeneration(generation)}
                >
                  <span
                    className="legend-dot"
                    style={{ background: GENERATION_INFO[generation].color }}
                  >
                    {selected && <Check size={10} strokeWidth={3} />}
                  </span>
                  {generation}
                </button>
              );
            })}
          </div>
          <div className="date-filters">
            <label className="select-wrap">
              <span className="sr-only">Start year</span>
              <select
                aria-label="Start year"
                value={filters.start}
                onChange={(e) => update({ start: Number(e.target.value) })}
              >
                {YEARS.filter((y) => y <= filters.end).map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>
            <span className="date-dash">—</span>
            <label className="select-wrap">
              <span className="sr-only">End year</span>
              <select
                aria-label="End year"
                value={filters.end}
                onChange={(e) => update({ end: Number(e.target.value) })}
              >
                {YEARS.filter((y) => y >= filters.start).map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>
            <button
              className="icon-button"
              aria-label="Reset filters"
              title="Reset filters"
              onClick={() => {
                update(readFilters(''));
                setInspectedYear(null);
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
        <div className="metric-cards" style={{ '--card-count': snapshot.length } as CSSProperties}>
          {snapshot.map(({ generation, generationRows, first, latest }) => {
            const change = first && latest ? latest[valueKey]! - first[valueKey]! : null;
            return (
              <article className="metric-card" key={generation}>
                <div className="metric-label">
                  <span>
                    <i className="dot" style={{ background: GENERATION_INFO[generation].color }} />
                    {generation}
                  </span>
                  <span>{latest?.year ?? 'No data'}</span>
                </div>
                <div className="metric-value">
                  <strong>{formatValue(latest?.[valueKey], valueKey)}</strong>
                  <Sparkline
                    rows={generationRows}
                    valueKey={valueKey}
                    color={GENERATION_INFO[generation].color}
                  />
                </div>
                <div className="metric-change">
                  {change !== null && first && latest && first.year !== latest.year ? (
                    <>
                      <span>{formatDelta(change, valueKey)}</span> since {first.year}
                    </>
                  ) : (
                    'No change comparison available'
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <section className="panel chart-panel" aria-labelledby="chart-title">
          <div className="chart-topbar">
            <div className="metric-tabs" role="group" aria-label="Measure">
              {(Object.keys(METRICS) as Metric[]).map((metric) => (
                <button
                  key={metric}
                  aria-pressed={filters.metric === metric}
                  onClick={() => update({ metric })}
                >
                  {METRICS[metric].label}
                </button>
              ))}
            </div>
            <div className="view-toggle" role="group" aria-label="Display">
              <button
                onClick={() => setDisplay('chart')}
                aria-pressed={display === 'chart'}
                aria-label="Chart view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setDisplay('table')}
                aria-pressed={display === 'table'}
                aria-label="Table view"
              >
                <Table2 size={16} />
              </button>
            </div>
          </div>
          <div className="chart-heading">
            <div>
              <h3 id="chart-title">{config.title}</h3>
              <p>
                {config.description}
                {filters.metric === 'earnings'
                  ? filters.real
                    ? ' · 2023 dollars'
                    : ' · nominal dollars'
                  : ''}
              </p>
            </div>
            {filters.metric === 'earnings' && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.real}
                  onChange={(e) => update({ real: e.target.checked })}
                />
                Adjust for inflation
              </label>
            )}
          </div>
          {display === 'chart' ? (
            <div className="chart-layout">
              <div className="chart-main">
                <TrendChart
                  rows={rows}
                  generations={filters.generations}
                  valueKey={valueKey}
                  years={years}
                  activeYear={activeYear}
                  onYearChange={setInspectedYear}
                />
                <div className="year-selector" role="group" aria-label="Inspect year">
                  <span>Explore a year</span>
                  {years.map((year) => (
                    <button
                      key={year}
                      aria-pressed={activeYear === year}
                      onClick={() => setInspectedYear(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
              <aside className="year-detail" aria-label="Selected year values">
                <span className="eyebrow">IN FOCUS</span>
                <h4>
                  {activeYear}
                  <span>OBSERVED YEAR</span>
                </h4>
                <div className="year-values" aria-live="polite">
                  {filters.generations.map((generation) => (
                    <div key={generation}>
                      <span>
                        <i
                          className="dot"
                          style={{ background: GENERATION_INFO[generation].color }}
                        />
                        {generation}
                      </span>
                      <strong>
                        {formatValue(
                          selectedRows.find((row) => row.generation === generation)?.[valueKey],
                          valueKey,
                        )}
                      </strong>
                    </div>
                  ))}
                </div>
                <p>
                  Hover the chart or select a year to explore.
                  <br />— means no observation.
                </p>
              </aside>
            </div>
          ) : (
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Comparison data table"
            >
              <table>
                <caption>
                  {config.label}, {filters.start}–{filters.end}
                  {valueKey === 'realEarnings'
                    ? ' (2023 dollars)'
                    : valueKey === 'earnings'
                      ? ' (nominal dollars)'
                      : ''}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Year</th>
                    {filters.generations.map((g) => (
                      <th scope="col" key={g}>
                        {g}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {years.map((year) => (
                    <tr key={year}>
                      <th scope="row">{year}</th>
                      {filters.generations.map((g) => (
                        <td key={g}>
                          {formatValue(
                            rows.find((row) => row.generation === g && row.year === year)?.[
                              valueKey
                            ],
                            valueKey,
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="panel-footnote">
                — = no observation; missing data is never replaced with zero.
              </p>
            </div>
          )}
          <div className="chart-caption">
            <span>
              <Info size={13} />
              Archived demonstration data · lines connect observed years
            </span>
            <a href="#methodology">
              How to read this <ArrowUpRight size={13} />
            </a>
          </div>
        </section>
        <div className="explorer-bottom-note">
          <span>
            Showing {rows.filter((row) => row[valueKey] !== null).length} observations across{' '}
            {filters.generations.length} generations
          </span>
          <span>Summary cards use the latest available year in your selection.</span>
        </div>
      </section>
      <div className="secondary-grid">
        <IndustryPanel data={data} />
        <section className="insight-panel" aria-labelledby="insight-title">
          <div className="insight-top">
            <span className="eyebrow">03 / A CLOSER LOOK</span>
            <TrendingUp size={21} />
          </div>
          <span className="insight-tag">
            {primary.generation} · {config.label}
          </span>
          <h2 id="insight-title">
            Numbers tell a story.
            <br />
            <span>Context gives it meaning.</span>
          </h2>
          <div className="insight-stat">
            {delta === null ? '—' : formatDelta(delta, valueKey)}
            <span>
              {primary.first && primary.latest
                ? `${primary.first.year} → ${primary.latest.year}`
                : 'No observations in this period'}
            </span>
          </div>
          <p>
            {primary.first && primary.latest
              ? `In this archived dataset, ${primary.generation} ${config.label.toLowerCase()} moves from ${formatValue(primary.first[valueKey], valueKey)} to ${formatValue(primary.latest[valueKey], valueKey)} over the selected observations.`
              : 'Choose another period or generation to explore available observations.'}
          </p>
          <div className="insight-caveat">
            <CircleHelp size={18} />
            <p>
              A comparison is a starting point. Age, life stage, and the economy all matter—and this
              dataset cannot separate their effects.
            </p>
          </div>
          <a href="#methodology">
            Go beyond the chart <ArrowUpRight size={16} />
          </a>
        </section>
      </div>
    </>
  );
}
