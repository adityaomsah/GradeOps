# feedback.py
# Goal: Allow TAs to approve or override AI-generated grades

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from backend.api.routes.results import results_store
from backend.api.routes.auth import get_current_user


router = APIRouter()

class FeedbackRequest(BaseModel):
    student_roll_no: int
    ta_override_score: Optional[int] = None
    justification: Optional[str] = None


@router.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest, current_user = Depends(get_current_user)):
    # RBAC
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    # 1. Check if student exists
    if feedback.student_roll_no not in results_store:
        raise HTTPException(status_code=404, detail="Student result not found")

    # 2. Mark as reviewed
    results_store[feedback.student_roll_no]["ta_reviewed"] = True

    # 3. Override or approve
    if feedback.ta_override_score is not None:
        results_store[feedback.student_roll_no]["ta_override_score"] = feedback.ta_override_score
        results_store[feedback.student_roll_no]["justification"] = feedback.justification
        message = "Grade overridden by TA"
    else:
        message = "Grade approved by TA"

    # 4. Return updated result
    return {
        "message": message,
        "result": results_store[feedback.student_roll_no]
    }