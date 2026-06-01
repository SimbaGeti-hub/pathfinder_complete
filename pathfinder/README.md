# 🧭 Pathfinder — AI Career Coaching Platform

> Your AI-powered career compass. Built for students in Uganda. 🇺🇬

## ✨ Features

- 🎯 **Career Recommender** — AI matches your interests to real career paths
- 🗺️ **Skill Roadmap** — Step-by-step learning plan for any career
- 🎤 **Interview Prep** — Role-specific questions with tips & sample answers
- 📚 **Study Plan Generator** — Personalized weekly study schedules
- 🌙 **Dark / Light Mode** — Beautiful in both themes
- 🔐 **Google OAuth** — Sign in with Google in one click
- ⚡ **GPT-4o mini** — Fast, accurate AI responses

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Your `.env.local` file is already configured. Just ensure it contains:
```
OPENAI_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom CSS Variables |
| AI Engine | OpenAI GPT-4o mini |
| Auth | NextAuth.js + Google OAuth |
| Database | Supabase |
| Icons | Lucide React |
| Notifications | React Hot Toast |

## 📁 Project Structure

```
pathfinder/
├── app/
│   ├── api/ai/          # AI API route (OpenAI)
│   ├── components/      # All UI components
│   │   ├── modules/     # 4 AI modules
│   │   ├── Dashboard.tsx
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── SignUpPage.tsx
│   ├── context/         # Theme + Auth contexts
│   ├── globals.css      # Design system
│   └── page.tsx         # App router / entry
├── .env.local           # Environment variables
└── README.md
```

## 👥 Group 2 — Student Career Guidance AI

**Team Members:**
- Veronica Maria Mirembe
- Immaculate Kaitesi
- Geti Simba

**Project:** Makerere University AI Engineering Capstone, 2024
