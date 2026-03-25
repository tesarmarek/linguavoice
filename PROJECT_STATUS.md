---
name: LinguaVoice project status and history
description: Full project context — what was built, how, current state v1.22.0, what's left (Phase 1b)
type: project
---

## Project: LinguaVoice
Language learning app: SK/CZ → EN via voice + AI. Kids speak Slovak/Czech, app corrects grammar, translates, generates a fairy-tale story with Peppa Pig illustration, reads aloud, and suggests next story prompts.

**Repo:** https://github.com/tesarmarek/linguavoice
**Current version:** v1.22.0
**Branch:** main (all merged)

## What Was Built (Phase 1 + enhancements)

### Core Pipeline (per turn)
1. User speaks SK/CZ sentence (Web Speech API or Together.ai Whisper)
2. LLM corrects grammar → explains errors in user's language
3. LLM translates to English
4. LLM generates fairy-tale story paragraph
5. LLM generates postmortem analysis (grammar rules, difficulty, practice suggestion)
6. LLM generates 2 scenario prompts (imagination sparks for next turn)
7. LLM extracts visual scene description from story (scene extractor)
8. Image model generates Peppa Pig style illustration
9. TTS generates audio for translation + story
10. All results displayed in two-column card layout

### Provider Chains (with probe-and-fallback)
- **LLM:** OpenAI GPT-4o → Azure OpenAI → Anthropic Claude
- **TTS:** ElevenLabs → OpenAI TTS → graceful skip
- **Image:** ElevenLabs (opt-in) → Together.ai FLUX → OpenAI DALL-E → skip
- **STT:** Browser Web Speech API (default) or Together.ai Whisper

### Per-Turn Model Selection (frontend dropdowns)
- STT model selector (Browser free / Whisper $0.0015/min)
- Image model selector (15 Together.ai models: FLUX, Google Flash, Qwen, Wan-AI)

### Feature Flags (.env)
ENABLE_TTS, ENABLE_IMAGE, ENABLE_SCENARIOS — master toggles
ELEVENLABS_IMAGE_ENABLED — opt-in ElevenLabs image beta
DEBUG — detailed pipeline logging

## Architecture (strictly enforced)
```
app/api/        → thin controllers (parse DTO → validate → call BLL → return)
src/bll/        → business logic (zero HTTP/filesystem knowledge)
src/dal/        → data access (JSON files, atomic writes via .tmp+rename)
src/clients/    → ALL external API calls (LLM, TTS, Image, STT)
src/prompts/    → ALL prompt strings (correction, translation, story, postmortem, scenario, image)
src/config/     → env, factories (llm, tts, image), model lists
```

BLL never imports concrete clients — only interfaces.
Prompts never built in BLL — always via PromptService.
DAL is the only code touching /data/ filesystem.

## Development Process Used

### Phase 1 Scaffold (team of 4)
- Created team "linguavoice" with 4 builder teammates
- Foundation: types, config, prompts, DAL (tasks #1-#5)
- Backend: clients, BLL, API routes (tasks #6-#9)
- Frontend: React components, main page (tasks #10-#11)
- Infra+Tests: Docker, vitest/playwright configs, fixtures (tasks #12-#15)
- Orchestrator (me) reviewed each teammate's output for CLAUDE.md compliance
- Dependency order: Foundation first → Backend + Infra parallel → Frontend last

### Phase 1b Planning (team of 3 planners)
- Created team "linguavoice-1b" with 3 Plan agents in parallel
- planner-audio: Auto-Play Audio feature plan
- planner-kidmode: Kid Mode feature plan
- planner-shared: Shared changes, conflict analysis, implementation order
- All 3 plans consolidated into phase1b-plan.md (saved in repo)

### Iterative Bugfixing (direct, no teams)
- Each bug/feature was a version bump (1.0.0 → 1.22.0)
- Debug logging added progressively
- Provider probe failures diagnosed from server logs
- Frontend errors traced via browser console + server correlation

## Key Issues Encountered and Resolved
1. **Tailwind v4 incompatibility** — needed @tailwindcss/postcss plugin (v1.2.0)
2. **VoiceButton hold-to-speak race condition** — switched to click-to-toggle (v1.3.0)
3. **ElevenLabs quota exceeded** — added OpenAI TTS fallback (v1.7.0)
4. **turn.input missing from API response** — DTO mapper didn't include input field (v1.4.0)
5. **Audio 404 (fire-and-forget)** — switched to await so files exist before response (v1.8.0)
6. **Image not matching story** — two-step pipeline: scene extractor → image model (v1.15.0)
7. **Image always green hills** — removed hardcoded background rules, scene goes first in prompt (v1.21.0)
8. **Together.ai model name wrong** — FLUX.1-schnell-Free → FLUX.1-schnell (v1.18.0)
9. **Google Flash Image probe failed** — removed width/height params from probe (v1.21.0)

## What's Left (not yet implemented)

### Phase 1b — Auto-Play Audio + Kid Mode
Full plan in `phase1b-plan.md` in the repo. Summary:

**Auto-Play Audio:**
- Translation auto-plays after turn, chains to story via onEnded
- useAutoPlayChain hook (useRef<HTMLAudioElement>, not JSX)
- Mute toggle in header, persisted in localStorage
- Handle NotAllowedError with fallback button

**Kid Mode:**
- Toggle locked at session start, saved on Session entity
- All prompts get kid-friendly alternate system prompts
- UI labels swapped via kidmode.labels.ts
- TurnCard renders differently (emoji labels, no grammar terminology)
- History respects stored kidMode flag

**Implementation order:** Auto-Play first, Kid Mode second (minimal TurnCard conflict)

### Other potential work
- Fill in Vitest test bodies (currently it.todo() stubs)
- Fill in Playwright E2E test bodies (currently test.fixme() stubs)
- Docker compose verification with real API keys
- Cosmos DB swap for DAL (interface already designed for it)

## Version History
1.0.0 → Initial scaffold
1.1.0–1.3.0 → OpenAI client, Tailwind fix, VoiceButton fix
1.4.0–1.6.0 → DTO fix, debug logging, audio graceful handling
1.7.0 → TTS fallback (ElevenLabs → OpenAI)
1.8.0 → Audio awaited, auto-play chain
1.9.0–1.10.0 → Story images (DALL-E) + scenarios + turn.service fix
1.11.0–1.13.0 → Two-column layout, image prompt improvements
1.14.0–1.15.0 → Scene extractor two-step pipeline
1.16.0–1.17.0 → Dual image provider factory, probing
1.18.0 → Together.ai FLUX as primary image provider
1.19.0 → Per-turn image model selector (15 models)
1.20.0 → Model fallback chain with retry
1.21.0 → Google Flash Image default, scene-first prompt
1.22.0 → Dual STT (Browser + Together.ai Whisper)
