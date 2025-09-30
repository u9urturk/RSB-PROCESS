import React from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
    React.useEffect(() => {
        if (!open) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    if (!open) return null;
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40 "
            onClick={handleBackdropClick}
            style={{ backdropFilter: 'blur(3px)' }}
        >
            <div className="bg-white rounded-lg shadow-lg relative min-w-[300px]" onClick={e => e.stopPropagation()}>
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
                    onClick={onClose}
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
