import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Building2, MapPin, Users } from 'lucide-react';

interface Warehouse {
    id: number;
    name: string;
    location: string;
    capacity: string;
    capacityPercentage: number;
    status: 'Aktif' | 'Pasif' | 'Bakım';
    manager: string;
    staffCount: number;
    area: number;
    temperature?: number;
    warehouseType: 'Normal' | 'Soğuk' | 'Dondurucu' | 'Kuru';
}

interface WarehouseDeleteConfirmationModalProps {
    open: boolean;
    warehouse: Warehouse | null;
    onClose: () => void;
    onConfirm: (id: number) => void;
}

const WarehouseDeleteConfirmationModal: React.FC<WarehouseDeleteConfirmationModalProps> = ({ 
    open, 
    warehouse, 
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
        if (warehouse) {
            onConfirm(warehouse.id);
        }
        handleClose();
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    if (!shouldRender || !warehouse) return null;

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
                className={`bg-white rounded-2xl overflow-y-scroll max-h-[75%] shadow-2xl w-full max-w-lg transition-all duration-200 ease-out transform ${
                    isAnimating 
                        ? 'scale-100 opacity-100 translate-y-0' 
                        : 'scale-95 opacity-0 translate-y-4'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center sticky top-0 bg-white z-10 justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-xl">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Depoyu Sil</h2>
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
                    {/* Warehouse Info */}
                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                            <Building2 size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-800">{warehouse.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    warehouse.warehouseType === 'Soğuk' ? 'bg-blue-100 text-blue-700' :
                                    warehouse.warehouseType === 'Dondurucu' ? 'bg-cyan-100 text-cyan-700' :
                                    warehouse.warehouseType === 'Kuru' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {warehouse.warehouseType}
                                    {warehouse.temperature && ` (${warehouse.temperature}°C)`}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                <MapPin size={14} />
                                {warehouse.location} • {warehouse.area}m²
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Users size={14} />
                                {warehouse.manager} • {warehouse.staffCount} personel
                            </p>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-yellow-800 mb-1">Dikkat!</h4>
                                <p className="text-sm text-yellow-700 mb-2">
                                    <strong>"{warehouse.name}"</strong> deposunu silmek üzeresiniz.
                                </p>
                                <div className="space-y-1 text-sm text-yellow-700">
                                    <p>• Depo kapasitesi: <strong>{warehouse.capacity}</strong></p>
                                    <p>• Sorumlu personel: <strong>{warehouse.manager}</strong></p>
                                    <p>• Toplam personel: <strong>{warehouse.staffCount} kişi</strong></p>
                                    <p>• Depo alanı: <strong>{warehouse.area}m²</strong></p>
                                </div>
                                <p className="text-sm text-yellow-700 mt-3 font-medium">
                                    Bu işlem geri alınamaz ve tüm depo verileri silinecektir.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Impact Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-red-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-red-800 mb-1">Etkilenecek Alanlar</h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                    <li>• Depo stoğundaki tüm ürünler</li>
                                    <li>• Stok transfer geçmişi</li>
                                    <li>• Depo raporları ve analizler</li>
                                    <li>• Personel görev atamaları</li>
                                </ul>
                            </div>
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

export default WarehouseDeleteConfirmationModal;