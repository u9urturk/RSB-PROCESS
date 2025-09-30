import React, { useState, useEffect } from 'react';
import { isValidBase64Image } from '../utils/validation';

interface SafeQRCodeProps {
    qrCode: string;
    alt?: string;
    className?: string;
    onError?: () => void;
}

// 🛡️ Secure QR Code Component
export const SafeQRCode: React.FC<SafeQRCodeProps> = ({ 
    qrCode, 
    alt = 'QR Code', 
    className = 'w-48 h-48 object-contain',
    onError 
}) => {
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const validateAndLoadImage = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Validate base64 format
                if (!isValidBase64Image(qrCode)) {
                    throw new Error('Invalid QR code format');
                }

                // Additional security check - verify image can be loaded
                const img = new Image();
                
                img.onload = () => {
                    setIsValid(true);
                    setIsLoading(false);
                };

                img.onerror = () => {
                    throw new Error('Failed to load QR code image');
                };

                img.src = qrCode;

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMessage);
                setIsValid(false);
                setIsLoading(false);
                
                if (onError) {
                    onError();
                }
                
                console.error('QR Code validation failed:', errorMessage);
            }
        };

        if (qrCode) {
            validateAndLoadImage();
        } else {
            setIsLoading(false);
            setError('No QR code provided');
        }
    }, [qrCode, onError]);

    if (isLoading) {
        return (
            <div className={`${className} flex items-center justify-center bg-gray-100 rounded`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !isValid) {
        return (
            <div className={`${className} flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded text-red-600`}>
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-center">QR kod yüklenemedi</span>
            </div>
        );
    }

    return (
        <img 
            src={qrCode} 
            alt={alt} 
            className={className}
            loading="lazy"
            // Security attributes
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
        />
    );
};
