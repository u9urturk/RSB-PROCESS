import React, { useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmContextType } from '../../types';

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    
    return (params: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        type?: 'default' | 'danger' | 'warning' | 'info';
        icon?: string | React.ReactNode;
        details?: Array<{ label: string; value: string | number }>;
        warnings?: string[];
        data?: any; // Silinecek item'ın tüm bilgileri
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
    type?: 'default' | 'danger' | 'warning' | 'info';
    icon?: string | React.ReactNode;
    details?: Array<{ label: string; value: string | number }>;
    warnings?: string[];
    data?: any;
    onConfirm: () => void;
    onCancel?: () => void;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [confirmText, setConfirmText] = useState('Evet');
    const [cancelText, setCancelText] = useState('Hayır');
    const [type, setType] = useState<'default' | 'danger' | 'warning' | 'info'>('default');
    const [icon, setIcon] = useState<string | React.ReactNode>('❓');
    const [details, setDetails] = useState<Array<{ label: string; value: string | number }>>([]);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [data, setData] = useState<any>(null);
    const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {});
    const [cancelCallback, setCancelCallback] = useState<(() => void) | undefined>(undefined);

    const showConfirm = useCallback(({
        title,
        message,
        confirmText = 'Evet',
        cancelText = 'Hayır',
        type = 'default',
        icon = '❓',
        details = [],
        warnings = [],
        data = null,
        onConfirm,
        onCancel
    }: ConfirmDialogParams) => {
        setTitle(title);
        setMessage(message);
        setConfirmText(confirmText);
        setCancelText(cancelText);
        setType(type);
        setIcon(icon);
        setDetails(details);
        setWarnings(warnings);
        setData(data);
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
        type,
        icon,
        details,
        warnings,
        data,
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

    // Tip bazında stil ve icon yapılandırması
    const getTypeConfig = () => {
        switch (type) {
            case 'danger':
                return {
                    iconBg: 'bg-gradient-to-r from-red-100 to-red-200',
                    iconColor: 'text-red-600',
                    defaultIcon: '⚠️',
                    buttonStyle: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                };
            case 'warning':
                return {
                    iconBg: 'bg-gradient-to-r from-yellow-100 to-orange-200',
                    iconColor: 'text-yellow-600',
                    defaultIcon: '⚠️',
                    buttonStyle: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700'
                };
            case 'info':
                return {
                    iconBg: 'bg-gradient-to-r from-blue-100 to-blue-200',
                    iconColor: 'text-blue-600',
                    defaultIcon: 'ℹ️',
                    buttonStyle: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                };
            default:
                return {
                    iconBg: 'bg-gradient-to-r from-orange-100 to-red-100',
                    iconColor: 'text-orange-600',
                    defaultIcon: '❓',
                    buttonStyle: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                };
        }
    };

    const typeConfig = getTypeConfig();

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
                        className="modal-overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={handleCancel}
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <motion.div
                            className="modal-content modal-md p-6 border border-gray-100"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with dynamic icon */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-full ${typeConfig.iconBg} flex items-center justify-center`}>
                                    {typeof icon === 'string' ? (
                                        <span className="text-2xl">{icon}</span>
                                    ) : (
                                        icon || <span className="text-2xl">{typeConfig.defaultIcon}</span>
                                    )}
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
                            <motion.div
                                className="mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                            >
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    {message}
                                </p>

                                {/* Data Details */}
                                {data && (
                                    <div className="p-4 bg-gray-50 rounded-xl mb-4">
                                        {data.name && (
                                            <div className="flex items-center gap-3 mb-2">
                                                {data.icon && (
                                                    <div className={`p-2 bg-gradient-to-br ${data.color || 'from-gray-500 to-gray-600'} rounded-lg text-white`}>
                                                        <span className="text-lg">{data.icon}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{data.name}</h4>
                                                    {data.description && (
                                                        <p className="text-sm text-gray-600">{data.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Details */}
                                {details.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {details.map((detail, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{detail.label}:</span>
                                                <span className="font-medium text-gray-800">{detail.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Warnings */}
                                {warnings.length > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <span className="text-yellow-600 text-lg">⚠️</span>
                                            <div>
                                                <h4 className="font-semibold text-yellow-800 mb-2">Dikkat!</h4>
                                                <ul className="space-y-1">
                                                    {warnings.map((warning, index) => (
                                                        <li key={index} className="text-sm text-yellow-700">
                                                            • {warning}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

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
                                    className={`px-6 py-2.5 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${typeConfig.buttonStyle}`}
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
