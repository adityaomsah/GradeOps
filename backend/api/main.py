from fastapi import FastAPI
from backend.api.routes.upload import router as upload_router
from backend.api.routes.grade import router as grade_router
from backend.api.routes.rubrics import router as rubrics_router

app = FastAPI(title="GradeOps API")

app.include_router(upload_router)
app.include_router(grade_router)
app.include_router(rubrics_router)

@app.get("/")
def home():
    return {"message": "GradeOps Backend Running"}