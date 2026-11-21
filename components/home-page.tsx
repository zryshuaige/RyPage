"use client";

import { DailyQuote } from "./daily-quote";
import { LocalWeather } from "./local-weather";
import { useTheme } from "./site-shell";

export function HomePage() {
  const { theme } = useTheme();
  const reverie = theme === "reverie";
  return (
    <main className="home-stage">
      <div className="home-topline"><span>EST. 2026</span></div>
      <section className="home-title-wrap" aria-labelledby="home-title">
        <p>{reverie ? "A waking dream, scored by Debussy." : "An invitation to the distant, after Beethoven."}</p>
        <h1 id="home-title"><span>Ryen</span><em>in AI</em></h1>
        <div className="home-title-bottom">
          <DailyQuote />
          <LocalWeather />
        </div>
      </section>
      <div className="home-theme-note">
        <span>{reverie ? "Reverie" : "Yonder"}</span>
        <p>{reverie ? "Soft light. Open thoughts. A daydream in motion." : "After dark, the distant feels a little closer."}</p>
      </div>
    </main>
  );
}
