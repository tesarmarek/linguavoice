'use client';

import { useState } from 'react';
import type { Turn } from '@/src/types/turn.types';
import { AudioPlayer } from '@/components/AudioPlayer';

export interface TurnCardProps {
  turn: Turn;
  autoPlay?: boolean;
}

export default function TurnCard({ turn, autoPlay = false }: TurnCardProps) {
  const { input, correction, translation, story, postmortem, audio } = turn;
  const [playStory, setPlayStory] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="font-semibold text-gray-800">Turn {turn.index + 1}</span>
        {input && <span>confidence: {Math.round((input.confidence ?? 0) * 100)}%</span>}
      </div>

      {/* Input */}
      {input && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            You said ({input.language?.toUpperCase()})
          </p>
          <p className="mt-1 text-gray-800">{input.raw}</p>
        </div>
      )}

      {/* Correction */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Correction</p>
        {correction.wasCorrect ? (
          <p className="mt-1 text-green-700 font-medium">
            {correction.corrected} (correct!)
          </p>
        ) : (
          <>
            <p className="mt-1 text-gray-800">{correction.corrected}</p>
            <ul className="mt-2 space-y-2">
              {correction.errors.map((err, i) => (
                <li key={i} className="rounded-lg bg-red-50 p-3 text-sm">
                  <span className="text-red-600 font-medium">{err.fragment}</span>
                  {' → '}
                  <span className="text-green-700 font-medium">{err.corrected}</span>
                  <br />
                  <span className="text-gray-500 italic">{err.rule}</span>: {err.explanation}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Translation */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">English</p>
        <p className="mt-1 text-gray-800">{translation.english}</p>
        {audio?.translationFile && (
          <div className="mt-2">
            <AudioPlayer
              src={`/api/audio/${encodeURIComponent(audio.translationFile)}`}
              label="Translation"
              autoPlay={autoPlay}
              onEnded={() => setPlayStory(true)}
            />
          </div>
        )}
      </div>

      {/* Story */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Story ({story.theme})
        </p>
        <p className="mt-1 text-gray-800 italic">{story.paragraph}</p>
        {audio?.storyFile && (
          <div className="mt-2">
            <AudioPlayer
              src={`/api/audio/${encodeURIComponent(audio.storyFile)}`}
              label="Story"
              autoPlay={playStory}
            />
          </div>
        )}
      </div>

      {/* Postmortem */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Analysis &middot; {postmortem.difficulty}
        </p>
        <p className="text-sm text-gray-700">{postmortem.learningNote}</p>
        <div className="flex flex-wrap gap-1">
          {postmortem.grammarRules.map((rule, i) => (
            <span key={i} className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
              {rule}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Practice:</span> {postmortem.suggestedPractice}
        </p>
      </div>
    </div>
  );
}
