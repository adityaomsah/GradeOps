from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import shutil
import os

from backend.ocr.pdf_to_images import pdf_to_image
from backend.api.routes.auth import get_current_user


router = APIRouter()

UPLOAD_FOLDER = "backend/ocr/uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...), current_user = Depends(get_current_user)):
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

    return {
        "message": "PDF uploaded and converted successfully",
        "images": image_paths
    }