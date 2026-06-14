# results.py
# Goal: Store and retrieve graded results, handle TA feedback/overrides, outputs a CSV file with all results for an exam 

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import io

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


@router.get("/results/export/csv")
async def export_results_csv(
    exam_id: Optional[int] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(Grade)
    if exam_id is not None:
        query = query.filter(Grade.exam_id == exam_id)
    grades = query.all()

    if not grades:
        raise HTTPException(status_code=404, detail="No results found")

    rows = []
    for g in grades:
        final_score = g.ta_override_score if g.ta_override_score is not None else g.score
        rows.append({
            "student_name": g.student_name,
            "student_roll_no": g.student_roll_no,
            "exam_id": g.exam_id,
            "ai_score": g.score,
            "ta_override_score": g.ta_override_score,
            "final_score": final_score,
            "plagiarism_score": g.plagiarism_score,
            "plagiarism_flag": g.plagiarism_flag,
            "ta_reviewed": g.ta_reviewed,
            "justification": g.justification
        })

    df = pd.DataFrame(rows)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)

    filename = f"exam_{exam_id}_results.csv" if exam_id is not None else "gradeops_all_results.csv"

    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )