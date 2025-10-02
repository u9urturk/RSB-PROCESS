import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Truck } from 'lucide-react';

interface Supplier {
    id: number;
    name: string;
    category: string;
    phone: string;
    email: string;
    rating: number;
    status: 'Aktif' | 'Pasif' | 'Beklemede';
    address: string;
    contactPerson: string;
    taxNumber: string;
    paymentTerms: string;
    deliveryTime: number;
    minimumOrder: number;
    products: string[];
    contractStartDate: string;
    contractEndDate: string;
    totalOrders: number;
    monthlyDeliveries: number;
}

interface SupplierDeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    supplier: Supplier | null;
}

const SupplierDeleteConfirmationModal: React.FC<SupplierDeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    supplier
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleConfirm = () => {
        onConfirm();
        handleClose();
    };

    if (!isOpen || !supplier) return null;

    return (
        <div
            className={`fixed inset-0  flex items-center justify-center z-50 p-4
                ${isVisible ? 'backdrop-blur-xs bg-opacity-50' : 'backdrop-blur-none bg-opacity-0'} transition-all duration-300 ease-out`}
            onClick={handleBackdropClick}
        >
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Tedarikçi Sil</h2>
                            <p className="text-gray-600 text-sm">Bu işlem geri alınamaz</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                                <Truck size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{supplier.name}</h3>
                                <p className="text-sm text-gray-600">{supplier.category}</p>
                                <p className="text-xs text-gray-500">{supplier.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-700 mb-4">
                            <strong>{supplier.name}</strong> tedarikçisini silmek istediğinizden emin misiniz?
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={20} className="text-red-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-800 mb-1">Dikkat!</h4>
                                    <ul className="text-sm text-red-700 space-y-1">
                                        <li>• Bu tedarikçiye ait tüm geçmiş kayıtlar silinecek</li>
                                        <li>• Aktif siparişler iptal edilecek</li>
                                        <li>• Sözleşme bilgileri kalıcı olarak kaybolacak</li>
                                        <li>• Bu işlem geri alınamaz</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tedarikçi İstatistikleri */}
                    {supplier.totalOrders > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-medium text-yellow-800 mb-2">Tedarikçi İstatistikleri</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-yellow-700">Toplam Sipariş:</span>
                                    <span className="font-medium ml-2">{supplier.totalOrders}</span>
                                </div>
                                <div>
                                    <span className="text-yellow-700">Aylık Teslimat:</span>
                                    <span className="font-medium ml-2">{supplier.monthlyDeliveries}</span>
                                </div>
                                <div>
                                    <span className="text-yellow-700">Değerlendirme:</span>
                                    <span className="font-medium ml-2">{supplier.rating}/5</span>
                                </div>
                                <div>
                                    <span className="text-yellow-700">Durum:</span>
                                    <span className="font-medium ml-2">{supplier.status}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                        >
                            Evet, Sil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDeleteConfirmationModal;