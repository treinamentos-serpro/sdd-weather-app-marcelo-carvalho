import type { WeatherData } from '../types/weather';

export const MOCK_WEATHER: WeatherData = {
  city: {
    id: 1,
    name: 'Seattle',
    country: 'Estados Unidos',
    admin1: 'Washington',
    latitude: 47.6062,
    longitude: -122.3321,
    timezone: 'America/Los_Angeles',
  },
  current: {
    time: '2026-06-16T12:00',
    temperature: 18,
    apparentTemperature: 17,
    humidity: 80,
    windSpeed: 10,
    pressure: 1015,
    precipitation: 0,
    weatherCode: 3,
  },
  forecast: [
    { date: '2026-06-16', min: 12, max: 20, weatherCode: 3, precipitationProbability: 20 },
    { date: '2026-06-17', min: 11, max: 19, weatherCode: 61, precipitationProbability: 90 },
    { date: '2026-06-18', min: 13, max: 22, weatherCode: 80, precipitationProbability: 70 },
    { date: '2026-06-19', min: 14, max: 24, weatherCode: 1, precipitationProbability: 10 },
    { date: '2026-06-20', min: 15, max: 25, weatherCode: 0, precipitationProbability: 0 },
  ],
};
