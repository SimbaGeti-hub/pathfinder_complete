"""
Pathfinder RAG — Data Ingestion Script
Loads all Uganda knowledge base CSVs into Supabase with vector embeddings.
Run once: python ingest.py
"""

import os
import csv
import time
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client

load_dotenv()

# ── Clients ──────────────────────────────────────────────────
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# ── Embedding function ────────────────────────────────────────
def get_embedding(text: str) -> list[float]:
    """Convert text to vector embedding using OpenAI."""
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text.strip()
    )
    return response.data[0].embedding

def chunk_text(text: str, max_chars: int = 1000) -> list[str]:
    """Split long text into smaller chunks."""
    if len(text) <= max_chars:
        return [text]
    chunks = []
    while text:
        chunk = text[:max_chars]
        last_period = chunk.rfind('.')
        if last_period > max_chars * 0.5:
            chunk = chunk[:last_period + 1]
        chunks.append(chunk.strip())
        text = text[len(chunk):].strip()
    return chunks

# ── Loaders ───────────────────────────────────────────────────
def load_careers():
    print("\n📋 Loading careers_uganda.csv...")
    documents = []
    with open("data/careers_uganda.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            content = f"""Career: {row['career_title']}
Category: {row['category']}
Description: {row['description']}
Required Skills: {row['required_skills']}
Average Monthly Salary in Uganda: UGX {row['average_salary_ugx_monthly']}
Salary Range: UGX {row['salary_range_ugx']} per month
Growth Rate: {row['growth_rate']}
Top Employers in Uganda: {row['top_employers_uganda']}
Education Required: {row['education_required']}
Experience Required: {row['experience_years']} years
Remote Work Possible: {row['remote_possible']}"""
            documents.append({
                "content": content,
                "metadata": dict(row),
                "source": "careers_uganda.csv",
                "category": "careers"
            })
    return documents

def load_universities():
    print("🏫 Loading universities_uganda.csv...")
    documents = []
    with open("data/universities_uganda.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            content = f"""University: {row['university_name']}
Location: {row['location']}, Uganda
Type: {row['type']} university
Established: {row['established']}
Notable Courses: {row['notable_courses']}
Entry Requirements: {row['entry_requirements']}
Approximate Tuition per Year: UGX {row['approximate_tuition_ugx_per_year']}
Duration: {row['duration_years']} years
Accreditation: {row['accreditation']}
Notes: {row['special_notes']}"""
            documents.append({
                "content": content,
                "metadata": dict(row),
                "source": "universities_uganda.csv",
                "category": "universities"
            })
    return documents

def load_skills():
    print("🎯 Loading skills_framework.csv...")
    documents = []
    with open("data/skills_framework.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            content = f"""Career: {row['career']}
Skill to Learn: {row['skill']}
Skill Type: {row['skill_type']}
Level: {row['level']}
Best Learning Resource: {row['learning_resource']}
Resource Type: {row['resource_type']}
Cost: {row['cost']}
Estimated Duration: {row['duration_weeks']} weeks
Description: {row['description']}"""
            documents.append({
                "content": content,
                "metadata": dict(row),
                "source": "skills_framework.csv",
                "category": "skills"
            })
    return documents

def load_jobs():
    print("💼 Loading jobs_market_uganda.csv...")
    documents = []
    with open("data/jobs_market_uganda.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            content = f"""Job Title: {row['job_title']}
Company: {row['company']}
Sector: {row['sector']}
Location: {row['location']}, Uganda
Job Type: {row['job_type']}
Monthly Salary: UGX {row['salary_ugx_monthly']}
Experience Required: {row['experience_required']}
Key Skills: {row['key_skills']}
Job Description: {row['description']}
How to Apply: {row['application_platform']}"""
            documents.append({
                "content": content,
                "metadata": dict(row),
                "source": "jobs_market_uganda.csv",
                "category": "jobs"
            })
    return documents

def load_interviews():
    print("🎤 Loading interview_qa.csv...")
    documents = []
    with open("data/interview_qa.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            content = f"""Career/Context: {row['career']}
Interview Question: {row['question']}
Question Category: {row['category']}
Sample Answer: {row['sample_answer']}
Coaching Tip: {row['coaching_tip']}"""
            documents.append({
                "content": content,
                "metadata": dict(row),
                "source": "interview_qa.csv",
                "category": "interviews"
            })
    return documents

# ── Insert into Supabase ──────────────────────────────────────
def ingest_documents(documents: list[dict]):
    """Embed and insert documents into Supabase pgvector."""
    total = len(documents)
    for i, doc in enumerate(documents, 1):
        try:
            # Get embedding from OpenAI
            embedding = get_embedding(doc["content"])
            
            # Insert into Supabase
            supabase.table("pathfinder_documents").insert({
                "content": doc["content"],
                "embedding": embedding,
                "metadata": doc["metadata"],
                "source": doc["source"],
                "category": doc["category"]
            }).execute()
            
            print(f"  ✅ [{i}/{total}] {doc['metadata'].get('career_title') or doc['metadata'].get('university_name') or doc['metadata'].get('job_title') or doc['metadata'].get('skill') or doc['metadata'].get('question', '')[:50]}")
            
            # Rate limiting — OpenAI allows 3000 RPM on free tier
            time.sleep(0.1)
            
        except Exception as e:
            print(f"  ❌ [{i}/{total}] Error: {e}")
            time.sleep(1)

# ── Clear existing data ───────────────────────────────────────
def clear_existing(category: str = None):
    """Clear documents from Supabase before re-ingesting."""
    if category:
        supabase.table("pathfinder_documents").delete().eq("category", category).execute()
    else:
        supabase.table("pathfinder_documents").delete().neq("id", 0).execute()

# ── Main ──────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 Pathfinder RAG — Data Ingestion")
    print("=" * 50)
    print("Clearing existing data...")
    clear_existing()

    all_documents = []
    all_documents.extend(load_careers())
    all_documents.extend(load_universities())
    all_documents.extend(load_skills())
    all_documents.extend(load_jobs())
    all_documents.extend(load_interviews())

    print(f"\n📦 Total documents to embed and store: {len(all_documents)}")
    print("Starting ingestion into Supabase...\n")
    
    ingest_documents(all_documents)
    
    print("\n" + "=" * 50)
    print("✅ Ingestion complete!")
    print(f"✅ {len(all_documents)} documents stored in Supabase pgvector")
    print("\nNext step: uvicorn main:app --reload --port 8000")
