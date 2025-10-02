import React, { useState } from 'react';
import { Truck, Plus, Phone, Mail, Star, Edit, Trash2, Package } from 'lucide-react';
import SupplierAddModal from './modals/SupplierAddModal';
import SupplierDeleteConfirmationModal from './modals/SupplierDeleteConfirmationModal';

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
    deliveryTime: number; // gün
    minimumOrder: number; // TL
    products: string[];
    contractStartDate: string;
    contractEndDate: string;
    totalOrders: number;
    monthlyDeliveries: number;
}

const SupplierManagement: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

    // Mock supplier data - state olarak tanımlandı
    const [suppliers, setSuppliers] = useState<Supplier[]>([
        {
            id: 1,
            name: 'Metro Gıda A.Ş.',
            category: 'Genel Gıda',
            phone: '+90 212 555 0101',
            email: 'siparis@metrogida.com',
            rating: 4.8,
            status: 'Aktif',
            address: 'Maslak, İstanbul',
            contactPerson: 'Ahmet Yılmaz',
            taxNumber: '1234567890',
            paymentTerms: '30 gün',
            deliveryTime: 2,
            minimumOrder: 1000,
            products: ['Konserve', 'Baharat', 'Temizlik'],
            contractStartDate: '2024-01-01',
            contractEndDate: '2025-12-31',
            totalOrders: 45,
            monthlyDeliveries: 12
        },
        {
            id: 2,
            name: 'Ege Et Kombinası',
            category: 'Et Ürünleri',
            phone: '+90 232 555 0202',
            email: 'satis@egeet.com',
            rating: 4.5,
            status: 'Aktif',
            address: 'Kemalpaşa, İzmir',
            contactPerson: 'Fatma Demir',
            taxNumber: '0987654321',
            paymentTerms: '15 gün',
            deliveryTime: 1,
            minimumOrder: 2000,
            products: ['Dana Eti', 'Kuzu Eti', 'Tavuk'],
            contractStartDate: '2024-03-01',
            contractEndDate: '2025-03-01',
            totalOrders: 28,
            monthlyDeliveries: 8
        },
        {
            id: 3,
            name: 'Akdeniz Sebze Hal',
            category: 'Sebze & Meyve',
            phone: '+90 242 555 0303',
            email: 'info@akdenizsebze.com',
            rating: 4.2,
            status: 'Aktif',
            address: 'Kepez, Antalya',
            contactPerson: 'Mehmet Kaya',
            taxNumber: '1122334455',
            paymentTerms: '7 gün',
            deliveryTime: 1,
            minimumOrder: 500,
            products: ['Domates', 'Salatalık', 'Meyve'],
            contractStartDate: '2024-02-15',
            contractEndDate: '2025-02-15',
            totalOrders: 67,
            monthlyDeliveries: 18
        },
        {
            id: 4,
            name: 'Boğaziçi Süt Ürünleri',
            category: 'Süt Ürünleri',
            phone: '+90 216 555 0404',
            email: 'siparis@bogazicisut.com',
            rating: 4.7,
            status: 'Beklemede',
            address: 'Üsküdar, İstanbul',
            contactPerson: 'Ayşe Özkan',
            taxNumber: '5544332211',
            paymentTerms: '21 gün',
            deliveryTime: 3,
            minimumOrder: 1500,
            products: ['Süt', 'Peynir', 'Yoğurt', 'Tereyağı'],
            contractStartDate: '2024-05-01',
            contractEndDate: '2025-05-01',
            totalOrders: 15,
            monthlyDeliveries: 4
        }
    ]);

    // Handler functions
    const handleAddSupplier = () => {
        setEditingSupplier(null);
        setIsAddModalOpen(true);
    };

    const handleEditSupplier = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsAddModalOpen(true);
    };

    const handleDeleteSupplier = (supplier: Supplier) => {
        setDeletingSupplier(supplier);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSupplier = () => {
        if (deletingSupplier) {
            setSuppliers(suppliers.filter(s => s.id !== deletingSupplier.id));
            setDeletingSupplier(null);
            setIsDeleteModalOpen(false);
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
                id: Math.max(...suppliers.map(s => s.id), 0) + 1,
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

            <SupplierDeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteSupplier}
                supplier={deletingSupplier}
            />
        </div>
    );
};

export default SupplierManagement;