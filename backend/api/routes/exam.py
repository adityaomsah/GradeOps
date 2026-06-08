# exam.py
# Goal: Allow instructors to create and view exams

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.db.models import Exam
from backend.api.routes.auth import get_current_user

router = APIRouter()

class ExamRequest(BaseModel):
    course_code: str
    course_name: str
    exam_type: str
    total_marks: int = Field(gt=0, le=1000)

class ExamResponse(BaseModel):
    exam_id: int
    course_code: str
    course_name: str
    exam_type: str
    total_marks: int


@router.post("/exam", response_model=ExamResponse)
def create_exam(
    exam: ExamRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RBAC — instructor only
    if current_user["role"] not in {"instructor"}:
        raise HTTPException(status_code=403, detail="Access denied")
    
    new_exam = Exam(
        course_code=exam.course_code,
        course_name=exam.course_name,
        exam_type=exam.exam_type,
        total_marks=exam.total_marks
    )
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)

    return ExamResponse(
        exam_id=new_exam.id,
        course_code=new_exam.course_code,
        course_name=new_exam.course_name,
        exam_type=new_exam.exam_type,
        total_marks=new_exam.total_marks
    )

@router.get("/exam")
def get_all_exams(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RBAC — instructor and TA
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    exams = db.query(Exam).all()
    return exams

@router.get("/exam/{exam_id}")
def get_exam(
    exam_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RBAC — instructor and TA
    if current_user["role"] not in {"instructor","ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam