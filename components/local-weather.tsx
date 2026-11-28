"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Location = { city: string; latitude: number; longitude: number; source: "ip" };
type Weather = { location: Location; temperature: number; code: number; wind: number };
type CachedWeather = { weather: Weather; cachedAt: number };
const locationKey = "rypage-ip-location-v2";
const weatherKey = "rypage-weather-v1";
const locationTtl = 24 * 60 * 60 * 1000;
const weatherTtl = 10 * 60 * 1000;

function condition(code: number) {
  if (code === 0) return "Clear sky";
  if (code === 1 || code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorm";
  return "Changing skies";
}

function WeatherGlyph({ code }: { code: number }) {
  const sun = <><circle cx="16" cy="16" r="5" /><path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.2 6.2l2.1 2.1M23.1 23.1l2.1 2.1M6.1 25.8l2.1-2.1M23.8 8.9l2.1-2.1" /></>;
  const cloud = <path d="M6 24h15a6 6 0 0 0 1-11.8A8.5 8.5 0 0 0 7.5 14A6 6 0 0 0 6 24Z" />;
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {code === 0 ? sun : code <= 2 ? <><circle cx="11" cy="10" r="4" /><path d="M11 2v2M3 11h2M6.2 6.2l1.5 1.5M18.3 6.2l-1.5 1.5" />{cloud}</> : code === 3 ? cloud : code === 45 || code === 48 ? <>{cloud}<path d="M7 27h18M10 30h12" /></> : code >= 71 && code <= 77 ? <>{cloud}<path d="M11 26v2M17 29v2M23 26v2" /></> : code >= 95 ? <>{cloud}<path d="m16 19-4 6h4l-2 5 6-7h-4l3-4" /></> : <>{cloud}<path d="m11 26-1 3M17 29l-1 3M23 26l-1 3" /></>}
    </svg>
  );
}

function readLocation() {
  try {
    const raw = localStorage.getItem(locationKey);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { location?: Location; cachedAt?: number };
    const location = cached.location;
    if (!cached.cachedAt || Date.now() - cached.cachedAt > locationTtl || !location?.city || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) return null;
    return { ...location, source: "ip" as const };
  } catch { return null; }
}

function saveLocation(location: Location) {
  try { localStorage.setItem(locationKey, JSON.stringify({ location, cachedAt: Date.now() })); } catch { /* Storage is optional. */ }
}

function readWeather(): CachedWeather | null {
  try {
    const raw = localStorage.getItem(weatherKey);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedWeather;
    const weather = cached.weather;
    if (!cached.cachedAt || !weather?.location?.city || !Number.isFinite(weather.location.latitude) || !Number.isFinite(weather.location.longitude) || !Number.isFinite(weather.temperature) || !Number.isFinite(weather.code) || !Number.isFinite(weather.wind)) return null;
    return cached;
  } catch { return null; }
}

async function fetchWithTimeout(url: string, timeoutMs: number, parentSignal: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  parentSignal.addEventListener("abort", abort, { once: true });
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
    parentSignal.removeEventListener("abort", abort);
  }
}

async function locate(signal: AbortSignal): Promise<Location | null> {
  const cached = readLocation();
  if (cached) return cached;
  try {
    const response = await fetchWithTimeout("https://ipwho.is/", 7000, signal);
    if (!response.ok) throw new Error("Location request failed");
    const data = await response.json() as { success?: boolean; city?: string; region?: string; latitude?: number; longitude?: number };
    if (!data.success || !Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) throw new Error("Location unavailable");
    const location: Location = { city: data.city || data.region || "Your city", latitude: data.latitude as number, longitude: data.longitude as number, source: "ip" };
    saveLocation(location);
    return location;
  } catch (error) {
    if (signal.aborted) throw error;
  }
  try {
    const response = await fetchWithTimeout("https://api.ip.sb/geoip", 4000, signal);
    if (!response.ok) throw new Error("Location request failed");
    const data = await response.json() as { city?: string; region?: string; latitude?: number; longitude?: number };
    if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) throw new Error("Location unavailable");
    const location: Location = { city: data.city || data.region || "Your city", latitude: data.latitude as number, longitude: data.longitude as number, source: "ip" };
    saveLocation(location);
    return location;
  } catch (error) {
    if (signal.aborted) throw error;
    return null;
  }
}

export function LocalWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const retryRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const retryAttemptRef = useRef(0);
  const loadWeatherRef = useRef<() => void>(() => {});

  const loadWeather = useCallback(async () => {
    const request = ++requestRef.current;
    controllerRef.current?.abort();
    if (retryRef.current !== null) window.clearTimeout(retryRef.current);
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setFailed(false);
    try {
      const location = await locate(controller.signal);
      if (request !== requestRef.current) return;
      if (!location) {
        const delay = Math.min(30000, 5000 * 2 ** retryAttemptRef.current);
        retryAttemptRef.current += 1;
        retryRef.current = window.setTimeout(() => loadWeatherRef.current(), delay);
        return;
      }
      const query = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: "temperature_2m,weather_code,wind_speed_10m", timezone: "auto" });
      const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${query}`, 6000, controller.signal);
      if (!response.ok) throw new Error("Weather request failed");
      const data = await response.json() as { current?: { temperature_2m?: number; weather_code?: number; wind_speed_10m?: number } };
      const current = data.current;
      if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.weather_code) || !Number.isFinite(current.wind_speed_10m)) throw new Error("Weather unavailable");
      const next = { location, temperature: Math.round(current.temperature_2m as number), code: current.weather_code as number, wind: Math.round(current.wind_speed_10m as number) };
      if (request !== requestRef.current) return;
      setWeather(next);
      setLoading(false);
      retryAttemptRef.current = 0;
      try { localStorage.setItem(weatherKey, JSON.stringify({ weather: next, cachedAt: Date.now() } satisfies CachedWeather)); } catch { /* Storage is optional. */ }
    } catch {
      if (request !== requestRef.current || controller.signal.aborted) return;
      setLoading(false);
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    loadWeatherRef.current = () => void loadWeather();
  }, [loadWeather]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const cached = readWeather();
      if (cached) {
        setWeather(cached.weather);
        setLoading(false);
      }
      if (!cached || Date.now() - cached.cachedAt > weatherTtl) loadWeatherRef.current();
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      requestRef.current += 1;
      controllerRef.current?.abort();
      if (retryRef.current !== null) window.clearTimeout(retryRef.current);
    };
  }, []);

  return (
    <aside className="local-weather" aria-label="当地天气" aria-busy={loading}>
      <header><span>{weather?.location.city ?? "Local weather"}</span></header>
      {weather ? (
        <div className="weather-reading">
          <WeatherGlyph code={weather.code} />
          <strong>{weather.temperature}<sup>°C</sup></strong>
          <div><p>{condition(weather.code)}</p><span>Wind {weather.wind} km/h</span></div>
        </div>
      ) : <p className="weather-status">{failed ? "The sky is out of reach." : "Reading the sky…"}</p>}
      {failed && <button type="button" className="weather-retry" onClick={() => { retryAttemptRef.current = 0; void loadWeather(); }}>Try again ↻</button>}
    </aside>
  );
}
