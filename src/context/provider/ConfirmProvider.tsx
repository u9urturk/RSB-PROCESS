import React, { useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    // Animation variants
    const overlayVariants = {
        hidden: { 
            opacity: 0
        },
        visible: { 
            opacity: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut" as const
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.2,
                ease: "easeIn" as const
            }
        }
    };

    const modalVariants = {
        hidden: { 
            opacity: 0,
            scale: 0.8,
            y: -50
        },
        visible: { 
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 30,
                delay: 0.1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: -20,
            transition: {
                duration: 0.2,
                ease: "easeIn" as const
            }
        }
    };

    const buttonVariants = {
        hover: { 
            scale: 1.05,
            transition: { duration: 0.2 }
        },
        tap: { 
            scale: 0.95,
            transition: { duration: 0.1 }
        }
    };

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={handleCancel} // Backdrop click to cancel
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-6 w-96 max-w-[90vw] shadow-2xl border border-gray-100"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking modal
                        >
                            {/* Header with icon */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
                                    <span className="text-2xl">❓</span>
                                </div>
                                <motion.h3 
                                    className="text-xl font-bold text-gray-900"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.3 }}
                                >
                                    {title}
                                </motion.h3>
                            </div>

                            {/* Message */}
                            <motion.p 
                                className="text-gray-600 mb-8 leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                            >
                                {message}
                            </motion.p>

                            {/* Buttons */}
                            <motion.div 
                                className="flex justify-end gap-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.3 }}
                            >
                                <motion.button
                                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors duration-200 border border-gray-200"
                                    onClick={handleCancel}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    {cancelText}
                                </motion.button>
                                <motion.button
                                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                    onClick={handleConfirm}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    {confirmText}
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
};
