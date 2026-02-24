import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CameraView from "@/components/CameraView";
import { explainCodeFromImage } from "@/services/geminiVision";

type ScanFlowState = "cameraActive" | "scanning" | "codeDetected" | "explanationReady";

const ScanPage = () => {
  const navigate = useNavigate();
  const [scanError, setScanError] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<ScanFlowState>("cameraActive");
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canvasToBase64 = useCallback((canvas: HTMLCanvasElement): Promise<string> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to capture image from camera."));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            const base64 = typeof result === "string" ? result.split(",")[1] ?? "" : "";
            if (!base64) {
              reject(new Error("Failed to convert image to base64."));
            } else {
              resolve(base64);
            }
          };
          reader.onerror = () => reject(new Error("Failed to read captured image."));
          reader.readAsDataURL(blob);
        },
        "image/png",
        0.95,
      );
    });
  }, []);

  const handleScan = useCallback(
    async (canvas: HTMLCanvasElement) => {
      console.log("[Scan] Scan requested (Gemini Vision)");
      setScanError(null);
      setExplanationText(null);
      setIsLoading(true);

      try {
        console.log("[Scan] Converting captured frame to base64");
        const base64 = await canvasToBase64(canvas);
        console.log("[Scan] Calling Gemini Vision");
        const explanation = await explainCodeFromImage(base64);
        setFlowState("explanationReady");
        setExplanationText(explanation);
        console.log("[Scan] Explanation text ready");
      } catch (err) {
        console.error("[Scan] Gemini Vision scan failed", err);
        const message =
          err instanceof Error ? err.message : "Scanning failed. Please try again.";
        setScanError(message);
        setFlowState("cameraActive");
        setExplanationText(null);
      } finally {
        setIsLoading(false);
      }
    },
    [canvasToBase64],
  );

  return (
    <CameraView
      onScan={handleScan}
      scanError={scanError}
      onClearError={() => setScanError(null)}
      onCameraReady={() => setFlowState("cameraActive")}
      onScanStart={() => setFlowState("scanning")}
      onHelp={() => navigate("/")}
      explanationText={isLoading ? "Scanning code with Gemini..." : explanationText}
    />
  );
};

export default ScanPage;
