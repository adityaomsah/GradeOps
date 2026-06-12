# grade.py endpoint
# Goal: Accept exam PDF + rubric_id, extract text via OCR, run through grading pipeline
# Returns: score, justification, plagiarism_score, plagiarism_flag


from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
import shutil
import json
import os

from backend.ocr.pdf_to_images import pdf_to_image
from backend.ocr.vision_extractor import text_from_image
from backend.agent.grader import grading_pipeline, GradeState
from backend.api.routes.auth import get_current_user

from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Rubric, Grade

router = APIRouter()

class GradeResponse(BaseModel):
    score: float
    justification: str
    plagiarism_score: float  
    plagiarism_flag: bool


@router.post("/grade", response_model=GradeResponse)
async def grade_student(                           #FastAPI can't receive a file and a JSON body at the same time. 
    file: UploadFile = File(...),            
    rubric_id: int = Form(...),                    #So we pass each field separately as Form fields
    all_answers: str = Form(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RBAC
    if current_user["role"] != "ta":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # 1. Save PDF
    UPLOAD_FOLDER = "backend/ocr/uploads"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    pdf_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Fetch rubric from database
    rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    rubric_text = json.dumps({
        "question": rubric.question,
        "max_marks": rubric.max_marks,
        "criteria": rubric.criteria
    })

    # 3. Convert PDF to images
    image_paths = pdf_to_image(
        pdf_path=pdf_path,
        output_save_folder="backend/ocr/images",
        pdf_name=file.filename.split(".")[0]
    )

    # 4. Extract text and student info from first page
    extracted_text = ""
    student_name = ""
    student_roll_no = 0

    for i, image_path in enumerate(image_paths):
        result = text_from_image(image_path)
        extracted_text += result["raw_text"] + "\n"
        if i == 0:  # get student info from first page only
            student_name = result["name"] or ""
            student_roll_no = int(result["roll_no"]) if result["roll_no"] else 0

    # 5. Build state and run pipeline
    state: GradeState = {
        "student_name": student_name,
        "student_roll_no": student_roll_no,
        "answer_script": extracted_text,
        "rubric": rubric_text,
        "all_answers": json.loads(all_answers),
        "score": 0,
        "justification": "",
        "plagiarism_score": 0.0,
        "plagiarism_flag": False
    }

    result = grading_pipeline.invoke(state)
    # 6. Save result to database
    new_grade = Grade(
        rubric_id=rubric_id,
        student_name=student_name,
        student_roll_no=student_roll_no,
        score=result["score"],
        justification=result["justification"],
        plagiarism_score=result["plagiarism_score"],
        plagiarism_flag=result["plagiarism_flag"],
        uploaded_pdf_filename=file.filename,
        ta_reviewed=False,
        ta_override_score=None
)
    db.add(new_grade)
    db.commit()
    db.refresh(new_grade)

    return GradeResponse(
        score=result["score"],
        justification=result["justification"],
        plagiarism_score=result["plagiarism_score"],
        plagiarism_flag=result["plagiarism_flag"]
    )