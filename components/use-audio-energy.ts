import { useCallback, useEffect, useRef, type RefObject } from "react";

export type AudioEnergy = { low: number; high: number; active: number };

export function useAudioEnergy(audioRef: RefObject<HTMLAudioElement | null>, isPlaying: boolean) {
  const energyRef = useRef<AudioEnergy>({ low: 0, high: 0, active: 0 });
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const activateAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (!contextRef.current) {
        const context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.88;
        context.createMediaElementSource(audio).connect(analyser);
        analyser.connect(context.destination);
        contextRef.current = context;
        analyserRef.current = analyser;
      }
      if (contextRef.current.state === "suspended") void contextRef.current.resume().catch(() => {});
    } catch {
      analyserRef.current = null;
    }
  }, [audioRef]);

  useEffect(() => {
    if (!isPlaying) {
      energyRef.current = { low: 0, high: 0, active: 0 };
      return;
    }
    const data = new Uint8Array(128);
    const sample = () => {
      const analyser = analyserRef.current;
      if (document.hidden) return;
      if (!analyser) {
        energyRef.current = { low: 0.08, high: 0.04, active: 1 };
        return;
      }
      analyser.getByteFrequencyData(data);
      const average = (from: number, to: number) => {
        let total = 0;
        for (let index = from; index < to; index += 1) total += data[index];
        return total / (to - from) / 255;
      };
      energyRef.current = { low: average(1, 9), high: average(18, 58), active: 1 };
    };
    sample();
    const timer = window.setInterval(sample, 50);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => () => {
    const context = contextRef.current;
    if (context && context.state !== "closed") void context.close().catch(() => {});
  }, []);

  return { energyRef, activateAudio };
}
