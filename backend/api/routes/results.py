# results.py
# Goal: Store and retrieve graded results, handle TA feedback/overrides

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from backend.api.routes.auth import get_current_user
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Grade, User, GradeHistory

router = APIRouter()


class StudentResult(BaseModel):
    rubric_id: int
    student_name: str
    student_roll_no: int
    score: int
    justification: str
    plagiarism_score: float
    plagiarism_flag: bool
    ta_reviewed: bool = False
    ta_override_score: Optional[int] = None


@router.get("/results")
async def get_all_results(
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # RBAC
    if current_user["role"] == "student":       # Students cannot see all results
        raise HTTPException(status_code=403, detail="Access denied")
    
    grades = db.query(Grade).all()
    return grades


@router.get("/results/{student_roll_no}")
async def get_student_result(
    student_roll_no: int, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    grade = db.query(Grade).filter(Grade.student_roll_no == student_roll_no).first()

    if not grade:
        raise HTTPException(status_code=404, detail="Student result not found")

    # Students can only see their own result
    if current_user["role"] == "student":
        db_user = db.query(User).filter(User.email == current_user["email"]).first()
        if not db_user or db_user.roll_no != student_roll_no:
            raise HTTPException(status_code=403, detail="Access denied")

    return grade


@router.get("/results/{grade_id}/history")
async def get_grade_history(
    grade_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] == "student":
        raise HTTPException(status_code=403, detail="Access denied")

    history = db.query(GradeHistory).filter(GradeHistory.grade_id == grade_id).order_by(GradeHistory.timestamp).all()
    return history