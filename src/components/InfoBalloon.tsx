import React, { useEffect } from "react";
import { InfoBalloonProps } from "../types";

const InfoBalloon: React.FC<InfoBalloonProps> = ({
    show,
    text,
    onClose,
    position = 'top',
    className = ''
}) => {
    useEffect(() => {
        if (show && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div
            className={`
                fixed transform -translate-x-1/2 left-1/2
                backdrop-blur-md bg-white/70 text-gray-900 px-6 py-4 rounded-2xl
                text-base font-semibold flex items-center gap-3
                animate-modernFadeInUp
                shadow-2xl border border-gray-200
                ${position === 'top' ? 'top-8' : ''}
                ${position === 'bottom' ? 'bottom-8' : ''}
                ${className}
            `}
            style={{ zIndex: 9999, minWidth: '260px', maxWidth: '90vw' }}
            onClick={onClose}
        >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 shadow-md mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
            </span>
            <span>{text}</span>
            <style>{`
                @keyframes modernFadeInUp {
                    0% { opacity: 0; transform: translateY(20px) scale(0.95);}
                    100% { opacity: 1; transform: translateY(0) scale(1);}
                }
            `}</style>
        </div>
    );
};

export default InfoBalloon;
