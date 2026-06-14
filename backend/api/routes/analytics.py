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


@router.get("/analytics/grade-distribution")
async def get_grade_distribution(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Grade distribution (A/B/C/D/F) across all exams, based on percentage:
      A >= 90, B >= 80, C >= 70, D >= 60, F < 60
    Final score = TA override if present, else AI score.
    Skips invalid scores (-1, None) and exams with invalid total_marks (<= 0).
    """
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    distribution = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}

    grades = db.query(Grade).all()
    if not grades:
        return distribution

    # Pre-fetch exams keyed by id to avoid N+1 queries
    exam_ids = {g.exam_id for g in grades}
    exams = db.query(Exam).filter(Exam.id.in_(exam_ids)).all()
    exam_marks = {e.id: e.total_marks for e in exams}

    for g in grades:
        # Determine final score, skipping invalid placeholders
        if g.ta_override_score is not None:
            final_score = g.ta_override_score
        elif g.score is not None and g.score != -1:
            final_score = g.score
        else:
            continue  # no valid score to grade

        max_marks = exam_marks.get(g.exam_id)
        if not max_marks or max_marks <= 0:
            continue  # skip exams with invalid/missing total_marks (avoid div-by-zero)

        percentage = (final_score / max_marks) * 100

        if percentage >= 90:
            distribution["A"] += 1
        elif percentage >= 80:
            distribution["B"] += 1
        elif percentage >= 70:
            distribution["C"] += 1
        elif percentage >= 60:
            distribution["D"] += 1
        else:
            distribution["F"] += 1

    return [
    {"grade": grade, "count": count}
    for grade, count in distribution.items()
]