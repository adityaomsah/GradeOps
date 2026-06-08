# rubrics.py endpoint
# Goal: To input the rubrics pdf uploaded by prof and output rubric_id and JSON rubric

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import shutil
import json
import os

from backend.ocr.pdf_to_images import pdf_to_image
from backend.ocr.vision_extractor import text_from_image
from backend.api.routes.auth import get_current_user
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Rubric

load_dotenv()

router = APIRouter()

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=os.getenv("GEMINI_API_KEY"))


class RubricCriteria(BaseModel):
    condition: str
    marks: int

class RubricResponse(BaseModel):
    rubric_id: int
    question: str
    max_marks: int
    criteria: List[RubricCriteria]



@router.post("/rubric", response_model=RubricResponse)
async def upload_rubric(
    file: UploadFile = File(...), 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    
    # RBAC
    if current_user["role"] not in {"instructor"}:
        raise HTTPException(status_code=403, detail="Access denied")

    # 1. Save PDF
    UPLOAD_FOLDER = "backend/ocr/uploads/rubric"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    pdf_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Convert PDF to images
    image_paths = pdf_to_image(
        pdf_path=pdf_path,
        output_save_folder="backend/ocr/images/rubric",
        pdf_name=file.filename.split(".")[0]
    )

    # 3. Extract text from each image
    extracted_text = ""
    for image_path in image_paths:
        extracted_text += text_from_image(image_path)["raw_text"] + "\n"

    # 4. Ask LLM to parse rubric into structured JSON
    prompt = f"""
    You are a rubric parser.
    Extract the grading rubric from this text and return it as JSON:
    {{
        "question": "...",
        "max_marks": 10,
        "criteria": [
            {{"condition": "mentions force and mass", "marks": 3}},
            {{"condition": "gives formula F=ma", "marks": 4}},
            {{"condition": "gives real life example", "marks": 3}}
        ]
    }}

    Rubric text: {extracted_text}
    """
    response = llm.invoke(prompt)
    
    # 5. Parse JSON from response
    raw = response.content.strip()    
    raw = raw.replace("```json", "").replace("```", "").strip() # remove ```json and ``` if present
    rubric_data = json.loads(raw)

    # 6. Generate unique rubric_id and store to database
    new_rubric = Rubric(
        question=rubric_data["question"],
        max_marks=rubric_data["max_marks"],
        criteria=rubric_data["criteria"]
    )
    db.add(new_rubric)
    db.commit()
    db.refresh(new_rubric)

    return RubricResponse(
        rubric_id=new_rubric.id,
        question=new_rubric.question,
        max_marks=new_rubric.max_marks,
        criteria=new_rubric.criteria
    )                 

@router.get("/rubric/{rubric_id}")
def get_rubric(
    rubric_id: int, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # RBAC
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")

    return {
        "rubric_id": rubric.id,
        "question": rubric.question,
        "max_marks": rubric.max_marks,
        "criteria": rubric.criteria
    }