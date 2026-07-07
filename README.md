# Midan

Turn meeting notes into structured action items, grouped by person, with due dates, priority, and status.

## Features

| Feature | Status |
|---------|--------|
| Paste meeting notes → get extracted action items | MVP |
| Grouped by assignee with priority, status, confidence | MVP |
| Chrome extension for Google Meet transcript capture | Coming Soon |
| Real-time transcription | Coming Soon |

## Tech Stack

- **Next.js 14+** (App Router)
- **shadcn/ui** + 21st.dev blocks
- **Clerk** authentication
- **Supabase** (database + real-time)
- **Groq API** (extraction engine)
- **Chrome Extension** (Manifest V3)
- **Framer Motion** (animations)

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your keys
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

| Directory | Description |
|-----------|-------------|
| `/prototype` | Working extraction engine (reference) |
| `/web` | Next.js web application |
| `/extension` | Chrome extension |
| `/supabase` | Database migrations |

## Git Workflow

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `pre-production` | Staging / QA |
| `features/*` | Feature branches |
| `test/*` | Experimental |
| `unstable` | Daily WIP |

## License

MIT
