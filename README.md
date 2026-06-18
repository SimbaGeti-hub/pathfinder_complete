# 🧭 Pathfinder — AI Career Guidance Platform for Uganda

> An AI-powered career coach that helps Ugandan students discover career paths, build skills, prepare for interviews, and find real jobs — grounded in verified local data through Retrieval Augmented Generation (RAG).

Built as part of the **AI Engineering Capstone Project** — Student Career Guidance AI (Group 2).

---

## 👥 Team

| Name | Role | Owns |
|---|---|---|
| **Geti Simba** | Frontend Engineer | `pathfinder/` — Next.js application, UI/UX, authentication, dashboard, all feature modules |
| **Veronica Maria Mirembe** | Backend / AI Engineer | `backend/` — Python RAG pipeline, FastAPI, vector search, knowledge base |
| **Immaculate Kaitesi** | QA & Documentation | Testing, feature validation |

---

## 🎯 The Problem

Many students in Uganda:
- Don't know what careers exist or match their interests
- Don't understand the skills required to get there
- Struggle with interview preparation and CV writing
- Lack access to real, localized job market information

## 💡 The Solution

**Pathfinder** is an AI career coach that combines a polished web application with a Retrieval Augmented Generation (RAG) backend — meaning the AI doesn't just guess answers, it retrieves and reasons over **real Uganda-specific data** before responding.

---

## 🏗️ System Architecture

```
┌─────────────────────────┐         ┌──────────────────────────┐
│   pathfinder/            │         │   backend/          │
│   Next.js 15 + TypeScript │ ──────► │   Python + FastAPI          │
│   Frontend + light API    │  HTTP   │   RAG Engine                │
│                          │ ◄────── │                            │
│   Port 3000               │         │   Port 8000                 │
└─────────────────────────┘         └──────────────────────────┘
                                                  │
                                                  ▼
                                      ┌──────────────────────────┐
                                      │   Supabase (pgvector)      │
                                      │   108 Uganda documents      │
                                      │   embedded as vectors       │
                                      └──────────────────────────┘
                                                  │
                                                  ▼
                                      ┌──────────────────────────┐
                                      │   OpenAI                   │
                                      │   GPT-4o mini + Embeddings  │
                                      └──────────────────────────┘
```

**How a request flows (example — Career Recommender):**
1. User selects interests in the React UI
2. Next.js sends the question to the Python RAG backend
3. The question is converted into a vector embedding
4. Supabase pgvector searches 108 Uganda documents for the most relevant matches
5. Matching documents are injected into a GPT-4o mini prompt as context
6. The AI generates an answer grounded in real Uganda data — real salaries, real companies, real universities
7. Answer is sent back and rendered beautifully in the UI

---

## 📁 Repository Structure

```
pathfinder-complete/
├── pathfinder/                  → Frontend (Next.js) — owned by Geti
│   ├── app/
│   │   ├── api/                 → ai, chat, rag proxy routes
│   │   ├── components/
│   │   │   ├── modules/         → 9 feature modules
│   │   │   └── ...              → Landing, Login, SignUp, Dashboard
│   │   ├── context/             → Auth + Theme state
│   │   └── globals.css          → Full design system
│   └── package.json
│
└── pathfinder-rag/              → Backend (Python RAG) — owned by Maria
    ├── main.py                  → FastAPI app, all endpoints
    ├── rag_engine.py            → Vector search + answer generation
    ├── ingest.py                → Loads CSVs into Supabase
    ├── supabase_setup.sql       → pgvector + table setup
    ├── data/                    → 5 Uganda knowledge base CSVs
    └── requirements.txt
```

---

## ✨ Features

| Module | What it does |
|---|---|
| ⚡ **Career Recommender** | Select interests → get AI-matched careers with Uganda salaries, employers, and growth data |
| 🗺️ **Skill Roadmap** | Pick a career → get a 4-phase learning roadmap with free resources |
| 🎤 **Interview Prep** | Get role-specific interview questions with coaching tips and sample answers |
| 📚 **Study Plan** | Generate a personalized weekly study schedule |
| 🤖 **AI Assistant** | Full chatbot with persistent, named conversation history |
| 📄 **CV Builder** | 5-step CV builder with AI-generated summary, downloads as a polished document |
| 🏆 **Progress Tracker** | Track skill completion per roadmap phase with unlockable milestones |
| 💾 **Saved Items** | Save and revisit career matches, roadmaps, and interview sets |
| 🌍 **Job Board** | Real Uganda job listings with direct links to LinkedIn and BrighterMonday |

