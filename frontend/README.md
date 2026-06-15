# GradeOps Frontend

A minimal React + Vite frontend fully wired to the GradeOps FastAPI backend.

## Setup

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` (matches the CORS config in
`backend/api/main.py`).

By default the frontend talks to `http://127.0.0.1:8000`. To change this,
edit `.env`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## How auth works

- `POST /login` uses `OAuth2PasswordRequestForm`, so the frontend sends
  `application/x-www-form-urlencoded` data with a `username` field (even
  though it's an email) — see `src/api/auth.js`.
- The returned JWT is stored in `localStorage` and attached to every request
  via an axios interceptor (`src/api/client.js`).
- The JWT payload (`role`, `sub`/email) is decoded client-side to drive
  routing/navigation. The backend still independently enforces RBAC on every
  endpoint — the frontend role checks are just for UX (hiding pages/buttons),
  not security.
- A 401 response from any endpoint clears the stored token and redirects to
  `/login`.

## Pages and roles

| Route        | Roles                | Backend endpoints used |
|--------------|----------------------|--------------------------|
| `/login`     | public               | `POST /login` |
| `/register`  | admin                | `POST /register` |
| `/exams`     | instructor, ta       | `GET /exam`, `POST /exam` (instructor) |
| `/rubrics`   | instructor, ta       | `POST /rubric` (instructor), `GET /rubric/{id}` |
| `/upload`    | ta                   | `POST /upload-pdf/`, `POST /grade` |
| `/results`   | instructor, ta       | `GET /results`, `POST /feedback`, `GET /results/{id}/history`, `GET /results/export/csv` |
| `/analytics` | instructor, ta       | `GET /analytics/dashboard`, `GET /analytics/grade-distribution`, `GET /analytics/exam/{id}` |
| `/my-result` | student              | `GET /results/{roll_no}` |

## Known backend issues (not fixed in this frontend)

### 1. `/analytics/*` is currently NOT registered in `main.py`

Your latest backend zip does not import or include `analytics_router` in
`main.py`, even though `analytics.py` still exists with working code.

**To enable the Analytics page**, add these two lines to
`backend/api/main.py`:

```python
from backend.api.routes.analytics import router as analytics_router
# ...
app.include_router(analytics_router)
```

Until this is added, `/analytics` page will show 404 errors. If you decide
to leave analytics disabled, simply remove the `/analytics` link from
`src/components/Navbar.jsx` and the corresponding `<Route>` in `src/App.jsx`.

### 2. `/submissions` endpoints return 500 (Unknown PG numeric type: 3802)

This is a known SQLAlchemy + psycopg2 + Neon Postgres compatibility issue,
NOT a frontend issue. It happens because Neon's connection pooler can return
cached query plans/type OIDs (here, `jsonb`, OID 3802) that psycopg2's local
type cache doesn't recognize on a pooled connection.

**This frontend does not call any `/submissions` endpoints** — submission
tracking is optional/side-car functionality and is not part of the core
upload → grade → review flow used by this UI. You can safely ignore this for
now, or fix it later with one of:

- Add `?options=-c%20plan_cache_mode=force_custom_statement` to your
  `DATABASE_URL`, or
- Use `NullPool` in `create_engine(...)` (disables connection pooling -
  acceptable for small/dev workloads), or
- Switch from `psycopg2-binary` to `psycopg` (v3), which handles this better
  with Neon's pooler.

### 3. `/grade/bulk` is not used by this frontend

The backend supports `POST /grade/bulk` (multiple files at once), but the
current UI only grades one PDF at a time via `/grade` for simplicity. This
can be added later as an enhancement to `UploadGradePage.jsx`.

## Notes on the grading flow

- `/upload-pdf/` and `/grade` both independently convert the PDF to images
  and would each save a copy server-side. The "Upload" step on the
  Upload & Grade page is optional/informational (lets a TA sanity-check that
  a PDF is readable before committing to a full grading run).
- `all_answers` (used for plagiarism comparison) is currently sent as an
  empty array `[]` from the frontend. If you want cross-submission plagiarism
  checks, you'll need to collect other students' extracted texts and pass
  them in — this would require a backend change to expose extracted text
  independently of grading.
