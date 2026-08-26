import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;
type WeatherErrorKind = 'network' | 'timeout' | 'http' | 'invalid-response';

/** Erro tipado da camada de dados, com mensagem amigável ao usuário. */
export class WeatherServiceError extends Error {
  readonly kind: WeatherErrorKind;

  constructor(message: string, kind: WeatherErrorKind) {
    super(message);
    this.name = 'WeatherServiceError';
    this.kind = kind;
  }
}

/** Faz um fetch com timeout via AbortController. */
async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response> {
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  const controller = new AbortController();
  const abortRequest = () => controller.abort();
  signal?.addEventListener('abort', abortRequest, { once: true });
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (signal?.aborted) throw err;
      throw new WeatherServiceError('A requisição demorou demais. Tente novamente.', 'timeout');
    }
    throw new WeatherServiceError('Falha de rede. Verifique sua conexão.', 'network');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortRequest);
  }
}

function invalidResponse(): WeatherServiceError {
  return new WeatherServiceError('A resposta do serviço é inválida. Tente novamente.', 'invalid-response');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getJsonArray(record: Record<string, unknown>, field: string): unknown[] {
  const value = record[field];
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw invalidResponse();
  return value;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw invalidResponse();
  }
}

/**
 * Busca cidades por nome (geocoding). Retorna lista vazia quando não há
 * resultados — o estado "vazio" é tratado pela camada de UI.
 */
export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const query = name.trim().replace(/\s+/g, ' ');
  if (!query) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;
  const res = await fetchWithTimeout(url, signal);
  if (!res.ok) {
    throw new WeatherServiceError('Não foi possível buscar a cidade. Tente novamente.', 'http');
  }

  const data = await readJson(res);
  if (!isRecord(data)) throw invalidResponse();
  if (data.results === undefined || data.results === null) return [];
  if (!Array.isArray(data.results)) throw invalidResponse();

  return data.results.flatMap((result) => {
    if (!isRecord(result)) return [];
    const id = asNumber(result.id);
    const cityName = asString(result.name);
    const latitude = asNumber(result.latitude);
    const longitude = asNumber(result.longitude);
    const timezone = asString(result.timezone);
    if (id === null || cityName === null || latitude === null || longitude === null || timezone === null) {
      return [];
    }

    return [
      {
        id,
        name: cityName,
        country: asString(result.country) ?? '',
        admin1: asString(result.admin1) ?? undefined,
        latitude,
        longitude,
        timezone,
      },
    ];
  }).slice(0, 5);
}

function mapCurrent(value: unknown): CurrentWeather | null {
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) throw invalidResponse();
  return {
    time: asString(value.time),
    temperature: asNumber(value.temperature_2m),
    apparentTemperature: asNumber(value.apparent_temperature),
    humidity: asNumber(value.relative_humidity_2m),
    windSpeed: asNumber(value.wind_speed_10m),
    pressure: asNumber(value.surface_pressure),
    precipitation: asNumber(value.precipitation),
    weatherCode: asNumber(value.weather_code),
  };
}

function mapForecast(value: unknown): ForecastDay[] | null {
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) throw invalidResponse();
  const dates = getJsonArray(value, 'time');
  const weatherCodes = getJsonArray(value, 'weather_code');
  const maxTemperatures = getJsonArray(value, 'temperature_2m_max');
  const minTemperatures = getJsonArray(value, 'temperature_2m_min');
  const precipitationProbabilities = getJsonArray(value, 'precipitation_probability_max');
  const length = Math.min(dates.length, 5);

  return Array.from({ length }, (_, i) => ({
    date: asString(dates[i]),
    weatherCode: asNumber(weatherCodes[i]),
    max: asNumber(maxTemperatures[i]),
    min: asNumber(minTemperatures[i]),
    precipitationProbability: asNumber(precipitationProbabilities[i]),
  }));
}

/**
 * Busca o clima atual e a previsão de 5 dias para uma cidade.
 * Temperaturas retornam em Celsius (conversão fica na UI).
 */
export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
  });

  const res = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`, signal);
  if (!res.ok) {
    throw new WeatherServiceError('Não foi possível carregar o clima. Tente novamente.', 'http');
  }

  const data = await readJson(res);
  if (!isRecord(data)) throw invalidResponse();
  const timezone = data.timezone === undefined || data.timezone === null ? city.timezone : asString(data.timezone);
  if (timezone === null) throw invalidResponse();

  return {
    city: { ...city, timezone },
    current: mapCurrent(data.current),
    forecast: mapForecast(data.daily),
  };
}
