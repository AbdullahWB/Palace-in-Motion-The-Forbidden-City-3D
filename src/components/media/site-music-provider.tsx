"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SITE_MUSIC_SRC } from "@/lib/constants";

type SiteMusicContextValue = {
  enabled: boolean;
  hasStarted: boolean;
  isPlaying: boolean;
  ready: boolean;
  startMusic: () => void;
  pauseMusic: () => void;
  toggleMusic: () => void;
};

const ENABLED_STORAGE_KEY = "palace-music-enabled";
const STARTED_STORAGE_KEY = "palace-music-started";
const DEFAULT_VOLUME = 0.42;

const SiteMusicContext = createContext<SiteMusicContextValue | null>(null);

export function SiteMusicProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }, []);

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !enabled) {
      return;
    }

    audio.volume = DEFAULT_VOLUME;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [enabled]);

  const startMusic = useCallback(() => {
    setEnabled(true);
    setHasStarted(true);
  }, []);

  const toggleMusic = useCallback(() => {
    if (enabled) {
      setEnabled(false);
      pauseMusic();
      return;
    }

    setEnabled(true);
    setHasStarted(true);
  }, [enabled, pauseMusic]);

  useEffect(() => {
    try {
      const storedEnabled = window.localStorage.getItem(ENABLED_STORAGE_KEY);
      const storedStarted = window.localStorage.getItem(STARTED_STORAGE_KEY);

      if (storedEnabled !== null) {
        setEnabled(storedEnabled === "true");
      }

      if (storedStarted !== null) {
        setHasStarted(storedStarted === "true");
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    window.localStorage.setItem(ENABLED_STORAGE_KEY, String(enabled));
    window.localStorage.setItem(STARTED_STORAGE_KEY, String(hasStarted));
  }, [enabled, hasStarted, ready]);

  useEffect(() => {
    if (hasStarted) {
      return;
    }

    const handleFirstInteraction = () => {
      setHasStarted(true);
    };

    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!enabled) {
      pauseMusic();
      return;
    }

    if (hasStarted) {
      void attemptPlay();
    }
  }, [attemptPlay, enabled, hasStarted, pauseMusic, ready]);

  const value = useMemo<SiteMusicContextValue>(
    () => ({
      enabled,
      hasStarted,
      isPlaying,
      ready,
      startMusic,
      pauseMusic,
      toggleMusic,
    }),
    [enabled, hasStarted, isPlaying, pauseMusic, ready, startMusic, toggleMusic]
  );

  return (
    <SiteMusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={SITE_MUSIC_SRC}
        loop
        preload="auto"
        playsInline
        aria-hidden="true"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </SiteMusicContext.Provider>
  );
}

export function useSiteMusic() {
  const context = useContext(SiteMusicContext);

  if (!context) {
    throw new Error("useSiteMusic must be used within SiteMusicProvider.");
  }

  return context;
}
