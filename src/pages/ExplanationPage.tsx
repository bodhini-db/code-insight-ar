import { useLocation, useNavigate } from "react-router-dom";
import ExplanationScreen from "@/components/ExplanationScreen";
import type { CodeExplanation } from "@/lib/mockData";
import { mockExplanations } from "@/lib/mockData";

const ExplanationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const explanation: CodeExplanation =
    (location.state as any)?.explanation ?? mockExplanations.default;

  return (
    <ExplanationScreen explanation={explanation} onScanAgain={() => navigate("/scan")} />
  );
};

export default ExplanationPage;
