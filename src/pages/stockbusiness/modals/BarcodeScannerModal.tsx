import { useState, useCallback, useEffect } from "react";
import { X, Camera, ScanLine, Search, AlertCircle } from "lucide-react";
import ModernBarcodeScanner from "../../../utils/barcode/ModernBarcodeScanner";

interface BarcodeScannerModalProps {
    open: boolean;
    onClose: () => void;
    onResult: (barcode: string) => void;
}

export default function BarcodeScannerModal({ open, onClose, onResult }: BarcodeScannerModalProps) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [permissionChecked, setPermissionChecked] = useState(false);

    const handleDetected = useCallback((result: string) => {

        // Single scan mode - immediately set result
        setScanResult(result);
        onResult(result);

        // 2 saniye sonra modal'ı kapat
        setTimeout(() => {
            handleClose();
        }, 2000);
    }, [onResult]);

    const handleClose = useCallback(() => {
        console.log('BarcodeScannerModal - Closing modal and cleaning up camera...');


        // State'i reset et (permission durumunu koruyoruz)
        setScanResult(null);
        setError(null);

        // Kısa bir gecikme ile modal'ı kapat (camera cleanup için)
        setTimeout(() => {
            onClose();
        }, 100);
    }, [onClose]);

    const handleCancel = useCallback(() => {
        console.log('BarcodeScannerModal - Scan cancelled by user');
        handleClose();
    }, [handleClose]);

    const handleRetry = useCallback(() => {
        setScanResult(null);
        setError(null);

        // Kısa bir gecikme ile scanner'ı tekrar aç
        // slight delay if needed for re-init
        setTimeout(() => {
            /* re-init placeholder */
        }, 100);
    }, []);

    const requestCameraPermission = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasPermission(true);
            setPermissionChecked(true);
            // ready to render scanner
            // Stream'i hemen kapat, ModernBarcodeScanner kendi stream'ini açacak
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            setHasPermission(false);
            setPermissionChecked(true);
            setError("Kamera erişim izni verilmedi. Lütfen tarayıcı ayarlarınızdan kamera erişimine izin verin.");
        }
    }, []);

    // Kamera izni durumunu kontrol et
    const checkCameraPermission = useCallback(async () => {
        try {
            // Önceden izin verildiyse direkt tarama ekranına geç
            if (hasPermission === true && permissionChecked) {
                // ready to render scanner
                return;
            }

            // Navigator.permissions API'si destekleniyorsa kontrol et
            if (navigator.permissions) {
                const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
                if (permissionStatus.state === 'granted') {
                    setHasPermission(true);
                    setPermissionChecked(true);
                    // ready to render scanner
                    return;
                } else if (permissionStatus.state === 'denied') {
                    setHasPermission(false);
                    setPermissionChecked(true);
                    setError("Kamera erişim izni reddedildi. Lütfen tarayıcı ayarlarınızdan kamera erişimine izin verin.");
                    return;
                }
            }

            // Permissions API desteklenmiyorsa veya prompt durumundaysa izin iste
            if (!permissionChecked) {
                await requestCameraPermission();
            }
        } catch (err) {
            console.warn('Permission check failed:', err);
            if (!permissionChecked) {
                await requestCameraPermission();
            }
        }
    }, [hasPermission, permissionChecked, requestCameraPermission]);

    // Modal açıldığında kamera izni kontrolü yap
    useEffect(() => {
        if (open) {
            // reset visual states
            setError(null);
            setScanResult(null);

            // Kamera izni kontrolü yap
            checkCameraPermission();
        }
    }, [open, checkCameraPermission]);

    const [render, setRender] = useState(open);
    useEffect(() => { if (open) setRender(true); }, [open]);
    useEffect(() => { if (!open && render) { const t = setTimeout(() => setRender(false), 200); return () => clearTimeout(t);} }, [open, render]);
    if (!render) return null;

    const overlayCls = `fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-200 ${open ? 'bg-black/50 opacity-100' : 'bg-black/0 opacity-0 pointer-events-none'}`;
    const panelCls = `bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl transition-all duration-200 ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`;
    return (
        <div className={overlayCls}>
            <div className={panelCls}>
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <ScanLine size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Barkod Tarayıcı</h2>
                                <p className="text-orange-100 text-sm">Ürün barkodunu tarayın</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {hasPermission === null && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Camera className="text-orange-600" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Kamera Hazırlanıyor
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Kamera erişimi kontrol ediliyor ve tarayıcı hazırlanıyor.
                            </p>
                            <button
                                onClick={checkCameraPermission}
                                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                            >
                                Kamerayı Başlat
                            </button>
                        </div>
                    )}

                    {hasPermission === false && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="text-red-600" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Kamera Erişimi Reddedildi
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {error || "Kamera erişim izni verilmedi. Lütfen tarayıcı ayarlarınızdan izin verin."}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={checkCameraPermission}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-semibold"
                                >
                                    Tekrar Dene
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    )}

                    {hasPermission === true && (
                        <div>
                            {scanResult ? (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="text-green-600" size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        Barkod Okundu!
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                        <p className="text-sm text-gray-600 mb-1">Okunan Barkod:</p>
                                        <p className="text-lg font-mono font-semibold text-gray-800">
                                            {scanResult}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Arama otomatik olarak başlatılacak...
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4">
                                        <ModernBarcodeScanner
                                            onDetected={handleDetected}
                                            onCancel={handleCancel}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="text-center">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleRetry}
                                                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold"
                                            >
                                                Yeniden Tara
                                            </button>
                                            <button
                                                onClick={handleClose}
                                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
