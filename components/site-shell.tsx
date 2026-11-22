"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { WorldCanvas } from "./world-canvas";
import { useAudioEnergy } from "./use-audio-energy";

export type Theme = "reverie" | "yonder";
export type Space = "earth" | "moon" | "galaxy";
type Track = { title: string; composer: string; src: string };

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const links = [
  { href: "/", label: "Home", space: "earth" },
  { href: "/navigator/", label: "Index", space: "moon" },
  { href: "/works/", label: "Works", space: "galaxy" },
] as const;

const tracks: Record<Theme, Track> = {
  reverie: { title: "Rêverie", composer: "Claude Debussy", src: `${publicBasePath}/audio/reverie.ogg` },
  yonder: { title: "Moonlight Sonata", composer: "Ludwig van Beethoven", src: `${publicBasePath}/audio/moonlight.ogg` },
};

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  isPlaying: boolean;
  togglePlay: () => void;
  progress: number;
  duration: number;
  seek: (value: number) => void;
  audioError: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within SiteShell");
  return context;
};

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}

function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const activeIndex = Math.max(0, links.findIndex((link) => link.href === pathname));
  return (
    <header className="site-chrome-header">
      <Link href="/" className="site-wordmark">Ryen <em>in AI</em></Link>
      <nav aria-label="主导航">
        <span className="space-nav-indicator" style={{ transform: `translateX(${activeIndex * 100}%)` }} aria-hidden="true">
          {links.map((link) => <i key={link.space} className={link.space === links[activeIndex].space ? "is-active" : ""} style={{ backgroundImage: `url(${publicBasePath}/textures/${link.space}-nav.webp)` }} />)}
        </span>
        {links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? "is-active" : ""} aria-current={pathname === link.href ? "page" : undefined}><span>{link.label}</span></Link>)}
      </nav>
      <div className="site-header-actions">
        <a href="https://github.com/zryshuaige" target="_blank" rel="noreferrer" className="github-link">GitHub ↗</a>
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`切换到${theme === "reverie" ? "Yonder" : "Reverie"}主题并播放对应音乐`}>
          <svg className="theme-celestial" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <defs><clipPath id="celestial-disc-clip"><circle cx="16" cy="16" r="6.5" /></clipPath></defs>
            <circle className="celestial-halo" cx="16" cy="16" r="10" />
            <circle className="celestial-orbit" cx="16" cy="16" r="12.25" />
            <g className="celestial-rays">
              <path d="M16 2v3M16 27v3M2 16h3M27 16h3M6.1 6.1l2.1 2.1M23.8 23.8l2.1 2.1M6.1 25.9l2.1-2.1M23.8 8.2l2.1-2.1" />
            </g>
            <g clipPath="url(#celestial-disc-clip)">
              <circle className="celestial-disc" cx="16" cy="16" r="6.5" />
              <circle className="celestial-eclipse" cx="16" cy="16" r="6.5" />
              <g className="celestial-craters"><circle cx="11.2" cy="13.8" r="0.8" /><circle cx="11.8" cy="18.2" r="0.55" /></g>
            </g>
          </svg>
          <span className={`theme-name ${theme === "reverie" ? "is-active" : ""}`}>Reverie</span>
          <span className={`theme-name ${theme === "yonder" ? "is-active" : ""}`}>Yonder</span>
        </button>
      </div>
    </header>
  );
}

function MusicPlayer() {
  const { theme, isPlaying, togglePlay, progress, duration, seek, audioError } = useTheme();
  const track = tracks[theme];
  return (
    <div className={`music-player ${isPlaying ? "is-playing" : ""}`}>
      <button type="button" className="play-button" onClick={togglePlay} aria-label={isPlaying ? "暂停音乐" : "播放音乐"}><i /><i /></button>
      <div className="track-copy"><span>{theme === "reverie" ? "Reverie" : "Yonder"} / Now playing</span><strong>{track.title}</strong><p>{track.composer}</p></div>
      <div className="player-timeline">
        <input type="range" min={0} max={duration || 1} step={0.1} value={Math.min(progress, duration || 1)} onChange={(event) => seek(Number(event.target.value))} aria-label="音乐播放进度" disabled={!duration} />
        <div><span>{formatTime(progress)}</span><span>{formatTime(duration)}</span></div>
      </div>
      <div className="equalizer" aria-hidden="true"><i /><i /><i /></div>
      {audioError && <p className="audio-error" role="status">音乐暂时无法播放</p>}
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const space = links.find((link) => link.href === pathname)?.space ?? "earth";
  const [theme, setTheme] = useState<Theme>("reverie");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const themeReady = useRef(false);
  const { energyRef, activateAudio } = useAudioEnergy(audioRef, isPlaying);
  const track = tracks[theme];

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const cached = localStorage.getItem("rypage-theme");
      themeReady.current = true;
      if (cached === "reverie" || cached === "yonder") setTheme(cached);
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("yonder");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let idleId: number | null = null;
    let fallbackId: number | null = null;
    const preload = () => {
      const inactiveTrack = theme === "reverie" ? tracks.yonder : tracks.reverie;
      void fetch(inactiveTrack.src, { signal: controller.signal, cache: "force-cache", priority: "low" }).then((response) => {
        if (!response.ok) throw new Error("Audio preload failed");
        return response.arrayBuffer();
      }).catch(() => {});
    };
    if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(preload, { timeout: 4000 });
    else fallbackId = window.setTimeout(preload, 2000);
    return () => {
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (fallbackId !== null) window.clearTimeout(fallbackId);
      controller.abort();
    };
  }, [theme]);

  useEffect(() => {
    if (!themeReady.current) return;
    localStorage.setItem("rypage-theme", theme);
    document.documentElement.style.colorScheme = theme === "yonder" ? "dark" : "light";
    audioRef.current?.load();
  }, [theme]);

  const toggleTheme = () => {
    activateAudio();
    setProgress(0);
    setDuration(0);
    setAudioError(false);
    setTheme((current) => current === "reverie" ? "yonder" : "reverie");
    setIsPlaying(true);
  };
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      activateAudio();
      setAudioError(false);
      audio.play().then(() => setIsPlaying(true)).catch(() => { setAudioError(true); setIsPlaying(false); });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };
  const seek = (value: number) => {
    if (audioRef.current) audioRef.current.currentTime = value;
    setProgress(value);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isPlaying, togglePlay, progress, duration, seek, audioError }}>
      <div className="site-shell" data-theme={theme} data-space={space}>
        <WorldCanvas space={space} theme={theme} energy={energyRef} />
        <SiteHeader />
        <div className="site-page-content">{children}</div>
        <MusicPlayer />
        <audio
          ref={audioRef}
          src={track.src}
          preload="metadata"
          onCanPlay={() => {
            if (isPlaying) audioRef.current?.play().catch(() => { setAudioError(true); setIsPlaying(false); });
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
          onError={() => { if (isPlaying) setAudioError(true); setIsPlaying(false); }}
        />
      </div>
    </ThemeContext.Provider>
  );
}
