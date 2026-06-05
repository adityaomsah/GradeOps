from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

BaseClass = declarative_base()

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
    student_name = Column(String)
    roll_no = Column(String, nullable = False)
    score = Column(Float)
    justification = Column(String)
    exam = relationship("Exam", back_populates = "grades" )


engine = create_engine("sqlite:///gradeops.db")
BaseClass.metadata.create_all(engine)

SessionLocal = sessionmaker(bind = engine)