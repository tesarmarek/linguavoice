# LinguaVoice

## Business Purpose
Language learning prototype for SK/CZ → EN via voice + AI.
Built to validate a product idea. Technical lead uses Claude Code
to spec and scaffold. Dev team takes it further.
Speed of prototype > perfection. Azure-deployable from day one.

## Stack
- Next.js 14 (App Router) — full-stack TypeScript
- React frontend (in same Next.js repo)
- LLM: Azure OpenAI + Anthropic Claude (switchable via LLM_PROVIDER env)
- Voice output: ElevenLabs API
- Voice input: Web Speech API (browser-native)
- Storage: Local JSON file DB under /data/
- Tests: Vitest (unit) + Playwright (E2E)
- Deploy target: Docker → Azure Container Apps

## Architecture Rules (strict)
- app/api/ routes are controllers only: parse DTO → call BLL → return
- src/bll/ has zero knowledge of HTTP or file paths
- src/dal/ is the only code that touches /data/ filesystem
- src/clients/ wraps all external APIs — never call ElevenLabs or LLM SDK
  directly from BLL
- src/prompts/ owns all LLM prompt strings — BLL calls PromptService,
  never builds strings itself
- All LLM responses must be structured JSON — parsed in clients layer,
  typed domain objects passed to BLL

## LLM Provider
- Interface: ILLMClient with method complete(prompt, systemPrompt): Promise<string>
- AzureOpenAIClient and AnthropicClient both implement it
- getLLMClient() factory reads LLM_PROVIDER env var
- BLL only ever uses ILLMClient — never imports a specific client

## Data
- /data/sessions/{uuid}.json — full session with embedded turns
- /data/index.json — lightweight list: [{ id, startedAt, turnCount, language }]
- /data/ is gitignored and Docker-volumed
- Repository interface designed for Cosmos DB swap later

## UI Patterns
- Session history: slide-out drawer (left), triggered by hamburger icon
- Session detail: modal overlay, read-only turn cards
- Main screen: single active session, hold-to-speak mic button
- Toast notifications for errors (not alerts)

## Dev Environment
- WSL2 Ubuntu on Windows 11
- Docker Desktop with WSL2 backend
- Project under /mnt/c/dev/
- Unix line endings (LF) everywhere
- Never use Windows-style paths

## Versioning
- Version lives in package.json `version` field
- App logs version to browser console on every page load via VersionLogger component
- Every chat iteration that changes code or config increments the patch version
  (e.g. 1.4.0 → 1.5.0 for the next change)
- Version is also used in Session.appVersion field

## Security
- All API keys in .env only — never in code
- .env is gitignored
- .env.example committed with placeholder values
- Rotate any key that appeared in chat or commit history
```

---

## Bootstrap Prompt for Claude Code

Paste this verbatim:
```
Scaffold a full-stack Next.js 14 (App Router) TypeScript application
called LinguaVoice. Read CLAUDE.md before writing any code.

This app teaches English to Slovak/Czech speakers via voice:
- User speaks a SK/CZ sentence (Web Speech API)
- LLM corrects grammar in source language, translates to English,
  generates a fairy-tale paragraph, produces a post-mortem analysis
- ElevenLabs reads the English translation and story aloud
- Each session and turn is saved to a local JSON file database

Scaffold in this order:

1. STRUCTURE — create all folders per CLAUDE.md project structure
2. TYPES — src/types/session.types.ts and turn.types.ts (full ERD)
3. CONFIG — src/config/env.ts and llm.config.ts with provider factory
4. PROMPTS — all 4 prompt templates in src/prompts/ returning typed JSON
5. CLIENTS — ILLMClient interface, AzureOpenAIClient, AnthropicClient,
   ElevenLabsClient (all with error handling and retry on 429/500)
6. DAL — ISessionRepository, IIndexRepository interfaces +
   JSON file implementations
7. BLL — SessionService, TurnService, LLMOrchestrator, PromptService
8. API ROUTES — 4 routes in app/api/ (thin controllers, DTOs, validation)
9. FRONTEND — React components: VoiceButton, TurnCard, SessionDrawer,
   SessionModal, AudioPlayer. Main page wires them together.
10. DOCKER — multi-stage Dockerfile, docker-compose.yml with
    /data volume and all env vars
11. TESTS — vitest.config.ts, playwright.config.ts, test fixtures,
    unit test stubs for all BLL and DAL modules
12. ENV — .env.example with all required keys and comments

Rules:
- Never call ElevenLabs or LLM SDK directly from BLL or API routes
- All prompts assembled by PromptService only
- LLM responses always parsed as JSON before leaving the client layer
- JSON file writes must be atomic (write to .tmp then rename)
- docker compose up must give a working app with no manual steps