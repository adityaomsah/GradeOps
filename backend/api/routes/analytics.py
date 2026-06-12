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

    # Score distribution in 5 buckets across 0 → max_marks
    bucket_size = max_marks / 5
    bins = [round(bucket_size * i, 2) for i in range(5)]
    bins.append(max_marks + 0.01)
    labels = [f"{bins[i]}-{bins[i+1]}" for i in range(5)]
    distribution_counts = pd.cut(series, bins=bins, labels=labels, include_lowest=True).value_counts().sort_index()

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
        "score_distribution": distribution_counts.to_dict(),
        "plagiarism_flagged_count": plagiarism_flagged,
        "ta_reviewed_count": ta_reviewed,
        "ta_pending_count": len(grades) - ta_reviewed
    }