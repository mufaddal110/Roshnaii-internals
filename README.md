# Roshnaii

A poetry platform for sharing and discovering Urdu poetry.

## Project Structure

```
roshnaii/
├── frontend/          # React frontend application
│   ├── src/          # React components, pages, store
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
│
└── backend/          # Node.js/Express API
    ├── server/       # Server code
    │   ├── routes/   # API routes
    │   ├── models/   # MongoDB models
    │   ├── middleware/ # Express middleware
    │   └── config/   # Configuration
    └── package.json  # Backend dependencies
```

## Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Development

- Backend runs on `http://localhost:5000` (default)
- Frontend runs on `http://localhost:5173` (Vite default)

## Deployment

- Frontend: Deploy to Vercel (configured with `vercel.json`)
- Backend: Deploy to your preferred Node.js hosting

See individual README files in `frontend/` and `backend/` for more details.
