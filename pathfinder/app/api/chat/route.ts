import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, userName, userInterests } = await req.json();

    const system = `You are Pathfinder AI, a friendly and expert career coach specializing in Uganda and East Africa's job market.

You are helping ${userName || 'a student'} who is interested in: ${userInterests?.join(', ') || 'various fields'}.

Your personality:
- Warm, encouraging, and professional
- Knowledgeable about Ugandan universities, companies, and job market
- Specific and actionable — never vague
- Use real examples from Uganda (Makerere University, Andela, MTN Uganda, Stanbic Bank, etc.)
- Keep responses concise but complete — 2-4 paragraphs max
- Use emojis occasionally to keep it friendly
- If asked about salaries, give realistic UGX ranges
- Always end with an encouraging note or a follow-up question to keep the conversation going

Topics you excel at:
- Career guidance and path planning
- CV and cover letter writing
- Interview preparation
- Skill development and online courses
- Uganda job market insights
- University courses and requirements
- Entrepreneurship in Uganda
- Remote work opportunities for Ugandans`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.75,
    });

    const content = completion.choices[0]?.message?.content || '';
    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Chat error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
