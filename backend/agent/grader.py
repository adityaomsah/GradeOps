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
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"))
structured_llm = llm.with_structured_output(GradingResponse)


# Defining the Grading Node
def grade_answer(state: GradeState) -> GradeState:
    prompt = f"""
    You are a strict exam grader.
    
    Student name: {state["student_name"]}
    Student answer: {state["answer_script"]}
    Rubric: {state["rubric"]}
    
    Instructions:
    - Award marks STRICTLY according to rubric provided.
    - Do not award marks beyond max marks.
    - Be objective and consistent.
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
    state["justification"] = (
        f"⚠️ This answer has been flagged for potential plagiarism.\n"
        f"Similarity Score: {state['plagiarism_score']:.2f}\n"
        f"Threshold: Jaccard > 0.6 AND Cosine > 0.85\n"
        f"Action Required: Manual review by TA before grading."
    )
    return state


# Defining Justification Node
def generate_justification(state: GradeState) -> GradeState:
    prompt = f"""
    You are an exam evaluator.

    Student Answer:{state["answer_script"]}
    Rubric:{state["rubric"]}
    Awarded Score:{state["score"]}

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

# Building the graph
graph = StateGraph(GradeState)

# Add nodes
graph.add_node("plagiarism_check", plagiarism_check)
graph.add_node("grade_answer", grade_answer)
graph.add_node("human_review_needed", human_review_needed)
graph.add_node("generate_justification", generate_justification)

# Set entry point
graph.set_entry_point("plagiarism_check")

# Add conditional edge
graph.add_conditional_edges(
    "plagiarism_check",                  # which node triggers the condition
    route_after_plagiarism,              # the routing function
    {
        "human_review_needed": "human_review_needed",
        "grade_answer": "grade_answer",
    }
)

# Add normal edges
graph.add_edge("grade_answer", "generate_justification")
graph.add_edge("generate_justification", END)
graph.add_edge("human_review_needed", END)

# Compile
grading_pipeline = graph.compile()

if __name__ == "__main__":
    # Context pool of existing student scripts
    peer_pool = [
        "The dynamic memory allocation in C uses malloc and calloc to grab memory blocks from the heap during runtime. Programmers must manually call free to prevent severe memory leaks.",
        "Object Oriented Programming relies heavily on four major pillars: Encapsulation, Inheritance, Polymorphism, and Abstraction to organize complex software architecture safely."
    ]

    shared_rubric = "Max 10 marks. Verify they talk about heap allocation, malloc, and memory leaks / freeing pointer targets."
    
    # --- TEST 1: Clean Answer ---
    clean_student: GradeState = {
        "student_name": "Alice Vance",
        "student_roll_no": 201,
        "answer_script": "When writing code in C, dynamic memory allocation helps grab storage out of the heap pool while the application is actively running. We use functions like malloc to accomplish this, but we must remember to free it later to avoid leaking memory spaces.",
        "rubric": shared_rubric,
        "all_answers": peer_pool,
        "score": 0, "justification": "", "plagiarism_score": 0.0, "plagiarism_flag": False
    }

    print("--- Executing Test 1 (Clean Student) ---")
    res_clean = grading_pipeline.invoke(clean_student)
    print(f"Final Score: {res_clean['score']}/10")
    print(f"Justification Summary: {res_clean['justification']}")

    # --- TEST 2: Flagged Copy-Paste Under Length Limit ---
    plagiarized_student: GradeState = {
        "student_name": "Bob Churn",
        "student_roll_no": 202,
        "answer_script": "The dynamic memory allocation in C uses malloc and calloc to grab memory blocks from the heap during runtime. Programmers must manually call free to prevent severe memory leaks.",
        "rubric": shared_rubric,
        "all_answers": peer_pool,
        "score": 0, "justification": "", "plagiarism_score": 0.0, "plagiarism_flag": False
    }

    print("\n--- Executing Test 2 (Plagiarized Student) ---")
    res_plag = grading_pipeline.invoke(plagiarized_student)
    print(f"Final Score: {res_plag['score']}")
    print(f"System Message: {res_plag['justification']}")
    print(f"Plagiarism Score: {res_plag['plagiarism_score']:.2f}")
    print(f"Plagiarism Flag: {res_plag['plagiarism_flag']}")
    
    # --- TEST 3: Flagged  ---
    plagiarized_student: GradeState = {
        "student_name": "John Doe",
        "student_roll_no": 203,
        "answer_script": "The dynamic memory allocation in C uses malloc and calloc to grab memory blocks from the heap during runtime execution. Programmers must always manually call the free function to prevent severe memory leaks from occurring in the program. Additionally, dynamic allocation allows flexible data structures during program execution. When a programmer allocates memory using malloc, the operating system reserves a block of memory on the heap for the program to use. Failing to free this memory after use results in memory leaks which degrade system performance significantly.",
        "rubric": shared_rubric,
        "all_answers": peer_pool,
        "score": 0, "justification": "", "plagiarism_score": 0.0, "plagiarism_flag": False
    }

    print("\n--- Executing Test 3 (Plagiarized Student) ---")
    res_plag = grading_pipeline.invoke(plagiarized_student)
    print(f"Final Score: {res_plag['score']}")
    print(f"System Message: {res_plag['justification']}")
    print(f"Plagiarism Score: {res_plag['plagiarism_score']:.2f}")
    print(f"Plagiarism Flag: {res_plag['plagiarism_flag']}")