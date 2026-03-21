import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWeather, weatherCondition, weatherIcon, _clearCache } from '../weatherService';

// Mock current date to control forecast window
const NOW = new Date('2026-04-01T12:00:00Z');

function mockGeoResponse(lat = 48.8566, lon = 2.3522) {
  return {
    ok: true,
    json: async () => ({
      results: [{ latitude: lat, longitude: lon }],
    }),
  };
}

function mockForecastResponse(days = 3) {
  const time = Array.from({ length: days }, (_, i) => `2026-04-0${i + 1}`);
  return {
    ok: true,
    json: async () => ({
      daily: {
        time,
        temperature_2m_max: time.map(() => 20),
        temperature_2m_min: time.map(() => 10),
        precipitation_probability_max: time.map(() => 30),
        weathercode: time.map(() => 2),
      },
    }),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.stubGlobal('fetch', vi.fn());
  _clearCache();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('fetchWeather', () => {
  it('returns a valid WeatherSummary on success', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(mockGeoResponse() as any)
      .mockResolvedValueOnce(mockForecastResponse(3) as any);

    const result = await fetchWeather('Paris', '2026-04-01', '2026-04-03');
    expect(result.avgHigh).toBe(20);
    expect(result.avgLow).toBe(10);
    expect(result.maxPrecipProb).toBe(30);
    expect(result.forecasts).toHaveLength(3);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns cached result on second call', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(mockGeoResponse() as any)
      .mockResolvedValueOnce(mockForecastResponse(3) as any);

    await fetchWeather('Paris', '2026-04-01', '2026-04-03');
    const result2 = await fetchWeather('Paris', '2026-04-01', '2026-04-03');
    expect(result2.avgHigh).toBe(20);
    expect(fetchMock).toHaveBeenCalledTimes(2); // no additional fetch
  });

  it('throws outsideForecastWindow for trips too far out', async () => {
    await expect(
      fetchWeather('Paris', '2026-05-01', '2026-05-10')
    ).rejects.toThrow('outsideForecastWindow');
  });

  it('throws geocodingFailed when no results', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as any);

    await expect(
      fetchWeather('Nowhere', '2026-04-01', '2026-04-03')
    ).rejects.toThrow('geocodingFailed');
  });

  it('throws invalidWeatherResponse on non-200 forecast', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(mockGeoResponse() as any)
      .mockResolvedValueOnce({ ok: false, status: 500 } as any);

    await expect(
      fetchWeather('Paris', '2026-04-01', '2026-04-03')
    ).rejects.toThrow('invalidWeatherResponse');
  });

  it('respects caller abort signal without retrying', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      fetchWeather('Paris', '2026-04-01', '2026-04-03', controller.signal)
    ).rejects.toThrow();
  });

  it('retries on internal timeout (AbortError from timer)', async () => {
    const fetchMock = vi.mocked(fetch);
    // First call times out (AbortError), retry succeeds
    const timeoutErr = new DOMException('The operation was aborted.', 'AbortError');
    fetchMock
      .mockRejectedValueOnce(timeoutErr)
      // Retry succeeds
      .mockResolvedValueOnce(mockGeoResponse() as any)
      .mockResolvedValueOnce(mockForecastResponse(3) as any);

    const resultPromise = fetchWeather('Paris', '2026-04-01', '2026-04-03');
    await vi.advanceTimersByTimeAsync(20000);
    const result = await resultPromise;
    expect(result.avgHigh).toBe(20);
  });

  it('deduplicates concurrent fetches for same key', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(mockGeoResponse() as any)
      .mockResolvedValueOnce(mockForecastResponse(3) as any);

    const [r1, r2] = await Promise.all([
      fetchWeather('Paris', '2026-04-01', '2026-04-03'),
      fetchWeather('Paris', '2026-04-01', '2026-04-03'),
    ]);
    expect(r1).toEqual(r2);
    expect(fetchMock).toHaveBeenCalledTimes(2); // geo + forecast, not 4
  });

  it('retries once on transient failure', async () => {
    const fetchMock = vi.mocked(fetch);
    // First geo call succeeds, first forecast fails with transient, retry succeeds
    fetchMock
      .mockResolvedValueOnce(mockGeoResponse() as any)
      .mockRejectedValueOnce(new Error('network down'))
      // Retry: geo + forecast
      .mockResolvedValueOnce(mockGeoResponse() as any)
      .mockResolvedValueOnce(mockForecastResponse(3) as any);

    const resultPromise = fetchWeather('Paris', '2026-04-01', '2026-04-03');

    // Advance past the 2s retry delay
    await vi.advanceTimersByTimeAsync(3000);

    const result = await resultPromise;
    expect(result.avgHigh).toBe(20);
  });
});

describe('weatherCondition', () => {
  it('maps code 0 to Clear', () => {
    expect(weatherCondition(0)).toBe('Clear');
  });

  it('maps rain codes to Rain', () => {
    expect(weatherCondition(61)).toBe('Rain');
    expect(weatherCondition(63)).toBe('Rain');
    expect(weatherCondition(65)).toBe('Rain');
  });

  it('maps snow codes to Snow', () => {
    expect(weatherCondition(71)).toBe('Snow');
    expect(weatherCondition(73)).toBe('Snow');
  });

  it('maps unknown code to Variable', () => {
    expect(weatherCondition(999)).toBe('Variable');
  });
});

describe('weatherIcon', () => {
  it('maps code 0 to sun', () => {
    expect(weatherIcon(0)).toBe('sun');
  });

  it('maps rain codes to cloud-rain', () => {
    expect(weatherIcon(61)).toBe('cloud-rain');
  });

  it('maps unknown code to cloud', () => {
    expect(weatherIcon(999)).toBe('cloud');
  });
});
