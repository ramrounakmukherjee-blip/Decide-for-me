# Decide For Me

**A hyper-rational decision engine that ends decision paralysis with weighted scoring, risk math, and regret minimization.**

> Built for chronically indecisive people. You bring the dilemma — the engine brings the verdict.

---

## About

**Decide For Me** is an AI decision assistant that refuses to sit on the fence.

Most people don't struggle with decisions because they lack information; they struggle because they have no consistent way to weigh that information against what they actually care about. Decide For Me fixes that. You declare your life priorities once, give them real mathematical weight, and every dilemma you throw at the engine is scored against *your* values rather than generic advice.

Tell it what you're torn between — *Move to New York* vs. *Stay in London*, *Take the startup offer* vs. *Stay at the corporate job*, *Buy the house* vs. *Keep renting* — add the context, drop in your own pros and cons, and within seconds you get a full clinical evaluation instead of another list of "it depends."

The engine runs each dilemma through a **hyper-rational, clinical decision framework**:

- **Weighted priority alignment** — every option is scored 0–10 against each of your priorities, weighted by the 1–10 importance you assigned. Buying a house doesn't score the same for someone who weights "Financial Stability" at 10/10 as it does for someone who weights "Freedom to Travel" at 10/10.
- **Trade-off synthesis** — structured pros, cons, hidden risks, and expected value for each option, with your own submitted factors folded into the math.
- **Quantitative risk modelling** — a 0–100 risk index per option with volatility, downside severity, reversibility, and a concrete mitigation strategy. "How bad is it if I'm wrong, and can I undo it?" is answered explicitly.
- **Regret minimization (10/10/10)** — the decision is projected 10 minutes, 10 months, and 10 years out, so short-term discomfort stops masquerading as long-term risk.
- **A verdict with a number** — one recommended option, a confidence score, a one-line headline, and an executive summary that explains exactly why the loser lost.
- **An action protocol** — three momentum steps to execute today, because an unexecuted decision is just more paralysis.

And it doesn't stop at the verdict. Every evaluation is conversational: ask follow-up questions, stress-test the recommendation, and interrogate the reasoning in a chat that remembers the full decision context.

Your priorities live in a persistent sidebar (with quick presets and one-click AI structuring), your history is saved locally and synced to Firestore when you sign in, and every report can be exported as Markdown, JSON, or print-to-PDF for the moments when you need to justify the choice to someone else.

There is no "both options are good." There is a recommendation, a number, and a first step.

---

## How it works

```
        ┌──────────────────────────────────────────────────────────┐
        │  1. YOU DEFINE THE DILEMMA                               │
        │     Option A / Option B (+ up to 2 more), context,       │
        │     and your own pros & cons per option                  │
        └───────────────────────────┬──────────────────────────────┘
                                    │
        ┌───────────────────────────▼──────────────────────────────┐
        │  2. YOUR PRIORITIES (weighted 1–10)                      │
        │     Stored locally, editable, AI-structurable            │
        └───────────────────────────┬──────────────────────────────┘
                                    │
        ┌───────────────────────────▼──────────────────────────────┐
        │  3. FAST VERDICT  —  POST /api/decide-template           │
        │     Firebase AI Logic "decider-flow" prompt template     │
        │     → instant verdict + justification + first step       │
        └───────────────────────────┬──────────────────────────────┘
                                    │
        ┌───────────────────────────▼──────────────────────────────┐
        │  4. FULL ANALYSIS  —  POST /api/decide                   │
        │     Gemini structured JSON: priority matrix, risk index, │
        │     regret 10/10/10, action steps, follow-up probes      │
        └───────────────────────────┬──────────────────────────────┘
                                    │
        ┌───────────────────────────▼──────────────────────────────┐
        │  5. FOLLOW-UP CHAT  —  POST /api/chat                    │
        │     Context-aware interrogation of the verdict           │
        └───────────────────────────┬──────────────────────────────┘
                                    │
        ┌───────────────────────────▼──────────────────────────────┐
        │  6. PERSISTENCE                                          │
        │     localStorage always · Firestore when signed in       │
        └──────────────────────────────────────────────────────────┘
```

