#Stack
* Frontend:     Next.js 14 App Router (React) — TypeScript
* Backend:      Next.js API Routes (same repo) — layered BLL/DAL/clients
* LLM:          Azure OpenAI (GPT-4o) + Anthropic Claude — switchable
* Voice input:  Web Speech API (browser) + optional Whisper fallback
* Voice output: ElevenLabs API
* Storage:      Local JSON file DB (Docker volume)
* Tests:        Vitest (unit) + Playwright (E2E)
* Deploy:       Docker → Azure Container Apps

#Project Structure
linguavoice/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Main voice screen
│   ├── layout.tsx
│   └── api/
│       ├── session/
│       │   ├── route.ts        # POST /api/session (create)
│       │   └── [id]/
│       │       ├── route.ts    # GET  /api/session/:id
│       │       └── turn/
│       │           └── route.ts  # POST /api/session/:id/turn
│       └── sessions/
│           └── route.ts        # GET  /api/sessions (index)
│
├── src/
│   ├── api/                    # Request/response DTOs + validators
│   │   ├── dtos/
│   │   │   ├── session.dto.ts
│   │   │   └── turn.dto.ts
│   │   └── validators/
│   │
│   ├── bll/                    # Business logic — no HTTP, no DB
│   │   ├── session.service.ts
│   │   ├── turn.service.ts
│   │   ├── llm.orchestrator.ts
│   │   └── prompt.service.ts
│   │
│   ├── dal/                    # Data access — JSON file store
│   │   ├── interfaces/
│   │   │   ├── ISessionRepository.ts
│   │   │   └── ITurnRepository.ts
│   │   └── repositories/
│   │       ├── session.repository.ts
│   │       └── index.repository.ts
│   │
│   ├── clients/                # External API wrappers
│   │   ├── elevenlabs.client.ts
│   │   ├── azure-openai.client.ts
│   │   └── anthropic.client.ts
│   │
│   ├── prompts/                # All LLM prompts as typed templates
│   │   ├── correction.prompt.ts
│   │   ├── translation.prompt.ts
│   │   ├── story.prompt.ts
│   │   └── postmortem.prompt.ts
│   │
│   ├── config/                 # Env + provider config
│   │   ├── env.ts
│   │   └── llm.config.ts       # Switch between providers
│   │
│   └── types/                  # Shared domain types / entities
│       ├── session.types.ts
│       └── turn.types.ts
│
├── components/                 # React UI components
│   ├── VoiceButton/
│   ├── TurnCard/
│   ├── SessionDrawer/          # Slide-out history sidebar
│   ├── SessionModal/           # Session detail popup
│   └── AudioPlayer/
│
├── tests/
│   ├── unit/                   # Vitest
│   │   ├── bll/
│   │   ├── dal/
│   │   ├── clients/
│   │   └── prompts/
│   ├── e2e/                    # Playwright
│   │   └── flows/
│   └── fixtures/               # Mock sessions, LLM responses, audio stubs
│
├── data/                       # Gitignored, Docker volume
│   ├── sessions/
│   └── index.json
│
├── infra/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── azure/
│
├── .env.example
├── CLAUDE.md
├── vitest.config.ts
└── playwright.config.ts

#LLM Provider Switching
// src/config/llm.config.ts
export type LLMProvider = "azure-openai" | "anthropic";

export function getLLMClient(): ILLMClient {
  const provider = process.env.LLM_PROVIDER as LLMProvider;
  switch (provider) {
    case "azure-openai": return new AzureOpenAIClient();
    case "anthropic":    return new AnthropicClient();
    default: throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
  }
}
```

Both clients implement the same `ILLMClient` interface — BLL never knows which is running.

---

## UI Architecture
```
┌─────────────────────────────────────────────────┐
│  [☰ History]              LinguaVoice      [⚙️]  │
│                                                  │
│         ┌─────────────────────────────┐          │
│         │   "Start Session" button    │          │
│         └─────────────────────────────┘          │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ Turn 1                                     │  │
│  │ 🎙 "Já jdu do školy"                       │  │
│  │ ✅ Corrected: "Já jdu do školy" (correct!) │  │
│  │ 🇬🇧 "I'm going to school"                  │  │
│  │ 📖 Story: Once upon a time, a young boy... │  │
│  │ 🔍 Analysis: Past tense / correct usage    │  │
│  │ ▶ [Play Translation]  ▶ [Play Story]       │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│              [ 🎙 Hold to Speak ]                │
└─────────────────────────────────────────────────┘

