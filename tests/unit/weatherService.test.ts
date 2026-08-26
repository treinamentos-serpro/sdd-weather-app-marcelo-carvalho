import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const CITY: City = {
  id: 1,
  name: 'Seattle',
  country: 'Estados Unidos',
  admin1: 'Washington',
  latitude: 47.6,
  longitude: -122.33,
  timezone: 'America/Los_Angeles',
};

function mockFetchOnce(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  } as Response);
}

describe('weatherService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('searchCities', () => {
    it('retorna lista vazia para input vazio sem chamar a rede', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const result = await searchCities('   ');
      expect(result).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('não inicia requisição quando o sinal já foi abortado', async () => {
      const fetchSpy = vi.fn();
      const controller = new AbortController();
      controller.abort();
      vi.stubGlobal('fetch', fetchSpy);

      await expect(searchCities('Seattle', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('mapeia resultados de geocoding', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          results: [
            {
              id: 1,
              name: 'Seattle',
              country: 'Estados Unidos',
              admin1: 'Washington',
              latitude: 47.6,
              longitude: -122.33,
              timezone: 'America/Los_Angeles',
            },
          ],
        }),
      );
      const result = await searchCities('Seattle');
      expect(result).toEqual([
        {
          id: 1,
          name: 'Seattle',
          country: 'Estados Unidos',
          admin1: 'Washington',
          latitude: 47.6,
          longitude: -122.33,
          timezone: 'America/Los_Angeles',
        },
      ]);
    });

    it('codifica caracteres especiais e normaliza espaços da consulta', async () => {
      const fetchSpy = mockFetchOnce({ results: [] });
      vi.stubGlobal('fetch', fetchSpy);

      await searchCities('  São   José-dos-Campos  ');

      const requestUrl = new URL(fetchSpy.mock.calls[0][0]);
      expect(requestUrl.searchParams.get('name')).toBe('São José-dos-Campos');
    });

    it('descarta cidades sem campos obrigatórios e limita os resultados a cinco', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          results: [
            { id: 0, name: 'Inválida', latitude: 0, longitude: 0 },
            ...Array.from({ length: 6 }, (_, index) => ({
              id: index + 1,
              name: `Cidade ${index + 1}`,
              latitude: index,
              longitude: index,
              timezone: 'America/Sao_Paulo',
            })),
          ],
        }),
      );

      const result = await searchCities('Cidade');

      expect(result).toHaveLength(5);
      expect(result[0]?.name).toBe('Cidade 1');
    });

    it('retorna vazio quando não há results', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}));
      expect(await searchCities('xyzxyz')).toEqual([]);
    });

    it('rejeita uma estrutura de results inválida', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({ results: 'Seattle' }));

      await expect(searchCities('Seattle')).rejects.toMatchObject({ kind: 'invalid-response' });
    });

    it('lança erro tipado em resposta não-ok', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}, false));
      await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('retorna mensagem amigável quando a rede está offline', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

      await expect(searchCities('Seattle')).rejects.toMatchObject({
        kind: 'network',
        message: 'Falha de rede. Verifique sua conexão.',
      });
    });

    it('retorna mensagem específica quando a requisição expira', async () => {
      vi.useFakeTimers();
      vi.stubGlobal(
        'fetch',
        vi.fn((_, init?: RequestInit) => {
          return new Promise((_, reject) => {
            init?.signal?.addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            });
          });
        }),
      );

      const request = searchCities('Seattle').catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(10_000);

      await expect(request).resolves.toMatchObject({
        kind: 'timeout',
        message: 'A requisição demorou demais. Tente novamente.',
      });
    });
  });

  describe('getWeather', () => {
    it('mapeia current e daily para WeatherData', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          current: {
            time: '2026-06-16T12:00',
            temperature_2m: 18,
            apparent_temperature: 17,
            relative_humidity_2m: 80,
            wind_speed_10m: 10,
            surface_pressure: 1015,
            precipitation: 0,
            weather_code: 3,
          },
          daily: {
            time: ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20'],
            weather_code: [3, 61, 80, 1, 0],
            temperature_2m_max: [20, 19, 22, 24, 25],
            temperature_2m_min: [12, 11, 13, 14, 15],
            precipitation_probability_max: [20, 90, 70, 10, null],
          },
        }),
      );

      const data = await getWeather(CITY);
      expect(data.city).toEqual(CITY);
      expect(data.current).toEqual({
        time: '2026-06-16T12:00',
        temperature: 18,
        apparentTemperature: 17,
        humidity: 80,
        windSpeed: 10,
        pressure: 1015,
        precipitation: 0,
        weatherCode: 3,
      });
      expect(data.current?.temperature).toBe(18);
      expect(data.forecast).toHaveLength(5);
      expect(data.forecast?.[4].precipitationProbability).toBeNull();
    });

    it('preserva blocos ausentes como indisponíveis', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}));

      await expect(getWeather(CITY)).resolves.toMatchObject({
        current: null,
        forecast: null,
      });
    });

    it('limita a previsão aos primeiros cinco dias', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          daily: {
            time: Array.from({ length: 6 }, (_, index) => `2026-06-${String(index + 1).padStart(2, '0')}`),
          },
        }),
      );

      await expect(getWeather(CITY)).resolves.toMatchObject({
        forecast: expect.arrayContaining([expect.objectContaining({ date: '2026-06-01' })]),
      });
      const weather = await getWeather(CITY);
      expect(weather.forecast).toHaveLength(5);
    });

    it('preserva campos e arrays diários incompletos como indisponíveis', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          current: { temperature_2m: null, weather_code: Number.NaN },
          daily: {
            time: ['2026-06-16', null],
            temperature_2m_max: [22],
            precipitation_probability_max: [null, 80],
          },
        }),
      );

      const data = await getWeather(CITY);
      expect(data.current?.temperature).toBeNull();
      expect(data.current?.weatherCode).toBeNull();
      expect(data.forecast).toEqual([
        {
          date: '2026-06-16',
          weatherCode: null,
          max: 22,
          min: null,
          precipitationProbability: null,
        },
        {
          date: null,
          weatherCode: null,
          max: null,
          min: null,
          precipitationProbability: 80,
        },
      ]);
    });
  });
});
