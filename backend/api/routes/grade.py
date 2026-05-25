from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import List
import shutil
import json
import os

from backend.ocr.pdf_to_images import pdf_to_image
from backend.ocr.vision_extractor import text_from_image
from backend.agent.grader import grading_pipeline, GradeState

router = APIRouter()

class GradeRequest(BaseModel):
    student_name: str
    student_roll_no: int
    rubric: str
    all_answers: List[str] 

class GradeResponse(BaseModel):
    score: int
    justification: str
    plagiarism_score: float  
    plagiarism_flag: bool


@router.post("/grade", response_model=GradeResponse)
async def grade_student(                           #FastAPI can't receive a file and a JSON body at the same time. 
    file: UploadFile = File(...),
    student_name: str = Form(...),                 #So we pass each field separately as Form fields
    student_roll_no: int = Form(...),
    rubric: str = Form(...),
    all_answers: str = Form(...)
):
    # 1. Save PDF
    UPLOAD_FOLDER = "backend/ocr/uploads"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    pdf_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Convert PDF to images
    image_paths = pdf_to_image(
        pdf_path=pdf_path,
        output_save_folder="backend/ocr/images",
        pdf_name=file.filename.split(".")[0]
    )

    # 3. Extract text from each image
    extracted_text = ""
    for image_path in image_paths:
        extracted_text += text_from_image(image_path) + "\n"

    # 4. Build state and run pipeline
    state: GradeState = {
        "student_name": student_name,
        "student_roll_no": student_roll_no,
        "answer_script": extracted_text,
        "rubric": rubric,
        "all_answers": json.loads(all_answers),
        "score": 0,
        "justification": "",
        "plagiarism_score": 0.0,
        "plagiarism_flag": False
    }

    result = grading_pipeline.invoke(state)

    # 5. Return response
    return GradeResponse(
        score=result["score"],
        justification=result["justification"],
        plagiarism_score=result["plagiarism_score"],
        plagiarism_flag=result["plagiarism_flag"]
    )