import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

/**
 * WeatherView — aplicação completa de previsão do tempo.
 *
 * Construída ao longo do treinamento de Spec-Driven Development com GitHub
 * Copilot, do briefing à entrega.
 */
export default function App() {
  const { status, data, error, cities, query, search, selectCity, retry } = useWeather();
  const [unit, setUnit] = useState<Unit>(() => {
    try {
      return localStorage.getItem('weather-unit') === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    } catch {
      return 'celsius';
    }
  });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status === 'success') mainRef.current?.focus();
  }, [status]);

  useEffect(() => {
    try {
      localStorage.setItem('weather-unit', unit);
    } catch {
      return;
    }
  }, [unit]);

  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-2xl text-sun">
              ☀️
            </span>
            <h1 className="text-lg font-bold">WeatherView</h1>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar onSearch={search} disabled={status === 'loading'} />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        ref={mainRef}
        tabIndex={-1}
        aria-busy={status === 'loading'}
        className="mx-auto max-w-5xl space-y-8 px-4 py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
      >
        {status === 'idle' && (
          <EmptyState
            title="Busque uma cidade para começar"
            hint="Ex.: Seattle, Lisboa, São Paulo…"
          />
        )}

        {status === 'loading' && <LoadingState />}

        {status === 'empty' && (
          <EmptyState
            title={`Nenhuma cidade encontrada para "${query}"`}
            hint="Verifique a grafia e tente novamente."
          />
        )}

        {status === 'error' && error && <ErrorState message={error} onRetry={retry} />}

        {status === 'results' && <SearchResults cities={cities} onSelect={selectCity} />}

        {status === 'success' && data && (
          <>
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList forecast={data.forecast} unit={unit} />
          </>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-white/70">
        Dados por{' '}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
          className="text-accent-400 hover:underline"
        >
          Open-Meteo
        </a>
      </footer>
    </div>
  );
}
