"""
Pathfinder RAG — FastAPI Backend
Runs on port 8000 alongside the Next.js frontend on port 3000.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pathfinder_complete.backend.rag_engine import (
    get_career_recommendations,
    get_skill_roadmap,
    get_interview_questions,
    get_job_listings,
    chat_with_rag,
    search_documents
)

load_dotenv()

# ── App setup ─────────────────────────────────────────────────
app = FastAPI(
    title="Pathfinder RAG API",
    description="RAG-powered career guidance API for Uganda students",
    version="1.0.0"
)

# Allow Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Models ────────────────────────────────────────────
class CareerRequest(BaseModel):
    interests: list[str]
    user_name: str = "Student"

class RoadmapRequest(BaseModel):
    career: str
    user_name: str = "Student"

class InterviewRequest(BaseModel):
    role: str
    level: str = "Entry Level"
    user_name: str = "Student"

class JobRequest(BaseModel):
    role: str

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []
    user_name: str = "Student"
    user_interests: list[str] = []

class SearchRequest(BaseModel):
    query: str
    category: str = None
    match_count: int = 5

# ── Health check ──────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "running",
        "service": "Pathfinder RAG API",
        "version": "1.0.0",
        "endpoints": [
            "/rag/careers",
            "/rag/roadmap",
            "/rag/interview",
            "/rag/jobs",
            "/rag/chat",
            "/rag/search",
            "/docs"
        ]
    }

@app.get("/health")
def health():
    return {"status": "healthy", "rag": "active", "vector_db": "supabase_pgvector"}

# ── RAG Endpoints ─────────────────────────────────────────────

@app.post("/rag/careers")
async def career_recommendations(request: CareerRequest):
    """
    Get AI career recommendations grounded in Uganda careers data.
    Used by the Career Recommender module.
    """
    try:
        if not request.interests:
            raise HTTPException(status_code=400, detail="Please provide at least one interest")

        result = get_career_recommendations(
            interests=request.interests,
            user_name=request.user_name
        )
        return {
            "success": True,
            "answer": result["answer"],
            "sources": result["sources"],
            "documents_found": result["documents_found"],
            "grounded": result["documents_found"] > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rag/roadmap")
async def skill_roadmap(request: RoadmapRequest):
    """
    Get a skill roadmap grounded in Uganda skills framework data.
    Used by the Skill Roadmap module.
    """
    try:
        if not request.career.strip():
            raise HTTPException(status_code=400, detail="Please provide a career name")

        result = get_skill_roadmap(
            career=request.career,
            user_name=request.user_name
        )
        return {
            "success": True,
            "answer": result["answer"],
            "sources": result["sources"],
            "documents_found": result["documents_found"],
            "grounded": result["documents_found"] > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rag/interview")
async def interview_prep(request: InterviewRequest):
    """
    Get interview questions grounded in Uganda interview Q&A data.
    Used by the Interview Prep module.
    """
    try:
        result = get_interview_questions(
            role=request.role,
            level=request.level,
            user_name=request.user_name
        )
        return {
            "success": True,
            "answer": result["answer"],
            "sources": result["sources"],
            "documents_found": result["documents_found"],
            "grounded": result["documents_found"] > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rag/jobs")
async def job_listings(request: JobRequest):
    """
    Get job listings grounded in Uganda jobs market data.
    Used by the Job Board module.
    """
    try:
        result = get_job_listings(role=request.role)
        return {
            "success": True,
            "answer": result["answer"],
            "jobs": result["jobs"],
            "sources": result["sources"],
            "documents_found": result["documents_found"],
            "grounded": result["documents_found"] > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rag/chat")
async def rag_chat(request: ChatRequest):
    """
    General RAG-powered chat grounded in all Uganda knowledge base categories.
    Used by the AI Chatbot module.
    """
    try:
        history = [{"role": m.role, "content": m.content} for m in request.conversation_history]

        result = chat_with_rag(
            message=request.message,
            conversation_history=history,
            user_name=request.user_name,
            user_interests=request.user_interests
        )
        return {
            "success": True,
            "answer": result["answer"],
            "sources": result["sources"],
            "documents_found": result["documents_found"],
            "grounded": result["documents_found"] > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rag/search")
async def raw_search(request: SearchRequest):
    """
    Raw vector search endpoint — useful for testing and debugging.
    Returns matching documents directly without AI generation.
    """
    try:
        documents = search_documents(
            query=request.query,
            category=request.category,
            match_count=request.match_count
        )
        return {
            "success": True,
            "query": request.query,
            "category": request.category,
            "documents_found": len(documents),
            "documents": documents
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
