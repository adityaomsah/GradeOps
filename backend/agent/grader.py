from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from typing import TypedDict, List
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os

from sentence_transformers import SentenceTransformer # for embeddings
from sklearn.metrics.pairwise import cosine_similarity


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

class GradingResponse(BaseModel): # Defining Pydantic schema for structured LLM response
    score: int = Field(description="The numeric marks awarded strictly based on the rubric.")


# Defining the LLM
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"))
structured_llm = llm.with_structured_output(GradingResponse)


# Defining the Grading Node
def grade_answer(state: GradeState) -> GradeState:
    prompt = f"""
    You are a strict exam grader.
    
    Student name: {state["student_name"]}
    Student answer: {state["answer_script"]}
    Rubric: {state["rubric"]}
    
    Award marks strictly based on the rubric provided.
    """
    
    response = structured_llm.invoke(prompt)
    
    state["score"] = response.score
    return state


# Defining Plagiarism Node

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def plagiarism_check(state: GradeState) -> GradeState:
    current_answer = state["answer_script"]
    all_answers = state["all_answers"]
    
    # Step 1 - length check
    word_count = len(current_answer.split())
    if word_count < 50: # need to change this later as per rubric
        state["plagiarism_score"] = 0.0
        state["plagiarism_flag"] = False
        return state
    
    # Step 2 - loop through all answers and compute
    max_jaccard = 0.0
    max_cosine = 0.0

    A = set(current_answer.lower().strip().split())
    embedding_A = embedding_model.encode(current_answer)

    for other_answer in all_answers:
        if other_answer == current_answer: # to avoid comparison with self
            continue

        # Jaccard
        B = set(other_answer.lower().strip().split())
        intersection = A.intersection(B)
        union = A.union(B)
        jaccard = float(len(intersection)/len(union)) if union else 0
        
        # Cosine
        embedding_B = embedding_model.encode(other_answer)
        cosine = float(cosine_similarity( [embedding_A],[embedding_B] )[0][0])
        
        
        max_jaccard = max(max_jaccard, jaccard)
        max_cosine = max(max_cosine, cosine)
    
    # Step 3 - combined decision
    state["plagiarism_score"] = max_cosine
    state["plagiarism_flag"] = True if max_jaccard > 0.6 and max_cosine > 0.85 else False
    return state


# Defining Human Review Node
def human_review_needed(state: GradeState) -> GradeState:
    state["score"] = -1 #not graded yet
    state["justification"] = "⚠️ This answer has been flagged for potential plagiarism and requires manual review by the TA. Automated grading has been skipped."
    return state


# Defining Justification Node
def generate_justification(state: GradeState) -> GradeState:
    prompt = f"""
    You are an exam evaluator.

    Student Answer:{state["answer_script"]}
    Rubric:{state["rubric"]}
    Awarded Score:{state["score"]}
    Plagiarism Flag: {state["plagiarism_flag"]}

    Explain clearly and concisely why this score was awarded.

    Mention:
    - strengths
    - missing points
    - mistakes
    - rubric alignment

    Keep the explanation professional and concise.
    """

    response = llm.invoke(prompt)

    state["justification"] = response.content.strip()
    return state

# Defining route, if flagged, bypass standard automated grading or route to human review
def route_after_plagiarism(state: GradeState):
    if state["plagiarism_flag"]:
        print(f"Flagged for potential plagiarism (Score: {state['plagiarism_score']:.2f})")
        return "human_review_needed"
    return "grade_answer"

