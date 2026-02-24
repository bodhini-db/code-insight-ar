import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ScanLine } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { getRandomExplanation } from "@/lib/mockData";

const ScanPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      setError("Unable to access camera. Please grant permission or try on a mobile device.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  const handleScan = () => {
    setScanning(true);
    // Simulate OCR delay
    setTimeout(() => {
      const explanation = getRandomExplanation();
      // Stop camera
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
      navigate("/explanation", { state: { explanation } });
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="Code Scan" showBack />

      <main className="relative flex flex-1 flex-col">
        {/* Camera Preview */}
        <div className="relative flex-1 overflow-hidden bg-foreground/5">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />

          {/* Scan overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-72 rounded-xl border-2 border-primary/60">
                <div className="scan-line h-0.5 w-full bg-primary" />
              </div>
            </div>
          )}

          {!cameraActive && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Camera className="h-12 w-12 animate-pulse" />
                <p className="text-sm">Starting camera...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="rounded-xl bg-card p-6 text-center shadow-lg">
                <Camera className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="mb-4 text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={() => {
                    // Simulate scan without camera
                    setScanning(true);
                    setTimeout(() => {
                      const explanation = getRandomExplanation();
                      navigate("/explanation", { state: { explanation } });
                    }, 1500);
                  }}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Simulate Scan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="safe-area-bottom bg-card px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <p className="mb-3 text-center text-sm text-muted-foreground">
            {scanning ? "Scanning code..." : "Point your camera at the code"}
          </p>
          {scanning && (
            <div className="mx-auto mb-3 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
              <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "60%" }} />
            </div>
          )}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-md transition-all active:scale-95 disabled:opacity-60"
            >
              <Camera className="h-5 w-5" />
              {scanning ? "Scanning..." : "Scan"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScanPage;
