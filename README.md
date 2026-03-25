# LinguaVoice

Language learning prototype that teaches English to Slovak and Czech speakers via voice and AI.

Speak a sentence in Slovak or Czech, and the app will:
1. **Correct** your grammar (with explanations in your language)
2. **Translate** to English
3. **Generate** a fairy-tale paragraph using your sentence
4. **Analyse** your grammar with learning tips
5. **Read aloud** the translation and story via TTS

## Key Features

- **Voice Input** — Browser-native Web Speech API (no API key needed)
- **LLM Processing** — Switchable between OpenAI, Azure OpenAI, and Anthropic Claude
- **Text-to-Speech** — ElevenLabs with automatic fallback to OpenAI TTS
- **Auto-Play Audio** — Translation plays automatically after results, then chains to story
- **Session History** — Browse past sessions via slide-out drawer
- **Debug Mode** — Set `DEBUG=true` to see full LLM request/response pipeline in console
- **Layered Architecture** — Clean BLL/DAL/Clients separation, ready for production swap (e.g. Cosmos DB)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes, TypeScript |
| LLM | OpenAI GPT-4o / Azure OpenAI / Anthropic Claude (switchable) |
| Voice Input | Web Speech API (browser-native, free) |
| Voice Output | ElevenLabs API with OpenAI TTS fallback |
| Storage | Local JSON file DB (Docker volume, designed for Cosmos DB swap) |
| Tests | Vitest (unit) + Playwright (E2E) |
| Deploy | Docker + Azure Container Apps |

## Prerequisites

You need **at least one** LLM API key and optionally a TTS key:

| Service | Required? | Get a key |
|---|---|---|
| **OpenAI** (platform.openai.com) | Yes (if using `openai` provider) | https://platform.openai.com/api-keys |
| **Azure OpenAI** | Alternative to OpenAI | Azure Portal |
| **Anthropic Claude** | Alternative to OpenAI | https://console.anthropic.com/ |
| **ElevenLabs** | Optional (falls back to OpenAI TTS) | https://elevenlabs.io/ |

**LLM Fallback Chain:**
- Set `LLM_PROVIDER` to `openai`, `azure-openai`, or `anthropic`
- Only the chosen provider's key is required

**TTS Fallback Chain:**
- On first turn, the app probes ElevenLabs with a test synthesis
- If ElevenLabs fails (quota, auth, network) → automatically falls back to OpenAI TTS
- If both fail → audio is gracefully skipped, text results still work

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/tesarmarek/linguavoice.git
cd linguavoice
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Choose your LLM provider: "openai", "azure-openai", or "anthropic"
LLM_PROVIDER=openai

# OpenAI (required if LLM_PROVIDER=openai — also used for TTS fallback)
OPENAI_API_KEY=sk-proj-your-key-here

# Azure OpenAI (required if LLM_PROVIDER=azure-openai)
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# Anthropic (required if LLM_PROVIDER=anthropic)
ANTHROPIC_API_KEY=your-key

# ElevenLabs (optional — falls back to OpenAI TTS if unavailable)
ELEVENLABS_API_KEY=your-key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# App settings
DATA_DIR=./data
DEBUG=true
```

### 4. Create data directories

```bash
mkdir -p data/sessions data/audio
```

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000 in Chrome (required for Web Speech API).

### 6. Use the app

1. Select **Slovak** or **Czech**
2. Click **Start Session**
3. Click **Click to Speak** and say a sentence in your language
4. Wait for AI to process (correction, translation, story, analysis)
5. Audio plays automatically (translation first, then story)

## Docker

```bash
# Production
docker compose -f infra/docker-compose.yml up

# Development (with hot reload)
docker compose -f infra/docker-compose.yml --profile dev up dev
```

## Project Structure

```
app/api/          # Next.js API routes (thin controllers)
src/
  bll/            # Business logic (zero HTTP/filesystem knowledge)
  dal/            # Data access (JSON file store, atomic writes)
  clients/        # External API wrappers (LLM, TTS)
  prompts/        # All LLM prompt templates
  config/         # Environment, LLM factory, TTS factory
  types/          # Domain types (Session, Turn, etc.)
components/       # React UI components
infra/            # Dockerfile, docker-compose, Azure configs
tests/            # Vitest unit + Playwright E2E
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/session` | Create a new session |
| GET | `/api/session/:id` | Get session with all turns |
| POST | `/api/session/:id/turn` | Submit a voice turn for processing |
| GET | `/api/sessions` | List all sessions |
| GET | `/api/audio/:filename` | Serve generated audio files |

## Debug Mode

Set `DEBUG=true` in `.env` to see detailed logs:

```
[TTS] Probing ElevenLabs...
[TTS] ElevenLabs probe failed — falling back to OpenAI TTS
[TTS] OpenAI TTS OK — using as TTS provider
[LLMOrchestrator] === NEW TURN ===
[LLMOrchestrator] User said: {"raw":"Ja mam...","language":"sk","confidence":0.92}
[LLMOrchestrator] Step 1: Correction...
[LLMOrchestrator] OpenAI correction response: { ... }
...
[LLMOrchestrator] Translation audio created: xxx-translation.mp3 (1234ms)
[LLMOrchestrator] Story audio created: xxx-story.mp3 (2345ms)
```

## Contributing

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Make changes, then commit
git add .
git commit -m "Add your feature"

# Push and create PR
git push -u origin feature/your-feature
gh pr create --title "Your feature" --body "Description of changes"
```

## License

MIT
