from langchain_google_genai import ChatGoogleGenerativeAI
from sentence_transformers import SentenceTransformer # for embeddings
from langgraph.graph import StateGraph, END
from typing import TypedDict, List
from dotenv import load_dotenv
import os

load_dotenv()

# Defining Shared State
class GradeState(TypedDict):
    student_name: str
    student_roll_no: int
    answer_script: str # extracted text
    rubric: str
    score: int
    justification: str
    all_answers: List[str] # all answer scripts to comapre for plagiarism
    plagiarism_score: float  # similarity score, TA decides if it's cheating
    plagiarism_flag: bool    # True if score crosses threshold AND answer is long

# Defining the LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=os.getenv("GEMINI_API_KEY"))

# Defining the Grading Node
def grade_answer(state: GradeState) -> GradeState:
    prompt = f"""
    You are a strict exam grader.
    
    Student name: {state["student_name"]}
    Student answer: {state["answer_script"]}
    Rubric: {state["rubric"]}
    
    Award marks strictly based on the rubric provided.
    Respond in exactly this format:
    SCORE: <marks awarded>
    JUSTIFICATION: <reason>
    """
    
    response = llm.invoke(prompt)
    lines = response.content.strip().split("\n") #This splits the response into a list of lines

    state["score"] = int(lines[0].replace("SCORE:", "").strip())
    state["justification"] = lines[1].replace("JUSTIFICATION:", "").strip()
    return state

