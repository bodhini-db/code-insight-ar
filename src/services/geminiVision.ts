const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const SYSTEM_PROMPT = [
  "You are a programming tutor. The image contains source code displayed on a screen.",
  "Identify the main code snippets and explain them.",
  "Return the response in JSON format with the following structure:",
  "{",
  '  "results": [',
  '    {',
  '      "summary": "Short summary title (e.g. Adds number1 and number2...)",',
  '      "code": "The extracted code snippet",',
  '      "purpose": "A brief explanation of the purpose",',
  '      "details": ["Detail 1", "Detail 2"],',
  '      "logicFlow": [',
  '        { "step": 1, "code": "Part of code", "explanation": "What it does" }',
  '      ]',
  '    }',
  '  ]',
  "}",
  "If there are multiple distinct code blocks, return them as separate items in the results array.",
  "Ensure valid JSON output without markdown formatting.",
].join(" ");

async function callGeminiVision(imageBase64: string): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your environment.",
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: SYSTEM_PROMPT,
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${text}`);
  }

  const json: any = await response.json();
  const candidates = json.candidates ?? [];
  const first = candidates[0];
  const parts = first?.content?.parts ?? [];
  const explanationText = parts
    .map((p: any) => p.text)
    .filter((t: unknown): t is string => typeof t === "string")
    .join("\n")
    .trim();

  if (!explanationText) {
    throw new Error("Gemini did not return any explanation text.");
  }

  try {
    // Clean up any markdown code blocks if present (though responseMimeType should prevent this)
    const cleanText = explanationText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse Gemini JSON response:", explanationText);
    throw new Error("Failed to parse Gemini response as JSON.");
  }
}

export async function explainCodeFromImage(imageBase64: string): Promise<any> {
  return callGeminiVision(imageBase64);
}

