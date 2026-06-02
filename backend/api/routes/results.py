# results.py
# Goal: Store and retrieve graded results, handle TA feedback/overrides

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

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
async def get_all_results():
    return list(results_store.values())


@router.get("/results/{student_roll_no}")
async def get_student_result(student_roll_no: int):
    if student_roll_no not in results_store:
        raise HTTPException(status_code=404, detail="Student result not found")
    return results_store[student_roll_no]