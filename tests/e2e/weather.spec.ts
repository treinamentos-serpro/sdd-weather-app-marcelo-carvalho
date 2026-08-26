import { expect, type Page, test } from '@playwright/test';

const geocoding = {
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
};

const forecast = {
  current: {
    time: '2026-06-16T12:00',
    temperature_2m: 0,
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
    precipitation_probability_max: [20, 90, 70, 10, 0],
  },
};

async function mockApis(page: Page) {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: geocoding }),
  );
  await page.route('**/api.open-meteo.com/**', (route) => route.fulfill({ json: forecast }));
}

test('fluxo completo: buscar → clima atual → previsão → trocar unidade', async ({ page }) => {
  await mockApis(page);
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();
  await page.getByRole('button', { name: /Seattle, Washington, Estados Unidos/i }).click();

  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  await expect(page.getByRole('region', { name: /previsão de 5 dias/i })).toBeVisible();

  const currentWeather = page.getByRole('region', { name: /clima atual/i });
  // 0°C exibido; após trocar para °F deve virar 32°.
  await expect(currentWeather.getByText('0°C')).toBeVisible();
  await page.getByRole('button', { name: '°F' }).click();
  await expect(currentWeather.getByText('32°F')).toBeVisible();
});

test('estado vazio quando a cidade não existe', async ({ page }) => {
  let forecastRequested = false;
  await page.route('**/geocoding-api.open-meteo.com/**', (route) => route.fulfill({ json: {} }));
  await page.route('**/api.open-meteo.com/**', () => {
    forecastRequested = true;
  });
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('xyzxyz');
  await page.getByRole('button', { name: /buscar/i }).click();

  await expect(page.getByText(/nenhuma cidade encontrada/i)).toBeVisible();
  expect(forecastRequested).toBe(false);
});

test('busca vazia exibe validação sem chamar a API', async ({ page }) => {
  let geocodingRequested = false;
  await page.route('**/geocoding-api.open-meteo.com/**', () => {
    geocodingRequested = true;
  });
  await page.goto('/');

  await page.getByRole('button', { name: /buscar/i }).click();

  await expect(page.getByRole('alert')).toHaveText(/informe uma cidade/i);
  expect(geocodingRequested).toBe(false);
});

test('preserva caracteres especiais e normaliza espaços na URL de busca', async ({ page }) => {
  let requestedName = '';
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    requestedName = new URL(route.request().url()).searchParams.get('name') ?? '';
    await route.fulfill({ json: {} });
  });
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('  São   José-dos-Campos  ');
  await page.getByRole('button', { name: /buscar/i }).click();

  await expect(page.getByText(/nenhuma cidade encontrada/i)).toBeVisible();
  expect(requestedName).toBe('São José-dos-Campos');
});

test('renderiza forecast incompleto com fallbacks seguros', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: geocoding }),
  );
  await page.route('**/api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        current: {},
        daily: { time: ['2026-06-16'], temperature_2m_max: [null] },
      },
    }),
  );
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();
  await page.getByRole('button', { name: /Seattle, Washington, Estados Unidos/i }).click();

  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  await expect(page.getByRole('region', { name: /clima atual/i })).toContainText('Indisponível');
  await expect(page.getByRole('region', { name: /previsão de 5 dias/i })).toContainText(
    /parte da previsão.*indisponível/i,
  );
  await expect(page.locator('body')).not.toContainText('undefined');
  await expect(page.locator('body')).not.toContainText('NaN');
});

test('viewport mobile renderiza o fluxo principal', async ({ page }) => {
  await mockApis(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();
  await page.getByRole('button', { name: /Seattle, Washington, Estados Unidos/i }).click();
  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
});
