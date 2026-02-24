import { createWorker } from "tesseract.js";

/**
 * Browser-based OCR using Tesseract.js.
 * Designed for "tap Scan -> capture frame -> OCR -> extract code-like lines".
 */

let workerPromise = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      // Tesseract.js v5+ / v6: pass language directly to createWorker
      const worker = await createWorker("eng");
      return worker;
    })();
  }

  return workerPromise;
}

export async function terminateOcrWorker() {
  if (!workerPromise) return;
  const worker = await workerPromise;
  workerPromise = null;
  await worker.terminate();
}

export async function recognizeTextFromCanvas(canvas) {
  const worker = await getWorker();
  const result = await worker.recognize(canvas);
  return result?.data?.text ?? "";
}

const CODE_HINT_RE =
  /\b(int|float|double|long|short|byte|boolean|char|String|public|private|protected|static|void|class|interface|enum|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|import|package|const|let|var|function|def|print|console\.log|System\.out\.println)\b|[{}();=<>+\-*/[\].,:]/;

function normalizeLine(line) {
  return line
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/[|]/g, "1")
    .replace(/[“”]/g, '"')
    .trim();
}

function isCodeLikeLine(line) {
  if (!line) return false;
  if (line.length < 3) return false;
  if (!CODE_HINT_RE.test(line)) return false;

  // Avoid obviously-non-code: mostly letters and spaces, no operators/symbols.
  const symbolCount = (line.match(/[{}();=<>+\-*/[\].,:]/g) ?? []).length;
  const letterCount = (line.match(/[A-Za-z]/g) ?? []).length;
  if (symbolCount === 0 && letterCount > 0 && letterCount / line.length > 0.85) return false;

  return true;
}

/**
 * Filters raw OCR text to keep programming-like lines.
 * Returns a small block (single line or a few lines) suitable for explanation.
 */
export function extractCodeLikeText(rawText, { maxLines = 8 } = {}) {
  const lines = rawText
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  const codeLines = [];
  for (const line of lines) {
    if (!isCodeLikeLine(line)) continue;
    codeLines.push(line);
    if (codeLines.length >= maxLines) break;
  }

  return codeLines.join("\n").trim();
}

export async function recognizeCodeFromCanvas(canvas) {
  const rawText = await recognizeTextFromCanvas(canvas);
  const codeText = extractCodeLikeText(rawText);
  return { rawText, codeText };
}

