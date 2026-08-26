import { describe, expect, it } from 'vitest';
import { MOCK_WEATHER } from '../../src/lib/mockWeather';

describe('weather fixture', () => {
  it('exibe uma cidade e 5 dias de previsão válidos para UI', () => {
    expect(MOCK_WEATHER.city.name).toBe('Seattle');
    expect(MOCK_WEATHER.current?.temperature).toBeTypeOf('number');
    expect(MOCK_WEATHER.forecast).toHaveLength(5);
    expect(MOCK_WEATHER.forecast?.[0].date).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(MOCK_WEATHER.forecast?.every((day) => (day.precipitationProbability ?? -1) >= 0)).toBe(true);
  });
});
