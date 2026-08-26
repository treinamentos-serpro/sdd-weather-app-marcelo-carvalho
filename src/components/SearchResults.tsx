import type { City } from '../types/weather';

interface SearchResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

export default function SearchResults({ cities, onSelect }: SearchResultsProps) {
  if (cities.length === 0) return null;

  return (
    <section aria-label="Resultados da busca" aria-live="polite">
      <h2 className="mb-3 text-xl font-bold">Escolha uma localidade</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {cities.slice(0, 5).map((city) => (
          <li key={city.id}>
            <button
              type="button"
              onClick={() => onSelect(city)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-accent-400 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              <span className="block font-semibold">{city.name}</span>
              <span className="block text-sm text-white/70">
                {[city.admin1, city.country].filter(Boolean).join(', ')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}