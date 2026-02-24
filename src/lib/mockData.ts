export interface CodeExplanation {
  code: string;
  summary: string;
  purpose: string;
  details: string[];
  logicFlow: { step: number; code: string; explanation: string }[];
}

export const mockExplanations: Record<string, CodeExplanation> = {
  default: {
    code: "int sum = number1 + number2;",
    summary: "Adds number1 and number2, storing the sum in sum",
    purpose: "Provides a quick explanation for the detected code.",
    details: [
      "Declares a variable called 'sum' of type integer",
      "Takes the value of 'number1' and 'number2'",
      "Adds both values together using the '+' operator",
      "Stores the result in the 'sum' variable",
    ],
    logicFlow: [
      {
        step: 1,
        code: "int sum = number1 + number2;",
        explanation: "Adds number1 and number2, storing the sum in sum",
      },
    ],
  },
  forLoop: {
    code: 'for (int i = 0; i < 10; i++) {\n  System.out.println(i);\n}',
    summary: "Prints numbers 0 through 9 to the console",
    purpose: "Demonstrates iteration using a for loop to repeat an action multiple times.",
    details: [
      "Initializes counter variable 'i' to 0",
      "Checks if 'i' is less than 10 before each iteration",
      "Prints the current value of 'i' to console",
      "Increments 'i' by 1 after each iteration",
      "Loop ends when 'i' reaches 10",
    ],
    logicFlow: [
      { step: 1, code: "int i = 0", explanation: "Initialize counter to 0" },
      { step: 2, code: "i < 10", explanation: "Check if counter is less than 10" },
      { step: 3, code: "System.out.println(i)", explanation: "Print current counter value" },
      { step: 4, code: "i++", explanation: "Increment counter by 1, then repeat from step 2" },
    ],
  },
  function: {
    code: 'public static void main(String[] args) {\n  System.out.println("Hello");\n}',
    summary: "Entry point that prints 'Hello' to the console",
    purpose: "The main method is where a Java program starts executing.",
    details: [
      "'public' means accessible from anywhere",
      "'static' means it belongs to the class, not an instance",
      "'void' means it does not return any value",
      "'String[] args' accepts command-line arguments",
      "Prints 'Hello' to the standard output",
    ],
    logicFlow: [
      { step: 1, code: "public static void main(String[] args)", explanation: "JVM calls this method to start the program" },
      { step: 2, code: 'System.out.println("Hello")', explanation: "Outputs the text 'Hello' followed by a new line" },
    ],
  },
};

const sampleCodes = Object.keys(mockExplanations);

export function getRandomExplanation(): CodeExplanation {
  const key = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
  return mockExplanations[key];
}
