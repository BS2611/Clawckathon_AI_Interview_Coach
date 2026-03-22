# AI Interview Coach — Web + Voice Experience

## Live demo

**Deployed app (Netlify):** [https://clawdcoach.netlify.app/](https://clawdcoach.netlify.app/)

---

## Overview

**Interview Coach** is a full-stack web application for practicing job interviews with **real-time AI feedback**. Candidates configure a session (role, interview type, experience level), answer questions in a focused **interview room** with live metrics, and receive a structured **final report** with scores, strengths, growth areas, and an improved-answer suggestion.

The product extends beyond the browser: after the text-based flow, users are guided to a **voice-based AI interviewer** powered by **ClawdTalk** (telephony + voice AI), reachable by phone with a short PIN—complementing the web experience for a realistic, spoken interview.

---

## Features

| Area | Description |
|------|-------------|
| **Landing & session setup** | Collect role, interview format, and seniority; start a session via API-backed flow. |
| **Interview room** | Multi-question text answers, live clarity/confidence/completeness metrics, coach notes, and optional **browser speech-to-text** (Web Speech API). |
| **AI answer evaluation** | Server-side OpenAI structured JSON evaluation (scores + coach note) per answer. |
| **Aggregated final report** | Final scores derived from **real** per-answer evaluations—not static templates. |
| **Results page** | Full report UI with overview, category breakdown, strengths, growth areas, and improved answer. |
| **Voice continuation (ClawdTalk)** | Results page CTA: scan QR (`tel:` dial-in), call **(509) 692-5293**, then enter extension **#2006** for the live AI voice interviewer. |
| **Polished UX** | Responsive layout, loading/analyzing states, accessible controls, and hackathon-ready demo polish. |

---

## How It Works (Architecture)

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js App (App Router)                     │
│  Landing → Interview Room → Results (+ Voice CTA)               │
│  React 19 · TypeScript · Tailwind CSS v4                         │
└───────────────┬───────────────────────────────┬──────────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│   API Routes (Route Handlers)   │   Browser Web Speech API      │
│   /api/start-session            │   (speech-to-text, optional)  │
│   /api/analyze-answer           │                               │
│   /api/final-report             │                               │
└───────────────┬───────────────┘   └──────────────────────────────┘
                │
                ▼
┌───────────────────────────┐       ┌───────────────────────────────┐
│   OpenAI (Chat Completions)     │       ClawdTalk / OpenClaw       │
│   JSON-mode evaluation          │       Voice AI interviewer       │
│   (answer analysis)             │       (phone + PIN after web)    │
└───────────────────────────┘       └───────────────────────────────┘
```

- **Frontend**: Single Next.js application—pages, client components, shared UI, and API routes colocated under `src/app` and `src/components`.
- **Backend**: Next.js **Route Handlers** implement REST-style JSON endpoints; session and report logic live under `src/lib` with typed contracts.
- **OpenAI**: Used in `/api/analyze-answer` for structured scoring and coaching text (no external STT/TTS dependency in that path).
- **Voice (ClawdTalk)**: The **phone channel** is the ClawdTalk experience; the web app advertises the dial-in and PIN on the results screen. **OpenClaw** is the broader automation/voice platform context for operating ClawdTalk-powered flows.

---

## Web Interview Flow

1. **Landing** (`/`) — User submits **InterviewConfig** (role, type, level).
2. **Interview room** (`/interview?…`) — Client calls `POST /api/start-session`, then answers each question; after each answer, `POST /api/analyze-answer` returns an **AnswerEvaluation**.
3. **Final aggregation** — After the last answer, `POST /api/final-report` receives the full **evaluations[]** array and builds a **FinalReport** (averages, category scores, strengths/weaknesses copy, summary).
4. **Results** (`/results`) — Report is read from **localStorage** (set right before navigation) so the page reflects the real run.

---

## Voice Interview (ClawdTalk Integration)

After viewing results, users see a **“Live Voice Interview”** card:

- **QR code** encodes only `tel:+15096925293` (no DTMF in the QR—phone keypad handling varies by device).
- **Visible instructions**: call **(509) 692-5293**, then after connect dial **#2006** to reach the AI voice interviewer.
- **“Call Now”** uses the same `tel:` URI.

This path is the **ClawdTalk**-mediated voice experience; the web app does not stream audio—it **hands off** to telephony + ClawdTalk.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** |
| UI | **React 19**, **Tailwind CSS v4** |
| AI (text evaluation) | **OpenAI** (`openai` SDK, JSON response format) |
| QR (results CTA) | **react-qr-code** |
| Voice input (browser) | **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`) |
| Voice interview (phone) | **ClawdTalk** (dial-in + PIN), **OpenClaw** ecosystem |

---

## Setup Instructions

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (ships with Node)
- **OpenAI API key** (required for `/api/analyze-answer` LLM evaluation)

### Installation

From the repository root (folder containing `package.json`):

```bash
cd interview-coach
npm install
```

---

## Environment Variables

Create a file named `.env.local` in the project root (Next.js loads it automatically for local dev).

```env
# Required for AI answer evaluation (OpenAI)
OPENAI_API_KEY=sk-...

# Optional: override the chat model used for /api/analyze-answer
# OPENAI_EVAL_MODEL=gpt-4o-mini
```

**Security**

- Never commit `.env.local` or real API keys.
- Rotate keys if they are exposed.

---

## Running Locally

```bash
# Development server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Production build (CI / sanity check)
npm run build

# Run production build locally
npm run start
```

```bash
# Lint
npm run lint
```

---

## Deployment

Typical options for a Next.js 16 app:

1. **Vercel** — Connect the Git repo; set `OPENAI_API_KEY` (and optional `OPENAI_EVAL_MODEL`) in Project → Settings → Environment Variables.
2. **Node host** — Run `npm run build && npm run start`; inject the same env vars in the process environment.

Ensure **server-side** env vars are available to API routes (`OPENAI_API_KEY` is not prefixed with `NEXT_PUBLIC_`).

---

## Demo Instructions

### Web interview (full loop)

1. Go to `/` and fill **role**, **interview type**, and **experience level**.
2. Click through to the **interview room** and answer all questions (type or use the **microphone** where supported).
3. Wait for **Analyzing…** between answers; confirm **live metrics** update.
4. Land on **Results** and review the **Final Report** (scores, overview, strengths, growth areas, improved answer).

### Voice interview (ClawdTalk)

1. On **Results**, scroll to **Ready for a live interview simulation?**
2. On a phone, **scan the QR** or tap **Call Now** / dial **(509) 692-5293**.
3. When connected, enter **#2006** as instructed for the AI voice interviewer.

### If speech-to-text fails

Chrome/Edge often use **online** speech recognition; a **network** error usually means connectivity or firewall/VPN blocking the speech service—**typing** still works.

---

## Future Improvements

- **Streaming** partial evaluations or WebSocket updates for lower perceived latency.
- **Persistent sessions** (database) instead of localStorage-only results for logged-in users.
- **Server-side STT** for environments where Web Speech API is unreliable.
- **Deeper ClawdTalk / OpenClaw** integration (e.g., deep links, session IDs in voice path).
- **E2E tests** for interview and results flows; contract tests for API routes.

---

## License

Private / hackathon use unless otherwise specified by the repository owner.
