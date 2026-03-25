'use client';

import { useCallback, useRef, useState } from 'react';
import type { Language } from '@/src/types/session.types';

export interface VoiceButtonProps {
  language: Language;
  disabled?: boolean;
  sttModel: string;
  onResult: (transcript: string, confidence: number) => void;
  onError: (message: string) => void;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onspeechend: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
    SpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

const LANG_MAP: Record<Language, string> = {
  sk: 'sk-SK',
  cs: 'cs-CZ',
};

export default function VoiceButton({
  language,
  disabled = false,
  sttModel,
  onResult,
  onError,
}: VoiceButtonProps) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const gotResultRef = useRef(false);

  const useBrowserSTT = sttModel === 'browser';

  // Browser STT via Web Speech API
  const startBrowserSTT = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    gotResultRef.current = false;
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_MAP[language];
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: { results: SpeechRecognitionResultList }) => {
      const result = event.results[0];
      if (result && result[0]) {
        gotResultRef.current = true;
        onResult(result[0].transcript, result[0].confidence);
      }
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === 'not-allowed') {
        onError('Microphone permission denied. Please allow mic access.');
      } else if (event.error === 'no-speech') {
        onError('No speech detected. Please try again.');
      } else if (event.error !== 'aborted') {
        onError(`Speech recognition error: ${event.error}`);
      }
      setRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setRecording(true);
    } catch {
      onError('Failed to start speech recognition.');
      recognitionRef.current = null;
    }
  }, [language, onResult, onError]);

  const stopBrowserSTT = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // Together.ai STT via MediaRecorder + server transcription
  const startTogetherSTT = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(t => t.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 100) {
          onError('No audio recorded. Please try again.');
          setRecording(false);
          return;
        }

        setTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          formData.append('language', language);

          const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Transcription failed');
          }

          const result = await res.json();
          if (result.text) {
            onResult(result.text, result.confidence ?? 0.9);
          } else {
            onError('No speech detected. Please try again.');
          }
        } catch (err) {
          console.error('[VoiceButton] Together STT error:', err);
          onError(`Transcription error: ${(err as Error).message}`);
        } finally {
          setTranscribing(false);
          setRecording(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      if ((err as Error).name === 'NotAllowedError') {
        onError('Microphone permission denied. Please allow mic access.');
      } else {
        onError(`Microphone error: ${(err as Error).message}`);
      }
    }
  }, [language, onResult, onError]);

  const stopTogetherSTT = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (recording) {
      useBrowserSTT ? stopBrowserSTT() : stopTogetherSTT();
    } else {
      useBrowserSTT ? startBrowserSTT() : startTogetherSTT();
    }
  }, [recording, useBrowserSTT, startBrowserSTT, stopBrowserSTT, startTogetherSTT, stopTogetherSTT]);

  const isWorking = recording || transcribing;

  return (
    <button
      onClick={toggleRecording}
      disabled={disabled || transcribing}
      aria-label={isWorking ? 'Click to stop recording' : 'Click to start speaking'}
      className={`w-full max-w-xs mx-auto flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-semibold select-none transition-all
        ${disabled || transcribing
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : recording
            ? 'bg-red-500 text-white scale-105 shadow-lg shadow-red-200 animate-pulse'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
        }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 1a4 4 0 00-4 4v7a4 4 0 008 0V5a4 4 0 00-4-4z" />
        <path d="M6 11a1 1 0 10-2 0 8 8 0 0016 0 1 1 0 10-2 0 6 6 0 01-12 0z" />
        <path d="M11 19.93A8.001 8.001 0 014 12a1 1 0 112 0 6 6 0 0012 0 1 1 0 112 0 8.001 8.001 0 01-7 7.93V22a1 1 0 11-2 0v-2.07z" />
      </svg>
      {transcribing ? 'Transcribing...' : recording ? 'Listening... (click to stop)' : 'Click to Speak'}
    </button>
  );
}
