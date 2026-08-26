import { getDayLabel, getShortDate } from '../lib/format';
import { formatTemperatureWithUnit } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

function formatTemperature(value: number | null, unit: Unit): string {
  return value === null ? 'Indisponível' : formatTemperatureWithUnit(value, unit);
}

/** Card de um dia da previsão. */
export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  return (
    <li className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md">
      <p className="font-semibold">{getDayLabel(day.date ?? '—', index)}</p>
      <p className="text-xs text-white/70">{getShortDate(day.date ?? '—')}</p>
      <span aria-hidden="true" className="text-3xl">
        {getWeatherIcon(day.weatherCode ?? -1)}
      </span>
      <span className="sr-only">{getWeatherLabel(day.weatherCode ?? -1)}</span>
      <p className="text-sm">
        <span className="font-semibold">{formatTemperature(day.max, unit)}</span>{' '}
        <span className="text-white/70">{formatTemperature(day.min, unit)}</span>
      </p>
      <p className="text-xs text-accent-400">
        <span aria-hidden="true">💧 </span>
        Probabilidade de precipitação:{' '}
        {day.precipitationProbability === null ? 'Indisponível' : `${day.precipitationProbability}%`}
      </p>
    </li>
  );
}
