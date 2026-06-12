# feedback.py
# Goal: Allow TAs to approve or override AI-generated grades

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from backend.api.routes.auth import get_current_user

from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Grade, GradeHistory

router = APIRouter()

class FeedbackRequest(BaseModel):
    grade_id: int
    ta_override_score: Optional[int] = None
    justification: Optional[str] = None


@router.post("/feedback")
async def submit_feedback(
    feedback: FeedbackRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    # RBAC
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    grade = db.query(Grade).filter(Grade.id == feedback.grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    old_score = grade.ta_override_score if grade.ta_override_score is not None else grade.score
    grade.ta_reviewed = True

    if feedback.ta_override_score is not None:
        grade.ta_override_score = feedback.ta_override_score
        grade.justification = feedback.justification
        action = "overridden"
        new_score = feedback.ta_override_score
        message = "Grade overridden by TA"
    else:
        action = "approved"
        new_score = old_score
        message = "Grade approved by TA"

    # Audit trail entry
    history_entry = GradeHistory(
        grade_id=grade.id,
        old_score=old_score,
        new_score=new_score,
        changed_by=current_user["email"],
        reason=feedback.justification,
        action=action
    )
    db.add(history_entry)
    db.commit()
    db.refresh(grade)

    return {
        "message": message,
        "grade_id": grade.id,
        "ta_reviewed": grade.ta_reviewed,
        "ta_override_score": grade.ta_override_score,
        "justification": grade.justification
    }