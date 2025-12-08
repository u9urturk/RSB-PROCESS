import React, { useState } from 'react';
import { Building2, Plus, MapPin, Users, Edit, Trash2, Settings } from 'lucide-react';
import WarehouseAddModal from './modals/WarehouseAddModal';
import { useConfirm } from '@/context/provider/ConfirmProvider';
import { useWarehouses } from './provider/WarehouseProvider';
import { Warehouse } from '@/types/stock';
import { WarehouseStatus, WarehouseType } from './apis/warehouseApi';



const WarehouseManagement: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    
    // Provider'dan gelen fonksiyonlar ve state
    const {
        warehouses,
        stats,
        createWarehouse,
        updateWarehouse,
        deleteWarehouse,
        validateWarehouse,
    } = useWarehouses();
    
    const confirm = useConfirm();

    // Utility functions for displaying Turkish labels
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Aktif';
            case 'INACTIVE': return 'Pasif';
            case 'MAINTENANCE': return 'Bakım';
            default: return status;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'NORMAL': return 'Normal';
            case 'COLD': return 'Soğuk';
            case 'FROZEN': return 'Dondurucu';
            case 'DRY': return 'Kuru';
            default: return type;
        }
    };

    // Handler fonksiyonları
    const handleAddWarehouse = async (newWarehouse: Omit<Warehouse, 'id'>) => {
        try {
            // Provider'dan gelen validasyon
            const validationErrors = validateWarehouse({
                name: newWarehouse.name,
                location: newWarehouse.location,
                capacity: newWarehouse.capacity,
                capacityPercentage: newWarehouse.capacityPercentage,
                status: newWarehouse.status as WarehouseStatus,
                manager: newWarehouse.manager,
                staffCount: newWarehouse.staffCount,
                area: newWarehouse.area,
                temperature: newWarehouse.temperature,
                warehouseType: newWarehouse.warehouseType as WarehouseType,
                code: newWarehouse.code,
                isActive: newWarehouse.isActive
            });

            if (validationErrors.length > 0) {
                // İlk hatayı göster
                return;
            }

            await createWarehouse({
                name: newWarehouse.name,
                location: newWarehouse.location,
                capacity: newWarehouse.capacity,
                capacityPercentage: newWarehouse.capacityPercentage,
                status: newWarehouse.status as WarehouseStatus,
                manager: newWarehouse.manager,
                staffCount: newWarehouse.staffCount,
                area: newWarehouse.area,
                temperature: newWarehouse.temperature,
                warehouseType: newWarehouse.warehouseType as WarehouseType,
                code: newWarehouse.code,
                isActive: newWarehouse.isActive
            });

            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Depo oluşturulurken hata:', error);
        }
    };

    const handleUpdateWarehouse = async (id: string, updatedWarehouse: Omit<Warehouse, 'id'>) => {
        try {
            // Provider'dan gelen validasyon
            const validationErrors = validateWarehouse({
                name: updatedWarehouse.name,
                location: updatedWarehouse.location,
                capacity: updatedWarehouse.capacity,
                capacityPercentage: updatedWarehouse.capacityPercentage,
                status: updatedWarehouse.status as WarehouseStatus,
                manager: updatedWarehouse.manager,
                staffCount: updatedWarehouse.staffCount,
                area: updatedWarehouse.area,
                temperature: updatedWarehouse.temperature,
                warehouseType: updatedWarehouse.warehouseType as WarehouseType,
                code: updatedWarehouse.code,
                isActive: updatedWarehouse.isActive
            });

            if (validationErrors.length > 0) {
                // İlk hatayı göster
                return;
            }

            await updateWarehouse(id, {
                name: updatedWarehouse.name,
                location: updatedWarehouse.location,
                capacity: updatedWarehouse.capacity,
                capacityPercentage: updatedWarehouse.capacityPercentage,
                status: updatedWarehouse.status as WarehouseStatus,
                manager: updatedWarehouse.manager,
                staffCount: updatedWarehouse.staffCount,
                area: updatedWarehouse.area,
                temperature: updatedWarehouse.temperature,
                warehouseType: updatedWarehouse.warehouseType as WarehouseType,
                code: updatedWarehouse.code,
                isActive: updatedWarehouse.isActive
            });

            setEditingWarehouse(null);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Depo güncellenirken hata:', error);
        }
    };

    const handleDeleteWarehouse = async (id: string) => {
        try {
            await deleteWarehouse(id);
        } catch (error) {
            console.error('Depo silinirken hata:', error);
        }
    };

    const handleEditClick = (warehouse: Warehouse) => {
        setEditingWarehouse(warehouse);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = async (warehouse: Warehouse) => {
        const result = await confirm({
            title: 'Depoyu Sil',
            message: `"${warehouse.name}" deposunu silmek istediğinizden emin misiniz?`,
            type: 'danger',
            icon: '🏢',
            confirmText: 'Evet, Sil',
            cancelText: 'İptal',
            data: warehouse,
            details: [
                { label: 'Depo Adı', value: warehouse.name },
                { label: 'Lokasyon', value: warehouse.location },
                { label: 'Kapasite', value: warehouse.capacity },
                { label: 'Sorumlu', value: warehouse.manager || 'Belirtilmemiş' },
                { label: 'Personel Sayısı', value: `${warehouse.staffCount} kişi` },
                { label: 'Alan', value: `${warehouse.area}m²` },
                { label: 'Tür', value: warehouse.warehouseType || 'Normal' }
            ],
            warnings: [
                'Depo stoğundaki tüm ürünler silinecek',
                'Stok transfer geçmişi kaybolacak',
                'Depo raporları ve analizler silinecek',
                'Personel görev atamaları iptal edilecek',
                'Bu işlem geri alınamaz'
            ]
        });

        if (result) {
            handleDeleteWarehouse(warehouse.id);
        }
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingWarehouse(null);
    };

    // Stats hesaplamaları - provider'dan gelen veriler
    const totalWarehouses = stats.totalWarehouses || warehouses.length;
    const activeLocations = stats.activeWarehouses || warehouses.filter(w => w.status === 'ACTIVE').length;
    const totalStaff = warehouses.reduce((sum, w) => sum + w.staffCount, 0);
    const averageCapacity = stats.averageCapacityPercentage || Math.round(
        warehouses.reduce((sum, w) => sum + w.capacityPercentage, 0) / warehouses.length
    );
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Depo İşlemleri</h2>
                            <p className="text-gray-600">Depo yönetimi ve lokasyon takibi</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                    >
                        <Plus size={20} />
                        Yeni Depo
                    </button>
                </div>
            </div>

            {/* Warehouse Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Toplam Depo', value: totalWarehouses.toString(), icon: <Building2 size={20} />, color: 'from-blue-500 to-blue-600' },
                    { title: 'Aktif Lokasyon', value: activeLocations.toString(), icon: <MapPin size={20} />, color: 'from-green-500 to-green-600' },
                    { title: 'Toplam Personel', value: totalStaff.toString(), icon: <Users size={20} />, color: 'from-purple-500 to-purple-600' },
                    { title: 'Ortalama Kapasite', value: `${averageCapacity}%`, icon: <Settings size={20} />, color: 'from-orange-500 to-orange-600' }
                ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                            <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl text-white`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Warehouse List */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Depo Listesi</h3>
                <div className="space-y-4">
                    {warehouses.map((warehouse) => (
                        <div key={warehouse.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${warehouse.status === 'ACTIVE' ? 'bg-green-100' :
                                        warehouse.status === 'INACTIVE' ? 'bg-gray-100' : 'bg-yellow-100'
                                        }`}>
                                        <Building2 size={20} className={
                                            warehouse.status === 'ACTIVE' ? 'text-green-600' :
                                                warehouse.status === 'INACTIVE' ? 'text-gray-600' : 'text-yellow-600'
                                        } />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-800">{warehouse.name}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${warehouse.warehouseType === 'COLD' ? 'bg-blue-100 text-blue-700' :
                                                warehouse.warehouseType === 'FROZEN' ? 'bg-cyan-100 text-cyan-700' :
                                                    warehouse.warehouseType === 'DRY' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {getTypeLabel(warehouse.warehouseType)}
                                                {warehouse.temperature && ` (${warehouse.temperature}°C)`}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                            <MapPin size={14} />
                                            {warehouse.location} • {warehouse.area}m² • {warehouse.manager}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500">
                                                👥 {warehouse.staffCount} personel
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${warehouse.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                warehouse.status === 'INACTIVE' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {getStatusLabel(warehouse.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-800 mb-1">
                                            Kapasite: {warehouse.capacity}
                                        </p>
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${warehouse.capacityPercentage >= 90 ? 'bg-red-500' :
                                                    warehouse.capacityPercentage >= 75 ? 'bg-yellow-500' :
                                                        'bg-green-500'
                                                    }`}
                                                style={{ width: `${warehouse.capacityPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(warehouse)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Depoyu Düzenle"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(warehouse)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Depoyu Sil"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add/Edit Warehouse Modal */}
            <WarehouseAddModal
                open={isAddModalOpen}
                onClose={handleCloseModal}
                onAdd={handleAddWarehouse}
                onUpdate={handleUpdateWarehouse}
                editingWarehouse={editingWarehouse}
                isEditMode={!!editingWarehouse}
            />
        </div>
    );
};

export default WarehouseManagement;