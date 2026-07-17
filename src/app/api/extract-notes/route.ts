import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const { notes, taskTitle } = await req.json();

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json({ hasNextStep: false });
    }

    const notesText = notes.join('\n- ');
    
    const systemInstruction = `You are Meowmy, a highly efficient, female personal assistant cat.
Your job is to read the user's quick notes from a completed task and determine if there is any unfinished business, a bug to fix, or a clear next step that requires a follow-up task.
If you find actionable unfinished items, extract the MOST important one as a new suggested task.

CRITICAL RULES:
1. Respond in English only.
2. Output MUST be valid JSON.
3. If no actionable follow-up is found in the notes, set "hasNextStep" to false.
4. Keep the suggested title extremely concise (max 5-6 words).
5. Estimate a realistic duration for the follow-up task in minutes (e.g., 15, 30, 45, 60).`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        hasNextStep: { type: "BOOLEAN" },
        suggestedTitle: { type: "STRING" },
        suggestedMinutes: { type: "INTEGER" },
        reason: { type: "STRING", description: "A very short explanation of why this follow-up is needed (e.g. 'You noted a login bug')" }
      },
      required: ["hasNextStep"]
    };

    const userPrompt = `Task completed: "${taskTitle}"\nNotes taken during task:\n- ${notesText}\n\nDoes this require a follow-up task?`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to extract notes');
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (responseText) {
      const parsed = JSON.parse(responseText);
      return NextResponse.json(parsed);
    } else {
      return NextResponse.json({ hasNextStep: false });
    }
  } catch (error: any) {
    console.error("AI Note Extraction Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to process notes' }, { status: 500 });
  }
}
