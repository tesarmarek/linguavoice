'use client';

import { useState } from 'react';
import type { Turn } from '@/src/types/turn.types';
import { AudioPlayer } from '@/components/AudioPlayer';

export interface TurnCardProps {
  turn: Turn;
  autoPlay?: boolean;
}

export default function TurnCard({ turn, autoPlay = false }: TurnCardProps) {
  const { input, correction, translation, story, postmortem, audio, image, scenarios } = turn;
  const [playStory, setPlayStory] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* LEFT CARD: Language learning content */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="font-semibold text-gray-800 text-lg">Turn {turn.index + 1}</span>
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

        {/* Story text */}
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

      {/* RIGHT CARD: Story image + What happens next */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        {/* Story image */}
        {image?.file ? (
          <img
            src={`/api/image/${encodeURIComponent(image.file)}`}
            alt={`Story illustration: ${story.theme}`}
            className="w-full rounded-2xl border-2 border-pink-200 shadow-lg"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-dashed border-pink-200 flex items-center justify-center">
            <span className="text-pink-300 text-lg">Image generating...</span>
          </div>
        )}

        {/* Scenario prompts */}
        {scenarios?.scenarios?.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-5 space-y-3 border border-purple-100">
            <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
              What happens next? Try saying...
            </p>
            {scenarios.scenarios.map((scenario, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/80 px-4 py-3 text-base text-purple-900 border border-purple-200 shadow-sm"
              >
                <span className="text-purple-500 font-bold mr-2">{i + 1}.</span>
                {scenario}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
