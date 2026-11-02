import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ScanWritingProps {
  onTextExtracted: (extractedText: string) => void;
  onCancel?: () => void;
}

export const ScanWriting: React.FC<ScanWritingProps> = ({ onTextExtracted }) => {
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Akses kamera langsung tidak tersedia. Anda tetap dapat mengunggah foto tulisan dari galeri perangkat Anda.'
      );
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const toggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setOcrError('Harap pilih berkas foto gambar (JPG, PNG, atau WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleProcessOcr = async () => {
    if (!capturedImage) return;
    setIsProcessingOcr(true);
    setOcrError(null);

    try {
      const response = await fetch('/api/kotari/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memproses gambar');
      }

      const data = await response.json();
      if (!data.text || !data.text.trim()) {
        throw new Error('Tidak ada tulisan yang terbaca dari gambar. Silakan coba foto dengan pencahayaan yang lebih terang.');
      }

      onTextExtracted(data.text);
    } catch (err: any) {
      setOcrError(err.message || 'Terjadi kesalahan saat mengekstraksi teks.');
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setOcrError(null);
    startCamera(facingMode);
  };

  return (
    <div className="relative rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-7 shadow-xl shadow-indigo-950/5 dark:shadow-none transition-all">
      <div className="flex items-center justify-between pb-5 border-b border-slate-200/60 dark:border-slate-800/80">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-500" />
            <span>Pindai Tulisan</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Foto langsung tulisan tangan atau naskah cetak untuk diekstraksi ke Kotak Paragraf.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[38px]"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Unggah Galeri</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Main Viewfinder Frame */}
      <div className="mt-5">
        {capturedImage ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-video max-h-[460px] flex items-center justify-center border border-slate-800 shadow-2xl">
            <img
              src={capturedImage}
              alt="Hasil Bidikan Tulisan"
              className="max-h-full max-w-full object-contain"
            />
            {isProcessingOcr && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 z-10">
                <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold tracking-wide">Mengekstraksi Teks (OCR Vision)...</p>
                <p className="text-xs text-slate-400 mt-1 text-center max-w-xs">
                  Membaca karakter tulisan sesuai kaidah ejaan bahasa Indonesia...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-video max-h-[460px] flex items-center justify-center border border-slate-800 shadow-inner">
            {streamActive ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Reticle guide corners */}
                <div className="pointer-events-none absolute inset-6 sm:inset-12 border border-white/20 rounded-xl flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-semibold text-white/90 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs">
                    Posisikan teks tulisan di dalam bingkai
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={toggleCamera}
                    title="Ganti Kamera Depan/Belakang"
                    className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center max-w-sm flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-white">Kamera Belum Aktif</h3>
                <p className="text-xs text-slate-400 mt-2">
                  {cameraError || 'Aktifkan izin kamera pada browser untuk memindai dokumen, atau pilih opsi unggah foto.'}
                </p>
                <div className="flex gap-2.5 mt-5">
                  <button
                    onClick={() => startCamera(facingMode)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    Izinkan Kamera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    Pilih Berkas Foto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {ocrError && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{ocrError}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-6 flex items-center justify-center gap-3">
        {capturedImage ? (
          <>
            <button
              onClick={handleRetake}
              disabled={isProcessingOcr}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
            >
              Foto Ulang
            </button>
            <button
              onClick={handleProcessOcr}
              disabled={isProcessingOcr}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all min-h-[44px] hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ekstraksi Teks ke Kotak Paragraf</span>
            </button>
          </>
        ) : (
          streamActive && (
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full border-4 border-white dark:border-slate-800 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center transition-transform active:scale-90"
              title="Ambil Foto Tulisan"
            >
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );
};
