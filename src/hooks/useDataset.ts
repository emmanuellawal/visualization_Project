import { useEffect, useState } from 'react';
import { buildDataset, type Dataset } from '../lib/data';

type State =
  { status: 'loading' } | { status: 'ready'; data: Dataset } | { status: 'error'; message: string };
export function useDataset() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ status: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const files = [
          'employment_by_generation.csv',
          'earnings_by_generation.csv',
          'employment_by_industry.csv',
        ];
        const texts = await Promise.all(
          files.map(async (file) => {
            const response = await fetch(`${import.meta.env.BASE_URL}${file}`, {
              signal: controller.signal,
            });
            if (!response.ok) throw new Error(`Could not load ${file} (HTTP ${response.status}).`);
            return response.text();
          }),
        );
        const data = buildDataset(texts[0], texts[1], texts[2]);
        if (!controller.signal.aborted) setState({ status: 'ready', data });
      } catch (error) {
        if (!controller.signal.aborted)
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'The datasets could not be loaded.',
          });
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);
  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  };
  return { state, retry };
}
