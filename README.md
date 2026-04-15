# Expense Scanner

A web application that scans receipts using AI vision models and automatically logs expenses into a structured database — no manual entry required.

---

## Features

- **Receipt scanning** — Upload a photo of any receipt; the app extracts merchant, amount, date, and category automatically
- **Dual AI backend** — Uses Ollama (local) as the primary model and Gemini 1.5 Flash (cloud) as an automatic fallback
- **Offline-capable** — Fully functional without internet when Ollama is running locally
- **Expense dashboard** — View, edit, and delete expense records with category breakdowns
- **Persistent storage** — All records saved to Supabase with in-memory fallback if database is unavailable

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Express.js (Node.js) |
| AI — Local | Ollama (`qwen3-vl:8b`) |
| AI — Cloud | Gemini 1.5 Flash API |
| Database | Supabase (PostgreSQL) |

---

## Architecture

### AI Fallback Pipeline

The backend proxies all receipt scanning requests through a single `/api/ollama/generate` endpoint. The routing logic is:

1. **Try Ollama** — sends the request to the local Ollama instance with a 3-second timeout
2. **Fallback to Gemini** — if Ollama is unavailable, times out, or returns a non-2xx response, the request is automatically rerouted to Gemini 1.5 Flash
3. **Both fail** — returns a `502` error with a descriptive message

The frontend is unaware of which model served the response — both return the same JSON shape.

```
Browser → Express (/api/ollama/generate)
              │
              ├─ Ollama (localhost:11434) ──→ success: return response
              │         ↓ timeout / error
              └─ Gemini 1.5 Flash API ──────→ success: return response
```

### Database Fallback

If Supabase credentials are not configured, the backend falls back to an in-memory store. This allows the app to run end-to-end in development without a database connection.

---

## Project Structure

```
expense-tracker/
├── server/
│   └── index.ts              # Express backend, AI proxy, Supabase API routes
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx     # Main expense overview
│   │   ├── History.tsx       # Full expense history
│   │   ├── ScanningView.tsx  # Receipt upload and scanning UI
│   │   ├── ReviewExpense.tsx # Review and confirm extracted data
│   │   ├── Modals.tsx        # Edit / delete modals
│   │   ├── Navbar.tsx
│   │   ├── Notifications.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   └── ollamaService.ts  # Receipt parsing, image compression, date normalization
│   ├── hooks/
│   │   └── useExpenses.ts    # Expense state management
│   ├── types.ts
│   ├── constants.ts
│   └── App.tsx
├── supabase/
│   └── int.sql               # Database schema
├── .env.example
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Ollama](https://ollama.ai) installed locally with the `qwen3-vl:8b` model pulled
- A [Supabase](https://supabase.com) project (optional — app runs without it)
- A [Gemini API key](https://aistudio.google.com) (optional — used as fallback when Ollama is unavailable)

### Installation

```bash
git clone https://github.com/your-username/expense-scanner.git
cd expense-scanner
npm install
```

### Pull the Ollama model

```bash
ollama pull qwen3-vl:8b
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the schema against your Supabase project via the SQL editor in the Supabase dashboard:

```
supabase/int.sql
```

### Run the App

```bash
npm run dev
```

This starts both the frontend (port 3000) and backend (port 3001) concurrently.

---

## Status

> Functional and actively being polished. Core scanning and expense management features are complete.

---

## Author

**Neo Li** — Computer Science Student, Dalhousie University  
[neofirst778@gmail.com](mailto:neofirst778@gmail.com)
