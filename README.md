# Embedded & IoT Engineer Portfolio

Futuristic full-stack portfolio and lead management system for an Embedded Systems and IoT Engineer.

## Stack

- React, Vite, Tailwind CSS, Three.js, GSAP, Lucide icons
- Supabase PostgreSQL, Auth, Storage, auto-generated API
- Optional Express backend for SMTP email notifications
- Vercel frontend deployment and Railway backend deployment

## Local Development

```bash
npm install
npm run dev
```

The app runs with local demo data if Supabase variables are missing. Admin login also works in demo mode from `/admin/login`.

Run the optional lead notification server:

```bash
npm run server
```

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create an admin user in Supabase Auth.
4. Copy `.env.example` to `.env` and set:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BACKEND_URL=
```

The public site can read skills, projects, and services and create leads. Authenticated admins can manage CRUD data.

## SMTP Email Notifications

Deploy `server/index.js` to Railway and set:

```bash
FRONTEND_ORIGIN=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_TO=
```

Then set `VITE_BACKEND_URL` in Vercel to your Railway URL.

## Deployment

- Frontend: import the repo in Vercel, set env vars, deploy.
- Backend: deploy the same repo on Railway with start command `npm run server`.
- Domain: connect your `.com` or `.dev` in Vercel DNS, enable HTTPS, and update `FRONTEND_ORIGIN` on Railway.
