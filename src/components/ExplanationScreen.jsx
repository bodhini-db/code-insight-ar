import { Volume2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Renders the code explanation UI.
 *
 * Props:
 * - explanation: { code, summary, purpose, details, logicFlow, codeStructure }
 * - onScanAgain(): navigate back to scan screen
 */
export default function ExplanationScreen({ explanation, onScanAgain }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#00BFA5] px-4 py-3 text-white shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 transition-colors hover:bg-white/20 active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">Code Explanation</h1>
        <button className="rounded-full p-2 transition-colors hover:bg-white/20 active:scale-95">
          <Volume2 className="h-6 w-6" />
        </button>
      </header>

      <main className="flex-1 space-y-6 overflow-y-auto px-5 py-6 fade-in">
        {/* Code Card */}
        <div className="overflow-hidden rounded-xl bg-muted/30 border border-border/50 shadow-sm">
          <div className="bg-muted/50 px-4 py-2 border-b border-border/50">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Code:</p>
          </div>
          <div className="bg-card p-4 overflow-x-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
              {explanation.code}
            </pre>
          </div>
        </div>

        {/* Summary */}
        <section>
          <h2 className="mb-2 text-lg font-bold text-foreground">Summary</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {explanation.summary}
          </p>
        </section>

        {/* Purpose */}
        <section>
          <h2 className="mb-2 text-lg font-bold text-foreground">Purpose</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {explanation.purpose}
          </p>
        </section>

        {/* Detailed Explanation */}
        {explanation.details && explanation.details.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-bold text-foreground">Detailed Explanation</h2>
            <ul className="space-y-3">
              {explanation.details.map((d, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00BFA5]" />
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Logic Flow */}
        {explanation.logicFlow && explanation.logicFlow.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">Logic Flow</h2>
            <div className="space-y-5">
              {explanation.logicFlow.map((step) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00BFA5] text-sm font-bold text-white shadow-sm">
                    {step.step}
                  </div>
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="rounded-md bg-muted/40 px-2 py-1 font-mono text-xs text-foreground/90 inline-block border border-border/40">
                      {step.code}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      → {step.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Scan Again */}
        <div className="pb-8 pt-4">
          <button
            onClick={onScanAgain}
            className="w-full rounded-full bg-[#00BFA5] py-4 text-center font-bold text-white shadow-lg transition-all hover:bg-[#008F7A] active:scale-95 active:shadow-sm"
          >
            Scan Another Code
          </button>
        </div>
      </main>
    </div>
  );
}
      