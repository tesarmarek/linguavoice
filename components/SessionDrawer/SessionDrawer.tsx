'use client';

import type { SessionIndexEntry } from '@/src/types/session.types';

export interface SessionDrawerProps {
  open: boolean;
  sessions: SessionIndexEntry[];
  onClose: () => void;
  onSelectSession: (id: string) => void;
}

function groupByDate(sessions: SessionIndexEntry[]): Map<string, SessionIndexEntry[]> {
  const groups = new Map<string, SessionIndexEntry[]>();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const todayStr = fmt(today);
  const yesterdayStr = fmt(yesterday);

  for (const session of sessions) {
    const dateStr = session.startedAt.slice(0, 10);
    let label: string;
    if (dateStr === todayStr) label = 'Today';
    else if (dateStr === yesterdayStr) label = 'Yesterday';
    else label = new Date(session.startedAt).toLocaleDateString();

    const group = groups.get(label) ?? [];
    group.push(session);
    groups.set(label, group);
  }

  return groups;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SessionDrawer({
  open,
  sessions,
  onClose,
  onSelectSession,
}: SessionDrawerProps) {
  const grouped = groupByDate(sessions);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-800">Session History</h2>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <nav className="overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 57px)' }}>
          {sessions.length === 0 && (
            <p className="text-sm text-gray-400">No sessions yet.</p>
          )}
          {[...grouped.entries()].map(([label, items]) => (
            <div key={label}>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {label}
              </h3>
              <div className="space-y-1">
                {items.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSession(s.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
                  >
                    <span>{formatTime(s.startedAt)}</span>
                    <span className="text-gray-400">
                      {s.turnCount} turn{s.turnCount !== 1 ? 's' : ''}
                    </span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                      {s.language.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
