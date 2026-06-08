from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from backend.db.database import BaseClass, engine


class User(BaseClass):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
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


BaseClass.metadata.create_all(bind = engine)