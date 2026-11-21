"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Location = { city: string; latitude: number; longitude: number; source: "ip" | "fallback" };
type Weather = { location: Location; temperature: number; code: number; wind: number };
const hangzhou: Location = { city: "Hangzhou", latitude: 30.2741, longitude: 120.1551, source: "fallback" };

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
  const sun = <><circle cx="16" cy="16" r="5" /><path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.8 6.8l2.1 2.1M23.1 23.1l2.1 2.1M6.8 25.2l2.1-2.1M23.1 8.9l2.1-2.1" /></>;
  const cloud = <path d="M8 24h15a6 6 0 0 0 1-11.8A8.5 8.5 0 0 0 7.5 14 5.5 5.5 0 0 0 8 24Z" />;
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {code === 0 ? sun : code <= 2 ? <><circle cx="11" cy="10" r="4" /><path d="M11 2v2M3 10h2M5.2 4.2l1.5 1.5M18.3 5.7l1.5 1.5" />{cloud}</> : code === 3 ? cloud : code === 45 || code === 48 ? <>{cloud}<path d="M6 27h20M10 30h12" /></> : code >= 71 && code <= 77 ? <>{cloud}<path d="M11 27v1M17 29v1M23 27v1" /></> : code >= 95 ? <>{cloud}<path d="m17 19-4 6h4l-2 5 6-7h-4l3-4" /></> : <>{cloud}<path d="m11 26-1 3M17 26l-1 3M23 26l-1 3" /></>}
    </svg>
  );
}

async function locate(signal: AbortSignal): Promise<Location> {
  try {
    const cached = sessionStorage.getItem("rypage-ip-location");
    if (cached) {
      const location = JSON.parse(cached) as Location;
      if (location.city && Number.isFinite(location.latitude) && Number.isFinite(location.longitude)) return { ...location, source: "ip" };
    }
  } catch { /* Storage is optional. */ }
  try {
    const response = await fetch("https://ipwho.is/", { signal });
    if (!response.ok) throw new Error("Location request failed");
    const data = await response.json() as { success?: boolean; city?: string; region?: string; latitude?: number; longitude?: number };
    if (!data.success || !Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) throw new Error("Location unavailable");
    const location: Location = { city: data.city || data.region || "Your city", latitude: data.latitude as number, longitude: data.longitude as number, source: "ip" };
    try { sessionStorage.setItem("rypage-ip-location", JSON.stringify(location)); } catch { /* Storage is optional. */ }
    return location;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
  }
  try {
    const response = await fetch("https://api.ip.sb/geoip", { signal });
    if (!response.ok) throw new Error("Location request failed");
    const data = await response.json() as { city?: string; region?: string; latitude?: number; longitude?: number };
    if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) throw new Error("Location unavailable");
    const location: Location = { city: data.city || data.region || "Your city", latitude: data.latitude as number, longitude: data.longitude as number, source: "ip" };
    try { sessionStorage.setItem("rypage-ip-location", JSON.stringify(location)); } catch { /* Storage is optional. */ }
    return location;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return hangzhou;
  }
}

export function LocalWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const loadWeather = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setFailed(false);
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const location = await locate(controller.signal);
      const query = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: "temperature_2m,weather_code,wind_speed_10m", timezone: "auto" });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Weather request failed");
      const data = await response.json() as { current?: { temperature_2m?: number; weather_code?: number; wind_speed_10m?: number } };
      const current = data.current;
      if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.weather_code) || !Number.isFinite(current.wind_speed_10m)) throw new Error("Weather unavailable");
      setWeather({ location, temperature: Math.round(current.temperature_2m as number), code: current.weather_code as number, wind: Math.round(current.wind_speed_10m as number) });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFailed(true);
    } finally {
      window.clearTimeout(timeout);
      if (controllerRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadWeather(), 0);
    return () => { window.clearTimeout(timeout); controllerRef.current?.abort(); };
  }, [loadWeather]);

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
      {failed && <button type="button" className="weather-retry" onClick={() => void loadWeather()}>Try again ↻</button>}
    </aside>
  );
}
