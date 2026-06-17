from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes.upload import router as upload_router
from backend.api.routes.grade import router as grade_router
from backend.api.routes.rubrics import router as rubrics_router
from backend.api.routes.results import router as results_router
from backend.api.routes.feedback import router as feedback_router
from backend.api.routes.auth import router as auth_router
from backend.api.routes.exam import router as exam_router
from backend.api.routes.submissions import router as submissions_router
from backend.api.routes.analytics import router as analytics_router

from backend.db.database import engine, get_db
from backend.db import models
import os
from backend.db.models import User
from backend.api.routes.auth import hash_password
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # runs on startup
    models.BaseClass.metadata.create_all(bind=engine)
    db = next(get_db())
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    if admin_email:
        existing = db.query(User).filter(User.email == admin_email).first()
        if not existing:
            admin = User(
                email=admin_email,
                password_hash=hash_password(admin_password),
                role="admin"
            )
            db.add(admin)
            db.commit()
            print(f"✅ First admin created: {admin_email}")
    db.close()
    
    yield 
    
app = FastAPI(title="GradeOps API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from fastapi.staticfiles import StaticFiles

app.include_router(upload_router)
app.include_router(grade_router)
app.include_router(rubrics_router)
app.include_router(results_router)
app.include_router(feedback_router)
app.include_router(auth_router)
app.include_router(exam_router)
app.include_router(submissions_router)
app.include_router(analytics_router)

# Mount uploads directory to serve PDFs
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def home():
    return {"message": "GradeOps Backend Running"}