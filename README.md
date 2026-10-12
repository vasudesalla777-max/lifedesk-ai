# LifeDesk AI — All-In-One Personal Life Operating System & AI Productivity Suite

[![CI/CD Deployment](https://github.com/vasudesalla/lifedesk-ai/actions/workflows/deploy.yml/badge.svg)](https://github.com/vasudesalla/lifedesk-ai/actions/workflows/deploy.yml)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-Thinking_Pro-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)

**LifeDesk AI** is an enterprise-grade personal life operating system and productivity web application. It integrates task management, smart notes, expense analytics, and document intelligence with a **grounded, database-aware AI copilot** powered by the **Google Gemini API** and **Supabase PostgreSQL** with Row Level Security (RLS).

---

## 🌟 Key Features

### 1. 🎯 Smart Task Management
- Full lifecycle task tracking: Priorities (`High`, `Medium`, `Low`), Status (`Pending`, `In Progress`, `Completed`), and due dates.
- Quick status toggles, calendar groupings, and instant search.
- **1-Click AI Prioritization**: Uses Eisenhower Matrix logic and deadline proximity to recommend an optimal daily focus blueprint.

### 2. 📝 AI-Powered Knowledge Notes
- Capture rich notes, study outlines, and meeting minutes.
- Instant full-text search across titles, content, and tags.
- **1-Click AI Summarization**: Generates concise, executive-level summaries in 2-3 sentences.

### 3. 💳 Expense Insights & Financial Analytics
- Track expenses across categories (`Food`, `Rent`, `Shopping`, `Travel`, `Bills`, `Other`).
- Live metrics: Total outflow, monthly velocity, top category percentage, and average transaction size.
- **AI Financial Spending Advisor**: Delivers personalized spending analysis and actionable cash-flow optimization tips.

### 4. 📄 Document Intelligence & Q&A
- Drag-and-drop or file upload for PDFs, text files, markdown, and contracts.
- In-browser document text inspection and metadata viewer.
- **AI Document Q&A**: Ask direct questions about terms, clauses, and dates, receiving cited answers directly from the document content.

### 5. 🤖 Database-Aware AI Assistant (Primary Copilot)
- **Anti-Fabrication Mathematical Grounding**: Answers queries using real rows from your database (never hallucinating fake metrics or ghost tasks).
- **Thinking Mode**: Deep reasoning capabilities powered by Gemini thinking models.
- **Natural Language Intent Recognition**:
  - *"What tasks do I have pending today?"*
  - *"How much did I spend on Food this month?"*
  - *"Summarize my recent notes."*
  - *"What should I focus on right now?"*
  - *"Who developed LifeDesk AI?"*

---

## 👨‍💻 Creator & Founder Attribution

LifeDesk AI was conceived, designed, and developed by:

**Vasu Desalla**  
*Founder & Lead Full-Stack Developer*  
*B.Tech in Computer Science Engineering*  
*Specialization: React & TypeScript, Supabase PostgreSQL, Row Level Security (RLS), AI Grounding & LLM Engineering.*

- 🌐 **Portfolio**: [vasudesalla.com](https://vasudesalla.com)
- 🐙 **GitHub**: [github.com/vasudesalla](https://github.com/vasudesalla)
- 💼 **LinkedIn**: [linkedin.com/in/vasudesalla](https://linkedin.com/in/vasudesalla)
- 📧 **Email**: [vasudesalla777@gmail.com](mailto:vasudesalla777@gmail.com)

---

## 🏗️ Architecture & Security Model

```
┌────────────────────────────────────────────────────────┐
│               React 19 + Vite Frontend                 │
│  (Tailwind CSS v4 • Lucide Icons • Recharts Analytics) │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│            Unified Node.js Express Server              │
│       (API Routing • Fallback Resiliency Engine)       │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│    Supabase PostgreSQL    │ │     Google Gemini AI     │
│   (Row Level Security)    │ │   (2.5 Flash / 3.1 Pro)  │
└───────────────────────────┘ └──────────────────────────┘
```

### 🔒 Cryptographic Multi-Tenant Isolation:
1. **Cloud PostgreSQL RLS**: Every query against Supabase validates `auth.uid() = user_id`. No user can read, insert, update, or delete data belonging to another user.
2. **Local Session Isolation**: Client offline storage scopes all keys to `lifedesk_*_${userId}`.
3. **Zero Secret Leakage**: Private API keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are executed strictly on the server-side proxy; no private keys are exposed to client bundles.

---

## 🚀 Quickstart & Local Development

### 1. Clone the repository:
```bash
git clone https://github.com/vasudesalla/lifedesk-ai.git
cd lifedesk-ai
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Setup environment variables:
```bash
cp .env.example .env
```
Update `.env` with your API keys (see [`.env.example`](./.env.example)).

### 4. Run database migration:
Execute the schema in [`supabase/schema.sql`](./supabase/schema.sql) in your Supabase SQL editor. Follow the step-by-step guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).

### 5. Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment: GitHub → Automatic Live Website

### 1. Push Code to GitHub
```bash
git add .
git commit -m "feat: prepare production release"
git push origin main
```

### 2. Configure GitHub Secrets
In your GitHub repository:
- Go to **Settings** > **Secrets and variables** > **Actions**
- Add:
  - `GEMINI_API_KEY`: Your Google Gemini API Key
  - `VITE_SUPABASE_URL`: Your Supabase Project URL
  - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anonymous Public Key

### 3. Automatic Deployment
The included `.github/workflows/deploy.yml` pipeline will automatically:
1. Lint TypeScript and verify syntax.
2. Build the production bundle.
3. Deploy directly to **GitHub Pages** or trigger your cloud hosting webhook (e.g. **Render**, **Railway**, or **Vercel**).

For in-depth deployment instructions across Vercel, Netlify, Render, Docker, and Google Cloud Run, see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## 📂 Project Structure

```
lifedesk-ai/
├── .github/workflows/deploy.yml # CI/CD automated deployment workflow
├── backend/                     # Optional Python FastAPI microservice
├── public/                      # Static assets & favicon
├── server/
│   └── aiAssistantEngine.ts     # Anti-fabrication context & intent engine
├── src/
│   ├── components/              # Modular UI components (Tasks, Notes, etc.)
│   │   └── chat/
│   │       └── CreatorProfileCard.tsx # Verified Founder Profile card
│   ├── context/                 # AuthContext & DataContext providers
│   ├── pages/                   # Main view routes (Dashboard, Assistant, etc.)
│   ├── lib/                     # Supabase client & utilities
│   ├── types.ts                 # Central TypeScript interfaces
│   ├── App.tsx                  # Root layout & routing
│   └── main.tsx                 # React DOM mount point
├── supabase/
│   └── schema.sql               # PostgreSQL tables & RLS security policies
├── .env.example                 # Production environment variable template
├── DEPLOYMENT.md                # Comprehensive deployment handbook
├── SUPABASE_SETUP.md            # Supabase database & auth guide
├── Dockerfile                   # Production container build
├── render.yaml                  # Render Infrastructure-as-Code
├── vercel.json                  # Vercel deployment configuration
├── netlify.toml                 # Netlify deployment configuration
├── package.json                 # Dependencies and build scripts
└── server.ts                    # Express server with Vite middleware
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
