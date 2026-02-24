/**
 * Rule-based code explanation generator (no API).
 * Input: a single line or small block of code.
 * Output matches the `CodeExplanation` shape used by the UI.
 */

function toTitleCase(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function splitNonEmptyLines(code) {
  return code
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function looksLikeJavaMain(signature) {
  return /\bpublic\s+static\s+void\s+main\s*\(\s*String\s*\[\]\s*\w*\s*\)/.test(signature);
}

function buildDefaultExplanation(code) {
  const lines = splitNonEmptyLines(code);
  const details =
    lines.length <= 1
      ? ["Reads this line and performs its operations in order."]
      : lines.map((l) => `Reads and executes: ${l}`);

  return {
    code,
    summary: "Explains the detected code snippet.",
    purpose: "Helps you understand what this code is doing at a high level.",
    details,
    logicFlow: lines.map((l, idx) => ({
      step: idx + 1,
      code: l,
      explanation: "Execute this statement.",
    })),
    codeStructure: [
      lines.length > 1 ? "A small block of statements" : "A single statement",
      "Tokens and operators recognized from the snippet",
    ],
  };
}

function explainAssignmentArithmetic(line) {
  // Example: int sum = number1 + number2;
  const m =
    /^(?<type>int|float|double|long|short|byte|boolean|char|String|var|let|const)\s+(?<name>[A-Za-z_]\w*)\s*=\s*(?<expr>[^;]+);?$/.exec(
      line,
    );
  if (!m?.groups) return null;

  const { type, name, expr } = m.groups;
  const hasPlus = /\+/.test(expr);
  const hasMinus = /-/.test(expr);
  const op =
    hasPlus && !hasMinus
      ? "addition"
      : hasMinus && !hasPlus
        ? "subtraction"
        : hasPlus && hasMinus
          ? "an arithmetic expression"
          : "a computed expression";

  // Try to extract two operands for simple explanations.
  const simpleOp = /^\s*(?<a>[A-Za-z_]\w*|\d+)\s*([+*/-])\s*(?<b>[A-Za-z_]\w*|\d+)\s*$/.exec(
    expr,
  );
  const a = simpleOp?.groups?.a;
  const b = simpleOp?.groups?.b;

  const summary =
    a && b && hasPlus
      ? `Adds ${a} and ${b}`
      : a && b && hasMinus
        ? `Subtracts ${b} from ${a}`
        : `Evaluates an expression and stores it in ${name}`;

  const details = [
    `Declares a ${type} variable named '${name}'.`,
    `Computes ${op}: ${expr.trim()}.`,
    `Assigns the result into '${name}'.`,
  ];

  const logicFlow = [
    {
      step: 1,
      code: line.endsWith(";") ? line : `${line};`,
      explanation: `${summary}, storing the result in ${name}.`,
    },
  ];

  const codeStructure = [
    `Variable declaration (${type} ${name})`,
    "Assignment operator (=)",
    "Expression on the right-hand side",
    line.includes("+") ? "Arithmetic operator (+)" : null,
    line.includes("-") ? "Arithmetic operator (-)" : null,
    line.includes(";") ? "Statement terminator (;)" : null,
  ].filter(Boolean);

  return {
    code: line,
    summary: toTitleCase(summary),
    purpose: `Stores the computed result in '${name}'.`,
    details,
    logicFlow,
    codeStructure,
  };
}

function explainForLoop(codeBlock) {
  const lines = splitNonEmptyLines(codeBlock);
  const first = lines[0] ?? codeBlock.trim();
  if (!/^for\s*\(/.test(first)) return null;

  return {
    code: codeBlock,
    summary: "Repeats a block of code using a for loop.",
    purpose: "Runs the loop body multiple times while a condition is true.",
    details: [
      "Initializes a loop variable (usually a counter).",
      "Checks the loop condition before each iteration.",
      "Executes the loop body when the condition passes.",
      "Updates the loop variable after each iteration.",
    ],
    logicFlow: [
      { step: 1, code: "Initialize", explanation: "Set the starting value(s) for the loop." },
      { step: 2, code: "Condition check", explanation: "If false, exit the loop." },
      { step: 3, code: "Loop body", explanation: "Run the statements inside the braces." },
      { step: 4, code: "Update", explanation: "Move to the next iteration, then repeat step 2." },
    ],
    codeStructure: [
      "for (...) loop header",
      "Initializer; condition; update",
      lines.some((l) => l.includes("{")) ? "Loop body block ({ ... })" : "Single-statement loop body",
    ],
  };
}

function explainIfStatement(codeBlock) {
  const lines = splitNonEmptyLines(codeBlock);
  const first = lines[0] ?? codeBlock.trim();
  if (!/^if\s*\(/.test(first)) return null;

  return {
    code: codeBlock,
    summary: "Runs code conditionally using an if statement.",
    purpose: "Executes a block only when a condition evaluates to true.",
    details: [
      "Evaluates the condition inside the parentheses.",
      "If true, runs the 'then' block.",
      "If there is an 'else', runs the alternative block when the condition is false.",
    ],
    logicFlow: [
      { step: 1, code: "Evaluate condition", explanation: "Compute true/false from the expression." },
      { step: 2, code: "If true → then block", explanation: "Run statements inside the if block." },
      { step: 3, code: "If false → else block", explanation: "Run else block if present." },
    ],
    codeStructure: [
      "if (condition)",
      lines.some((l) => l.includes("{")) ? "Conditional blocks ({ ... })" : "Single-statement branches",
    ],
  };
}

function explainJavaMain(codeBlock) {
  const lines = splitNonEmptyLines(codeBlock);
  const first = lines[0] ?? codeBlock.trim();
  if (!looksLikeJavaMain(first)) return null;

  return {
    code: codeBlock,
    summary: "Program entry point (Java main method).",
    purpose: "This method is where the JVM starts executing your program.",
    details: [
      "'public' makes it accessible to the JVM.",
      "'static' means it can be called without creating an object.",
      "'void' means it returns no value.",
      "'String[] args' holds command-line arguments.",
    ],
    logicFlow: [
      { step: 1, code: first, explanation: "JVM calls this method to start the program." },
      { step: 2, code: "…", explanation: "Runs the statements inside the method body." },
    ],
    codeStructure: ["Access modifier (public)", "static method", "Return type (void)", "Parameters (String[] args)"],
  };
}

function explainClassDeclaration(lineOrBlock) {
  const firstLine = splitNonEmptyLines(lineOrBlock)[0] ?? lineOrBlock.trim();
  if (!/\bclass\s+[A-Za-z_]\w*/.test(firstLine)) return null;
  const nameMatch = /\bclass\s+(?<name>[A-Za-z_]\w*)/.exec(firstLine);
  const name = nameMatch?.groups?.name ?? "a class";

  return {
    code: lineOrBlock,
    summary: `Defines a class named ${name}.`,
    purpose: "Groups related data and behavior into a reusable type.",
    details: [
      "A class is a blueprint for creating objects (instances).",
      "It can contain fields (data) and methods (functions).",
      "The body of the class is usually enclosed in braces { ... }.",
    ],
    logicFlow: [{ step: 1, code: firstLine, explanation: `Declare the ${name} class.` }],
    codeStructure: ["class keyword", "Class name", firstLine.includes("{") ? "Class body ({ ... })" : "Class body (not shown)"],
  };
}

export function explainCode(codeText) {
  const code = (codeText ?? "").trim();
  if (!code) return buildDefaultExplanation("");

  // Prefer line-based rules first for common beginner snippets.
  const lines = splitNonEmptyLines(code);
  if (lines.length === 1) {
    return (
      explainAssignmentArithmetic(lines[0]) ||
      explainClassDeclaration(lines[0]) ||
      explainForLoop(lines[0]) ||
      explainIfStatement(lines[0]) ||
      buildDefaultExplanation(lines[0])
    );
  }

  // Block-based rules.
  return (
    explainJavaMain(code) ||
    explainForLoop(code) ||
    explainIfStatement(code) ||
    explainClassDeclaration(code) ||
    buildDefaultExplanation(code)
  );
}

