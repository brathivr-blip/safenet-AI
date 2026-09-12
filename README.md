# SafeNet AI — Intelligent Emergency Response & Community Safety Platform

> **Decision-support prototype.** In a real emergency, contact the appropriate official
> emergency service. SafeNet AI does not replace professional emergency dispatch or
> medical judgment.

## Status

🚧 Module 1 of the roadmap complete: project scaffold (frontend, backend, docker-compose).
Database models, auth, AI triage/routing engines, and dashboards are being built module by
module — see the architecture doc in the project conversation for the full roadmap.

## Quick start (local, no Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
Visit http://localhost:8000/api/health — should return `{"status": "ok", ...}`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173.

## Quick start (Docker)

```bash
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8000/api/health
- Postgres: localhost:5432 (user/pass/db: `safenet`)

## Project structure

```
safenet-ai/
├── frontend/    React + Vite + TypeScript + Tailwind
├── backend/     FastAPI + SQLAlchemy + PostgreSQL
├── ml/          Standalone datasets/training/prediction scripts for the risk & triage models
└── docker-compose.yml
```

## Demo Mode

The platform is designed to run fully offline with seeded data (sample emergencies,
ambulances, hospitals, road risk zones, alerts). A visible "DEMO MODE" indicator is shown
in the UI whenever `DEMO_MODE=true` in the backend `.env`.
