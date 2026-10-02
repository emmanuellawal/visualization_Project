import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUpRight,
  Code2,
  ChevronDown,
  ExternalLink,
  Info,
  RotateCcw,
} from 'lucide-react';
import { useDataset } from './hooks/useDataset';
import { Explorer } from './components/Explorer';
function Wordmark() {
  return (
    <a className="wordmark" href="#top" aria-label="Cohort home">
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      cohort<span className="brand-period">.</span>
    </a>
  );
}
function App() {
  const { state, retry } = useDataset();
  return (
    <div id="top">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Wordmark />
          <nav aria-label="Main navigation">
            <a className="nav-active" href="#explorer">
              Explorer
            </a>
            <a href="#methodology">About the data</a>
            <a
              href="https://emmanuellawal.dev"
              target="_blank"
              rel="noreferrer"
              className="portfolio-link"
            >
              Emmanuel Lawal <ArrowUpRight size={15} />
            </a>
          </nav>
        </div>
      </header>
      <main id="main" className="page-shell">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="live-dot" />
              WORKFORCE IN PERSPECTIVE<span className="kicker-divider">/</span>2000—2023
            </div>
            <h1 id="hero-title">
              Every generation.
              <br />
              <span>A different working life.</span>
            </h1>
            <p>
              A closer look at how four generations experience work.
              <br className="desktop-break" /> Follow the patterns. Compare the numbers. Find your
              perspective.
            </p>
            <a className="hero-link" href="#explorer">
              Explore the data <ArrowDown size={15} />
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-label">
              <span>FOUR GENERATIONS</span>
              <span>ONE CHANGING WORLD</span>
            </div>
            <svg viewBox="0 0 350 160" fill="none">
              <path d="M10 40C70 40 64 127 120 114S182 30 226 54S290 115 340 81" stroke="#b45136" />
              <path
                d="M10 111C61 111 71 66 120 81S185 139 229 105S290 61 340 66"
                stroke="#496c53"
              />
              <path d="M10 89C75 89 75 21 126 43S185 109 227 79S279 29 340 41" stroke="#527c9c" />
              <path d="M10 133C66 133 89 99 132 121S190 66 236 49S306 18 340 22" stroke="#937444" />
              {[
                [340, 81, '#b45136'],
                [340, 66, '#496c53'],
                [340, 41, '#527c9c'],
                [340, 22, '#937444'],
              ].map(([cx, cy, color]) => (
                <circle
                  key={color}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill={String(color)}
                  stroke="#f6f5f1"
                  strokeWidth="2"
                />
              ))}
            </svg>
            <div className="art-footer">
              <span>Different paths. Shared questions.</span>
              <span>↗</span>
            </div>
          </div>
        </section>
        <div className="data-notice">
          <Info size={16} />
          <p>
            <strong>A lens for exploration.</strong> This portfolio project uses archived
            demonstration data, not verified labor statistics.
          </p>
          <a href="#methodology">
            Data notes <ArrowUpRight size={14} />
          </a>
        </div>
        {state.status === 'ready' ? (
          <Explorer data={state.data} />
        ) : (
          <section
            id="explorer"
            className="panel loading-panel"
            aria-live="polite"
            aria-busy={state.status === 'loading'}
          >
            {state.status === 'loading' ? (
              <>
                <div className="loading-bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <h2>Bringing the data into focus.</h2>
                <p>Loading the three archived datasets…</p>
              </>
            ) : (
              <>
                <h2>The data couldn’t be loaded.</h2>
                <p>{state.message}</p>
                <button className="button primary" onClick={retry}>
                  <RotateCcw size={15} />
                  Try again
                </button>
              </>
            )}
          </section>
        )}
        <section id="methodology" className="methodology" aria-labelledby="methodology-title">
          <div className="methodology-intro">
            <span className="eyebrow">04 / BEHIND THE NUMBERS</span>
            <h2 id="methodology-title">
              Good visualization
              <br />
              starts with transparency.
            </h2>
            <p>What this dataset can tell you—and what it can’t.</p>
            <a
              className="text-button"
              href="https://github.com/emmanuellawal/visualization_Project"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={16} />
              Explore the source <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="data-notes">
            <details open>
              <summary>
                About this dataset <ChevronDown size={16} />
              </summary>
              <p>
                The original project’s three CSV files cover selected observations from 2000 to
                2023, plus a 2023 industry snapshot. Their provenance cannot be verified from the
                repository. They are retained as demonstration data, not presented as official BLS
                statistics or current economic evidence.
              </p>
            </details>
            <details>
              <summary>
                Generations, age ranges & limitations <ChevronDown size={16} />
              </summary>
              <p>
                Generation labels are preserved from the source files. Age ranges are inconsistent
                between files: for example, “Gen Z” in 2023 is listed as 29–38 in employment data
                and 18–28 in industry data. These are not validated birth cohorts. Industry shares
                may not sum to 100%. No causal or policy conclusions should be drawn.
              </p>
            </details>
            <details>
              <summary>
                How the charts & calculations work <ChevronDown size={16} />
              </summary>
              <p>
                Each point is a recorded observation. Lines only connect observed years and do not
                imply annual measurements. Missing values display as a dash. Summary cards compare
                the first and last available values in the selected period; percentage rates change
                in percentage points (pp). Earnings can show nominal dollars or the file’s provided
                2023-dollar values. The industry snapshot has its own generation control and is
                always 2023.
              </p>
            </details>
            <details>
              <summary>
                Download & verify the source files <ChevronDown size={16} />
              </summary>
              <div className="source-links">
                <a href="/employment_by_generation.csv" download>
                  Employment CSV <ArrowDownToLine size={14} />
                </a>
                <a href="/earnings_by_generation.csv" download>
                  Earnings CSV <ArrowDownToLine size={14} />
                </a>
                <a href="/employment_by_industry.csv" download>
                  Industries CSV <ArrowDownToLine size={14} />
                </a>
                <a href="https://www.bls.gov/cps/" target="_blank" rel="noreferrer">
                  BLS Current Population Survey <ExternalLink size={13} />
                </a>
              </div>
              <p>
                BLS is a reference for verified labor statistics, not a validated source for these
                files.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <Wordmark />
            <p>A study in data, design, and perspective.</p>
          </div>
          <div className="footer-credit">
            <span>Designed & built by</span>
            <a href="https://emmanuellawal.dev" target="_blank" rel="noreferrer">
              Emmanuel Lawal <ArrowUpRight size={16} />
            </a>
          </div>
          <a className="footer-back" href="#top">
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}
export default App;
