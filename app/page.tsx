'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language, Session, SessionIndexEntry } from '@/src/types/session.types';
import type { Turn } from '@/src/types/turn.types';
import { VoiceButton } from '@/components/VoiceButton';
import TurnCard from '@/components/TurnCard/TurnCard';
import { SessionDrawer } from '@/components/SessionDrawer';
import { SessionModal } from '@/components/SessionModal';

interface Toast {
  id: number;
  message: string;
  exiting?: boolean;
}

let toastId = 0;

export default function Home() {
  // Session state
  const [session, setSession] = useState<Session | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [language, setLanguage] = useState<Language>('sk');
  const [processing, setProcessing] = useState(false);

  // Drawer / modal state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessionIndex, setSessionIndex] = useState<SessionIndexEntry[]>([]);
  const [modalSession, setModalSession] = useState<Session | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Auto-scroll ref
  const turnsEndRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  // Fetch session index for drawer
  const fetchIndex = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) throw new Error('Failed to load sessions');
      const data = await res.json();
      setSessionIndex(data.sessions ?? []);
    } catch {
      showToast('Could not load session history.');
    }
  }, [showToast]);

  // Start a new session
  const startSession = async () => {
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      if (!res.ok) throw new Error('Failed to create session');
      const newSession: Session = await res.json();
      setSession(newSession);
      setTurns([]);
    } catch {
      showToast('Could not start session. Please try again.');
    }
  };

  // Submit a voice turn
  const handleVoiceResult = async (transcript: string, confidence: number) => {
    if (!session) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/session/${session.id}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: transcript, language: session.language, confidence }),
      });
      if (!res.ok) throw new Error('Failed to process turn');
      const turn: Turn = await res.json();
      setTurns((prev) => [...prev, turn]);
    } catch {
      showToast('Could not process your input. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Open a past session in modal
  const openSessionModal = async (id: string) => {
    setDrawerOpen(false);
    try {
      const res = await fetch(`/api/session/${id}`);
      if (!res.ok) throw new Error('Failed to load session');
      const data: Session = await res.json();
      setModalSession(data);
    } catch {
      showToast('Could not load session details.');
    }
  };

  // Auto-scroll when new turn arrives
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  // Fetch index when drawer opens
  useEffect(() => {
    if (drawerOpen) fetchIndex();
  }, [drawerOpen, fetchIndex]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open session history"
          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-indigo-600">LinguaVoice</h1>
        <div className="w-8" /> {/* spacer for centering */}
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center px-4 py-6">
        {!session ? (
          /* No active session — show start screen */
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <p className="text-center text-gray-500">
              Practice your English by speaking in Slovak or Czech.
            </p>

            {/* Language selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('sk')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition
                  ${language === 'sk'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Slovak
              </button>
              <button
                onClick={() => setLanguage('cs')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition
                  ${language === 'cs'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Czech
              </button>
            </div>

            <button
              onClick={startSession}
              className="rounded-xl bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              Start Session
            </button>
          </div>
        ) : (
          /* Active session */
          <>
            <div className="mb-4 text-center text-sm text-gray-400">
              Session &middot; {session.language.toUpperCase()} &middot;{' '}
              {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* Turn list — full width for two-column cards */}
            <div className="w-full max-w-6xl flex-1 space-y-4 pb-32 px-2">
              {turns.map((turn, i) => (
                <TurnCard
                  key={turn.id}
                  turn={turn}
                  autoPlay={i === turns.length - 1}
                />
              ))}

              {processing && (
                <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
                  <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </div>
              )}

              <div ref={turnsEndRef} />
            </div>

            {/* Voice button — fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/90 backdrop-blur px-4 py-4">
              <VoiceButton
                language={session.language}
                disabled={processing}
                onResult={handleVoiceResult}
                onError={showToast}
              />
            </div>
          </>
        )}
      </main>

      {/* Session Drawer */}
      <SessionDrawer
        open={drawerOpen}
        sessions={sessionIndex}
        onClose={() => setDrawerOpen(false)}
        onSelectSession={openSessionModal}
      />

      {/* Session Modal */}
      <SessionModal
        session={modalSession}
        onClose={() => setModalSession(null)}
      />

      {/* Toast container */}
      <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg ${
              toast.exiting ? 'toast-exit' : 'toast-enter'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
