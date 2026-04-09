import { useRef, useEffect, useState, useCallback } from 'react';
import { X, Camera, Loader2, AlertCircle, ZoomIn, Check } from 'lucide-react';
import { analyzeReceipt, ReceiptData } from '../services/ollamaService';

interface ScanningViewProps {
  onCancel: () => void;
  onResult: (data: ReceiptData, imageDataUrl: string) => void;
}

type Phase = 'camera' | 'capturing' | 'analyzing' | 'done' | 'error';

export default function ScanningView({ onCancel, onResult }: ScanningViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Start camera
  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' }, // prefer rear camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e: any) {
        if (!cancelled) {
          setErrorMsg(
            e?.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access and try again.'
              : `Could not access camera: ${e?.message ?? e}`
          );
          setPhase('error');
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setPhase('capturing');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();

    // Small delay so user sees the captured frame
    await new Promise(r => setTimeout(r, 400));
    setPhase('analyzing');

    // Animate progress bar
    let progress = 5;
    const interval = setInterval(() => {
      progress += Math.random() * 12;
      if (progress > 90) progress = 90;
      setAnalysisProgress(Math.round(progress));
    }, 300);

    try {
      // Strip the data URL prefix to get raw base64
      const base64 = dataUrl.split(',')[1];
      const result = await analyzeReceipt(base64, 'image/jpeg');
      clearInterval(interval);
      setAnalysisProgress(100);
      setPhase('done');
      // Brief pause to show 100% then hand off
      await new Promise(r => setTimeout(r, 600));
      onResult(result, dataUrl);
    } catch (e: any) {
      clearInterval(interval);
      setErrorMsg(e?.message ?? 'Analysis failed. Please try again.');
      setPhase('error');
    }
  }, [stopCamera, onResult]);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 pt-12 pb-4 bg-gradient-to-b from-black/70 to-transparent">
        <button
          onClick={() => { stopCamera(); onCancel(); }}
          className="flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-white hover:bg-white/25 transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-white text-lg font-bold tracking-tight drop-shadow">
          {phase === 'camera' ? 'Scan Receipt' : phase === 'analyzing' ? 'Analyzing...' : phase === 'done' ? 'Done!' : 'Error'}
        </h2>
        <div className="w-10" />
      </div>

      {/* Camera / Captured image */}
      <div className="relative flex-1 flex items-center justify-center bg-black">
        {/* Live camera feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${phase === 'camera' ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Captured still frame */}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured receipt"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Viewfinder overlay (only when camera is live) */}
        {phase === 'camera' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Darkened border */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Receipt frame cutout */}
            <div
              className="relative z-10 w-[78%] aspect-[3/4] rounded-2xl"
              style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }}
            >
              {/* Corner markers */}
              {[['top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl', ''],
                ['top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl', ''],
                ['bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl', ''],
                ['bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl', ''],
              ].map(([cls], i) => (
                <div key={i} className={`absolute ${cls} border-white/80 w-8 h-8`} />
              ))}
              {/* Scanning line animation */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="animate-[scanline_2.5s_ease-in-out_infinite] absolute left-0 right-0">
                  <div className="h-[2px] bg-blue-400 shadow-[0_0_16px_4px_rgba(96,165,250,0.9)]" />
                  <div className="h-16 bg-gradient-to-b from-blue-400/25 to-transparent" />
                </div>
              </div>
            </div>
            <p className="absolute bottom-32 text-white/80 text-sm font-medium text-center px-6 drop-shadow">
              Point camera at the <span className="text-blue-300 font-bold">total amount</span> on the receipt
            </p>
          </div>
        )}

        {/* Analyzing overlay */}
        {phase === 'analyzing' && capturedImage && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-400/40">
                <ZoomIn size={28} className="text-blue-300" />
              </div>
              <p className="text-white font-semibold text-lg">Reading Receipt...</p>
              <p className="text-white/60 text-sm">Gemini AI is extracting the total</p>
            </div>
            {/* Progress bar */}
            <div className="w-48 h-1.5 rounded-full bg-white/20 overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-300 ease-out"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <p className="text-white/50 text-xs">{analysisProgress}%</p>
          </div>
        )}

        {/* Done overlay */}
        {phase === 'done' && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-400">
              <Check size={30} className="text-green-400" />
            </div>
            <p className="text-white font-semibold text-lg">Receipt Scanned!</p>
          </div>
        )}

        {/* Error overlay */}
        {phase === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 bg-black">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-400/50">
              <AlertCircle size={30} className="text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg mb-2">Scan Failed</p>
              <p className="text-white/60 text-sm leading-relaxed">{errorMsg}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setCapturedImage(null); setErrorMsg(''); setPhase('camera'); }}
                className="px-5 py-2.5 rounded-full bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => { stopCamera(); onCancel(); }}
                className="px-5 py-2.5 rounded-full bg-white/15 text-white font-semibold text-sm hover:bg-white/25 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {phase === 'camera' && (
        <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center gap-4 pb-12 pt-6 bg-gradient-to-t from-black/80 to-transparent">
          <button
            onClick={captureAndAnalyze}
            className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full border-4 border-slate-300 flex items-center justify-center">
              <Camera size={26} className="text-slate-700" />
            </div>
          </button>
          <p className="text-white/60 text-xs">Tap to capture</p>
        </div>
      )}

      {/* Capturing flash effect */}
      {phase === 'capturing' && (
        <div className="absolute inset-0 z-50 bg-white animate-[flash_0.3s_ease-out_forwards] pointer-events-none" />
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scanline {
          0%, 100% { top: 5%; }
          50% { top: 80%; }
        }
        @keyframes flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
