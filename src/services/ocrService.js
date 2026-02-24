/**
 * OCR service has been removed in favor of Gemini Vision.
 * This file is kept as a placeholder to avoid import errors if any references remain.
 */

export async function terminateOcrWorker() {
  return Promise.resolve();
}

export async function recognizeTextFromCanvas(canvas) {
  return Promise.resolve("");
}

export function extractCodeLikeText(rawText, options = {}) {
  return "";
}

export async function recognizeCodeFromCanvas(canvas) {
  return Promise.resolve({ rawText: "", codeText: "" });
}
