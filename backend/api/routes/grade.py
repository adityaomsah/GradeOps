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
from backend.api.routes.rubrics import rubric_store
from backend.api.routes.results import results_store
from backend.api.routes.auth import get_current_user


router = APIRouter()

class GradeResponse(BaseModel):
    score: int
    justification: str
    plagiarism_score: float  
    plagiarism_flag: bool


@router.post("/grade", response_model=GradeResponse)
async def grade_student(                           #FastAPI can't receive a file and a JSON body at the same time. 
    file: UploadFile = File(...),            
    rubric_id: str = Form(...),                    #So we pass each field separately as Form fields
    all_answers: str = Form(...),
    current_user = Depends(get_current_user)
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

    # Fetch rubric from store
    if rubric_id not in rubric_store:
        raise HTTPException(status_code=404, detail="Rubric not found")
    rubric_data = rubric_store[rubric_id]
    rubric_text = json.dumps(rubric_data)  # convert dict to string for the prompt

    # 2. Convert PDF to images
    image_paths = pdf_to_image(
        pdf_path=pdf_path,
        output_save_folder="backend/ocr/images",
        pdf_name=file.filename.split(".")[0]
    )

    # 3. Extract text and student info from first page
    extracted_text = ""
    student_name = ""
    student_roll_no = 0

    for i, image_path in enumerate(image_paths):
        result = text_from_image(image_path)
        extracted_text += result["raw_text"] + "\n"
        if i == 0:  # get student info from first page only
            student_name = result["name"] or ""
            student_roll_no = int(result["roll_no"]) if result["roll_no"] else 0

    # 4. Build state and run pipeline
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
    # Save result to results_store
    results_store[student_roll_no] = {
        "student_name": student_name,
        "student_roll_no": student_roll_no,
        "score": result["score"],
        "justification": result["justification"],
        "plagiarism_score": result["plagiarism_score"],
        "plagiarism_flag": result["plagiarism_flag"],
        "ta_reviewed": False,
        "ta_override_score": None
}

    # 5. Return response
    return GradeResponse(
        score=result["score"],
        justification=result["justification"],
        plagiarism_score=result["plagiarism_score"],
        plagiarism_flag=result["plagiarism_flag"]
    )