import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface StockType {
    id: number;
    name: string;
    description: string;
    color: string;
    icon: string;
    itemCount: number;
    examples: string[];
}

interface DeleteConfirmationModalProps {
    open: boolean;
    stockType: StockType | null;
    onClose: () => void;
    onConfirm: (id: number) => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
    open, 
    stockType, 
    onClose, 
    onConfirm 
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    // Animasyon kontrolü
    useEffect(() => {
        if (open) {
            setShouldRender(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => setShouldRender(false), 200);
        }
    }, [open]);

    const handleConfirm = () => {
        if (stockType) {
            onConfirm(stockType.id);
        }
        handleClose();
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    if (!shouldRender || !stockType) return null;

    return (
        <div 
            className={`fixed inset-0  flex items-center justify-center z-50 p-4 transition-all duration-200 ease-out ${
                isAnimating 
                    ? 'bg-opacity-50 backdrop-blur-sm' 
                    : 'bg-opacity-0 backdrop-blur-none'
            }`}
            onClick={handleClose}
        >
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-200 ease-out transform ${
                    isAnimating 
                        ? 'scale-100 opacity-100 translate-y-0' 
                        : 'scale-95 opacity-0 translate-y-4'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-xl">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Stok Türünü Sil</h2>
                            <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
                        <div className={`p-2 bg-gradient-to-br ${stockType.color} rounded-lg text-white`}>
                            <span className="text-lg">{stockType.icon}</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">{stockType.name}</h3>
                            <p className="text-sm text-gray-600">{stockType.description}</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-yellow-800 mb-1">Dikkat!</h4>
                                <p className="text-sm text-yellow-700">
                                    <strong>"{stockType.name}"</strong> stok türünü silmek üzeresiniz. 
                                    Bu stok türüne ait <strong>{stockType.itemCount} adet</strong> ürün bulunmaktadır.
                                </p>
                                <p className="text-sm text-yellow-700 mt-2">
                                    Bu işlem geri alınamaz ve tüm ilişkili veriler silinecektir.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            <strong>Silinecek örnek ürünler:</strong>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {stockType.examples.map((example, idx) => (
                                <span 
                                    key={idx} 
                                    className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs"
                                >
                                    {example}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        Evet, Sil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;