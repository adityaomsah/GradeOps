# GradeOps 

> A Human-in-the-Loop (HITL) AI grading pipeline that uses Vision-Language Models and Agentic LLMs to evaluate handwritten exam scans against structured rubrics — with an advanced TA review dashboard for final approval.

Built as part of the **IIT Guwahati Coding Club Even Semester Projects 2026**.

---

## 🌟 Key Features

- **Drag & Drop PDF Uploads** — Instructors can easily upload scanned exams and define JSON rubrics via an interactive dropzone.
- **AI Grading Pipeline** — VLM extracts handwritten answers; LangGraph agents (Gemini 2.0 Flash) award partial credit with detailed justifications.
- **Advanced Plagiarism Detection** — Leverages NLP sentence-transformers (Cosine & Jaccard similarity) to flag structurally similar answers and visualize cheating rings.
- **Interactive TA Review Dashboard** — A two-column layout featuring an interactive `react-pdf` viewer side-by-side with the AI's grade and audit history, enabling rapid approve/override actions.
- **Analytics Dashboard** — Rich data visualization using `recharts` to display class grade distributions and plagiarism statistics dynamically.
- **Global Theme & Notifications** — Full Dark/Light/System theme support and non-blocking toast notifications (`react-hot-toast`) for a seamless UX.
- **Role-Based Access Control** — Secure JWT authentication for Instructors and Teaching Assistants.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite), Tailwind CSS |
| **Backend API** | FastAPI, Python |
| **Database** | Neon PostgreSQL, SQLAlchemy ORM |
| **Grading Agent** | LangChain, LangGraph, Gemini 2.0 Flash (`langchain-google-genai`) |
| **OCR / Vision** | Qwen2-VL-2B-Instruct |
| **Plagiarism Engine** | `sentence-transformers` (all-MiniLM-L6-v2) |
| **Auth** | JWT (`python-jose`), `passlib` (bcrypt) |
| **UI Components** | `react-pdf`, `recharts`, `react-dropzone`, `react-hot-toast`, Heroicons |

---

## 📂 Project Structure

```
GradeOps/
├── backend/
│   ├── ocr/          # VLM-based handwriting extraction workflows
│   ├── agent/        # LangGraph grading agent and Gemini logic
│   ├── api/          # FastAPI routes and static file mounting
│   └── db/           # SQLAlchemy Database models
├── frontend/
│   ├── src/          # React components and Tailwind styling
│   └── scripts/      # Build and theme utility scripts
├── docs/             # Rubric schema examples, roadmap, and notes
├── tests/
├── uploads/          # Statically mounted directory for active PDF uploads
├── .gitignore
├── README.md
└── requirements.txt
```

---

## 🚀 Deployment

- **Backend:** Configured via `Procfile` for one-click deployment on **Railway**.
- **Frontend:** Configured via `vercel.json` for seamless routing and deployment on **Vercel**.

---

## 👥 Team

**Aditya Om Sah** & **Mallhar Totey**

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