Two Gemini calls run per dilemma: a lightweight `decider-flow` template call that returns an instant verdict (so you see *something* immediately), followed by the full structured analysis. Both fall back gracefully — see [Resilience](#resilience--graceful-degradation).

---

## Features

### Dilemma intake
- Two required options (**A** and **B**) plus up to two optional extras (**C**, **D**)
- Optional free-text dilemma background for context
- Per-option pros & cons entry, with live counts and removable chips
- Add/remove entries with <kbd>Enter</kbd>, no page reloads

### Weighted priorities engine
- Natural-language "Primary Life Directive" — write your priorities however you like
- **Auto-Extract Priority Tags** — Gemini structures your raw text into 3–6 crisp, weighted priorities
- Per-priority **1–10 mathematical weight** with automatic tiering (9–10 Critical, 7–8 High, 4–6 Medium, 1–3 Low)
- 7 quick-add presets: Financial Stability, Work-Life Balance, Bi-Annual Travel, Career Growth, Family Proximity, Mental Well-being, Vibrant City Life
- Weights are injected directly into the scoring prompt — they change the math, not just the wording

### The decision report
Each evaluation renders as a full-page card containing:

| Section | What it gives you |
|---|---|
| **Optimal Choice** | The recommended option, a one-line verdict headline, and an alignment/confidence score |
| **Executive Rational Synthesis** | 2–3 sentence breakdown of why this option won |
| **Priority Alignment Breakdown** | Per-priority dual progress bars (Option A vs. Option B, 0–10) with the importance weight and a comparative note |
| **Option Analysis** | Pros, cons, hidden risks, and expected value per option — plus your own submitted factors surfaced as "User-Submitted Weighted Factors" |
| **Quantitative Risk Index** | 0–100 risk score, risk level, volatility (1–10), downside severity (1–10), reversibility rating, key risk factors, and a mitigation strategy |
| **10 / 10 / 10 Regret Minimization** | The decision projected 10 minutes, 10 months, and 10 years out |
| **Immediate Action Protocol** | 3 numbered momentum steps |
| **Probe Further** | 3 AI-suggested follow-up questions as one-click chips |

### Exports & sharing
- **Copy Briefing** — verdict + summary to clipboard
- **Copy Markdown** — full formatted report
- **Export JSON** — the raw `DecisionResult` object
- **Print / PDF** — print-optimized styles (chrome hidden, card de-chromed)

### Follow-up chat
- Inline chat bar appears after your first evaluation
- Full decision context (dilemma, both options, priorities, recommendation) is injected into every turn
- Explicitly instructed to counter cognitive bias: sunk cost fallacy, status quo bias, FOMO

### History & sync
- **Decision History Log** — every past dilemma with timestamp, confidence score, and verdict snippet; click to reload the full analysis into the workspace
- **Local persistence** — priorities, structured weights, history, and settings in `localStorage` (`dfm_*` keys), toggleable
- **Cloud sync** — sign in with Google, email/password, or anonymously; decisions sync to Firestore in real time via `onSnapshot`, scoped to `users/{uid}/decisions/{decisionId}`

### Evaluation lens modes
Switch the personality of the engine in **Settings → Engine Logic**:

| Mode | Behaviour |
|---|---|
| **Clinical Rational** *(default)* | Strict quantitative alignment scoring across all active priorities, zero emotional bias |
| **Regret Minimization** | Applies the 10/10/10 rule to prevent future remorse over missed opportunities |
| **Risk-Averse** | Heavily penalizes downside volatility, hidden costs, and instability |
| **Aggressive Opportunity** | Maximizes long-term upside, learning leverage, and personal agency |

---

## Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 5.8, Vite 6 |
| **Styling** | Tailwind CSS 4 (`@tailwindcss/vite`), Inter / Manrope / JetBrains Mono |
| **Icons** | lucide-react |
| **Server** | Express 4 (Vite middleware in dev, static `dist` in production) |
| **AI** | `@google/genai` — Gemini 2.5 Flash → 2.5 Pro fallback, JSON-mode structured output |
| **Auth & DB** | Firebase 12 — Authentication + Cloud Firestore |
| **Runtime** | `tsx` for development, esbuild bundle for production |

---

## Getting started

### Prerequisites

- **Node.js 22+** (or [Bun](https://bun.sh) — a `bun.lock` is committed)
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Install

```bash
git clone https://github.com/ramrounakmukherjee-blip/Decide-for-me.git
cd Decide-for-me

npm install      # or: bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

```env
# Required — used for all Gemini calls
GEMINI_API_KEY="your-gemini-api-key"

# The URL where the app is hosted (reserved for self-referential links)
APP_URL="http://localhost:3000"
```

> Firebase credentials are already committed in `firebase-applet-config.json` — these are public client-side identifiers, not secrets. Access is controlled by the Firestore security rules, not by hiding them.

### 3. Run

```bash
npm run dev      # or: bun run dev
```

Open **http://localhost:3000**. The server binds to `0.0.0.0` so it also works inside containers and preview environments.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Vite middleware + HMR) on port 3000 |
| `npm run build` | Production bundle: `vite build` + esbuild → `dist/server.cjs` |
| `npm run start` | Serve the production build (`NODE_ENV=production node dist/server.cjs`) |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run clean` | Remove `dist/` |

---

## Project structure

```
Decide-for-me/
├── server.ts                    # Express server + all Gemini prompts + fallback engine
├── index.html                   # Entry HTML, fonts, root div
├── vite.config.ts               # React + Tailwind, HMR toggle via DISABLE_HMR
├── tsconfig.json                # ES2022, bundler resolution, @/* path alias
├── firestore.rules              # Per-user read/write isolation
├── firebase-applet-config.json  # Firebase client config (public)
├── firebase-blueprint.json      # Entity + security schema for the data model
├── metadata.json                # App name, description, declared capabilities
├── src/
│   ├── main.tsx                 # React root
│   ├── App.tsx                  # State orchestration, API calls, persistence
│   ├── types.ts                 # PriorityItem, DecisionResult, ChatMessage, AppSettings…
│   ├── index.css                # Tailwind import, font classes, scrollbar
│   ├── lib/
│   │   └── firebase.ts          # Auth helpers + Firestore CRUD + decider-flow client
│   └── components/
│       ├── Header.tsx                # Brand, history, settings, auth entry
│       ├── DilemmaForm.tsx           # Options A–D, context, pros & cons capture
│       ├── ChatFlow.tsx              # Message stream, decider-flow card, follow-up bar
│       ├── DecisionResultCard.tsx    # The full analysis report + export actions
│       ├── SidebarPriorities.tsx     # Life directive, weighted priorities, lens display
│       ├── EditPrioritiesModal.tsx   # Priority editing, AI structuring, presets, sliders
│       ├── HistoryModal.tsx          # Decision log with replay
│       ├── SettingsModal.tsx         # Evaluation lens + storage preferences
│       └── AuthModal.tsx             # Google / email / anonymous sign-in
```

---

## API reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness check |
| `POST` | `/api/decide` | Full structured decision analysis |
| `POST` | `/api/chat` | Context-aware follow-up conversation |
| `POST` | `/api/decide-template` | Fast verdict via the `decider-flow` prompt template |
| `POST` | `/api/refine-priorities` | Turn raw priority text into 3–6 weighted priorities |

### `POST /api/decide`

```jsonc
{
  "dilemma": "Which city sets up my next 3 years best?",
  "optionA": "Move to New York",
  "optionB": "Stay in London",
  "extraOptions": [],
  "userProsCons": [
    { "optionName": "Move to New York", "pros": ["Higher salary"], "cons": ["Far from family"] },
    { "optionName": "Stay in London", "pros": ["Established social circle"], "cons": [] }
  ],
  "priorities": "Financial stability, work-life balance, travel twice a year",
  "structuredPriorities": [
    { "id": "p1", "title": "Financial Stability", "weight": "Critical", "customWeight": 10 }
  ],
  "mode": "Clinical Rational"
}
```

Responds with `{ "success": true, "data": { ...DecisionResult } }` — recommended option, confidence score, verdict headline, executive summary, priority alignment matrix, per-option analysis, risk calculation, regret minimization, action steps, and suggested follow-ups.

### `POST /api/chat`

```jsonc
{
  "messages": [{ "role": "user", "content": "What if the visa falls through?" }],
  "dilemma": "…", "optionA": "…", "optionB": "…",
  "priorities": "…", "currentDecision": { /* the DecisionResult in view */ }
}
```

---

## Data model

```
users/{userId}
  ├── email, displayName, createdAt
  └── decisions/{decisionId}
        ├── dilemma, optionA, optionB, extraOptions, userProsCons
        ├── recommendedOption, confidenceScore, verdictHeadline, executiveSummary
        ├── priorityAlignment[], optionAAnalysis, optionBAnalysis
        ├── riskCalculation, regretMinimization, decisiveActionSteps
        └── timestamp, createdAt
```

> The `users/{userId}` profile document (`email`, `displayName`, `createdAt`) is defined in `firebase-blueprint.json`; the app currently writes only to the `decisions` subcollection.

Security is per-user and explicit — a signed-in user can only read and write their own document tree:

```js
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  match /decisions/{decisionId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

---

## Resilience & graceful degradation

The app is designed to stay useful when the AI layer is unavailable.

1. **Model fallback** — every Gemini call tries `gemini-2.5-flash` first, then `gemini-2.5-pro`. A failure on the first model is logged and retried, not surfaced.
2. **Deterministic fallback engine** — if all models fail (quota exhaustion, network, bad key), `/api/decide` returns a locally computed analysis. It scores options from your submitted pros/cons, builds the priority matrix from your actual weights, derives a risk index, and generates action steps — so the UI never breaks and you still get a defensible answer.
3. **Priority structuring fallback** — if refinement fails, your raw text is split on commas/semicolons/newlines and tiered heuristically.
4. **Non-blocking template call** — the fast `decider-flow` verdict is wrapped in its own `try/catch`; a failure logs a warning and the full analysis proceeds regardless.

---

## Design system

| Token | Value | Use |
|---|---|---|
| `ink` | `#191c1e` | Primary text |
| `slate` | `#454652` | Secondary text |
| `muted` | `#757684` | Labels, meta |
| `indigo` | `#3f51b5` | Primary actions, accent |
| `deep` | `#24389c` | Brand, headlines, hover |
| `surface` | `#f7f9fb` | Page background |
| `panel` | `#f2f4f6` | Sidebar, nested cards |
| `line` | `#c5c5d4` | Borders, dividers |

- **Manrope** — headlines · **Inter** — body & UI · **JetBrains Mono** — labels, weights, scores
- Workspace / priorities split is 75 / 25 on desktop; the sidebar collapses into a mobile drawer below `lg`

---

## Notes & known gaps

- `package.json` still carries the scaffold name `react-example`; renaming it to `decide-for-me` is a one-line cleanup.
- `motion` and `APP_URL` are declared but not currently referenced anywhere in `src/` or `server.ts`.
- No `LICENSE` file is present. Source headers declare `SPDX-License-Identifier: Apache-2.0`, so adding an Apache-2.0 `LICENSE` would make that explicit.
- `.env.example` mentions AI Studio secret injection; self-hosting works fine with a plain `.env`.

---

## License

Source files carry the `Apache-2.0` SPDX identifier. A top-level `LICENSE` file has not been added yet — see the note above.
