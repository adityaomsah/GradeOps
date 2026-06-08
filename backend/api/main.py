from fastapi import FastAPI
from backend.api.routes.upload import router as upload_router
from backend.api.routes.grade import router as grade_router
from backend.api.routes.rubrics import router as rubrics_router
from backend.api.routes.results import router as results_router
from backend.api.routes.feedback import router as feedback_router
from backend.api.routes.auth import router as auth_router

from backend.db.database import engine
from backend.db import models

models.BaseClass.metadata.create_all(bind=engine)

app = FastAPI(title="GradeOps API")

app.include_router(upload_router)
app.include_router(grade_router)
app.include_router(rubrics_router)
app.include_router(results_router)
app.include_router(feedback_router)
app.include_router(auth_router)


@app.get("/")
def home():
    return {"message": "GradeOps Backend Running"}