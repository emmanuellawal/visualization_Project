import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GENERATIONS, GENERATION_INFO, type Dataset, type Generation } from '../lib/data';
export function IndustryPanel({ data }: { data: Dataset }) {
  const [generation, setGeneration] = useState<Generation>('Gen Z');
  const [expanded, setExpanded] = useState(false);
  const rows = data.industries
    .filter((row) => row.generation === generation)
    .sort((a, b) => b.share - a.share);
  const max = Math.ceil(Math.max(...rows.map((row) => row.share), 1) / 5) * 5;
  return (
    <section className="panel industry-panel" aria-labelledby="industry-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">02 / INDUSTRY SNAPSHOT</span>
          <h2 id="industry-title">Where work happens.</h2>
        </div>
        <span className="small-tag">2023 only</span>
      </div>
      <div className="industry-toolbar">
        <p>Employment share by industry</p>
        <label className="select-wrap">
          <span className="sr-only">Industry generation</span>
          <select value={generation} onChange={(e) => setGeneration(e.target.value as Generation)}>
            {GENERATIONS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <ChevronDown size={14} />
        </label>
      </div>
      <div className="industry-bars" aria-live="polite">
        {rows.slice(0, expanded ? rows.length : 5).map((row, index) => (
          <div className="industry-row" key={row.industry}>
            <span className="industry-number">{String(index + 1).padStart(2, '0')}</span>
            <div className="industry-detail">
              <div>
                <span>{row.industry}</span>
                <strong>{row.share.toFixed(1)}%</strong>
              </div>
              <div className="bar-track">
                <div
                  style={{
                    width: `${(row.share / max) * 100}%`,
                    background: GENERATION_INFO[generation].color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className="text-button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        {expanded ? 'Show top 5 industries' : `View all ${rows.length} industries`}
        <ChevronDown className={expanded ? 'rotated' : ''} size={15} />
      </button>
      <p className="panel-footnote">
        Independent 2023 snapshot · source shares are shown as provided, without normalizing to
        100%.
      </p>
    </section>
  );
}
