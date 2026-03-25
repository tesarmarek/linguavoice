# LinguaVoice — Phase 1b Implementation Plan
# Auto-Play Audio & Kid Mode

> Generated from 3 parallel planning agents. Ready to execute.
> Date: 2026-03-25

---

## Execution Order

**Auto-Play Audio FIRST, then Kid Mode.** Rationale: Auto-Play is self-contained
in frontend. Kid Mode has broader surface (types, prompts, BLL, frontend). TurnCard
merge risk is minimal if ordered this way.

---

## Wave 1 — Foundation (parallel, no deps)

### 1a. Shared Type Changes
**Files:**
- `src/types/session.types.ts` — add `kidMode: boolean` to `Session` and `SessionIndexEntry`
- `src/types/turn.types.ts` — add `kidMode: boolean` to `PostmortemResult`

### 1b. Kid Mode Labels Config (NEW)
**File:** `src/config/kidmode.labels.ts`
- Single source of truth for all terminology swaps
- Exports: `getLabel(section, kidMode)`, `getDifficultyLabel(difficulty, kidMode)`
- Mapping:
  - Session → Adventure
  - Turn → Round
  - Correction → Oops fix
  - Analysis → What we learned
  - easy/medium/hard → star emojis
  - Confidence % → emoji rating (hide %)

### 1c. Auto-Play Hooks (NEW)
**Files:**
- `hooks/useLocalStorage.ts` — generic localStorage-backed state hook
- `hooks/useAutoPlayChain.ts` — sequential audio playback manager

**useAutoPlayChain API:**
```typescript
type PlaybackState = 'idle' | 'loading' | 'playing-trans' | 'playing-story' | 'paused' | 'error-audio';

interface AutoPlayChainReturn {
  playbackState: PlaybackState;
  activeSection: 'translation' | 'story' | null;
  fallbackNeeded: boolean;
  playChain: (turn: Turn) => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
  playSection: (section: 'translation' | 'story', src: string) => void;
  stop: () => void;
}
```

**Key design:**
- Two `useRef<HTMLAudioElement>` created via `new Audio()` (not JSX) to avoid re-render issues
- Chain via `.onended` event — NO setTimeout
- Catch `NotAllowedError` → set `fallbackNeeded = true`
- `stop()` before starting new chain (handles rapid successive turns)
- useEffect cleanup pauses both elements on unmount

---

## Wave 2 — Auto-Play Audio (sequential, depends on Wave 1c)

### 2a. Rewrite AudioPlayer
**File:** `components/AudioPlayer/AudioPlayer.tsx`
- Remove internal `<audio>` element management
- Accept external control props: `isPlaying`, `highlighted`, `onPlay`, `onPause`
- Add "Click to play" fallback button for NotAllowedError recovery
- Highlight styling: `ring-2 ring-indigo-300 bg-indigo-50/30`

### 2b. Wire TurnCard
**File:** `components/TurnCard/TurnCard.tsx`
- New props: `activeSection`, `onManualPlay`, `onPause`, `showFallbackPlay`
- Pass `highlighted` to AudioPlayer instances
- Highlight active section div during playback

### 2c. Wire page.tsx
**File:** `app/page.tsx`
- Import `useAutoPlayChain` and `useLocalStorage`
- `autoplayEnabled` state from `localStorage("linguavoice_autoplay")`, default `true`
- After turn arrives → trigger `playChain(turn)` if autoplay enabled
- Track `playbackState` + `activeSection`, pass to latest TurnCard
- Header: replace spacer `<div className="w-8" />` with mute toggle button (🔊/🔇)
- Handle `fallbackNeeded` — show "Click to play" on latest TurnCard

---

## Wave 3 — Kid Mode Backend (parallel tasks, depends on Wave 1a)

### 3a. Prompts (all 4, can be parallel)
**Files:**
- `src/prompts/correction.prompt.ts` — add `kidMode` to input, alternate system prompt
- `src/prompts/translation.prompt.ts` — add `kidMode`, simpler vocabulary
- `src/prompts/story.prompt.ts` — add `kidMode`, more whimsical/magical
- `src/prompts/postmortem.prompt.ts` — add `kidMode`, no grammar terminology, encouraging

**Kid Mode prompt style:**
- Talking to a child aged 5-10
- No terms like "infinitiv", "pád", "podstatné jméno"
- Use emoji (1-2 per error max)
- Learning note under 2 sentences
- Suggested practice feels like a game

### 3b. BLL Services
**Files:**
- `src/bll/prompt.service.ts` — all `build*` methods gain `kidMode` param
- `src/bll/llm.orchestrator.ts` — `processTurn()` gains `kidMode`, passes to all prompts
- `src/bll/turn.service.ts` — reads `session.kidMode`, passes to orchestrator

### 3c. API + Session Layer
**Files:**
- `src/api/dtos/session.dto.ts` — add `kidMode` to request/response DTOs + mappers
- `src/api/validators/session.validator.ts` — validate optional `kidMode` boolean
- `src/bll/session.service.ts` — accept + persist `kidMode` (default `false`)
- `app/api/session/route.ts` — pass `kidMode` through

