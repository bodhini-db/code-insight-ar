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
      console.log("[Scan] Cleaning up OCR worker");
      void terminateOcrWorker();
    };
  }, []);

  const handleScan = useCallback(
    async (canvas: HTMLCanvasElement) => {
      console.log("[Scan] Scan requested");
      setScanError(null);

      try {
        console.log("[Scan] Starting OCR on captured frame");
        const { codeText } = await recognizeCodeFromCanvas(canvas);
        console.log("[Scan] OCR raw code text:", codeText);

        if (!codeText) {
          console.warn("[Scan] OCR returned empty / non-code text");
          setScanError("Code snippet detected, but unable to extract clearly. Try again.");
          setFlowState("cameraActive");
          setExplanationPoints([]);
          return;
        }

        setFlowState("codeDetected");
        console.log("[Scan] Generating explanation for detected code");
        const explanation = explainCode(codeText);
        setFlowState("explanationReady");
        const flowPoints =
          explanation.logicFlow?.map((step) => step.explanation).filter(Boolean) ?? [];
        const detailPoints = explanation.details ?? [];
        const pointsSource = flowPoints.length > 0 ? flowPoints : detailPoints;
        setExplanationPoints(pointsSource.slice(0, 4));
        console.log("[Scan] Explanation points ready:", pointsSource.slice(0, 4));
      } catch (err) {
        console.error("[Scan] OCR scan failed", err);
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
