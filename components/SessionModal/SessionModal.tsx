'use client';

import { useEffect } from 'react';
import type { Session } from '@/src/types/session.types';
import TurnCard from '@/components/TurnCard/TurnCard';

export interface SessionModalProps {
  session: Session | null;
  onClose: () => void;
}

export default function SessionModal({ session, onClose }: SessionModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!session) return null;

  const dateLabel = new Date(session.startedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeLabel = new Date(session.startedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Session from ${dateLabel}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Session &middot; {dateLabel} &middot; {timeLabel}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close session modal"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          {session.turns.length === 0 ? (
            <p className="text-center text-sm text-gray-400">No turns in this session.</p>
          ) : (
            session.turns.map((turn) => (
              <TurnCard key={turn.id} turn={turn} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
