"use client";

import { Camera, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "./locale-provider";
import { Button } from "./ui/button";

export function QrScanner({
  title,
  description,
  onDetected,
  onClose,
  notice,
  processingLabel,
  closeOnDetected = true
}: {
  title: string;
  description: string;
  onDetected: (value: string) => boolean | void | Promise<boolean | void>;
  onClose?: () => void;
  notice?: string | null;
  processingLabel?: string;
  closeOnDetected?: boolean;
}) {
  const { dictionary } = useLocale();
  const qrCopy = dictionary.qrScanner;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSupport() {
      const hasDetector =
        typeof window !== "undefined" &&
        "BarcodeDetector" in window &&
        typeof BarcodeDetector.getSupportedFormats === "function";

      if (!hasDetector) {
        setIsSupported(false);
        return;
      }

      try {
        const formats = await BarcodeDetector.getSupportedFormats();
        setIsSupported(formats.includes("qr_code"));
      } catch {
        setIsSupported(false);
      }
    }

    void checkSupport();
  }, []);

  const stopCamera = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    detectorRef.current = null;
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (!onClose) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        stopCamera();
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, stopCamera]);

  const startCamera = useCallback(async () => {
    setIsProcessing(false);

    if (!isSupported) {
      setError(qrCopy.unsupported);
      return;
    }

    if (
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      window.location.hostname !== "localhost"
    ) {
      setError(qrCopy.cameraSecureContext);
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }
        }
      });

      streamRef.current = stream;
      detectorRef.current = new BarcodeDetector({ formats: ["qr_code"] });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      intervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || !detectorRef.current) return;

        try {
          const results = await detectorRef.current.detect(videoRef.current);
          const rawValue = results[0]?.rawValue;
          if (rawValue) {
            setIsProcessing(true);
            stopCamera();
            const nextAction = await onDetected(rawValue);

            if (nextAction === false) {
              setIsProcessing(false);
              window.setTimeout(() => {
                void startCamera();
              }, 240);
              return;
            }

            if (closeOnDetected) {
              onClose?.();
            }
          }
        } catch {
          setIsProcessing(false);
          // Ignore transient camera detection failures.
        }
      }, 700);

      setIsActive(true);
    } catch (nextError) {
      stopCamera();
      setError(resolveCameraError(nextError, qrCopy));
    }
  }, [
    isSupported,
    closeOnDetected,
    onClose,
    onDetected,
    qrCopy,
    stopCamera
  ]);

  return (
    <div
      className="fixed inset-0 z-30 flex min-h-[100dvh] flex-col bg-panel-soft px-5 py-6 md:px-8 md:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
      aria-describedby="qr-scanner-description"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-xl space-y-2">
          <h2
            id="qr-scanner-title"
            className="text-2xl font-semibold text-ink md:text-3xl"
          >
            {title}
          </h2>
          <p id="qr-scanner-description" className="text-sm leading-7 text-muted">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose?.();
          }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-panel text-ink-soft shadow-card transition hover:border-accent-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
          aria-label={dictionary.actions.closeScanner}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-6">
        <div className="relative flex-1 overflow-hidden rounded-lg border border-line bg-accent-soft">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            playsInline
          />

          {!isActive ? (
            <div className="absolute inset-0 flex items-center justify-center bg-accent-soft px-6 text-center">
              <div className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-panel text-accent shadow-card">
                  <Camera className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm text-muted" role={error ? "alert" : "status"}>
                  {isProcessing
                    ? processingLabel || dictionary.qrScanner.ready
                    : error || notice || dictionary.qrScanner.ready}
                </p>
                {isProcessing ? (
                  <div
                    className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent-border border-t-ink"
                    aria-hidden="true"
                  />
                ) : (
                  <Button onClick={() => void startCamera()}>
                    {qrCopy.openCamera}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 border-[12px] border-white/20" />
          )}
        </div>

        {notice && isActive ? (
          <p className="pt-4 text-sm text-danger" role="alert">
            {notice}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function resolveCameraError(
  error: unknown,
  copy: {
    cameraPermissionDenied: string;
    cameraSecureContext: string;
    cameraNotFound: string;
    cameraBusy: string;
    cameraOpenError: string;
  }
) {
  if (!(error instanceof DOMException)) {
    return copy.cameraOpenError;
  }

  if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
    return copy.cameraPermissionDenied;
  }

  if (error.name === "SecurityError") {
    return copy.cameraSecureContext;
  }

  if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
    return copy.cameraNotFound;
  }

  if (error.name === "NotReadableError" || error.name === "TrackStartError") {
    return copy.cameraBusy;
  }

  return copy.cameraOpenError;
}
