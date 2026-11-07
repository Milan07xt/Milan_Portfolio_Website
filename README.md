Contact form server and portfolio admin

This repository contains a static portfolio site and a small Node/Express server (server.js) that accepts contact form submissions and appends them to `contact.csv`.

Quick start

1. Install Node.js (if you don't have it): https://nodejs.org/
2. Open a terminal in the project folder:

```powershell
cd "c:\Users\ABC\Downloads\Milan_Portfolio_Website"
npm install
npm run start:local
```

3. Serve the site files in a browser. Easiest options:
- Use VS Code Live Server extension to serve the site (recommended). Open `index.html` via Live Server (e.g., http://127.0.0.1:5500).
- Or open `index.html` directly — the form uses fetch to http://localhost:3000 so the server must be running. If you open the file via `file://` origin some browsers may restrict requests; use Live Server if you see CORS/network errors.

4. Fill and submit the contact form. Submissions are appended to `contact.csv`.

Notes
- The server allows any origin (CORS '*') so it can receive requests from the page served from Live Server or other local hosts.
- `contact.csv` will be created if missing and will contain header row: Name,Mail,Number,Subject,Message

If you want I can also add a simple confirmation UI or save a timestamp column — tell me which option you prefer.

## Hosted admin editor

The portfolio includes a protected editor for the profile, featured projects, images, and site font. It uses Supabase Postgres for portfolio content and a public Supabase Storage bucket for images.

To enable editing on Vercel:

1. Create a Supabase project and run [`supabase-setup.sql`](./supabase-setup.sql) in its SQL Editor.
2. Add these environment variables to Vercel and to `.env` for local use:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only; never expose this in browser code.
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD` — use a unique password with at least 12 characters.
   - `ADMIN_SESSION_SECRET` — use a random secret with at least 32 characters.
3. Redeploy the Vercel site after setting its variables.

Generate a session secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The admin API fails closed when credentials are not configured. Admin sessions expire after eight hours. Failed sign-ins show contact options; portfolio content and image upload APIs require a valid signed admin token. Uploaded image files are limited to 3 MB.

The default profile and project details are stored in `portfolio-content.json`. Hosted edits are stored in Supabase; the checked-in JSON remains the local/default content. Run `npm run start:local` and open `http://localhost:3000` to use the local API and editor.
