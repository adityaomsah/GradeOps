from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.db.database import BaseClass, engine


class User(BaseClass):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    roll_no = Column(Integer, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)

class Exam(BaseClass):
    __tablename__ = "exams"

    id = Column(Integer, primary_key = True, index=True)
    course_name = Column(String, nullable=False)
    course_code = Column(String, nullable=False)
    exam_type = Column(String, nullable=False)
    total_marks = Column(Float, nullable = False)

    grades = relationship("Grade", back_populates = "exam")
#important = relationship ke undar mai class ka naam ki string input
#name of the attribute =  name of the bac_populates value

class Rubric(BaseClass):
    __tablename__ = "rubrics"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    max_marks = Column(Integer, nullable=False)
    criteria = Column(JSON, nullable=False)

    grades = relationship("Grade", back_populates="rubric")

class Grade(BaseClass):
    __tablename__ = "grades"

    id = Column(Integer, primary_key = True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    rubric_id = Column(Integer, ForeignKey("rubrics.id"), nullable=False)
    student_name = Column(String)
    student_roll_no = Column(Integer, nullable = False)
    score = Column(Float)
    justification = Column(String)
    plagiarism_score = Column(Float, default = 0.0)
    plagiarism_flag = Column(Boolean, default =False)
    ta_reviewed = Column(Boolean, default = False)
    ta_override_score = Column(Float, nullable = True)
    uploaded_pdf_filename = Column(String, nullable=True)

    exam = relationship("Exam", back_populates = "grades" )
    rubric = relationship("Rubric", back_populates="grades")
    history = relationship("GradeHistory", back_populates="grade")

class GradeHistory(BaseClass):
    """
    Audit trail — records every change made to a Grade.
    Tracks AI's original score vs TA overrides, with reasoning and reviewer info.
    """
    __tablename__ = "grade_history"

    id = Column(Integer, primary_key=True, index=True)
    grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False)
    old_score = Column(Float, nullable=True)   
    new_score = Column(Float, nullable=True)   
    changed_by = Column(String, nullable=False) 
    reason = Column(String, nullable=True)  # justification for change
    action = Column(String, nullable=False) # ai_graded / approved / overridden
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    grade = relationship("Grade", back_populates="history")


BaseClass.metadata.create_all(bind = engine)