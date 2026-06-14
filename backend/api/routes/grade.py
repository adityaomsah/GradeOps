# grade.py endpoint
# Goal: Accept exam PDF(s) + rubric_id, extract text via OCR, run through grading pipeline
# Returns: score, justification, plagiarism_score, plagiarism_flag
# Supports single file (/grade) and bulk upload (/grade/bulk)

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import shutil
import json
import os

from backend.ocr.pdf_to_images import pdf_to_image
from backend.ocr.vision_extractor import text_from_image
from backend.agent.grader import grading_pipeline, GradeState
from backend.api.routes.auth import get_current_user

from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Rubric, Exam, Grade, GradeHistory, Submission

router = APIRouter()

MAX_SIZE = 20 * 1024 * 1024  # 20 MB


class GradeResponse(BaseModel):
    score: float
    justification: str
    plagiarism_score: float
    plagiarism_flag: bool


class BulkGradeResultItem(BaseModel):
    filename: str
    status: str  # "success" or "error"
    data: Optional[GradeResponse] = None
    error: Optional[str] = None


class BulkGradeResponse(BaseModel):
    total: int
    succeeded: int
    failed: int
    results: List[BulkGradeResultItem]


async def process_single_grade(
    file: UploadFile,
    exam_id: int,
    rubric_id: int,
    all_answers_list: List[str],
    db: Session,
    submission_id: Optional[int] = None
) -> GradeResponse:
    """
    Core grading logic for a single PDF.
    Validates, runs OCR + grading pipeline, saves to DB, returns GradeResponse.
    Raises HTTPException on any failure (caller handles for bulk mode).
    """
    # File validation
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")
    await file.seek(0)

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

    # 3. Fetch exam from database
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # 4. Convert PDF to images
    image_paths = pdf_to_image(
        pdf_path=pdf_path,
        output_save_folder="backend/ocr/images",
        pdf_name=file.filename.split(".")[0]
    )

    # 5. Extract text and student info from first page
    extracted_text = ""
    student_name = ""
    student_roll_no = 0

    for i, image_path in enumerate(image_paths):
        result = text_from_image(image_path)
        extracted_text += result["raw_text"] + "\n"
        if i == 0:
            student_name = result["name"] or ""
            student_roll_no = int(result["roll_no"]) if result["roll_no"] else 0

    # 6. Build state and run grading pipeline
    state: GradeState = {
        "student_name": student_name,
        "student_roll_no": student_roll_no,
        "answer_script": extracted_text,
        "rubric": rubric_text,
        "all_answers": all_answers_list,
        "score": 0,
        "justification": "",
        "plagiarism_score": 0.0,
        "plagiarism_flag": False
    }

    result = grading_pipeline.invoke(state)

    # 7. Save result to database
    new_grade = Grade(
        rubric_id=rubric_id,
        exam_id=exam_id,
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

    # 8. Audit trail entry — log initial AI grading
    initial_history = GradeHistory(
        grade_id=new_grade.id,
        old_score=None,
        new_score=new_grade.score,
        changed_by="system",
        reason="Initial AI grading",
        action="ai_graded"
    )
    db.add(initial_history)
    db.commit()

    if submission_id:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if submission:
            submission.status = "graded"
            submission.score_cache = result["score"]
            submission.grade_id = new_grade.id
            submission.student_roll_no = student_roll_no
            db.commit()
            
    return GradeResponse(
        score=result["score"],
        justification=result["justification"],
        plagiarism_score=result["plagiarism_score"],
        plagiarism_flag=result["plagiarism_flag"]
    )


@router.post("/grade", response_model=GradeResponse)
async def grade_student(
    file: UploadFile = File(...),
    exam_id: int = Form(...),
    rubric_id: int = Form(...),
    all_answers: str = Form(...),
    submission_id: Optional[int] = Form(None),   # <-- new
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "ta":
        raise HTTPException(status_code=403, detail="Access denied")

    return await process_single_grade(
        file=file, exam_id=exam_id, rubric_id=rubric_id,
        all_answers_list=json.loads(all_answers), db=db,
        submission_id=submission_id
    )


@router.post("/grade/bulk", response_model=BulkGradeResponse)
async def grade_students_bulk(
    files: List[UploadFile] = File(...),
    exam_id: int = Form(...),
    rubric_id: int = Form(...),
    all_answers: str = Form(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Bulk grading — accepts multiple PDF files (one per student).
    Each file is processed independently; failures don't stop the batch.
    all_answers should contain the answer texts of all students for
    plagiarism comparison.
    """
    # RBAC
    if current_user["role"] != "ta":
        raise HTTPException(status_code=403, detail="Access denied")

    all_answers_list = json.loads(all_answers)
    results = []
    succeeded = 0
    failed = 0

    for file in files:
        try:
            data = await process_single_grade(
                file=file,
                exam_id=exam_id,
                rubric_id=rubric_id,
                all_answers_list=all_answers_list,
                db=db
            )
            results.append(BulkGradeResultItem(filename=file.filename, status="success", data=data))
            succeeded += 1
        except HTTPException as e:
            results.append(BulkGradeResultItem(filename=file.filename, status="error", error=str(e.detail)))
            failed += 1
        except Exception as e:
            results.append(BulkGradeResultItem(filename=file.filename, status="error", error=str(e)))
            failed += 1

    return BulkGradeResponse(
        total=len(files),
        succeeded=succeeded,
        failed=failed,
        results=results
    )