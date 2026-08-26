import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

/** Barra de busca de cidade. Bloqueia submit com input vazio. */
export default function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [showRequiredError, setShowRequiredError] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      setShowRequiredError(true);
      return;
    }
    setShowRequiredError(false);
    onSearch(trimmed);
  }

  return (
    <form role="search" aria-busy={disabled} onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md focus-within:border-accent-400">
        <span aria-hidden="true" className="text-white/70">
          🔍
        </span>
        <label htmlFor="city-search" className="sr-only">
          Buscar cidade
        </label>
        <input
          id="city-search"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar cidade…"
          autoComplete="off"
          disabled={disabled}
          aria-describedby={showRequiredError ? 'city-search-error' : undefined}
          aria-invalid={showRequiredError}
          className="flex-1 bg-transparent text-white placeholder-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-accent-400 px-4 py-1.5 text-sm font-semibold text-night-900 transition hover:bg-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      {showRequiredError && (
        <p id="city-search-error" role="alert" className="mt-2 text-sm text-white/80">
          Informe uma cidade para pesquisar.
        </p>
      )}
    </form>
  );
}
