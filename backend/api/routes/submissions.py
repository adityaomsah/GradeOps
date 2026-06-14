from fastapi import APIRouter, Depends, HTTPException, File, Form, UploadFile
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime

from backend.db.database import get_db
from backend.db.models import Submission
from backend.api.routes.auth import get_current_user

router = APIRouter()


# ----------------------------
# RESPONSE SCHEMA
# ----------------------------
class SubmissionResponse(BaseModel):
    id: int
    exam_id: int
    student_roll_no: Optional[int] = None
    status: str
    score: Optional[float] = None
    file_url: str
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------------------
# CREATE SUBMISSION (OPTION A)
# ----------------------------
@router.post("/submissions", response_model=SubmissionResponse)
def create_submission(
    exam_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] not in {"instructor", "ta"}:
        raise HTTPException(status_code=403, detail="Access denied")

    # TODO: replace with real storage (S3/local/cloudinary)
    file_url = f"/uploads/{file.filename}"

    sub = Submission(
        exam_id=exam_id,
        student_roll_no=None,
        file_url=file_url,
        status="uploaded"
    )

    db.add(sub)
    db.commit()
    db.refresh(sub)

    return SubmissionResponse(
        id=sub.id,
        exam_id=sub.exam_id,
        student_roll_no=sub.student_roll_no,
        status=sub.status,
        score=sub.score_cache,
        file_url=sub.file_url,
        created_at=sub.created_at
    )


# ----------------------------
# LIST SUBMISSIONS
# ----------------------------
@router.get("/submissions", response_model=list[SubmissionResponse])
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

    return [
        SubmissionResponse(
            id=s.id,
            exam_id=s.exam_id,
            student_roll_no=s.student_roll_no,
            status=s.status,
            score=s.score_cache,
            file_url=s.file_url,
            created_at=s.created_at
        )
        for s in query.all()
    ]


# ----------------------------
# GET ONE
# ----------------------------
@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
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

    return SubmissionResponse(
        id=sub.id,
        exam_id=sub.exam_id,
        student_roll_no=sub.student_roll_no,
        status=sub.status,
        score=sub.score_cache,
        file_url=sub.file_url,
        created_at=sub.created_at
    )


# ----------------------------
# UPDATE
# ----------------------------
class SubmissionUpdateRequest(BaseModel):
    status: str
    score_cache: Optional[float] = None
    grade_id: Optional[int] = None


@router.patch("/submissions/{submission_id}", response_model=SubmissionResponse)
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

    return SubmissionResponse(
        id=sub.id,
        exam_id=sub.exam_id,
        student_roll_no=sub.student_roll_no,
        status=sub.status,
        score=sub.score_cache,
        file_url=sub.file_url,
        created_at=sub.created_at
    )