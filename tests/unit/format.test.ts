import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('format', () => {
  it('usa traço para data ausente ou inválida', () => {
    expect(getDayLabel('—', 2)).toBe('—');
    expect(getShortDate('—')).toBe('—');
  });
  it('rotula o primeiro e o segundo dia', () => {
    expect(getDayLabel('2026-06-16', 0)).toBe('Hoje');
    expect(getDayLabel('2026-06-17', 1)).toBe('Amanhã');
  });

  it('usa dia da semana para os demais', () => {
    // 2026-06-18 é uma quinta-feira.
    expect(getDayLabel('2026-06-18', 2)).toBe('Qui');
  });

  it('formata data curta', () => {
    expect(getShortDate('2026-06-16')).toBe('16 Jun');
    expect(getShortDate('2026-12-25')).toBe('25 Dez');
  });
});
