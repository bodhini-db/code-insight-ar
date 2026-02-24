import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CameraView from "@/components/CameraView";
import { recognizeCodeFromCanvas, terminateOcrWorker } from "@/services/ocrService";
import { explainCode } from "@/lib/explainCode";

type ScanFlowState = "cameraActive" | "scanning" | "codeDetected" | "explanationReady";

const ScanPage = () => {
  const navigate = useNavigate();
  const [scanError, setScanError] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<ScanFlowState>("cameraActive");
  const [explanationPoints, setExplanationPoints] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      // Release OCR resources when leaving the page.
      void terminateOcrWorker();
    };
  }, []);

  const handleScan = useCallback(
    async (canvas: HTMLCanvasElement) => {
      setScanError(null);

      try {
        const { codeText } = await recognizeCodeFromCanvas(canvas);

        if (!codeText) {
          setScanError("Code snippet detected, but unable to extract clearly. Try again.");
          setFlowState("cameraActive");
          setExplanationPoints([]);
          return;
        }

        setFlowState("codeDetected");
        const explanation = explainCode(codeText);
        setFlowState("explanationReady");
        const flowPoints =
          explanation.logicFlow?.map((step) => step.explanation).filter(Boolean) ?? [];
        const detailPoints = explanation.details ?? [];
        const pointsSource = flowPoints.length > 0 ? flowPoints : detailPoints;
        setExplanationPoints(pointsSource.slice(0, 4));
      } catch {
        setScanError("Scanning failed. Please try again.");
        setFlowState("cameraActive");
        setExplanationPoints([]);
      }
    },
    [],
  );

  return (
    <CameraView
      onScan={handleScan}
      scanError={scanError}
      onClearError={() => setScanError(null)}
      onCameraReady={() => setFlowState("cameraActive")}
      onScanStart={() => setFlowState("scanning")}
      onHelp={() => navigate("/")}
      explanationPoints={explanationPoints}
    />
  );
};

export default ScanPage;
