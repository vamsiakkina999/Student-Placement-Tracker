# Student Placement Tracker

A full-stack app for managing student placements, jobs, applications, and notifications.

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React + Vite

## Prerequisites
- Node.js 18+ (recommended)
- npm 9+
- A MongoDB database (Atlas or local)

## Setup
1. Install dependencies for both apps:

```bash
npm install
npm run install-all
```

2. Create the backend environment file at `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
ADMIN_SECRET=your_admin_secret
EMAIL_DISABLED=false
PORT=5000
```

3. Create the frontend environment file at `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run (Development)
From the project root, start both backend and frontend together:

```bash
npm run dev
```

### Default URLs
- Backend API: `http://localhost:5000`
- Frontend: Vite will print the local URL (typically `http://localhost:5173`)

## Useful Scripts
- `npm run dev`: Start backend + frontend concurrently
- `npm run install-all`: Install dependencies for both apps
- `npm --prefix backend run start`: Run backend only
- `npm --prefix frontend run dev`: Run frontend only

## Notes
- Make sure `backend/.env` and `frontend/.env` exist before running.
- Secrets should never be committed to Git; `.gitignore` already excludes `.env` files.

