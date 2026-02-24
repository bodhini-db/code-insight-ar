const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const SYSTEM_PROMPT = [
  "You are a programming tutor. The image contains source code displayed on a screen.",
  "First, extract the code from the image.",
  "Then explain what the code does in simple, beginner-friendly language.",
  "If possible, mention the programming language and key logic.",
].join(" ");

async function callGeminiVision(imageBase64: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your environment.",
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
  const explanation = parts
    .map((p: any) => p.text)
    .filter((t: unknown): t is string => typeof t === "string")
    .join("\n")
    .trim();

  if (!explanation) {
    throw new Error("Gemini did not return any explanation text.");
  }

  return explanation;
}

export async function explainCodeFromImage(imageBase64: string): Promise<string> {
  return callGeminiVision(imageBase64);
}

