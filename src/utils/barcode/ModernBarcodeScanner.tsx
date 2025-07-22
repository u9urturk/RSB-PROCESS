import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { X, Zap, ZapOff, RotateCcw } from "lucide-react";
import "./modern-scanner.css";

interface ModernBarcodeScannerProps {
    onDetected: (result: string) => void;
    onCancel?: () => void;
    onClose?: () => void;
    facingMode?: "environment" | "user";
    className?: string;
    showTorch?: boolean;
    showCancel?: boolean;
    autoStart?: boolean;
    theme?: "light" | "dark";
}

// Optimized Audio Manager
class OptimizedAudioManager {
    private static instance: OptimizedAudioManager;
    private audioContext: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    
    public static getInstance(): OptimizedAudioManager {
        if (!OptimizedAudioManager.instance) {
            OptimizedAudioManager.instance = new OptimizedAudioManager();
        }
        return OptimizedAudioManager.instance;
    }
    
    private initAudioContext(): void {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
        }
    }
    
    public playSuccess(): void {
        try {
            this.initAudioContext();
            if (!this.audioContext || !this.gainNode) return;
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
            
            this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            this.gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.connect(this.gainNode);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
    
    public cleanup(): void {
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
            this.gainNode = null;
        }
    }
}

// Optimized Turkey barcode validation
function isValidBarcode(barcode: string): boolean {
    if (!barcode || typeof barcode !== 'string') return false;
    
    const clean = barcode.trim();
    
    // EAN-13 (13 digits)
    if (/^\d{13}$/.test(clean)) {
        return validateEAN13(clean);
    }
    
    // EAN-8 (8 digits)
    if (/^\d{8}$/.test(clean)) {
        return validateEAN8(clean);
    }
    
    // UPC-A (12 digits)
    if (/^\d{12}$/.test(clean)) {
        return validateUPCA(clean);
    }
    
    // Code 128/39 (variable length)
    if (clean.length >= 4 && clean.length <= 48) {
        return /^[\x20-\x7E]+$/.test(clean);
    }
    
    return false;
}

function validateEAN13(barcode: string): boolean {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
    }
    return (10 - (sum % 10)) % 10 === parseInt(barcode[12]);
}

function validateEAN8(barcode: string): boolean {
    let sum = 0;
    for (let i = 0; i < 7; i++) {
        sum += parseInt(barcode[i]) * (i % 2 === 0 ? 3 : 1);
    }
    return (10 - (sum % 10)) % 10 === parseInt(barcode[7]);
}

function validateUPCA(barcode: string): boolean {
    let sum = 0;
    for (let i = 0; i < 11; i++) {
        sum += parseInt(barcode[i]) * (i % 2 === 0 ? 3 : 1);
    }
    return (10 - (sum % 10)) % 10 === parseInt(barcode[11]);
}

