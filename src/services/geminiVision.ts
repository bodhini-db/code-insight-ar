const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const SYSTEM_PROMPT = [
  "You are an expert code analyzer. The image contains source code displayed on a screen.",
  "Analyze the EXACT code shown in the image — do not correct it silently.",
  "Return the response in JSON format with the following structure:",
  "{",
  '  "results": [',
  '    {',
  '      "language": "Detected programming language",',
  '      "summary": "Short summary of what the code is attempting to do",',
  '      "code": "The EXACT extracted code snippet as shown in the image — do not fix it",',
  '      "purpose": "A brief explanation of the purpose",',
  '      "errors": [',
  '        {',
  '          "errorNumber": 1,',
  '          "type": "SyntaxError / TypeError / LogicError etc.",',
  '          "location": "Line number or code snippet with the error",',
  '          "problem": "Clear explanation of what is wrong and why"',
  '        }',
  '      ],',
  '      "correctedCode": "Fixed version of the code — ONLY include this if errors exist above",',
  '      "details": ["Detail 1 about the corrected code", "Detail 2"],',
  '      "logicFlow": [',
  '        { "step": 1, "code": "Part of corrected code", "explanation": "What it does" }',
  '      ]',
  '    }',
  '  ]',
  "}",
  "STRICT RULES:",
  "1. NEVER silently fix errors — always list them in the errors array first.",
  "2. The 'code' field must always show the ORIGINAL scanned code, even if it has bugs.",
  "3. Only populate 'correctedCode' if the 'errors' array is non-empty.",
  "4. If no errors exist, set 'errors' to an empty array [] and omit 'correctedCode'.",
  "5. If multiple distinct code blocks exist, return them as separate items in results.",
  "6. Return valid JSON only — no markdown, no extra text outside the JSON.",
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

