# results.py
# Goal: Store and retrieve graded results, handle TA feedback/overrides

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from backend.api.routes.auth import get_current_user

router = APIRouter()

# Shared results store — written by /grade, read by /results
results_store = {} # currently using in memory dictionary, later need to store in database using SQL

class StudentResult(BaseModel):
    student_name: str
    student_roll_no: int
    score: int
    justification: str
    plagiarism_score: float
    plagiarism_flag: bool
    ta_reviewed: bool = False
    ta_override_score: Optional[int] = None


@router.get("/results")
async def get_all_results(current_user = Depends(get_current_user)):
    # RBAC
    if current_user["role"] == "student":       # Students cannot see all results
        raise HTTPException(status_code=403, detail="Access denied")
    
    return list(results_store.values())


@router.get("/results/{student_roll_no}")
async def get_student_result(student_roll_no: int, current_user = Depends(get_current_user)):
    if student_roll_no not in results_store:
        raise HTTPException(status_code=404, detail="Student result not found")

    # RBAC
    if current_user["role"] == "student":
        if results_store[student_roll_no]["student_roll_no"] != student_roll_no:        # Students can only see their own result
            raise HTTPException(status_code=403, detail="Access denied")
    
    return results_store[student_roll_no]