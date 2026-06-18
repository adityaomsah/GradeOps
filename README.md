# GradeOps 🎓

**AI-Powered Human-in-the-Loop Exam Grading Pipeline**

[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://gradeops-backend-06ww.onrender.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://grade-jguwjxw0z-adityaomsah1.vercel.app)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%28Neon%29-336791?logo=postgresql)](https://neon.tech)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> IIT Guwahati Coding Club — Even Semester Projects 2026  

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://grade-ops-nu.vercel.app |
| **Backend API** | https://gradeops-backend-06ww.onrender.com |
| **API Docs (Swagger)** | https://gradeops-backend-06ww.onrender.com/docs |

---

## 📖 What is GradeOps?

GradeOps automates the evaluation of handwritten exam scripts using:
- **Vision-Language Models** (Qwen2-VL / Gemini Vision) for OCR extraction
- **Agentic LLM pipeline** (LangGraph + Gemini 2.0 Flash) for rubric-based grading
- **Hybrid plagiarism detection** (Jaccard + Cosine similarity)
- **Human-in-the-Loop review** where TAs approve or override every AI grade

The system dramatically reduces grading time while preserving academic fairness through mandatory human review.

---

## 🏗️ Architecture

```
PDF Upload (TA)
     ↓
OCR Extraction (Qwen2-VL / Gemini Vision)
     ↓
Plagiarism Check (Jaccard + Cosine via sentence-transformers)
     ↓ (if clean)
LangGraph Grading Pipeline (Gemini 2.0 Flash)
     ↓
Grade + Justification saved to PostgreSQL
     ↓
TA Review Dashboard (React)
     ↓
Approve / Override → GradeHistory audit trail
     ↓
Student views result
```

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (Python 3.11+) |
| Agent Orchestration | LangGraph |
| LLM | Gemini 2.0 Flash (`langchain-google-genai`) |
| Embeddings | `sentence-transformers` (all-MiniLM-L6-v2) |
| OCR (Local/GPU) | Qwen2-VL-2B-Instruct (Hugging Face) |
| OCR (Deployment) | Gemini Vision API |
| Database ORM | SQLAlchemy 2.0 |
| Database (Production) | Neon PostgreSQL (serverless) |
| Database (Local) | SQLite |
| Authentication | JWT (`python-jose`) + `passlib`/`bcrypt==4.0.1` |
| PDF Processing | `pdf2image` + poppler |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 3 (dark/light/system theme) |
| Routing | React Router v6 |
| HTTP | Axios with JWT interceptors |
| State | React Context API |

### Deployment
| Service | Platform |
|---------|---------|
| Backend | Render |
| Frontend | Vercel |
| Database | Neon (PostgreSQL serverless) |

---

## 📁 Project Structure

```
GradeOps/
├── backend/
│   ├── agent/
│   │   └── grader.py           # LangGraph pipeline + plagiarism detection
│   ├── api/
│   │   ├── main.py             # FastAPI app, CORS, lifespan
│   │   └── routes/
│   │       ├── auth.py         # JWT login/register, RBAC middleware
│   │       ├── exam.py         # Exam management
│   │       ├── rubrics.py      # Rubric upload + LLM parsing
│   │       ├── upload.py       # PDF upload + image conversion
│   │       ├── grade.py        # Single + bulk grading
│   │       ├── results.py      # Results + history + CSV export
│   │       ├── feedback.py     # TA approve/override
│   │       ├── submissions.py  # Submission tracking layer
│   │       └── analytics.py    # Dashboard + per-exam stats
│   ├── db/
│   │   ├── database.py         # SQLAlchemy engine + session
│   │   └── models.py           # User, Exam, Rubric, Grade, GradeHistory, Submission
│   └── ocr/
│       ├── pdf_to_images.py    # PDF → page images
│       └── vision_extractor.py # OCR (mock/Qwen2-VL/Gemini)
├── requirements.txt
└── README.md
```

---

## 🔑 API Endpoints

| Endpoint | Method | Roles | Purpose |
|----------|--------|-------|---------|
| `/login` | POST | All | Get JWT token |
| `/register` | POST | Admin | Create user accounts |
| `/exam` | POST/GET | Instructor/TA | Manage exams |
| `/rubric` | POST | Instructor | Upload + parse rubric PDF |
| `/rubric/{id}` | GET | Instructor, TA | Fetch rubric |
| `/upload-pdf/` | POST | TA | Upload answer script PDF |
| `/grade` | POST | TA | Grade single PDF |
| `/grade/bulk` | POST | TA | Grade multiple PDFs at once |
| `/results` | GET | Instructor, TA | All graded results |
| `/results/{roll_no}` | GET | All | Student result (own only for student) |
| `/results/{id}/history` | GET | Instructor, TA | Audit trail |
| `/results/export/csv` | GET | Instructor, TA | CSV download |
| `/feedback` | POST | Instructor, TA | Approve/override grade |
| `/submissions` | GET/POST | Instructor, TA | Submission tracking |
| `/analytics/dashboard` | GET | Instructor, TA | Global stats |
| `/analytics/exam/{id}` | GET | Instructor, TA | Per-exam analytics |

Full interactive docs: https://gradeops-backend-06ww.onrender.com/docs

---

## 👥 Role-Based Access Control

| Role | Capabilities |
|------|-------------|
| **Admin** | Register all user types |
| **Instructor** | Create exams & rubrics, view analytics, approve/override grades, export CSV |
| **TA** | Upload PDFs, trigger grading (single/bulk), review grades, approve/override |
| **Student** | View own graded result only |

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- poppler (for PDF processing)
  - Ubuntu: `sudo apt install poppler-utils`
  - macOS: `brew install poppler`
  - Windows: Download from https://github.com/oschwartz10612/poppler-windows

### Backend

```bash
# Clone the repo
git clone https://github.com/adityaomsah/GradeOps.git
cd GradeOps

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# Run the server
uvicorn backend.api.main:app --reload
```

Backend runs at: http://127.0.0.1:8000  
Swagger UI at: http://127.0.0.1:8000/docs

### Frontend

```bash
cd frontend
npm install
# Create .env with: VITE_API_BASE_URL=http://127.0.0.1:8000
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# Database (SQLite for local, PostgreSQL for production)
DATABASE_URL=sqlite:///./gradeops.db
# For production: postgresql://user:password@host/dbname

# JWT Secret (generate with: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your_secret_key_here

# Gemini API Key (get from https://aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key

# First admin auto-created on startup
ADMIN_EMAIL=admin@gradeops.com
ADMIN_PASSWORD=your_secure_password
```

---

## 🧪 Testing with CS101 Sample Exam

The `test_materials/` folder contains a complete CS101 End Semester exam for testing:

| File | Description |
|------|-------------|
| `CS101_Question_Paper.pdf` | Full 100-mark question paper |
| `CS101_Rubric.pdf` | Grading rubric (upload via `/rubric`) |
| `CS101_Answer_Arjun_Sharma_220103045.pdf` | Strong student script |
| `CS101_Answer_Priya_Patel_220103067.pdf` | Average student script |

**Testing workflow:**
1. Login as admin → register an instructor and a TA
2. Login as instructor → create exam (CS101, endsem, 100 marks) → upload rubric PDF → note the `rubric_id`
3. Login as TA → upload answer scripts to `/grade` with the `exam_id` and `rubric_id`
4. Login as TA/instructor → go to Results → approve or override the AI grades
5. Login as student → view result at `/my-result`

---

## 🐛 Known Issues & Limitations

1. **Qwen2-VL requires GPU** — the local OCR model needs CUDA. On CPU-only machines, the system uses a Gemini Vision API fallback automatically.

2. **Neon + psycopg2 jsonb type error** — occasionally, Neon's PgBouncer pooler causes `Unknown PG numeric type: 3802`. Workaround: append `?options=-c%20plan_cache_mode=force_custom_statement` to `DATABASE_URL`, or migrate to `psycopg` v3.

3. **`all_answers` for bulk plagiarism** — in bulk mode, the plagiarism check compares against a pre-provided list. For full cross-submission comparison, the list should include all students' extracted texts (a two-pass flow that's on the roadmap).

4. **Render cold starts** — the free Render tier spins down after inactivity. The first request after idle may take 30–60 seconds.

---

## 🔮 Future Roadmap

- [ ] Cloudinary/S3 for storing exam scan images (enables side-by-side TA review)
- [ ] Keyboard shortcuts (A to approve, O to override) in TA dashboard
- [ ] Async grading queue (Celery + Redis) for large batches without HTTP timeouts
- [ ] Email notifications when results are published
- [ ] Bulk PDF splitting by roll number (detect per-student boundaries in combined PDFs)
- [ ] Rubric versioning and template library
- [ ] LMS integration (Moodle webhook sync)
- [ ] Student dispute resolution portal
- [ ] Migration from psycopg2 to psycopg v3 for better Neon compatibility

---

## 👨‍💻 Team

**Aditya Om Sah & Mallhar Totey**

**Mentor:** Abhinav Rai

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ at IIT Guwahati Coding Club, Even Semester 2026*
