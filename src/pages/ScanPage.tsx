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
  const [scanResults, setScanResults] = useState<any[]>([]);
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
      setScanResults([]);
      setIsLoading(true);

      try {
        console.log("[Scan] Converting captured frame to base64");
        const base64 = await canvasToBase64(canvas);
        console.log("[Scan] Calling Gemini Vision");
        const response = await explainCodeFromImage(base64);
        console.log("[Scan] Response received", response);
        
        if (response.results && Array.isArray(response.results)) {
          setScanResults(response.results);
          setFlowState("explanationReady");
        } else {
          throw new Error("Invalid response format from AI");
        }
      } catch (err) {
        console.error("[Scan] Gemini Vision scan failed", err);
        const message =
          err instanceof Error ? err.message : "Scanning failed. Please try again.";
        setScanError(message);
        setFlowState("cameraActive");
        setScanResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [canvasToBase64],
  );

  const handleCardClick = (result: any) => {
    navigate("/explanation", { state: { explanation: result } });
  };

  return (
    <CameraView
      onScan={handleScan}
      scanError={scanError}
      onClearError={() => setScanError(null)}
      onCameraReady={() => setFlowState("cameraActive")}
      onScanStart={() => setFlowState("scanning")}
      onHelp={() => navigate("/")}
      isScanning={isLoading}
      scanResults={scanResults}
      onResultClick={handleCardClick}
    />
  );
};

export default ScanPage;