export default function ModernBarcodeScanner({
    onDetected,
    onCancel,
    onClose,
    facingMode = "environment",
    className = "rounded-md shadow-lg",
    showTorch = true,
    showCancel = true,
    autoStart = true,
    theme = "dark"
}: ModernBarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReader = useRef<BrowserMultiFormatReader | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);
    const audioManager = useRef<OptimizedAudioManager>(OptimizedAudioManager.getInstance());
    const isMountedRef = useRef<boolean>(true);
    
    const [isScanning, setIsScanning] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [torchSupported, setTorchSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [detectionSuccess, setDetectionSuccess] = useState(false);
    
    // Optimized camera constraints
    const cameraConstraints = useMemo(() => ({
        video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 }
        }
    }), [facingMode]);
    
    // Cleanup function
    const cleanup = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        
        if (codeReader.current) {
            try {
                // ZXing cleanup - MinimalBarcodeScanner approach
                if (videoRef.current && videoRef.current.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                    videoRef.current.srcObject = null;
                }
            } catch (e) {
                console.warn('Scanner cleanup failed:', e);
            }
            codeReader.current = null;
        }
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        setIsScanning(false);
        setIsReady(false);
        setTorchEnabled(false);
        setTorchSupported(false);
        setError(null);
        setDetectionSuccess(false);
    }, []);
    
    // Torch control
    const toggleTorch = useCallback(async () => {
        if (!streamRef.current) return;
        
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (!videoTrack) return;
        
        try {
            await videoTrack.applyConstraints({
                advanced: [{ torch: !torchEnabled } as any]
            });
            setTorchEnabled(!torchEnabled);
        } catch (err) {
            console.warn('Torch toggle failed:', err);
        }
    }, [torchEnabled]);
    
    // Check torch support
    const checkTorchSupport = useCallback(() => {
        if (!streamRef.current) return;
        
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (!videoTrack) return;
        
        try {
            const capabilities = videoTrack.getCapabilities() as any;
            setTorchSupported(!!capabilities.torch);
        } catch (err) {
            console.warn('Torch support check failed:', err);
        }
    }, []);
    
    // Start camera
    const startCamera = useCallback(async () => {
        try {
            setError(null);
            
            const stream = await navigator.mediaDevices.getUserMedia(cameraConstraints);
            
            if (!isMountedRef.current) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }
            
            streamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
                
                // Simple approach like MinimalBarcodeScanner
                videoRef.current.addEventListener('loadedmetadata', () => {
                    videoRef.current?.play();
                    setIsReady(true);
                    checkTorchSupport();
                });
            }
        } catch (err: any) {
            setError(`Kamera başlatılamadı: ${err.message}`);
        }
    }, [cameraConstraints, checkTorchSupport]);
    
    // Start scanning
    const startScanning = useCallback(async () => {
        if (!isReady || !videoRef.current) return;
        
        try {
            setError(null);
            
            codeReader.current = new BrowserMultiFormatReader();
            setIsScanning(true);
            
            codeReader.current.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                (result, error) => {
                    if (error) return;
                    
                    if (result && isMountedRef.current) {
                        const barcodeText = result.getText();
                        
                        if (isValidBarcode(barcodeText)) {
                            setDetectionSuccess(true);
                            setIsScanning(false);
                            
                            audioManager.current.playSuccess();
                            onDetected(barcodeText);
                            
                            // Auto cleanup after detection
                            setTimeout(() => {
                                if (isMountedRef.current) {
                                    cleanup();
                                }
                            }, 1000);
                        }
                    }
                }
            );
        } catch (err: any) {
            setError(`Tarama başlatılamadı: ${err.message}`);
        }
    }, [isReady, onDetected, cleanup]);
    
    // Handle cancel
    const handleCancel = useCallback(() => {
        cleanup();
        onCancel?.();
        onClose?.();
    }, [cleanup, onCancel, onClose]);
    
    // Handle retry
    const handleRetry = useCallback(() => {
        cleanup();
        setTimeout(() => {
            if (isMountedRef.current) {
                startCamera();
            }
        }, 100);
    }, [cleanup, startCamera]);
    
    // Effects
    useEffect(() => {
        isMountedRef.current = true;
        
        if (autoStart) {
            startCamera();
        }
        
        return () => {
            isMountedRef.current = false;
            cleanup();
        };
    }, [autoStart, startCamera, cleanup]);
    
    // Auto-start scanning when ready
    useEffect(() => {
        if (isReady && autoStart) {
            startScanning();
        }
    }, [isReady, autoStart, startScanning]);
    
    useEffect(() => {
        return () => {
            audioManager.current.cleanup();
        };
    }, []);
    
    if (error) {
        return (
            <div className={`modern-scanner-container ${theme} ${className}`}>
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <div className="error-message">{error}</div>
                    <button onClick={handleRetry} className="retry-button">
                        <RotateCcw size={16} />
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`modern-scanner-container  ${theme} ${className}`}>
            <div className="scanner-header">
                {/* <div className="scanner-title">
                    <Scan size={20} />
                    <span>Barkod Tarayıcı</span>
                </div> */}
                
                <div className="scanner-controls">
                    {showTorch && torchSupported && (
                        <button
                            onClick={toggleTorch}
                            className={`control-button ${torchEnabled ? 'active' : ''}`}
                            title={torchEnabled ? 'Flaşı Kapat' : 'Flaşı Aç'}
                        >
                            {torchEnabled ? <Zap size={18} /> : <ZapOff size={18} />}
                        </button>
                    )}
{/*                     
                    {showCancel && (
                        <button
                            onClick={handleCancel}
                            className="control-button cancel"
                            title="İptal"
                        >
                            <X size={18} />
                        </button>
                    )} */}
                </div>
            </div>
            
            <div className="scanner-viewport">
                <video
                    ref={videoRef}
                    className="scanner-video"
                    autoPlay
                    muted
                    playsInline
                />
                
                {isReady && (
                    <div className="scanner-overlay">
                        <div className="scan-region">
                            <div className="scan-corners">
                                <div className="corner top-left"></div>
                                <div className="corner top-right"></div>
                                <div className="corner bottom-left"></div>
                                <div className="corner bottom-right"></div>
                            </div>
                            
                            {isScanning && (
                                <div className="scan-line"></div>
                            )}
                        </div>
                    </div>
                )}
                
                {!isReady && (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <span>Kamera hazırlanıyor...</span>
                    </div>
                )}
                
                {detectionSuccess && (
                    <div className="success-state">
                        <div className="success-icon">✅</div>
                        <span>Barkod başarıyla okundu!</span>
                    </div>
                )}
            </div>
            
            <div className="scanner-footer">
                <div className="scan-instructions">
                    <div className="instruction">Barkodu kırmızı çerçeve içine hizalayın</div>
                    <div className="formats">EAN-13 • EAN-8 • UPC-A • Code 128 • Code 39</div>
                </div>
            </div>
        </div>
    );
}