**Platform features:** Google OAuth sign-in · Email OTP verification · Dark/Light mode · Onboarding tour for new users · Fully responsive design

---

## 🛠️ Tech Stack

### Frontend (`pathfinder/`)
- **Next.js 15** — App Router, file-based routing, API routes
- **React 18 + TypeScript** — UI components with strict typing
- **CSS Variables + Tailwind** — theming system powering dark/light mode
- **Lucide React** — icon system
- **React Hot Toast** — notifications

### Backend (`pathfinder-rag/`)
- **Python 3.11 + FastAPI** — RAG API server
- **LangChain** — RAG orchestration
- **Supabase + pgvector** — vector database storing the Uganda knowledge base
- **OpenAI `text-embedding-3-small`** — converts text to vectors
- **OpenAI GPT-4o mini** — generates grounded answers
- **Uvicorn** — ASGI server

### Shared
- **OpenAI API** — powers every AI feature across both layers
- **Supabase** — shared database for both auth data and vector storage

---

## 📊 The Knowledge Base — What Makes This RAG

| File | Records | Contents |
|---|---|---|
| `careers_uganda.csv` | 20 | Career titles, UGX salaries, top employers, required education |
| `universities_uganda.csv` | 13 | Makerere, Kyambogo, MUBS, UCU, and more — courses, fees, requirements |
| `skills_framework.csv` | 35 | Skill-to-career mapping with free learning resources |
| `jobs_market_uganda.csv` | 24 | Real job listings from MTN, Andela, Stanbic, Safeboda, and more |
| `interview_qa.csv` | 18 | Interview questions with coaching tips and sample answers |

**Total: 108 documents** embedded into Supabase pgvector — every AI answer is grounded in this data rather than the model's general training knowledge.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- A Supabase account
- An OpenAI API key

---

### 1️⃣ Backend Setup (`pathfinder-rag/`)

```bash
cd pathfinder-rag
pip install -r requirements.txt
```

**Set up Supabase:**
1. Open Supabase Dashboard → SQL Editor
2. Run the contents of `supabase_setup.sql` — enables pgvector and creates tables

**Configure environment** — create `.env`:
```env
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

**Load the knowledge base (run once):**
```bash
python ingest.py
```

**Start the RAG server:**
```bash
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

---

### 2️⃣ Frontend Setup (`pathfinder/`)

```bash
cd pathfinder
npm install
```

**Configure environment** — create `.env.local`:
```env
OPENAI_API_KEY=your_openai_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAG_BACKEND_URL=http://localhost:8000
```

**Start the frontend:**
```bash
npm run dev
```

---

### 3️⃣ Run Both Together

```
Terminal 1:  cd pathfinder-rag && uvicorn main:app --reload --port 8000
Terminal 2:  cd pathfinder && npm run dev
```

Open: **http://localhost:3000**

---

## 🔌 API Endpoints (RAG Backend)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/rag/careers` | Career recommendations grounded in Uganda career data |
| `POST` | `/rag/roadmap` | Skill roadmap grounded in skills framework data |
| `POST` | `/rag/interview` | Interview questions grounded in Uganda Q&A data |
| `POST` | `/rag/jobs` | Job listings grounded in Uganda job market data |
| `POST` | `/rag/chat` | General chat across the full knowledge base |
| `POST` | `/rag/search` | Raw vector search — for debugging |
| `GET` | `/health` | Backend health check |

---

## 🧩 Why This Stack

We chose Next.js for the frontend because it unifies UI and lightweight API routes in a single TypeScript codebase, simplifying deployment. For the AI layer, we deliberately moved to **Python with FastAPI and LangChain** — the industry standard for RAG and machine learning workloads — rather than staying purely in JavaScript. This let us build a genuine retrieval pipeline against a **Supabase pgvector** database, ensuring Pathfinder's answers are grounded in real, citable Uganda data rather than relying solely on the AI's general knowledge.

---

## 📝 Project Brief Alignment

This project was built for the **Student Career Guidance AI** brief, fulfilling:
- ✅ Career path recommendation based on interests
- ✅ Skill and learning roadmap generation
- ✅ Interview question generation
- ✅ Structured outputs (JSON-based AI responses)
- ✅ RAG using a custom career-to-skill and jobs dataset
- ✅ Simple, polished user interface
- ✅ Personalization (interests, saved items, progress tracking)

---

## 📄 License

Built for academic purposes as part of an AI Engineering Capstone Project, Uganda 🇺🇬