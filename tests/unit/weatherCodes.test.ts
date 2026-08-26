import { describe, expect, it } from 'vitest';
import { getWeatherIcon, getWeatherInfo, getWeatherLabel } from '../../src/lib/weatherCodes';

describe('weatherCodes', () => {
  it('mapeia códigos conhecidos', () => {
    expect(getWeatherInfo(0)).toEqual({ label: 'Céu limpo', icon: '☀️' });
    expect(getWeatherLabel(95)).toBe('Trovoadas');
    expect(getWeatherIcon(95)).toBe('⛈️');
  });

  it('usa fallback para código desconhecido', () => {
    const info = getWeatherInfo(123456);
    expect(info).toEqual({ label: 'Condição desconhecida', icon: '🌡️' });
  });
});
