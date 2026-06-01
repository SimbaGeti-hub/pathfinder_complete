"""
Pathfinder RAG Engine
Handles vector similarity search against Supabase pgvector
and generates grounded answers using OpenAI GPT-4o mini.
"""

import os
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# ── Embedding ─────────────────────────────────────────────────
def embed_query(text: str) -> list[float]:
    """Convert a user question into a vector embedding."""
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text.strip()
    )
    return response.data[0].embedding

# ── Vector Search ─────────────────────────────────────────────
def search_documents(
    query: str,
    category: str = None,
    match_count: int = 5,
    match_threshold: float = 0.4
) -> list[dict]:
    """
    Search Supabase pgvector for documents most relevant to the query.
    Returns the top matching document chunks with their content and metadata.
    """
    query_embedding = embed_query(query)
    
    result = supabase.rpc(
        "match_pathfinder_documents",
        {
            "query_embedding": query_embedding,
            "match_threshold": match_threshold,
            "match_count": match_count,
            "filter_category": category
        }
    ).execute()
    
    return result.data if result.data else []

# ── Context Builder ───────────────────────────────────────────
def build_context(documents: list[dict]) -> str:
    """Format retrieved documents into a context string for the AI."""
    if not documents:
        return "No specific Uganda data found. Answer from general knowledge about Uganda's job market."
    
    context_parts = []
    for i, doc in enumerate(documents, 1):
        similarity_pct = round(doc.get("similarity", 0) * 100)
        context_parts.append(
            f"[Source {i} — {doc.get('source', 'Uganda Knowledge Base')} | {similarity_pct}% relevant]\n"
            f"{doc['content']}"
        )
    
    return "\n\n---\n\n".join(context_parts)

# ── RAG Answer Generator ──────────────────────────────────────
def generate_rag_answer(
    question: str,
    context: str,
    system_context: str = "",
    conversation_history: list[dict] = None,
    user_name: str = "Student",
    user_interests: list[str] = None
) -> str:
    """
    Generate an answer grounded in retrieved Uganda documents.
    Falls back to general knowledge if no documents found.
    """
    interests_str = ", ".join(user_interests) if user_interests else "various fields"
    
    system_prompt = f"""You are Pathfinder AI, an expert career coach specialising in Uganda and East Africa's job market.

You are helping {user_name} who is interested in: {interests_str}.

{system_context}

IMPORTANT INSTRUCTIONS:
- Base your answers primarily on the Uganda-specific data provided in the context below
- Always cite which source you are drawing from when using specific data
- Use real company names, salaries in UGX, and Uganda-specific details from the context
- Be warm, encouraging and specific
- Keep responses concise but complete — 2-4 short paragraphs
- If the context doesn't fully answer the question, supplement with general knowledge but note this
- Use emojis occasionally to keep it friendly
- Always end with an actionable next step or follow-up question

UGANDA KNOWLEDGE BASE CONTEXT:
{context}

Remember: You are grounded in real Uganda data. Refer to it naturally in your responses."""

    messages = [{"role": "system", "content": system_prompt}]
    
    if conversation_history:
        messages.extend(conversation_history[-6:])  # last 3 exchanges
    
    messages.append({"role": "user", "content": question})
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=600,
        temperature=0.7
    )
    
    return response.choices[0].message.content

# ── Specialised RAG Functions ─────────────────────────────────

def get_career_recommendations(interests: list[str], user_name: str = "Student") -> dict:
    """Get career recommendations grounded in Uganda career data."""
    query = f"careers for someone interested in: {', '.join(interests)}"
    documents = search_documents(query, category="careers", match_count=8)
    context = build_context(documents)
    
    system_context = """For career recommendations, structure your response as:
1. Top 3-4 career matches with why they fit the interests
2. For each career: mention the Uganda salary range, top employers, and required skills
3. A clear recommendation on which to start with"""
    
    answer = generate_rag_answer(
        question=query,
        context=context,
        system_context=system_context,
        user_name=user_name,
        user_interests=interests
    )
    
    sources = list(set([doc.get("source", "") for doc in documents]))
    return {"answer": answer, "sources": sources, "documents_found": len(documents)}

def get_skill_roadmap(career: str, user_name: str = "Student") -> dict:
    """Get a skill roadmap grounded in Uganda skills framework data."""
    query = f"skills and learning resources to become a {career}"
    
    skill_docs = search_documents(query, category="skills", match_count=8)
    career_docs = search_documents(career, category="careers", match_count=3)
    
    all_docs = skill_docs + career_docs
    context = build_context(all_docs)
    
    system_context = f"""Create a structured skill roadmap for becoming a {career} in Uganda.
Include: specific skills to learn in order, recommended free resources, estimated timeline, and Uganda-specific context."""
    
    answer = generate_rag_answer(
        question=f"Create a complete skill roadmap for becoming a {career} in Uganda",
        context=context,
        system_context=system_context,
        user_name=user_name
    )
    
    sources = list(set([doc.get("source", "") for doc in all_docs]))
    return {"answer": answer, "sources": sources, "documents_found": len(all_docs)}

def get_interview_questions(role: str, level: str = "Entry Level", user_name: str = "Student") -> dict:
    """Get interview questions grounded in Uganda interview Q&A data."""
    query = f"interview questions for {role} {level}"
    
    interview_docs = search_documents(query, category="interviews", match_count=8)
    general_docs = search_documents("general interview tips", category="interviews", match_count=4)
    
    all_docs = interview_docs + general_docs
    context = build_context(all_docs)
    
    system_context = f"""Generate interview preparation content for a {role} position at {level}.
Include: 5-6 likely questions, coaching tips for each, sample answer structures, and Uganda-specific interview advice."""
    
    answer = generate_rag_answer(
        question=f"Prepare me for a {role} interview at {level} in Uganda",
        context=context,
        system_context=system_context,
        user_name=user_name
    )
    
    sources = list(set([doc.get("source", "") for doc in all_docs]))
    return {"answer": answer, "sources": sources, "documents_found": len(all_docs)}

def get_job_listings(role: str) -> dict:
    """Get job listings grounded in Uganda jobs market data."""
    query = f"{role} jobs in Uganda"
    documents = search_documents(query, category="jobs", match_count=8)
    context = build_context(documents)
    
    system_context = f"""Present job opportunities for {role} in Uganda.
For each relevant job: mention the company, salary range in UGX, location, key requirements, and how to apply."""
    
    answer = generate_rag_answer(
        question=f"Show me current {role} job opportunities in Uganda",
        context=context,
        system_context=system_context
    )
    
    raw_jobs = [doc.get("metadata", {}) for doc in documents]
    sources = list(set([doc.get("source", "") for doc in documents]))
    return {"answer": answer, "jobs": raw_jobs, "sources": sources, "documents_found": len(documents)}

def chat_with_rag(
    message: str,
    conversation_history: list[dict],
    user_name: str = "Student",
    user_interests: list[str] = None
) -> dict:
    """General chat grounded in all Uganda knowledge base categories."""
    # Search across all categories
    documents = search_documents(message, category=None, match_count=6)
    context = build_context(documents)
    
    answer = generate_rag_answer(
        question=message,
        context=context,
        conversation_history=conversation_history,
        user_name=user_name,
        user_interests=user_interests
    )
    
    sources = list(set([doc.get("source", "") for doc in documents]))
    return {"answer": answer, "sources": sources, "documents_found": len(documents)}
