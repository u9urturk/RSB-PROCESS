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
                bg-black text-white px-4 py-2 rounded-lg
                text-sm font-medium
                animate-fadeInUp
                shadow-lg
                ${position === 'top' ? 'top-6' : ''}
                ${position === 'bottom' ? 'bottom-6' : ''}
                ${className}
            `}
            onClick={onClose}
        >
            {text}
            <div className="w-3 h-3 bg-black rotate-45 absolute left-1/2 -translate-x-1/2 top-full -mt-1"></div>
            <style>{`
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(10px) scale(0.95);}
                    100% { opacity: 1; transform: translateY(0) scale(1);}
                }
            `}</style>
        </div>
    );
};

export default InfoBalloon;
