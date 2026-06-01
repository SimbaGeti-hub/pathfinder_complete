import { NextRequest, NextResponse } from 'next/server';

const RAG_URL = process.env.RAG_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, ...payload } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint is required' }, { status: 400 });
    }

    const ragRes = await fetch(`${RAG_URL}/rag/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!ragRes.ok) {
      const err = await ragRes.text();
      throw new Error(`RAG backend error: ${err}`);
    }

    const data = await ragRes.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'RAG service error';
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
      return NextResponse.json({
        error: 'RAG backend not running',
        hint: 'Start: cd pathfinder-rag && uvicorn main:app --port 8000',
        fallback: true
      }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const res = await fetch(`${RAG_URL}/health`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return NextResponse.json({ rag_online: true, ...data });
  } catch {
    return NextResponse.json({ rag_online: false, message: 'RAG backend is offline' });
  }
}
