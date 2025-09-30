# MindCare – Culturally Sensitive Mental Health & Wellness Platform (Indian Youth Focus)

An AI-augmented mental wellness platform for Indian youth combining:
- Emotionally intelligent AI chat (context-aware: General / Academic / Family)
- Real-time empathetic companion with avatar reactions
- Gamification (Points • Levels • Streaks • Badges • Daily & Weekly Challenges)
- Cultural integration (Sanskrit terms, Ayurveda, family & academic pressure context)
- Secure, privacy-first data handling with encryption & RLS
- Proactive interventions & crisis-aware guidance (with human escalation pathways)

> ⚠️ This platform supports emotional well‑being but does NOT replace licensed mental health professionals. Always escalate critical cases.

---

## ✨ Core Feature Pillars

| Pillar | Highlights |
|--------|-----------|
| AI Companion | Gemini LLM + contextual prompts (general / academic / family), proactive check-ins, emotion tracking, vector semantic memory |
| Avatar & UX | 3D VRM avatar (emotion states: neutral, sad, concerned, happy, supportive, excited) driven by AI emotion analysis |
| Gamification | Points, wellness levels (Sanskrit-inspired), streaks, karma badges, culturally themed daily/weekly challenges |
| Cultural Intelligence | Hindi transliterations, dosha-aware challenges, family dynamics, exam stress, culturally sensitive phrasing |
| Safety & Ethics | Crisis keyword/emotion detection foundation, intervention logs, escalation patterns |
| Privacy & Security | Encrypted PII & sensitive psych fields (`_encrypted`), pgcrypto, Row Level Security (RLS), consent flags |
| Wellness Data | Mood entries, activities, challenges, streak milestones, Ayurvedic personalization (dosha-driven challenges) |

---

## 🏗️ High-Level Architecture

```
frontend/          React + Vite + Tailwind + MUI + VRM + Socket.io client
backend/           Express (TypeScript), PostgreSQL, Redis (planned), Socket.io server
ai-services/       Python (Flask currently) LLM orchestrator (Gemini + sentence transformers)
database/          SQL schema + migrations + gamification & challenges DDL
docs/              Feature design, integration, test reports
```

### Service Interaction Flow
1. Frontend → Backend: Authenticated REST + WebSocket (chat & live gamification updates)
2. Backend → AI Service: HTTP POST /chat (context, userId, message)
3. Backend → DB: Secure CRUD, gamification logic, challenges assignment, streak updates
4. AI Service:
   - Maintains per-user conversation history
   - Vector embedding memory (MiniLM) for semantic recall
   - Emotion classification → avatar mood & therapeutic language shaping

---

## 🤖 AI System Deep Dive

| Component | Implementation |
|----------|----------------|
| LLM | `ChatGoogleGenerativeAI(model="gemini-2.0-flash")` |
| Context Modes | `general`, `academic`, `family` (from `ai-services/context_prompts.py`) |
| Vector Memory | In‑memory embeddings (SentenceTransformer `all-MiniLM-L6-v2`) w/ similarity recall |
| Emotion Tracking | LLM-based JSON extraction → fallback keyword classifier (`EMOTIONAL_PATTERNS`) |
| Therapeutic Layer | System prompt (`ai-services/systemprompt.py`) + emotion-guided reflective scaffolding |
| Proactive Messages | Context + recent emotion history + similarity retrieval |
| Fallbacks | Graceful canned empathetic responses if LLM/keys missing |
| Avatar Mapping | AI emotion → avatar state (concerned / sad / happy / supportive / excited / neutral) |

### Prompt Design Principles
- Indian youth mental health themes (family pressure, exams, identity)
- Hindi code-mixing for warmth (“sab kuch theek ho jayega”, “dil”, “mann ki baat”)
- Encourages reflective disclosure, not diagnostic claims
- Consistently validates feelings before guidance

---

## 🎮 Gamification System (Multi-Layer)

| Layer | What It Does |
|-------|--------------|
| Points | Earned per wellness / chat / challenge activity (`point_activities`) |
| Wellness Levels | Progressive Sanskrit-inspired level names (see `wellness_levels`) |
| Streaks | Per-activity day-based streak tracking + milestone rewards |
| Badges | Karma badges unlocked via criteria (points, activity counts, levels) |
| Daily/Weekly Challenges | Ayurvedic & traditional practice–based structured tasks |
| Challenges Personalization | Dosha compatibility + cultural context fields |
| Achievements | Level + streak achievements logged separately |

### Daily / Weekly Challenges (Fourth Gamification Feature)
- 5 new tables + 11 seeded culturally rooted challenge templates
- Dosha-aware personalization (future-extensible)
- Quality scoring, streak bonuses, cultural bonuses
- Frontend integrates as a dashboard widget (ChallengesWidget)
- Integration tests & status report in `docs/CHALLENGES_INTEGRATION_TEST_REPORT.md`

For full details, see `docs/GAMIFICATION_CHALLENGES_FEATURE.md`.

---

## 🗄️ Database & Data Protection Overview

