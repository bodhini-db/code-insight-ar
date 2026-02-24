import { Camera, Code, Sparkles, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="CodeLens AR" />

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-1 text-primary">
          <Code className="h-12 w-12" strokeWidth={2.5} />
        </div>

        <h2 className="mb-2 text-center text-3xl font-extrabold text-foreground">
          CodeLens AR
        </h2>
        <p className="mb-2 text-center text-sm text-muted-foreground">
          Version 1.0.0
        </p>
        <p className="mb-10 max-w-xs text-center text-base text-muted-foreground">
          Scan code and understand it instantly
        </p>

        {/* Start Scan Button */}
        <button
          onClick={() => navigate("/scan")}
          className="group flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl active:scale-95"
        >
          <Camera className="h-6 w-6" />
          Start Scan
          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Features */}
        <div className="mt-14 w-full max-w-sm space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Features
          </h3>
          {[
            { icon: Camera, title: "Live Code Scan", desc: "Real-time scanning using your camera" },
            { icon: Sparkles, title: "AI Explanations", desc: "Instant, beginner-friendly breakdowns" },
            { icon: Code, title: "Logic Flow", desc: "Step-by-step code walkthroughs" },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        © 2026 CodeLens AR
      </footer>
    </div>
  );
};

export default HomePage;
