import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="error-page">
          <span className="eyebrow">COHORT / SOMETHING WENT WRONG</span>
          <h1>Let’s try that again.</h1>
          <p>The explorer couldn’t be displayed. Reload the page to start a fresh session.</p>
          <button className="button primary" onClick={() => window.location.reload()}>
            Reload explorer
          </button>
        </main>
      );
    return this.props.children;
  }
}
