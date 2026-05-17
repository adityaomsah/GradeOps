# GradeOps 

> A Human-in-the-Loop (HITL) AI grading pipeline that uses Vision-Language Models and Agentic LLMs to evaluate handwritten exam scans against structured rubrics — with a fast TA review dashboard for final approval.

Built as part of the **IIT Guwahati Coding Club Even Semester Projects 2026**.

---

## Features

-  **Bulk PDF Upload** — Professors upload scanned exams and define JSON rubrics
-  **AI Grading Pipeline** — VLM extracts handwritten answers; LangGraph agent awards partial credit with justifications
-  **Plagiarism Detection** — Flags structurally similar answers across submissions
-  **TA Review Dashboard** — Side-by-side view of student answer and AI grade with keyboard shortcuts for rapid approve/override
-  **Role-Based Access Control** — Separate views for Instructors and Teaching Assistants

---

## Tech Stack

| Layer | Technology |
|---|---|
| OCR / Vision | Qwen-VL / Nougat (HuggingFace) |
| Grading Agent | LangChain + LangGraph |
| Backend API | FastAPI |
| Database | PostgreSQL / MongoDB |
| Frontend | React.js |
| Auth | JWT |
| Storage | Cloudinary / AWS S3 |

---

## Project Structure

```
GradeOps/
├── backend/
│   ├── ocr/          # VLM-based handwriting extraction
│   ├── agent/        # LangGraph grading agent
│   ├── api/          # FastAPI routes
│   └── db/           # Database models
├── frontend/
│   └── src/          # React components
├── docs/             # Rubric schema examples, notes
├── tests/
├── .gitignore
├── README.md
└── requirements.txt
```

---

## Team

Aditya Om Sah, Mallhar Totey

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
