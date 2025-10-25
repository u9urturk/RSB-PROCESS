import React, { useState, useEffect } from 'react';
import { Truck, Plus, Phone, Mail, Star, Edit, Trash2, Package } from 'lucide-react';
import SupplierAddModal from './modals/SupplierAddModal';
import { useConfirm } from '@/context/provider/ConfirmProvider';
import { useNotification } from '@/context/provider/NotificationProvider';
import { Supplier } from '@/types/stock';
import { supplierApi, SupplierStatus } from './apis/supplierApi';
import { ErrorHandlerService } from '@/utils/ErrorHandlerService';



const SupplierManagement: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const confirm = useConfirm();
    const { showNotification } = useNotification();

    // Utility functions for displaying Turkish labels
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Aktif';
            case 'INACTIVE': return 'Pasif';
            case 'PENDING': return 'Beklemede';
            default: return status;
        }
    };

    // Load suppliers from API
    useEffect(() => {
        if (isLoaded) return;

        supplierApi.getAllSuppliers().then(response => {
            console.log('API Tedarikçi Verisi:', response);
            const formattedData: Supplier[] = response.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                phone: item.phone,
                email: item.email,
                rating: item.rating,
                status: item.status,
                address: item.address,
                contactPerson: item.contactPerson,
                taxNumber: item.taxNumber,
                paymentTerms: item.paymentTerms,
                deliveryTime: item.deliveryTime,
                minimumOrder: parseFloat(item.minimumOrder) || 0, // Backend'den string geliyor
                products: item.products,
                contractStartDate: item.contractStartDate,
                contractEndDate: item.contractEndDate,
                totalOrders: item.totalOrders,
                monthlyDeliveries: item.monthlyDeliveries,
                contactInfo: item.contactInfo,
                leadTimeDays: item.leadTimeDays,
                isActive: item.isActive,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                stockItems: item.stockItems,
                inventories: item.inventories
            }));

            setSuppliers(formattedData);
            setIsLoaded(true);
        }).catch(error => {
            console.error('Tedarikçiler yüklenirken hata:', error);
            const errorMessage = ErrorHandlerService.extractErrorMessage(error);
            showNotification('error', `Tedarikçiler yüklenirken hata: ${errorMessage}`);
        });
    }, [isLoaded, showNotification]);

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
                { label: 'Toplam Sipariş', value: supplier.totalOrders.toString() },
                { label: 'Aylık Teslimat', value: supplier.monthlyDeliveries.toString() },
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
            try {
                await supplierApi.deleteSupplier(supplier.id);
                setSuppliers(suppliers.filter(s => s.id !== supplier.id));
                showNotification('success', `"${supplier.name}" tedarikçisi başarıyla silindi`);
            } catch (error) {
                console.error('Tedarikçi silinirken hata:', error);
                const errorMessage = ErrorHandlerService.extractErrorMessage(error);
                showNotification('error', `Tedarikçi silinirken hata: ${errorMessage}`);
            }
        }
    };

    const handleSaveSupplier = async (supplierData: Omit<Supplier, 'id' | 'totalOrders' | 'monthlyDeliveries'>) => {
        try {
            if (editingSupplier) {
                // Tedarikçi güncelleme
                const response = await supplierApi.updateSupplier(editingSupplier.id, {
                    name: supplierData.name,
                    category: supplierData.category,
                    phone: supplierData.phone,
                    email: supplierData.email,
                    rating: supplierData.rating,
                    status: supplierData.status as SupplierStatus,
                    address: supplierData.address,
                    contactPerson: supplierData.contactPerson,
                    taxNumber: supplierData.taxNumber,
                    paymentTerms: supplierData.paymentTerms,
                    deliveryTime: supplierData.deliveryTime,
                    minimumOrder: supplierData.minimumOrder,
                    products: supplierData.products,
                    contractStartDate: supplierData.contractStartDate,
                    contractEndDate: supplierData.contractEndDate,
                    contactInfo: supplierData.contactInfo,
                    leadTimeDays: supplierData.leadTimeDays,
                    isActive: supplierData.isActive
                });

                console.log('Update response:', response);
                const updated = response.data;

                const updatedSupplier: Supplier = {
                    id: updated.id || editingSupplier.id,
                    name: updated.name || supplierData.name,
                    category: updated.category || supplierData.category,
                    phone: updated.phone || supplierData.phone,
                    email: updated.email || supplierData.email,
                    rating: updated.rating || supplierData.rating,
                    status: updated.status || (supplierData.status as SupplierStatus),
                    address: updated.address || supplierData.address,
                    contactPerson: updated.contactPerson || supplierData.contactPerson,
                    taxNumber: updated.taxNumber || supplierData.taxNumber,
                    paymentTerms: updated.paymentTerms || supplierData.paymentTerms,
                    deliveryTime: updated.deliveryTime || supplierData.deliveryTime,
                    minimumOrder: updated.minimumOrder ? parseFloat(updated.minimumOrder) : (supplierData.minimumOrder || 0),
                    products: updated.products || supplierData.products || [],
                    contractStartDate: updated.contractStartDate || supplierData.contractStartDate,
                    contractEndDate: updated.contractEndDate || supplierData.contractEndDate,
                    totalOrders: updated.totalOrders || editingSupplier.totalOrders || 0,
                    monthlyDeliveries: updated.monthlyDeliveries || editingSupplier.monthlyDeliveries || 0,
                    contactInfo: updated.contactInfo || supplierData.contactInfo,
                    leadTimeDays: updated.leadTimeDays || supplierData.leadTimeDays || 0,
                    isActive: updated.isActive !== undefined ? updated.isActive : (supplierData.isActive !== undefined ? supplierData.isActive : true),
                    createdAt: updated.createdAt || editingSupplier.createdAt || new Date().toISOString(),
                    updatedAt: updated.updatedAt || new Date().toISOString(),
                    stockItems: updated.stockItems || editingSupplier.stockItems || [],
                    inventories: updated.inventories || editingSupplier.inventories || []
                };

                setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? updatedSupplier : s));
                showNotification('success', `"${updatedSupplier.name}" tedarikçisi başarıyla güncellendi`);
            } else {
                // Yeni tedarikçi oluşturma
                const response = await supplierApi.createSupplier({
                    name: supplierData.name,
                    category: supplierData.category,
                    phone: supplierData.phone,
                    email: supplierData.email,
                    rating: supplierData.rating,
                    status: supplierData.status as SupplierStatus,
                    address: supplierData.address,
                    contactPerson: supplierData.contactPerson,
                    taxNumber: supplierData.taxNumber,
                    paymentTerms: supplierData.paymentTerms,
                    deliveryTime: supplierData.deliveryTime,
                    minimumOrder: supplierData.minimumOrder,
                    products: supplierData.products,
                    contractStartDate: supplierData.contractStartDate,
                    contractEndDate: supplierData.contractEndDate,
                    contactInfo: supplierData.contactInfo,
                    leadTimeDays: supplierData.leadTimeDays,
                    isActive: supplierData.isActive
                });

                console.log('Create response:', response);
                const created = response.data;
                
                const newSupplier: Supplier = {
                    id: created.id || `temp-${Date.now()}`,
                    name: created.name || supplierData.name,
                    category: created.category || supplierData.category,
                    phone: created.phone || supplierData.phone,
                    email: created.email || supplierData.email,
                    rating: created.rating || supplierData.rating,
                    status: created.status || (supplierData.status as SupplierStatus),
                    address: created.address || supplierData.address,
                    contactPerson: created.contactPerson || supplierData.contactPerson,
                    taxNumber: created.taxNumber || supplierData.taxNumber,
                    paymentTerms: created.paymentTerms || supplierData.paymentTerms,
                    deliveryTime: created.deliveryTime || supplierData.deliveryTime,
                    minimumOrder: created.minimumOrder ? parseFloat(created.minimumOrder) : (supplierData.minimumOrder || 0),
                    products: created.products || supplierData.products || [],
                    contractStartDate: created.contractStartDate || supplierData.contractStartDate,
                    contractEndDate: created.contractEndDate || supplierData.contractEndDate,
                    totalOrders: created.totalOrders || 0,
                    monthlyDeliveries: created.monthlyDeliveries || 0,
                    contactInfo: created.contactInfo || supplierData.contactInfo,
                    leadTimeDays: created.leadTimeDays || supplierData.leadTimeDays || 0,
                    isActive: created.isActive !== undefined ? created.isActive : (supplierData.isActive !== undefined ? supplierData.isActive : true),
                    createdAt: created.createdAt || new Date().toISOString(),
                    updatedAt: created.updatedAt || new Date().toISOString(),
                    stockItems: created.stockItems || [],
                    inventories: created.inventories || []
                };

                setSuppliers([...suppliers, newSupplier]);
                showNotification('success', `"${newSupplier.name}" tedarikçisi başarıyla oluşturuldu`);
            }
            setEditingSupplier(null);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Tedarikçi kaydetme hatası:', error);
            const errorMessage = ErrorHandlerService.extractErrorMessage(error);
            const operation = editingSupplier ? 'güncellenirken' : 'oluşturulurken';
            showNotification('error', `Tedarikçi ${operation} hata: ${errorMessage}`);
        }
    };

    // İstatistik hesaplamaları
    const activeSuppliers = suppliers.filter(s => s.status === 'ACTIVE').length;
    const totalMonthlyDeliveries = suppliers.reduce((sum, s) => sum + s.monthlyDeliveries, 0);
    const averageRating = suppliers.length > 0 
        ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)
        : '0.0';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'INACTIVE': return 'bg-red-100 text-red-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
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
                                                {getStatusLabel(supplier.status)}
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