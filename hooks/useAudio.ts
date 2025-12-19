'use client';

import { useCallback, useRef } from 'react';

type SoundType = 'start' | 'warning' | 'urgent' | 'complete';

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    },
    [getAudioContext]
  );

  const playChime = useCallback(() => {
    // Pleasant ascending chime for task start
    playTone(523.25, 0.15, 'sine', 0.2); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 100); // E5
    setTimeout(() => playTone(783.99, 0.3, 'sine', 0.2), 200); // G5
  }, [playTone]);

  const playWarning = useCallback(() => {
    // Soft double beep for 5 min warning
    playTone(440, 0.15, 'triangle', 0.25); // A4
    setTimeout(() => playTone(440, 0.15, 'triangle', 0.25), 200);
  }, [playTone]);

  const playUrgent = useCallback(() => {
    // More urgent triple beep for 1 min warning
    playTone(880, 0.1, 'square', 0.15); // A5
    setTimeout(() => playTone(880, 0.1, 'square', 0.15), 150);
    setTimeout(() => playTone(880, 0.1, 'square', 0.15), 300);
  }, [playTone]);

  const playComplete = useCallback(() => {
    // Success sound - ascending arpeggio
    playTone(523.25, 0.12, 'sine', 0.2); // C5
    setTimeout(() => playTone(659.25, 0.12, 'sine', 0.2), 80); // E5
    setTimeout(() => playTone(783.99, 0.12, 'sine', 0.2), 160); // G5
    setTimeout(() => playTone(1046.5, 0.4, 'sine', 0.25), 240); // C6
  }, [playTone]);

  const playSound = useCallback(
    (type: SoundType) => {
      switch (type) {
        case 'start':
          playChime();
          break;
        case 'warning':
          playWarning();
          break;
        case 'urgent':
          playUrgent();
          break;
        case 'complete':
          playComplete();
          break;
      }
    },
    [playChime, playWarning, playUrgent, playComplete]
  );

  return { playSound };
}
