# analytics.py
# Goal: Provide aggregate statistics for an exam — scores, distribution, plagiarism, review progress

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd

from backend.db.database import get_db
from backend.db.models import Grade, Exam
from backend.api.routes.auth import get_current_user

router = APIRouter()

@router.get("/analytics/exam/{exam_id}")
async def get_exam_analytics(
    exam_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    grades = db.query(Grade).filter(Grade.exam_id == exam_id).all()
    if not grades:
        return {
            "exam_id": exam_id,
            "exam_name": exam.course_name,
            "total_students": 0,
            "message": "No grades available yet"
        }

    # final_score = TA override if present, else AI score
    final_scores = [
    g.ta_override_score if g.ta_override_score is not None else g.score
    for g in grades
    if (g.ta_override_score is not None) or (g.score is not None and g.score != -1)
    ]

    series = pd.Series(final_scores)
    max_marks = exam.total_marks

    plagiarism_flagged = sum(1 for g in grades if g.plagiarism_flag)
    ta_reviewed = sum(1 for g in grades if g.ta_reviewed)

    return {
        "exam_id": exam_id,
        "exam_name": exam.course_name,
        "total_students": len(grades),
        "average_score": round(series.mean(), 2),
        "median_score": round(series.median(), 2),
        "min_score": round(series.min(), 2),
        "max_score": round(series.max(), 2),
        "max_marks": max_marks,
        "plagiarism_flagged_count": plagiarism_flagged,
        "ta_reviewed_count": ta_reviewed,
        "ta_pending_count": len(grades) - ta_reviewed
    }

@router.get("/analytics/dashboard")
async def get_dashboard_summary(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Summary statistics for dashboard cards:
    total exams, total submissions, graded submissions,
    average score, plagiarism flags, pending TA reviews.
    """
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    total_exams = db.query(Exam).count()
    grades = db.query(Grade).all()

    total_submissions = len(grades)

    # A submission is "graded" if it has a valid AI score (not -1, not None)
    graded_submissions = sum(
    1
    for g in grades
    if (
        g.ta_override_score is not None
        or (g.score is not None and g.score != -1)
    )
)

    # Final score = TA override if present, else AI score (ignore invalid -1 placeholders)
    valid_final_scores = [
        g.ta_override_score if g.ta_override_score is not None else g.score
        for g in grades
        if (g.ta_override_score is not None) or (g.score is not None and g.score != -1)
    ]

    average_score = round(sum(valid_final_scores) / len(valid_final_scores), 2) if valid_final_scores else 0.0

    plagiarism_flags = sum(1 for g in grades if g.plagiarism_flag)

    pending_reviews = sum(1 for g in grades if not g.ta_reviewed)

    return {
        "total_exams": total_exams,
        "total_submissions": total_submissions,
        "graded_submissions": graded_submissions,
        "average_score": average_score,
        "plagiarism_flags": plagiarism_flags,
        "pending_reviews": pending_reviews
    }