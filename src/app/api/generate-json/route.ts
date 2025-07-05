import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to read the system prompt from the markdown file
async function getSystemPrompt(): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', 'applications', 'qompath', 'llm_prompt.md');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return fileContent;
  } catch (error) {
    console.error("Error reading system prompt file:", error);
    // Fallback prompt in case file reading fails
    return "You are a helpful assistant that generates JSON for a node-based editor.";
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local' }, { status: 500 });
  }

  try {
    const { userPrompt } = await req.json();

    if (!userPrompt) {
      return NextResponse.json({ error: 'User prompt is required' }, { status: 400 });
    }

    const systemPrompt = await getSystemPrompt();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });
    
    const jsonContent = response.choices[0].message?.content;

    if (!jsonContent) {
        return NextResponse.json({ error: 'Failed to generate content from OpenAI' }, { status: 500 });
    }

    const cleanedJson = jsonContent.replace(/```json\n/g, '').replace(/\n```/g, '').trim();

    try {
        JSON.parse(cleanedJson);
        return NextResponse.json({ json: cleanedJson });
    } catch {
        console.error("Generated content is not valid JSON:", cleanedJson);
        return NextResponse.json({ error: 'Generated content was not valid JSON.', rawContent: cleanedJson }, { status: 500 });
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
