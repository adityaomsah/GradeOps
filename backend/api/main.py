from fastapi import FastAPI
from backend.api.routes import router

app = FastAPI(title="GradeOps API")

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "GradeOps backend running"}