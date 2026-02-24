import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera } from "lucide-react";
import AppHeader from "@/components/AppHeader";

/**
 * Camera preview + frame capture.
 * - Starts the environment-facing camera on mount.
 * - Captures a frame to an offscreen canvas when user taps Scan.
 *
 * Props:
 * - onScan(canvas): async handler that runs capture + analysis
 * - scanError: string | null
 * - onClearError(): clears scanError
 * - onCameraReady(): called when camera becomes active
 * - onScanStart(): called when Scan begins
 * - onHelp(): invoked when Help button is pressed
 * - explanationText?: string | null - explanation rendered below camera
 */
export default function CameraView({
  onScan,
  scanError,
  onClearError,
  onCameraReady,
  onScanStart,
  onHelp,
  explanationText = null,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const statusText = useMemo(() => {
    if (scanError) return scanError;
    if (scanning) return "Scanning code...";
    return "Point your camera at the code";
  }, [scanning, scanError]);

  const stopCamera = useCallback(() => {
    const video = videoRef.current;
    if (!video?.srcObject) return;
    const tracks = video.srcObject.getTracks?.() ?? [];
    tracks.forEach((t) => t.stop());
    video.srcObject = null;
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;

      // iOS/Safari often needs an explicit play().
      await video.play().catch(() => {});

      setCameraActive(true);
      onCameraReady?.();
    } catch {
      setCameraError("Unable to access camera. Please grant permission or try on a mobile device.");
      setCameraActive(false);
    }
  }, [onCameraReady]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const captureFrameToCanvas = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, w, h);
    return canvas;
  }, []);

  const handleScanClick = useCallback(async () => {
    if (!onScan) return;

    onClearError?.();
    onScanStart?.();
    setScanning(true);

    try {
      const canvas = captureFrameToCanvas();
      if (!canvas) throw new Error("capture_failed");
      await onScan(canvas);
    } finally {
      setScanning(false);
    }
  }, [captureFrameToCanvas, onClearError, onScan, onScanStart]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
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

          {/* Hidden canvas used for frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-72 rounded-xl border-2 border-primary/60">
                <div className="scan-line h-0.5 w-full bg-primary" />
              </div>
            </div>
          )}

          {!cameraActive && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Camera className="h-12 w-12 animate-pulse" />
                <p className="text-sm">Starting camera...</p>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="rounded-xl bg-card p-6 text-center shadow-lg">
                <Camera className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="mb-4 text-sm text-muted-foreground">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Explanation below camera */}
        {explanationText && (
          <section className="px-5 py-4">
            <div className="rounded-xl bg-card p-4 shadow-md">
              <h2 className="mb-2 text-base font-bold text-foreground">Explanation</h2>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {explanationText}
              </p>
            </div>
          </section>
        )}

        {/* Bottom Bar */}
        <div className="safe-area-bottom relative z-20 bg-card px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <p className="mb-3 text-center text-sm text-muted-foreground">{statusText}</p>
          {scanning && (
            <div className="mx-auto mb-3 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
              <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "60%" }} />
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onHelp?.()}
              className="rounded-2xl border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition-all active:scale-95"
            >
              Help
            </button>
            <button
              onClick={handleScanClick}
              disabled={scanning || !cameraActive}
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all active:scale-95 disabled:opacity-60"
            >
              <Camera className="h-5 w-5" />
              {scanning ? "Scanning..." : "Scan"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