---

## Wave 4 — Kid Mode Frontend (depends on Wave 3 + Wave 1b)

### 4a. TurnCard Labels
**File:** `components/TurnCard/TurnCard.tsx`
- Add `kidMode: boolean` to props
- Replace hardcoded labels with `getLabel()` / `getDifficultyLabel()` calls
- Hide confidence %, show emoji instead
- Kid mode: warmer colors, slightly larger text (optional)

### 4b. Page Toggle + Session Locking
**File:** `app/page.tsx`
- Add `kidMode` state
- Toggle in header (right of mute button): 🎮 icon, labeled switch
- `disabled={session !== null}` — locked once session starts
- Pass `kidMode` to `startSession()` POST body `{ language, kidMode }`
- Pass `kidMode` to all `<TurnCard>` instances
- "Start Session" → "Start Adventure!" when kid mode on

### 4c. Modal + Drawer
**Files:**
- `components/SessionModal/SessionModal.tsx` — read `session.kidMode`, pass to TurnCards
- `components/SessionDrawer/SessionDrawer.tsx` — show 🎮 badge on kid-mode sessions

---

## Wave 5 — Tests + Docs

### 5a. Unit Tests (Vitest)
| Test File | Covers |
|---|---|
| `tests/unit/prompts/worker.system.test.ts` | kidMode prompt switching |
| `tests/unit/components/AudioPlayer.test.tsx` | autoPlay chain, mute, error states |
| `tests/unit/bll/session.service.test.ts` | kidMode persistence |

**Note:** Component tests need `jsdom` environment. Add to `vitest.config.ts`:
```ts
environmentMatchGlobs: [['tests/unit/components/**', 'jsdom']]
```
Install: `@testing-library/react`, `@testing-library/jest-dom`

### 5b. E2E Tests (Playwright)
| Test File | Scenario |
|---|---|
| `tests/e2e/flows/autoplay.spec.ts` | Turn → translation plays → story plays → idle |
| `tests/e2e/flows/autoplay-muted.spec.ts` | Mute → turn → no autoplay → manual play works |
| `tests/e2e/flows/autoplay-browser-policy.spec.ts` | Autoplay blocked → "Click to play" fallback |
| `tests/e2e/flows/kid-mode-toggle.spec.ts` | Toggle on → start → kid labels rendered |
| `tests/e2e/flows/kid-mode-history.spec.ts` | Kid session in history → kid labels shown |
| `tests/e2e/flows/kid-mode-lock.spec.ts` | Toggle disabled mid-session → enabled after end |

### 5c. CLAUDE.md Update
Append Phase 1b section documenting:
- AudioPlayer useRef pattern (no JSX `<audio>`)
- onended chaining (no setTimeout)
- Mute in localStorage
- kidMode lifecycle (set at session start, locked, persisted)
- Label mapping in `kidmode.labels.ts`

---

## Conflict Zones

| File | Auto-Play touches | Kid Mode touches | Strategy |
|---|---|---|---|
| `TurnCard.tsx` | AudioPlayer props, highlight | Label text, kidMode CSS | Audio first (adds props), Kid Mode second (wraps labels) |
| `app/page.tsx` | Mute toggle, playback state | kidMode toggle, session locking | Audio adds header toggle + hook. Kid Mode adds start screen toggle. Different JSX areas. |

---

## Backward Compatibility

- Existing sessions without `kidMode` → default `false` via `session.kidMode ?? false`
- `POST /api/session` without `kidMode` in body → default `false`
- Old index entries without `kidMode` → handled by `?? false` in reads

---

## Stats

- **3 new files** (hooks + labels config)
- **~18 modified files**
- **6 new E2E specs, 3 new unit test files**
- **Estimated teammates:** 3 builders (Audio, Kid Mode, Tests+Docs)

---

## Teammate Prompts (for spawning)

### Builder: Audio
```
Phase 1b Feature 1. Read phase1b-plan.md.
Scope: hooks/useLocalStorage.ts, hooks/useAutoPlayChain.ts (NEW),
AudioPlayer rewrite, TurnCard playback wiring, page.tsx mute toggle.
Do Waves 1c → 2a → 2b → 2c in order.
```

### Builder: Kid Mode
```
Phase 1b Feature 2. Read phase1b-plan.md.
Scope: types, kidmode.labels.ts (NEW), all 4 prompts, BLL services,
session API, TurnCard labels, page.tsx toggle, Modal + Drawer.
Do Waves 1a+1b → 3a+3b+3c → 4a+4b+4c in order.
Wait for Audio builder to finish TurnCard before starting Wave 4a.
```

### Builder: Tests+Docs
```
Phase 1b testing. Read phase1b-plan.md.
Scope: vitest config update, unit tests, E2E specs, CLAUDE.md update.
Do Wave 5 after Audio and Kid Mode builders complete.
```
