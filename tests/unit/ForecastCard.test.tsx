import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../src/components/ForecastCard';

describe('ForecastCard', () => {
  it('expõe a condição meteorológica sem depender do title do ícone', () => {
    render(
      <ForecastCard
        day={{
          date: '2026-06-16',
          min: 12,
          max: 22,
          weatherCode: 3,
          precipitationProbability: 40,
        }}
        index={0}
        unit="celsius"
      />,
    );

    expect(screen.getByText(/nublado/i)).toBeInTheDocument();
    expect(screen.getByText(/probabilidade de precipitação: 40%/i)).toBeInTheDocument();
  });
});
