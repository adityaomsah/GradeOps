# upload.py
# Goal: Upload exam PDF, convert to images, optionally create a Submission tracking record
# If exam_id is provided, a Submission row is created (status="uploaded") and
# its submission_id is returned — TA can pass this to /grade later for tracking.

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
import shutil
import os

from backend.ocr.pdf_to_images import pdf_to_image
from backend.api.routes.auth import get_current_user
from backend.db.database import get_db
from backend.db.models import Submission, Exam


router = APIRouter()

UPLOAD_FOLDER = "backend/ocr/uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload-pdf/")
async def upload_pdf(
    file: UploadFile = File(...),
    exam_id: Optional[int] = Form(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # RBAC
    if current_user["role"] != "ta":
        raise HTTPException(status_code=403, detail="Access denied")

    # File validation
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    contents = await file.read()
    MAX_SIZE = 20 * 1024 * 1024  # 20 MB
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")

    # reset file pointer since we read it
    await file.seek(0)

    # Save uploaded PDF
    pdf_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("PDF uploaded successfully!")

    # Convert PDF to images
    image_paths = pdf_to_image(
        pdf_path=pdf_path,
        output_save_folder="backend/ocr/images",
        pdf_name=file.filename.split(".")[0]
    )

    response = {
        "message": "PDF uploaded and converted successfully",
        "images": image_paths
    }

    # Optional: create Submission tracking record if exam_id is provided
    if exam_id is not None:
        exam = db.query(Exam).filter(Exam.id == exam_id).first()
        if not exam:
            raise HTTPException(status_code=404, detail="Exam not found")

        new_submission = Submission(
            exam_id=exam_id,
            student_roll_no=None,
            file_url=pdf_path,
            status="uploaded"
        )
        db.add(new_submission)
        db.commit()
        db.refresh(new_submission)

        response["submission_id"] = new_submission.id

    return response