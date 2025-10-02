import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Users, Thermometer, Ruler } from 'lucide-react';

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

interface WarehouseAddModalProps {
    open: boolean;
    onClose: () => void;
    onAdd?: (warehouse: Omit<Warehouse, 'id'>) => void;
    onUpdate?: (id: number, warehouse: Omit<Warehouse, 'id'>) => void;
    editingWarehouse?: Warehouse | null;
    isEditMode?: boolean;
}

const WarehouseAddModal: React.FC<WarehouseAddModalProps> = ({
    open,
    onClose,
    onAdd,
    onUpdate,
    editingWarehouse,
    isEditMode = false
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacityPercentage: 0,
        status: 'Aktif' as 'Aktif' | 'Pasif' | 'Bakım',
        manager: '',
        staffCount: 1,
        area: 100,
        temperature: undefined as number | undefined,
        warehouseType: 'Normal' as 'Normal' | 'Soğuk' | 'Dondurucu' | 'Kuru'
    });

    const [errors, setErrors] = useState<{[key: string]: string}>({});

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

    // Edit mode için form data'yı initialize et
    useEffect(() => {
        if (isEditMode && editingWarehouse && open) {
            setFormData({
                name: editingWarehouse.name,
                location: editingWarehouse.location,
                capacityPercentage: editingWarehouse.capacityPercentage,
                status: editingWarehouse.status,
                manager: editingWarehouse.manager,
                staffCount: editingWarehouse.staffCount,
                area: editingWarehouse.area,
                temperature: editingWarehouse.temperature,
                warehouseType: editingWarehouse.warehouseType
            });
        } else if (!isEditMode && open) {
            setFormData({
                name: '',
                location: '',
                capacityPercentage: 0,
                status: 'Aktif',
                manager: '',
                staffCount: 1,
                area: 100,
                temperature: undefined,
                warehouseType: 'Normal'
            });
        }
    }, [isEditMode, editingWarehouse, open]);

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Depo adı gereklidir';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Depo adı en az 2 karakter olmalıdır';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Lokasyon gereklidir';
        }

        if (!formData.manager.trim()) {
            newErrors.manager = 'Depo sorumlusu gereklidir';
        }

        if (formData.staffCount < 1) {
            newErrors.staffCount = 'En az 1 personel olmalıdır';
        }

        if (formData.area < 10) {
            newErrors.area = 'Depo alanı en az 10 m² olmalıdır';
        }

        if (formData.capacityPercentage < 0 || formData.capacityPercentage > 100) {
            newErrors.capacityPercentage = 'Kapasite 0-100 arasında olmalıdır';
        }

        if ((formData.warehouseType === 'Soğuk' || formData.warehouseType === 'Dondurucu') && !formData.temperature) {
            newErrors.temperature = 'Bu depo türü için sıcaklık gereklidir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const warehouseData = {
                name: formData.name.trim(),
                location: formData.location.trim(),
                capacity: `${formData.capacityPercentage}%`,
                capacityPercentage: formData.capacityPercentage,
                status: formData.status,
                manager: formData.manager.trim(),
                staffCount: formData.staffCount,
                area: formData.area,
                temperature: formData.temperature,
                warehouseType: formData.warehouseType
            };

            if (isEditMode && editingWarehouse && onUpdate) {
                onUpdate(editingWarehouse.id, warehouseData);
            } else if (!isEditMode && onAdd) {
                onAdd(warehouseData);
            }

            handleClose();
        }
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setFormData({
                name: '',
                location: '',
                capacityPercentage: 0,
                status: 'Aktif',
                manager: '',
                staffCount: 1,
                area: 100,
                temperature: undefined,
                warehouseType: 'Normal'
            });
            setErrors({});
            onClose();
        }, 200);
    };

    if (!shouldRender) return null;

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
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transition-all duration-200 ease-out transform ${
                    isAnimating 
                        ? 'scale-100 opacity-100 translate-y-0' 
                        : 'scale-95 opacity-0 translate-y-4'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex sticky top-0 bg-white z-10 items-center justify-between p-6 border-b border-gray-200 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditMode ? 'Depoyu Düzenle' : 'Yeni Depo Ekle'}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {isEditMode ? 'Mevcut depo bilgilerini güncelleyin' : 'Yeni bir depo oluşturun'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Temel Bilgiler */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Depo Adı */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Building2 size={16} />
                                Depo Adı
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Örn: Ana Depo, Soğuk Hava Deposu..."
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Lokasyon */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <MapPin size={16} />
                                Lokasyon
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    errors.location ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Örn: Merkez, Yan Bina, Kat 2..."
                            />
                            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                        </div>
                    </div>

                    {/* Depo Türü ve Durum */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Depo Türü */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Thermometer size={16} />
                                Depo Türü
                            </label>
                            <select
                                value={formData.warehouseType}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    warehouseType: e.target.value as 'Normal' | 'Soğuk' | 'Dondurucu' | 'Kuru',
                                    temperature: e.target.value === 'Normal' || e.target.value === 'Kuru' ? undefined : prev.temperature
                                }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="Normal">Normal Depo</option>
                                <option value="Soğuk">Soğuk Hava Deposu</option>
                                <option value="Dondurucu">Dondurucu Deposu</option>
                                <option value="Kuru">Kuru Gıda Deposu</option>
                            </select>
                        </div>

                        {/* Durum */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Building2 size={16} />
                                Durum
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Aktif' | 'Pasif' | 'Bakım' }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="Aktif">Aktif</option>
                                <option value="Pasif">Pasif</option>
                                <option value="Bakım">Bakım</option>
                            </select>
                        </div>
                    </div>

                    {/* Sıcaklık (sadece soğuk depolar için) */}
                    {(formData.warehouseType === 'Soğuk' || formData.warehouseType === 'Dondurucu') && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Thermometer size={16} />
                                Sıcaklık (°C)
                            </label>
                            <input
                                type="number"
                                value={formData.temperature || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value ? Number(e.target.value) : undefined }))}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    errors.temperature ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder={formData.warehouseType === 'Dondurucu' ? 'Örn: -18' : 'Örn: 4'}
                                min={formData.warehouseType === 'Dondurucu' ? -30 : -5}
                                max={formData.warehouseType === 'Dondurucu' ? -10 : 15}
                            />
                            {errors.temperature && <p className="text-red-500 text-sm mt-1">{errors.temperature}</p>}
                        </div>
                    )}

                    {/* Personel ve Alan */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sorumlu */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Users size={16} />
                                Depo Sorumlusu
                            </label>
                            <input
                                type="text"
                                value={formData.manager}
                                onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    errors.manager ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Örn: Ahmet Yılmaz"
                            />
                            {errors.manager && <p className="text-red-500 text-sm mt-1">{errors.manager}</p>}
                        </div>

                        {/* Personel Sayısı */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Users size={16} />
                                Personel Sayısı
                            </label>
                            <input
                                type="number"
                                value={formData.staffCount}
                                onChange={(e) => setFormData(prev => ({ ...prev, staffCount: Number(e.target.value) }))}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    errors.staffCount ? 'border-red-500' : 'border-gray-300'
                                }`}
                                min="1"
                                max="50"
                            />
                            {errors.staffCount && <p className="text-red-500 text-sm mt-1">{errors.staffCount}</p>}
                        </div>

                        {/* Alan */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Ruler size={16} />
                                Alan (m²)
                            </label>
                            <input
                                type="number"
                                value={formData.area}
                                onChange={(e) => setFormData(prev => ({ ...prev, area: Number(e.target.value) }))}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    errors.area ? 'border-red-500' : 'border-gray-300'
                                }`}
                                min="10"
                                placeholder="m²"
                            />
                            {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                        </div>
                    </div>

                    {/* Kapasite */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Building2 size={16} />
                            Mevcut Doluluk Oranı (%)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                value={formData.capacityPercentage}
                                onChange={(e) => setFormData(prev => ({ ...prev, capacityPercentage: Number(e.target.value) }))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                min="0"
                                max="100"
                                step="5"
                            />
                            <span className="text-lg font-semibold text-gray-800 min-w-[60px]">
                                {formData.capacityPercentage}%
                            </span>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    formData.capacityPercentage >= 90 ? 'bg-red-500' :
                                    formData.capacityPercentage >= 75 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                }`}
                                style={{ width: `${formData.capacityPercentage}%` }}
                            ></div>
                        </div>
                        {errors.capacityPercentage && <p className="text-red-500 text-sm mt-1">{errors.capacityPercentage}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            {isEditMode ? 'Güncelle' : 'Depo Ekle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WarehouseAddModal;