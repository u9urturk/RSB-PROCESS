import React, { useState } from 'react';
import { Truck, Plus, Phone, Mail, Star, Edit, Trash2, Package } from 'lucide-react';
import SupplierAddModal from './modals/SupplierAddModal';
import { useConfirm } from '@/context/provider/ConfirmProvider';
import { Supplier } from '@/types/stock';
import mockSuppliers from './mocks/supplierData';



const SupplierManagement: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const confirm = useConfirm();

    // Mock supplier data - state olarak tanımlandı
    const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);

    // Handler functions
    const handleAddSupplier = () => {
        setEditingSupplier(null);
        setIsAddModalOpen(true);
    };

    const handleEditSupplier = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsAddModalOpen(true);
    };

    const handleDeleteSupplier = async (supplier: Supplier) => {
        const result = await confirm({
            title: 'Tedarikçi Sil',
            message: `"${supplier.name}" tedarikçisini silmek istediğinizden emin misiniz?`,
            type: 'danger',
            icon: '🚚',
            confirmText: 'Evet, Sil',
            cancelText: 'İptal',
            data: supplier,
            details: [
                { label: 'Tedarikçi', value: supplier.name },
                { label: 'Kategori', value: supplier.category },
                { label: 'Telefon', value: supplier.phone },
                { label: 'E-posta', value: supplier.email },
                { label: 'Toplam Sipariş', value: supplier.totalOrders },
                { label: 'Aylık Teslimat', value: supplier.monthlyDeliveries },
                { label: 'Değerlendirme', value: `${supplier.rating}/5` }
            ],
            warnings: [
                'Bu tedarikçiye ait tüm geçmiş kayıtlar silinecek',
                'Aktif siparişler iptal edilecek', 
                'Sözleşme bilgileri kalıcı olarak kaybolacak',
                'Bu işlem geri alınamaz'
            ]
        });

        if (result) {
            setSuppliers(suppliers.filter(s => s.id !== supplier.id));
        }
    };

    const handleSaveSupplier = (supplierData: Omit<Supplier, 'id' | 'totalOrders' | 'monthlyDeliveries'>) => {
        if (editingSupplier) {
            // Edit existing supplier
            setSuppliers(suppliers.map(s => 
                s.id === editingSupplier.id 
                    ? { 
                        ...supplierData, 
                        id: editingSupplier.id, 
                        totalOrders: editingSupplier.totalOrders,
                        monthlyDeliveries: editingSupplier.monthlyDeliveries 
                    }
                    : s
            ));
        } else {
            // Add new supplier
            const newSupplier: Supplier = {
                ...supplierData,
                id: (Math.max(...suppliers.map(s => parseInt(s.id)), 0) + 1).toString(),
                totalOrders: 0,
                monthlyDeliveries: 0
            };
            setSuppliers([...suppliers, newSupplier]);
        }
        setEditingSupplier(null);
        setIsAddModalOpen(false);
    };

    // İstatistik hesaplamaları
    const activeSuppliers = suppliers.filter(s => s.status === 'Aktif').length;
    const totalMonthlyDeliveries = suppliers.reduce((sum, s) => sum + s.monthlyDeliveries, 0);
    const averageRating = suppliers.length > 0 
        ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)
        : '0.0';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aktif': return 'bg-green-100 text-green-800';
            case 'Pasif': return 'bg-red-100 text-red-800';
            case 'Beklemede': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Tedarikçi İşlemleri</h2>
                            <p className="text-gray-600">Tedarikçi yönetimi ve sipariş takibi</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleAddSupplier}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                    >
                        <Plus size={20} />
                        Yeni Tedarikçi
                    </button>
                </div>
            </div>

            {/* Supplier Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Toplam Tedarikçi', value: suppliers.length.toString(), icon: <Truck size={20} />, color: 'from-blue-500 to-blue-600' },
                    { title: 'Aktif Tedarikçi', value: activeSuppliers.toString(), icon: <Package size={20} />, color: 'from-green-500 to-green-600' },
                    { title: 'Bu Ay Teslimat', value: totalMonthlyDeliveries.toString(), icon: <Truck size={20} />, color: 'from-orange-500 to-orange-600' },
                    { title: 'Ortalama Puan', value: averageRating, icon: <Star size={20} />, color: 'from-yellow-500 to-yellow-600' }
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

            {/* Suppliers List */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tedarikçi Listesi</h3>
                <div className="space-y-4">
                    {suppliers.map((supplier) => (
                        <div key={supplier.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                                        <Truck size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-semibold text-gray-800">{supplier.name}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                                                {supplier.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">{supplier.category}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Phone size={14} />
                                                {supplier.phone}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Mail size={14} />
                                                {supplier.email}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star size={14} />
                                                {supplier.rating}/5
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span>Teslimat: {supplier.deliveryTime} gün</span>
                                            <span>Min. Sipariş: {supplier.minimumOrder} TL</span>
                                            <span>Aylık Teslimat: {supplier.monthlyDeliveries}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditSupplier(supplier)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Düzenle"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSupplier(supplier)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <SupplierAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveSupplier}
                editingSupplier={editingSupplier}
            />
        </div>
    );
};

export default SupplierManagement;