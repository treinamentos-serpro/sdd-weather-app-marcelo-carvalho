import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[] | null;
  unit: Unit;
}

/** Grid responsivo com a previsão de 5 dias. */
export default function ForecastList({ forecast, unit }: ForecastListProps) {
  if (!forecast) {
    return (
      <section aria-label="Previsão de 5 dias">
        <h2 className="mb-4 text-xl font-bold">Previsão de 5 dias</h2>
        <p role="status" className="text-white/80">
          Dados da previsão indisponíveis.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Previsão de 5 dias">
      <h2 className="mb-4 text-xl font-bold">Previsão de 5 dias</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day, index) => (
          <ForecastCard
            key={`${day.date ?? 'indisponível'}-${day.weatherCode ?? 'indisponível'}-${day.max ?? 'indisponível'}-${day.min ?? 'indisponível'}-${day.precipitationProbability ?? 'indisponível'}`}
            day={day}
            index={index}
            unit={unit}
          />
        ))}
      </ul>
      {forecast.length < 5 && (
        <p role="status" className="mt-4 text-sm text-white/80">
          Parte da previsão para os próximos dias está indisponível.
        </p>
      )}
    </section>
  );
}
