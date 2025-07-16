import React, { useState, useCallback, createContext, useContext } from 'react';
import { ConfirmContextType } from '../../types';

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    
    // Return a function that returns a promise
    return (params: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            context.showConfirm({
                ...params,
                onConfirm: () => {
                    resolve(true);
                },
                onCancel: () => {
                    resolve(false);
                }
            });
        });
    };
};

interface ConfirmProviderProps {
    children: React.ReactNode;
}

interface ConfirmDialogParams {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [confirmText, setConfirmText] = useState('Evet');
    const [cancelText, setCancelText] = useState('Hayır');
    const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {});
    const [cancelCallback, setCancelCallback] = useState<(() => void) | undefined>(undefined);

    const showConfirm = useCallback(({
        title,
        message,
        confirmText = 'Evet',
        cancelText = 'Hayır',
        onConfirm,
        onCancel
    }: ConfirmDialogParams) => {
        setTitle(title);
        setMessage(message);
        setConfirmText(confirmText);
        setCancelText(cancelText);
        setConfirmCallback(() => onConfirm);
        setCancelCallback(() => onCancel);
        setIsOpen(true);
    }, []);

    const hideConfirm = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleConfirm = useCallback(() => {
        confirmCallback();
        hideConfirm();
    }, [confirmCallback, hideConfirm]);

    const handleCancel = useCallback(() => {
        if (cancelCallback) {
            cancelCallback();
        }
        hideConfirm();
    }, [cancelCallback, hideConfirm]);

    const value: ConfirmContextType = {
        isOpen,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        showConfirm,
        hideConfirm
    };

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-2">{title}</h3>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                onClick={handleCancel}
                            >
                                {cancelText}
                            </button>
                            <button
                                className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded"
                                onClick={handleConfirm}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};