Key Strategies:
- pgcrypto encryption for sensitive columns (suffixed with `_encrypted`)
- Row Level Security (RLS) policies restrict per-user access
- Separation of chat messages vs session metadata
- JSONB for flexible cultural metadata (dosha, preferences)
- Audit logging for sensitive operations

Representative Tables (see `database/schema.sql`):
- `users`, `user_profiles`, `chat_sessions`, `chat_messages`, `interventions`
- `user_points`, `point_transactions`, `karma_badges`, `user_badges`
- `daily_activities`, `streaks`, `wellness_levels`
- `challenge_templates`, `user_challenges`, `challenge_completions`, `challenge_streaks`, `user_ayurveda_profile`
- `mood_entries`, `wellness_activities`, `user_activities`, `emergency_contacts`

---

## 🔐 Security & Ethics

| Domain | Practices |
|--------|----------|
| Encryption | pgcrypto on sensitive PHI-like fields |
| Access Control | JWT Auth + (planned) Redis session hardening |
| RLS Policies | Users can only see their own rows (explicit policies) |
| Logging | Winston + no sensitive payload logging |
| Crisis Sensitivity | Intervention logs; patterns ready for expansion |
| AI Safety | No medical advice; encourages professional escalation |
| Consent | `has_consent` flag in `user_profiles`; gating logic to be respected by features |

---

## 🧩 Backend (Express + TypeScript)

Highlights:
- Routes under `/api/*` (auth, users, chat baseline, wellness, interventions, gamification, audio)
- Centralized `GameService` handles awarding points, streaks, levels, badge criteria, milestones
- Request queue in gamification routes to smooth DB bursts
- Rate limiting (configurable) with relaxed dev bypass for gamification endpoints
- Socket.IO initialization prepared for real-time modules

### Example Gamification Flow
1. Frontend triggers an activity → POST `/api/gamification/award-points`
2. Service:
   - Fetches `point_activities` row
   - Upserts into `user_points`
   - Logs `point_transactions`
   - Runs `checkLevelUp`, `recordDailyActivity`, `checkNewBadges`
3. Returns badges earned, streak info, level-up info

---

## 🧠 AI Service (Python)

Current State:
- Flask app (`ai-services/main.py`) with `/chat` & `/health`
- Dual environment load (`.env` root & local)
- Graceful fallback logic if Gemini key missing
- Structured generation with vector + emotional + contextual augmentation
- Embedding trimming to last N sessions for memory control

---

## 🖥️ Frontend (React + Vite + Tailwind + MUI)

Feature Surfaces:
- Avatar rendering via `@pixiv/three-vrm`
- Real-time chat UI (Socket.IO planned / partial)
- Gamification dashboard (Points, Levels, Streaks, Badges, Challenges)
- Cultural theming (dosha colors, Sanskrit overlays)
- Component architecture (contexts for auth, gamification)

Key Libraries:
- VRM / three.js stack
- `@tanstack/react-query` (data fetching/caching)
- Radix UI primitives + MUI + Tailwind utility styling
- Framer Motion for animation
- React Router for page flows

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- PostgreSQL ≥ 14
- (Optional) Redis planned for session scaling
- Gemini API key (LLM features)

### Environment File (Example)
```
# Root .env
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_key_here
DATABASE_URL=postgres://user:pass@localhost:5432/mindcare
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=200
```

### Install & Run Everything
```
npm install
npm run dev        
```

### Run Individually
```
npm run dev:backend
npm run dev:ai
npm run dev:frontend
```

### Database Setup (Manual)
- Create a PostgreSQL database and user.
- Apply SQL files in `database/` (start with `schema.sql`, then feature `add_*.sql` as needed).
- Seed optional gamification/challenges data using the provided SQL files.

---

## 🌍 Cultural & Ethical Design Principles

| Dimension | Implementation |
|-----------|----------------|
| Language | Code-mixed Hindi when natural; avoids token spam |
| Academic Pressure | Dedicated prompt guidance (JEE, NEET, board exam nuance) |
| Family Dynamics | Respect + boundary coaching without alienation |
| Ayurveda | Dosha-aware challenge templates (seed stage) |
| Inclusivity | Non-judgmental tone; avoids stigmatizing phrasing |
| Crisis | Encourages professional help; avoids medical claims |

---

## 🧭 Repository At a Glance

| Path | Purpose |
|------|---------|
| `ai-services/main.py` | Core AI orchestration (LLM, emotions, memory, proactive flows) |
| `backend/src/services/gamification.ts` | Gamification engine |
| `backend/src/routes/gamification.ts` | API surface for gamification & challenges |
| `database/schema.sql` | Full relational schema w/ RLS & encryption |
| `docs/` | Feature design + integration + test narratives |
| `frontend/src/` | React app, dashboard, VRM avatar system |

---

## ⚠️ Disclaimer & Crisis Support (India)

MindCare does not provide diagnosis or replace licensed therapy. For suicidal thoughts or crisis situations in India, contact:
- KIRAN Mental Health Helpline: 1800-599-0019
- Snehi Helpline: +91-9582208181
- AASRA: +91-9820466726

