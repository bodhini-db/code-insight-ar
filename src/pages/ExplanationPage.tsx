import { useLocation, useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import type { CodeExplanation } from "@/lib/mockData";
import { mockExplanations } from "@/lib/mockData";

const ExplanationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const explanation: CodeExplanation =
    (location.state as any)?.explanation ?? mockExplanations.default;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader
        title="Code Explanation"
        showBack
        rightAction={
          <button className="rounded-full p-1.5 text-header-foreground transition-opacity hover:opacity-80">
            <Volume2 className="h-5 w-5" />
          </button>
        }
      />

      <main className="flex-1 space-y-5 px-5 py-5 fade-in">
        {/* Code Card */}
        <div className="rounded-xl bg-code p-4">
          <p className="mb-1 text-xs font-semibold text-muted-foreground">Code:</p>
          <pre className="whitespace-pre-wrap font-mono text-sm text-code-foreground">
            {explanation.code}
          </pre>
        </div>

        {/* Summary */}
        <section>
          <h2 className="mb-1 text-base font-bold text-foreground">Summary</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {explanation.summary}
          </p>
        </section>

        {/* Purpose */}
        <section>
          <h2 className="mb-1 text-base font-bold text-foreground">Purpose</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {explanation.purpose}
          </p>
        </section>

        {/* Detailed Explanation */}
        <section>
          <h2 className="mb-2 text-base font-bold text-foreground">
            Detailed Explanation
          </h2>
          <ul className="space-y-1.5">
            {explanation.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {d}
              </li>
            ))}
          </ul>
        </section>

        {/* Logic Flow */}
        <section>
          <h2 className="mb-3 text-base font-bold text-foreground">Logic Flow</h2>
          <div className="space-y-3">
            {explanation.logicFlow.map((step) => (
              <div key={step.step} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-step text-xs font-bold text-step-foreground">
                  {step.step}
                </div>
                <div className="flex-1">
                  <code className="text-xs text-code-foreground">{step.code}</code>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    → {step.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scan Again */}
        <div className="pb-6 pt-2">
          <button
            onClick={() => navigate("/scan")}
            className="w-full rounded-2xl bg-primary py-3.5 text-center font-semibold text-primary-foreground shadow-md transition-all active:scale-95"
          >
            Scan Another Code
          </button>
        </div>
      </main>
    </div>
  );
};

export default ExplanationPage;
