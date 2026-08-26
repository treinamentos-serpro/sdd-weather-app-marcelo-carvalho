import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import type { City, WeatherData } from '../../src/types/weather';

const serviceMocks = vi.hoisted(() => ({
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

vi.mock('../../src/services/weatherService', () => ({
  ...serviceMocks,
  WeatherServiceError: class WeatherServiceError extends Error {},
}));

const city: City = {
  id: 1,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.72,
  longitude: -9.14,
  timezone: 'Europe/Lisbon',
};

const weather: WeatherData = {
  city,
  current: {
    time: '2026-06-16T12:00',
    temperature: 18,
    apparentTemperature: 17,
    humidity: 70,
    windSpeed: 8,
    pressure: 1015,
    precipitation: 0,
    weatherCode: 0,
  },
  forecast: [
    {
      date: '2026-06-16',
      min: 12,
      max: 22,
      weatherCode: 0,
      precipitationProbability: 0,
    },
  ],
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza a marca e o estado inicial vazio', () => {
    render(<App />);
    expect(screen.getByText('WeatherView')).toBeInTheDocument();
    expect(screen.getByText(/busque uma cidade para começar/i)).toBeInTheDocument();
  });

  it('mostra a barra de busca e o alternador de unidade', () => {
    render(<App />);
    expect(screen.getByLabelText(/buscar cidade/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /unidade de temperatura/i })).toBeInTheDocument();
  });

  it('mostra carregamento enquanto a busca está pendente', async () => {
    serviceMocks.searchCities.mockReturnValue(new Promise(() => {}));
    render(<App />);

    await userEvent.type(screen.getByLabelText(/buscar cidade/i), 'Lisboa');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/carregando/i);
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  });

  it('mostra estado vazio quando não encontra cidades', async () => {
    serviceMocks.searchCities.mockResolvedValue([]);
    render(<App />);

    await userEvent.type(screen.getByLabelText(/buscar cidade/i), 'Atlantis');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(await screen.findByText(/nenhuma cidade encontrada/i)).toBeInTheDocument();
  });

  it('mostra erro quando a busca falha e oferece nova tentativa', async () => {
    serviceMocks.searchCities.mockRejectedValue(new Error('network failure'));
    render(<App />);

    await userEvent.type(screen.getByLabelText(/buscar cidade/i), 'Lisboa');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/algo deu errado/i);
    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retryButton).toBeInTheDocument();

    await userEvent.click(retryButton);
    expect(serviceMocks.searchCities).toHaveBeenCalledTimes(2);
    expect(serviceMocks.searchCities).toHaveBeenLastCalledWith('Lisboa', expect.any(AbortSignal));
  });

  it('aguarda a seleção da localidade antes de carregar o clima', async () => {
    serviceMocks.searchCities.mockResolvedValue([city]);
    serviceMocks.getWeather.mockResolvedValue(weather);
    render(<App />);

    await userEvent.type(screen.getByLabelText(/buscar cidade/i), 'Lisboa');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(await screen.findByRole('heading', { name: /escolha uma localidade/i })).toBeInTheDocument();
    expect(serviceMocks.getWeather).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /lisboa/i }));

    expect(await screen.findByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /clima atual/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /previsão de 5 dias/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('main')).toHaveFocus();
  });
});
