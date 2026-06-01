-- ============================================================
-- PATHFINDER RAG — Supabase Setup SQL
-- Run this entire script in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Step 1: Enable the pgvector extension
create extension if not exists vector;

-- Step 2: Create the main documents table
-- This stores all our Uganda knowledge base as vector embeddings
create table if not exists pathfinder_documents (
  id bigserial primary key,
  content text not null,
  embedding vector(1536),  -- OpenAI text-embedding-3-small produces 1536 dimensions
  metadata jsonb,
  source text,             -- which CSV file this came from
  category text,           -- careers | universities | skills | jobs | interviews
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Step 3: Create an index for fast similarity search
-- Using ivfflat for approximate nearest neighbor search
create index if not exists pathfinder_documents_embedding_idx
  on pathfinder_documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Step 4: Create a function for similarity search
-- This is what LangChain calls when a user asks a question
create or replace function match_pathfinder_documents (
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 5,
  filter_category text default null
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  source text,
  category text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    pathfinder_documents.id,
    pathfinder_documents.content,
    pathfinder_documents.metadata,
    pathfinder_documents.source,
    pathfinder_documents.category,
    1 - (pathfinder_documents.embedding <=> query_embedding) as similarity
  from pathfinder_documents
  where
    (filter_category is null or pathfinder_documents.category = filter_category)
    and 1 - (pathfinder_documents.embedding <=> query_embedding) > match_threshold
  order by pathfinder_documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Step 5: Grant access to the service role
grant all on pathfinder_documents to service_role;
grant execute on function match_pathfinder_documents to service_role;

-- Done! Your Supabase is ready for RAG.
-- Next: run `python ingest.py` to load the Uganda knowledge base.
