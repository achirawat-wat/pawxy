import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const { focusSeconds, breakSeconds, afkSeconds, tasksCount } = await req.json();

    const systemInstruction = `You are Meowmy, a supportive, female personal assistant cat.
Your job is to provide a brief, encouraging end-of-day review for the user based on their time metrics.
CRITICAL RULES:
1. Respond in English only.
2. Output MUST be valid JSON.
3. Keep the summary under 3 sentences. Be encouraging, slightly playful, and mention their focus time.`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        summary: { type: "STRING" }
      },
      required: ["summary"]
    };

    const formatMinutes = (seconds: number) => Math.round(seconds / 60);

    const userPrompt = `Today's stats:
- Tasks completed: ${tasksCount}
- Focus Time: ${formatMinutes(focusSeconds)} minutes
- Break Time: ${formatMinutes(breakSeconds)} minutes
- AFK Time (away from keyboard): ${formatMinutes(afkSeconds)} minutes

Please give me my daily review.`;

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
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate daily review');
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (responseText) {
      const parsed = JSON.parse(responseText);
      return NextResponse.json(parsed);
    } else {
      return NextResponse.json({ summary: "Great job today! Rest up and see you tomorrow!" });
    }
  } catch (error: any) {
    console.error("AI Daily Review Error:", error);
    return NextResponse.json({ summary: "Great job today! Rest up and see you tomorrow!" });
  }
}