← DRAWER (slides in from left on ☰ click)
┌──────────────────┐
│ Session History  │
│ ──────────────── │
│ Today            │
│ • 14:32 – 5 turns│  ← click → opens SessionModal
│ • 11:10 – 3 turns│
│ Yesterday        │
│ • 18:45 – 8 turns│
└──────────────────┘

↑ SESSION MODAL (opens over main screen)
┌────────────────────────────────┐
│ Session · Jan 14 · 14:32  [✕] │
│ ─────────────────────────────  │
│ Turn 1 / Turn 2 / Turn 3 ...  │
│ [full read-only turn cards]    │
└────────────────────────────────┘
```

---

## ERD
```
Session ──< Turn
              │
              ├── TranscriptInput
              ├── CorrectionResult ──< Error
              ├── TranslationResult
              ├── StoryResult
              ├── PostmortemResult
              └── AudioResult

Session
  id            string (UUID)
  startedAt     string (ISO)
  endedAt       string | null
  language      "sk" | "cs"
  turnCount     number
  appVersion    string

Turn
  id            string (UUID)
  sessionId     string (FK)
  index         number
  createdAt     string (ISO)
  durationMs    number
  input         TranscriptInput
  correction    CorrectionResult
  translation   TranslationResult
  story         StoryResult
  postmortem    PostmortemResult
  audio         AudioResult

TranscriptInput
  raw           string
  language      "sk" | "cs"
  confidence    number (0-1, from STT)

CorrectionResult
  original      string
  corrected     string
  wasCorrect    boolean
  errors        Error[]

Error
  fragment      string  (original wrong fragment)
  corrected     string
  rule          string  (grammar rule name)
  explanation   string  (in SK/CS for learner)

TranslationResult
  source        string  (corrected SK/CS text)
  english       string

StoryResult
  paragraph     string  (English, 3-5 sentences)
  theme         string  (auto-detected, e.g. "school", "animals")

PostmortemResult
  grammarRules      string[]
  learningNote      string   (in source language)
  difficulty        "easy" | "medium" | "hard"
  suggestedPractice string

AudioResult
  translationFile   string  (path under /data/audio/)
  storyFile         string
  voiceId           string
  generatedAt       string (ISO)
```

---

## Test Suite

### Vitest — Unit Tests

| Test file | Covers |
|---|---|
| `bll/session.service.test.ts` | Create, end, retrieve session logic |
| `bll/turn.service.test.ts` | Turn creation, index increment, validation |
| `bll/llm.orchestrator.test.ts` | Correct pipeline sequence, error handling, provider swap |
| `bll/prompt.service.test.ts` | Each prompt type returns correct structure |
| `dal/session.repository.test.ts` | JSON read/write, concurrent write safety, index update |
| `clients/elevenlabs.client.test.ts` | Mock API, 429 retry, 500 graceful fail |
| `clients/llm.client.test.ts` | Mock both providers, response parsing |
| `prompts/correction.test.ts` | Parses malformed JSON, wasCorrect flag correct |

### Playwright — E2E Tests

| Test | Scenario |
|---|---|
| `happy-path-sk.spec.ts` | Full SK sentence → correction → EN → story → audio |
| `happy-path-cs.spec.ts` | Same for Czech |
| `session-start-end.spec.ts` | Start session → multiple turns → end → appears in history |
| `history-drawer.spec.ts` | Open drawer → sessions listed → click → modal opens |
| `history-modal.spec.ts` | All turns visible in modal, read-only, audio playable |
| `mic-denied.spec.ts` | Mic permission denied → clear error, app still usable |
| `llm-timeout.spec.ts` | LLM >10s → loading state shown, no crash, retry available |
| `elevenlabs-fail.spec.ts` | 500 from ElevenLabs → text shown, audio gracefully skipped |
| `provider-switch.spec.ts` | Change LLM_PROVIDER → app works with both |

### Fixtures (`tests/fixtures/`)
```
fixtures/
  sessions/
    session-happy-sk.json       # complete session, SK, no errors
    session-with-errors-cs.json # CS with grammar corrections
    session-empty.json          # just started, 0 turns
  llm-responses/
    correction-correct.json
    correction-with-errors.json
    translation.json
    story.json
    postmortem.json
  audio/
    stub.mp3                    # silent 1s mp3 for ElevenLabs mock