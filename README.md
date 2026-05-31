# Modern Dark Data-Science Portfolio

Two pieces:

```
frontend/   # Static site (HTML + Bootstrap 5 + vanilla JS)  -> deploy on Vercel
backend/    # FastAPI app (contact + projects API)           -> deploy on Render
```

## 1. Personalise

Open `frontend/index.html` and replace the placeholders marked with `EDIT:` —
your name, role, bio, social links, project list, etc. Replace
`frontend/images/profile-photo.jpg` with your own photo.

## 2. Run locally

Frontend:

```bash
cd frontend
python -m http.server 5500
# open http://localhost:5500
```

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# http://localhost:8000  /  http://localhost:8000/docs
```

## 3. Deploy

### Frontend → Vercel
1. Push this repo to GitHub.
2. Import the project in Vercel and set **Root Directory** to `frontend`.
3. Framework preset: **Other**. Build command: *(none)*. Output dir: `.`.
4. After your backend is live, edit `frontend/js/main.js` and set
   `API_BASE` to your Render URL — or define `window.API_BASE` in `index.html`.

### Backend → Render
1. Render → New → Web Service → connect the same repo.
2. Render auto-detects `backend/render.yaml`. Make sure to update
   `ALLOWED_ORIGINS` to your Vercel URL.
3. (Optional) Add `SMTP_*` env vars to receive contact-form emails.

That's it — the contact form on the frontend POSTs to `/api/contact` on the
backend, and the projects gallery can pull from `/api/projects`.
