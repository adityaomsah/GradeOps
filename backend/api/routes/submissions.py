# submissions.py
# Goal: Track uploaded exam PDFs and their grading status (side-car to /grade)

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.db.models import Submission
from backend.api.routes.auth import get_current_user

router = APIRouter()


class SubmissionCreateRequest(BaseModel):
    exam_id: int
    student_roll_no: Optional[int] = None
    file_url: str


class SubmissionUpdateRequest(BaseModel):
    status: str
    score_cache: Optional[float] = None
    grade_id: Optional[int] = None


# CREATE submission (after upload-pdf)
@router.post("/submissions")
def create_submission(
    submission: SubmissionCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    sub = Submission(
        exam_id=submission.exam_id,
        student_roll_no=submission.student_roll_no,
        file_url=submission.file_url,
        status="uploaded"
    )

    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


# GET all submissions, optional filters
@router.get("/submissions")
def list_submissions(
    exam_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(Submission)
    if exam_id is not None:
        query = query.filter(Submission.exam_id == exam_id)
    if status is not None:
        query = query.filter(Submission.status == status)

    return query.all()


# GET one submission
@router.get("/submissions/{submission_id}")
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub


# UPDATE status (used by grading or manual correction)
@router.patch("/submissions/{submission_id}")
def update_submission(
    submission_id: int,
    update: SubmissionUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub.status = update.status
    if update.score_cache is not None:
        sub.score_cache = update.score_cache
    if update.grade_id is not None:
        sub.grade_id = update.grade_id

    db.commit()
    db.refresh(sub)
    return sub