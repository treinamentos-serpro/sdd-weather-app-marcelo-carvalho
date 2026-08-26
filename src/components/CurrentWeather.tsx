import { formatTemperatureWithUnit } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';
import { formatDateTime } from '../lib/format';
import type { City, CurrentWeather as CurrentWeatherType, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherType | null;
  unit: Unit;
}

interface MetricProps {
  icon: string;
  label: string;
  value: string;
}

function formatTemperature(value: number | null, unit: Unit): string {
  return value === null ? 'Indisponível' : formatTemperatureWithUnit(value, unit);
}

function formatValue(value: number | null, suffix: string): string {
  return value === null ? 'Indisponível' : `${Math.round(value)}${suffix}`;
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
      <span aria-hidden="true" className="text-xl">
        {icon}
      </span>
      <div>
        <p className="text-xs text-white/70">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

/** Seção "hero" com as condições atuais da cidade selecionada. */
export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const location = [city.admin1, city.country].filter(Boolean).join(', ');

  if (!current) {
    return (
      <section
        aria-label="Clima atual"
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-glass md:p-8"
      >
        <h2 className="text-2xl font-bold md:text-3xl">{city.name}</h2>
        {location && <p className="text-white/75">{location}</p>}
        <p role="status" className="mt-6 text-white/80">
          Dados do clima atual indisponíveis.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Clima atual"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-glass md:p-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">{city.name}</h2>
          {location && <p className="text-white/75">{location}</p>}

          <div className="mt-6 flex items-center gap-4">
            <span aria-hidden="true" className="text-6xl">
              {getWeatherIcon(current.weatherCode ?? -1)}
            </span>
            <span className="text-6xl font-light md:text-7xl">
              {formatTemperature(current.temperature, unit)}
            </span>
          </div>
          <p className="mt-2 text-white/80">{getWeatherLabel(current.weatherCode ?? -1)}</p>
          <p className="mt-2 text-sm text-white/70">Medição: {formatDateTime(current.time, city.timezone)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric
            icon="🌡️"
            label="Sensação térmica"
            value={formatTemperature(current.apparentTemperature, unit)}
          />
          <Metric icon="💧" label="Umidade" value={formatValue(current.humidity, '%')} />
          <Metric icon="💨" label="Vento" value={formatValue(current.windSpeed, ' km/h')} />
          <Metric icon="🌧️" label="Precipitação" value={formatValue(current.precipitation, ' mm')} />
          <Metric icon="📊" label="Pressão" value={formatValue(current.pressure, ' hPa')} />
        </div>
      </div>
    </section>
  );
}
