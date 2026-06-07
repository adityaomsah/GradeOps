from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from backend.database import BaseClass, engine

BaseClass = declarative_base()


class User(BaseClass):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)


class Exam(BaseClass):
    __tablename__ = "exams"

    id = Column(Integer, primary_key = True)
    exam_name = Column(String)
    subject = Column(String)
    uploaded_pdf_filename = Column(String, nullable = False)
    date = Column(String)
    total_marks = Column(Float, nullable = False)

    grades = relationship("Grade", back_populates = "exam")
#important = relationship ke undar mai class ka naam ki string input
#name of the attribute =  name of the bac_populates value


class Grade(BaseClass):
    __tablename__ = "grades"

    id = Column(Integer, primary_key = True)
    exam_id = Column(Integer, ForeignKey("exams.id"))
    rubric_id = Column(Integer, Foreign("rubrics.id"))
    student_name = Column(String)
    roll_no = Column(String, nullable = False)
    score = Column(Float)
    justification = Column(String)
    plagiarism_score = Column(Float, default = 0.0)
    plagiarism_flag = Column(Boolean, default =False)
    ta_reviewed = Column(Boolean, default = False)
    ta_override_socre = Column(Float, nullable = True)

    exam = relationship("Exam", back_populates = "grades" )


class Rubric(BaseClass):
    __tablename__ = "rubrics"
    id = Column(Integer, primary_key=True)
    question = Column(String, nullable=False)
    max_marks = Column(Integer, nullable=False)
    criteria = Column(JSON, nullable=False)

    
BaseClass.metadata.create_all(bind = engine)