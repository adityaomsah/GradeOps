from fastapi import FastAPI
from backend.api.routes.upload import router as upload_router

app = FastAPI(title="GradeOps API")

app.include_router(upload_router)

@app.get("/")
def home():
    return {"message": "GradeOps Backend Running"}