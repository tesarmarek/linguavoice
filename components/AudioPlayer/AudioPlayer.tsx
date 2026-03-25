'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export interface AudioPlayerProps {
  src: string;
  label: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export default function AudioPlayer({ src, label, autoPlay = false, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const autoPlayTriggered = useRef(false);

  // Check if audio exists on mount
  useEffect(() => {
    autoPlayTriggered.current = false;
    if (!src) {
      setAvailable(false);
      return;
    }
    fetch(src, { method: 'HEAD' })
      .then((res) => setAvailable(res.ok))
      .catch(() => setAvailable(false));
  }, [src]);

  // Auto-play when available and autoPlay is true
  useEffect(() => {
    if (autoPlay && available && !autoPlayTriggered.current) {
      autoPlayTriggered.current = true;
      const el = audioRef.current;
      if (el) {
        el.play().catch((err) => {
          console.warn(`[AudioPlayer] Auto-play blocked for ${label}:`, err.message);
        });
      }
    }
  }, [autoPlay, available, label]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el || !available) return;
    if (playing) {
      el.pause();
    } else {
      el.play().catch(() => setAvailable(false));
    }
  }, [available, playing]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    onEnded?.();
  }, [onEnded]);

  if (available === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-400">
        Loading audio...
      </span>
    );
  }

  if (!available) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-400">
        Audio unavailable
      </span>
    );
  }

  return (
    <span className="inline-flex items-center">
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onError={() => setAvailable(false)}
      />
      <button
        onClick={toggle}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition
          ${playing
            ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
      >
        {playing ? `Pause ${label}` : `Play ${label}`}
      </button>
    </span>
  );
}
