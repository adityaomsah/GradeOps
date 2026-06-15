# GradeOps Frontend

AI-powered automated grading platform frontend built with React 19, Vite, TypeScript, Tailwind CSS, and shadcn-style UI primitives.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- React Router DOM
- TanStack Query
- Axios service layer
- React Hook Form + Zod
- Framer Motion
- Recharts
- Lucide React

## Getting Started

```bash
cd C:\Users\SUNSA\gradeops
npm install
npm run dev
```

Ensure the FastAPI backend is running at `http://127.0.0.1:8000` before using authenticated features.

Configure the API base URL in `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Scripts

- `npm run dev` — start development server (port 5173)
- `npm run build` — production build
- `npm run preview` — preview production build

## Architecture

Feature-based structure under `src/features/` with shared UI in `src/components/`, API services in `src/services/`, and RBAC-protected routes in `src/routes/`.

## API Integration

All HTTP calls go through typed services (`authService`, `examService`, etc.). JWT refresh is handled in `src/services/api.ts`.

If your backend paths differ from the assumed REST routes, update the corresponding service files to match your OpenAPI spec at `http://127.0.0.1:8000/docs`.

## Roles

- **Instructor** — full access
- **Teaching Assistant** — uploads + reviews
- **Student** — results portal

## Keyboard Shortcuts

- `Ctrl+K` — command palette
- `G` then `D` — dashboard
- `G` then `E` — exams