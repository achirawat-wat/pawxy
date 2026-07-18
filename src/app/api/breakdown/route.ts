import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { taskTitle, durationMinutes, goal, clarificationContext } = body;

    if (!taskTitle) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const systemInstruction = `You are an expert productivity assistant. Your job is to break down a single large task into a list of smaller, highly actionable, and realistic subtasks. 
The total time for the main task is ${durationMinutes || 'unknown'} minutes. 
Please ensure the sum of the 'durationMinutes' for all your subtasks is roughly equal to ${durationMinutes || 'a reasonable timeframe'}.
Keep the subtask titles concise (max 5-7 words), practical, and straightforward. Do not use overly grandiose, dramatic, or fictional language. Use actionable verbs (e.g. "Review", "Write", "Setup").
${goal ? `Context: The user's ultimate goal is "${goal}". Align the subtasks to this context if relevant, but keep it realistic.` : ''}

CRITICAL RULES: 1. STRICT LANGUAGE MATCHING: You MUST reply in the EXACT SAME LANGUAGE as the user's input. If the task title contains ANY Thai characters, your ENTIRE JSON response MUST be written in Thai. If the task title is entirely in English, your ENTIRE JSON response MUST be written in English. DO NOT mix languages.
2. If the task title is highly vague or ambiguous (e.g. "develop web site", "design app", "เรียนภาษาอังกฤษ") AND no clarificationContext is provided, you MUST return a 'clarification_needed' response to understand the scope before generating subtasks. 
   - ADAPT THE FORM: You must generate a dynamic form (1-2 fields max).
   - If it's a Learning/Skill task: You MUST include a 'slider' field for their current proficiency level (1-10) and a 'text' field asking for their specific focus area.
   - If it's a Work/Project task: You MUST include an 'options' field for progress state (e.g., New vs Continuing) and a 'text' field for any specific feature they want to focus on.
3. If the user provides a clarificationContext, you MUST use it to generate the final subtasks. Do not ask for clarification again.
4. If the task is already clear enough, generate the subtasks directly.
5. NO BOILERPLATE: Skip generic preamble tasks like "Set up environment", "Review existing code", "Brainstorm ideas". 
6. DO NOT HALLUCINATE SPECIFIC FEATURES: Keep subtasks broadly applicable unless specified.
7. LESS IS MORE: Generate exactly 2 to 4 subtasks. Do not generate 5 or more.`;

    const responseSchema = {
      type: "OBJECT",
      description: "Response object containing either a dynamic clarification form or the final subtasks.",
      properties: {
        type: {
          type: "STRING",
          description: "Must be either 'clarification_needed' or 'subtasks'"
        },
        clarification: {
          type: "OBJECT",
          description: "Provide this if type is 'clarification_needed'",
          properties: {
            title: { type: "STRING", description: "A catchy, friendly title for the modal (e.g., 'Need a little more info!', 'Let's refine this!')" },
            description: { type: "STRING", description: "A short sentence explaining why you need this info." },
            fields: {
              type: "ARRAY",
              description: "1-2 form fields to ask the user.",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "STRING", description: "Unique ID for the field (e.g., 'proficiency', 'focus')" },
                  type: { type: "STRING", description: "Must be 'options', 'slider', or 'text'" },
                  label: { type: "STRING", description: "The question or label for this field" },
                  options: { type: "ARRAY", items: { type: "STRING" }, description: "Only required if type is 'options'" },
                  min: { type: "INTEGER", description: "Only required if type is 'slider' (usually 1)" },
                  max: { type: "INTEGER", description: "Only required if type is 'slider' (usually 10)" }
                },
                required: ["id", "type", "label"]
              }
            }
          },
          required: ["title", "description", "fields"]
        },
        subtasks: {
          type: "ARRAY",
          description: "Provide this if type is 'subtasks'",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              durationMinutes: { type: "INTEGER" }
            },
            required: ["title", "durationMinutes"]
          }
        }
      },
      required: ["type"]
    };

    const userPrompt = clarificationContext 
      ? `Task: "${taskTitle}"\nClarification Context from user: "${clarificationContext}"\nPlease generate the subtasks now.`
      : `Break down this task: "${taskTitle}"`;

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
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      })
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error("API returned non-JSON response:", rawText.substring(0, 200));
      return NextResponse.json({ error: `API returned an invalid response (Status ${response.status}). Check if the model name is correct.` }, { status: 500 });
    }

    if (!response.ok) {
      console.error("Gemini API Error Response:", data);
      throw new Error(data.error?.message || 'Failed to generate breakdown from API');
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (responseText) {
      const parsed = JSON.parse(responseText);
      return NextResponse.json(parsed);
    } else {
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 500 });
    }
  } catch (error: any) {
    console.error("AI Breakdown Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to process AI breakdown' }, { status: 500 });
  }
}
