# Orca

Learn English from the news you actually want to read.

Orca turns any news article into a language lesson: it extracts vocabulary at your level, generates a summary, and lets you discuss the article with an AI tutor. It ships as a **web app**, a **Chrome extension** that works on any page you're browsing, and an **iOS/Android app**.

Built and maintained since May 2023 — ~600 commits across a TypeScript monorepo with a Python AI service.

> **Start here:** [`nextjs/`](#nextjs--web-app--api) is the core of the system. It serves the web app *and* the API that every other client talks to.

---

## Features

**Conversation**
- Chat with an AI tutor about the article you just read
- Spoken replies via TTS; speech input on mobile
- Grammar checking and paraphrase suggestions on what you write
- Sentence-level translation into your native language

**Accounts & platform**
- Firebase Authentication, Stripe subscriptions, feature flags
- Contentful CMS for editorial content
- Analytics via Mixpanel, error tracking via Sentry and LogRocket

---

## Tech stack

| Layer | Technologies |
|---|---|
| **Language** | TypeScript (clients + API + workers); Python (inactive `ai/` service) |
| **Web** | Next.js (Pages Router), React, MUI, Redux Toolkit, next-i18next |
| **Chrome extension** | Plasmo, React, MUI, Redux Toolkit |
| **Mobile** | Expo, React Native, React Native Paper, Redux Toolkit |
| **API / data** | Next.js API routes, Prisma, PostgreSQL |
| **Auth & billing** | Firebase Auth, Stripe |
| **AI** | OpenAI; AWS Polly (TTS via Lambda) |
| **CMS & content** | Contentful; NewsData.io (ingestion) |
| **Workers** | Fastify (`worker/`), Serverless Framework + AWS Lambda (`lambda/`), Firebase Cloud Functions |
| **Observability** | Mixpanel, Sentry, LogRocket |
| **Testing** | Cypress (extension E2E) |

---

## Architecture

Every client is a thin UI over one shared API. State lives in Postgres, accessed through Prisma.

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Web (SPA)   │   │  Chrome ext  │   │  iOS/Android │
│   nextjs/    │   │     ce/      │   │     rn/      │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       │        ┌─────────┴────────┐         │
       │        │ background       │         │
       │        │ service worker   │         │
       │        └─────────┬────────┘         │
       └──────────────────┼──────────────────┘
                          │  REST + Firebase ID token
                 ┌────────▼─────────┐
                 │  nextjs/pages/api│
                 │  Next.js API     │
                 └────────┬─────────┘
                          │
      ┌───────────┬───────┴────┬────────────┐
      │           │            │            │
┌─────▼────┐ ┌────▼────┐ ┌─────▼────┐ ┌─────▼─────┐
│ Postgres │ │ OpenAI  │ │ lambda/  │ │ worker/   │
│ (Prisma) │ │         │ │ AWS Polly│ │ ingestion │
└──────────┘ └─────────┘ └──────────┘ └───────────┘
```

All three clients share the same shape: **Redux Toolkit** store, thunks calling the same endpoints, MUI components. The extension differs in one way — its network calls are proxied through a Plasmo background service worker rather than issued directly from the UI.

---

## Folder structure

| Package | Stack | Role |
|---|---|---|
| [`nextjs/`](#nextjs--web-app--api) | Next.js (Pages Router), Prisma, MUI | **Web app + the API for all clients** |
| [`ce/`](#ce--chrome-extension) | Plasmo, React, Redux | Chrome extension — lessons injected into any page |
| [`rn/`](#rn--mobile-app) | Expo, React Native | iOS & Android app |
| [`ai/`](#ai--python-service-inactive) | Flask, LangChain, Chroma | **Inactive.** Original streaming chat service |
| `lambda/` | Serverless Framework, TypeScript | AWS Polly text-to-speech (`polly`, `chatPolly`) |
| `worker/` | Fastify, TypeScript | Work server for long running LLM tasks such as vocabulary extraction and article parsing |
| `writer/` | TypeScript | News ingestion from NewsData.io into Contentful |
| `mobile/` | Python, Firebase Functions | Firebase Cloud Functions |
| `functions/` | — | Firebase project config |

### `nextjs/` — web app + API

The system's core. Ships the web UI and the REST API consumed by the extension and the mobile app.

```
nextjs/
├── pages/
│   ├── api/              # ~70 REST endpoints — the backend for every client
│   │   ├── lessons/      #   lesson lifecycle, chat, messages
│   │   ├── materials/    #   article import, vocab, ratings
│   │   ├── messages/     #   paraphrase, grammar, translation
│   │   ├── publishers/   #   RSS sources, follow, cron
│   │   ├── vocabs/       #   extraction and saved words
│   │   ├── youtube/      #   captions, summaries, vocab
│   │   ├── stripe/       #   checkout and webhooks
│   │   └── cms/          #   Contentful sync
│   └── *.tsx             # web app pages
├── models/               # data access layer over Prisma
├── db/prisma/            # schema — 25 models (User, Lesson, Message, Vocabulary…)
├── utils/openai/         # prompt construction per feature
├── middleware/           # setCurrentUser — resolves Firebase UID to a User
├── firebase/             # Admin SDK, ID token validation
├── redux/features/       # client store (mirrors ce/ and rn/)
└── jobs/, defer/         # scheduled and deferred work
```

**Request flow for an authenticated route:** `validateToken` (verify Firebase ID token) → `setCurrentUser` (Firebase UID → `User` row) → load the resource → verify ownership → handle.

### `ce/` — Chrome extension

Built with [Plasmo](https://www.plasmo.com/). Injects a lesson panel into whatever page you're reading, so any article on the web becomes study material.

```
ce/
├── contents/       # content scripts — inject the panel into the host page
├── background/
│   └── messages/   # service worker handlers; all API calls proxy through here
├── components/     # Inject.tsx is the main panel
├── tabs/           # full-tab pages
├── redux/features/ # store, mirrors nextjs/redux
├── firebase/       # client auth
└── cypress/        # E2E tests
```

UI components never call the API directly. They dispatch a Redux thunk → `sendToBackground({ name })` → a handler in `background/messages/` → the Next.js API. This exists because Manifest V3 content scripts are subject to the host page's CSP; the service worker is not.

### `rn/` — mobile app

Expo / React Native, iOS and Android.

```
rn/
├── screens/        # Feed, Lesson, Talk, Search, Note, Auth …
├── components/
├── redux/features/ # store, mirrors nextjs/redux
├── locales/        # i18n
└── hooks/, helpers/, styles/
```

Adds voice input (`@react-native-voice/voice`) and audio playback (`expo-av`) for spoken conversation practice.

### `ai/` — Python service (inactive)

**Not wired to any client.** Kept for reference; the chat feature it served was reimplemented in Node in October 2023.

```
ai/
├── app.py          # Flask — POST /api/chat, streams text/event-stream
├── chat/callback.py# token streaming callback handler
├── db.py           # its own Prisma client, same Postgres
└── Dockerfile
```

This was the original chat backend and is architecturally more capable than what replaced it:

- **Token streaming** over Server-Sent Events, so replies appeared word by word
- **Retrieval-augmented** — loaded the article with `PlaywrightURLLoader`, embedded it into a Chroma vector store, and answered against a LangChain `ConversationalRetrievalChain`

It was reached through a Next.js rewrite proxying `/api/bot` to Flask on port 5328. That rewrite was not carried over when `web/` was renamed to `nextjs/`, and the service was left stranded. The current implementation (`nextjs/pages/api/lessons/[lessonId]/chat.ts`) is a single blocking OpenAI call with no retrieval step.

> Restoring streaming and grounding is the highest-value open item in the codebase. See [Known gaps](#known-gaps).

---

## Getting started

Each package installs and runs independently — there is no workspace root.

```bash
# Web app + API
cd nextjs
npm install
cp .env.example .env          # fill in the values
npm run db:migrate            # schema lives at db/prisma/schema.prisma
npm run dev                   # http://localhost:3000

# Chrome extension — then load build/chrome-mv3-dev as an unpacked extension
cd ce && npm install && cp .env.example .env && npm run dev

# Mobile
cd rn && npm install && cp .env.example .env
npm run start                 # or `npm run ios` / `npm run android`
```

Every package ships a `.env.example` listing the keys it needs. **No secrets are committed** — `.env` files are gitignored and the history has been scrubbed.

---

## Data model

25 Prisma models. The core chain:

```
User ──< Lesson ──< Message ──< Sentence
             │                     └──< Paraphrase, GrammarMistake, Translation
             └──> Material ──< Vocabulary
                      └──> Publisher
```

A **Material** is an imported article. A **Lesson** is one user's session with that material. **Messages** are the tutor conversation; **Sentences** decompose them so grammar and paraphrase features can attach per sentence.

---

## Future improvements

* **Increase test coverage:** Since this project was built at the pre-PMF / MVP stage, I prioritized rapid product iteration and shipping over comprehensive automated testing. I would add stronger unit, integration, and end-to-end coverage around the core user flows.

Add Storybook stories for reusable UI components, Chromatic for automated visual regression testing, and Cypress E2E tests for critical user flows.

* **Move to a monorepo:** Consolidate the web app, browser extension, and React Native app into a monorepo to share common components, types, utilities, and business logic. Today each client duplicates code and `shared/` only has a thin types/helpers stub. This layout is where that duplication would go.

```
orca/
├── apps/
│   ├── web/          # nextjs/ — web app + API
│   ├── extension/    # ce/ — Chrome extension
│   └── mobile/       # rn/ — Expo / React Native
├── packages/
│   ├── ui/           # shared presentational components
│   ├── store/        # Redux Toolkit slices (auth, lessons, messages…)
│   ├── api-client/   # typed API helpers / thunks
│   ├── types/        # shared domain types
│   └── config/       # eslint, tsconfig, tooling
├── services/
│   ├── worker/       # Fastify ingestion / LLM jobs
│   └── lambda/       # Polly TTS
└── package.json      # workspace root (pnpm workspaces)
```

* **Improve component boundaries and data flow:** Refactor several larger legacy components, reduce duplication, and make state and data ownership clearer.

* **Strengthen authorization and permissions:** Review authorization boundaries across API routes and user-owned resources, and add more systematic permission checks and tests.



# Challeges

### Parsing websites

- **Parsing websites correctly and improving parsing/response time for real-time conversation**

In 2023, grounding chat on a full article was slow end-to-end. The process—scraping → (optional) embedding/retrieval → LLM completion—resulted in laggy "real-time conversation", particularly before streaming and faster models became standard. Site parsing was (and remains) unreliable across different publishers. Ended using `[Text from: ${lessonUrl}]` because it is 

#### Initial Architecture

The data flow for chat messages initially was:

```
ai/app.py
   ↓
nextjs/pages/api/chatStream.ts
   ↓
nextjs/pages/api/chat.ts
```

#### Change to Non-Streaming

Streaming was discontinued because Polly (the TTS engine) requires the full string before synthesizing speech. As a result, token streaming is no longer the critical path. 

---
