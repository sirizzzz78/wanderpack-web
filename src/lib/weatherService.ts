export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  precipProbability: number;
  weatherCode: number;
}

export interface WeatherSummary {
  avgHigh: number;
  avgLow: number;
  maxPrecipProb: number;
  dominantWeatherCode: number;
  forecasts: DailyForecast[];
}

// In-memory cache
const cache = new Map<string, { summary: WeatherSummary; fetched: number }>();
const MAX_CACHE = 20;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function fetchWeather(
  destination: string,
  tripStart: string,
  tripEnd: string
): Promise<WeatherSummary> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + 16);

  const start = new Date(tripStart);
  const end = new Date(tripEnd);
  const windowStart = start > today ? start : today;
  const windowEnd = end < horizon ? end : horizon;

  if (windowStart > windowEnd) {
    throw new Error('outsideForecastWindow');
  }

  const cacheKey = `${destination}|${tripStart}|${tripEnd}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetched < CACHE_TTL) {
    return cached.summary;
  }

  // Geocode using Open-Meteo geocoding API
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl, { signal: controller.signal });
  const geoData = await geoRes.json();

  if (!geoData.results?.length) {
    throw new Error('geocodingFailed');
  }

  const { latitude, longitude } = geoData.results[0];

  // Fetch forecast
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&start_date=${fmt(windowStart)}&end_date=${fmt(windowEnd)}&timezone=auto`;

  const res = await fetch(forecastUrl, { signal: controller.signal });
  const data = await res.json();

  const daily = data.daily;
  const forecasts: DailyForecast[] = [];

  for (let i = 0; i < daily.time.length; i++) {
    if (i >= daily.temperature_2m_max.length || i >= daily.temperature_2m_min.length || i >= daily.weathercode.length) break;
    forecasts.push({
      date: daily.time[i],
      high: daily.temperature_2m_max[i],
      low: daily.temperature_2m_min[i],
      precipProbability: daily.precipitation_probability_max?.[i] ?? 0,
      weatherCode: daily.weathercode[i],
    });
  }

  if (forecasts.length === 0) {
    return { avgHigh: 0, avgLow: 0, maxPrecipProb: 0, dominantWeatherCode: 0, forecasts: [] };
  }

  const avgHigh = forecasts.reduce((s, f) => s + f.high, 0) / forecasts.length;
  const avgLow = forecasts.reduce((s, f) => s + f.low, 0) / forecasts.length;
  const maxPrecipProb = Math.max(...forecasts.map(f => f.precipProbability));
  const dominantWeatherCode = Math.max(...forecasts.map(f => f.weatherCode));

  const summary: WeatherSummary = { avgHigh, avgLow, maxPrecipProb, dominantWeatherCode, forecasts };

  // LRU eviction
  if (cache.size >= MAX_CACHE) {
    let oldest = '';
    let oldestTime = Infinity;
    for (const [key, val] of cache) {
      if (val.fetched < oldestTime) { oldest = key; oldestTime = val.fetched; }
    }
    if (oldest) cache.delete(oldest);
  }
  cache.set(cacheKey, { summary, fetched: Date.now() });

  return summary;
  } finally {
    clearTimeout(timeout);
  }
}

export function weatherCondition(code: number): string {
  switch (code) {
    case 0: return 'Clear';
    case 1: return 'Mostly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45: case 48: return 'Foggy';
    case 51: case 53: case 55: return 'Drizzle';
    case 61: case 63: case 65: return 'Rain';
    case 71: case 73: case 75: return 'Snow';
    case 77: return 'Sleet';
    case 80: case 81: case 82: return 'Showers';
    case 85: case 86: return 'Snow Showers';
    case 95: return 'Thunderstorm';
    case 96: case 99: return 'Hail Storm';
    default: return 'Variable';
  }
}

export function weatherIcon(code: number): string {
  switch (code) {
    case 0: return 'sun';
    case 1: return 'sun';
    case 2: return 'cloud-sun';
    case 3: return 'cloud';
    case 45: case 48: return 'cloud-fog';
    case 51: case 53: case 55: return 'cloud-drizzle';
    case 61: case 63: case 65: return 'cloud-rain';
    case 71: case 73: case 75: case 77: return 'cloud-snow';
    case 80: case 81: case 82: return 'cloud-rain-wind';
    case 85: case 86: return 'cloud-snow';
    case 95: return 'cloud-lightning';
    case 96: case 99: return 'cloud-lightning';
    default: return 'cloud';
  }
}
