import React, { useState } from 'react';
import { Package, Plus, Edit, Trash2, Tag } from 'lucide-react';
import StockTypeAddModal from './modals/StockTypeAddModal';
import { useConfirm } from '@/context/provider/ConfirmProvider';
import { useStockTypes } from './provider/StockTypeProvider';
import { StockType } from '@/types/stock';

const StockTypeManagement: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingStockType, setEditingStockType] = useState<StockType | null>(null);   
    
    // Provider'dan gelen fonksiyonlar ve state
    const {
        stockTypes,
        stats,
        createStockType,
        updateStockType,
        deleteStockType,
        validateStockType,
    } = useStockTypes();
    
    const confirm = useConfirm();

    // En çok kullanılan stok türünü hesapla
    const getMostUsedStockType = () => {
        if (stockTypes.length === 0) return 'N/A';
        
        const sortedByItemCount = [...stockTypes].sort((a, b) => b.itemCount - a.itemCount);
        return sortedByItemCount[0]?.name || 'N/A';
    };

    // Yeni stok türü ekleme handler'ı
    const handleAddStockType = async (newStockType: Omit<StockType, 'id' | 'itemCount'>) => {
        try {
            // Provider'dan gelen validasyon
            const validationErrors = validateStockType({
                name: newStockType.name,
                description: newStockType.description,
                color: newStockType.color,
                icon: newStockType.icon,
                examples: newStockType.examples
            });

            if (validationErrors.length > 0) {
                // İlk hatayı göster
                return;
            }

            await createStockType({
                name: newStockType.name,
                description: newStockType.description,
                color: newStockType.color,
                icon: newStockType.icon,
                examples: newStockType.examples
            });
            
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Stok türü oluşturulurken hata:', error);
        }
    };

    // Stok türü güncelleme handler'ı
    const handleUpdateStockType = async (id: string, updatedStockType: Omit<StockType, 'id' | 'itemCount'>) => {
        try {
            // Provider'dan gelen validasyon
            const validationErrors = validateStockType({
                name: updatedStockType.name,
                description: updatedStockType.description,
                color: updatedStockType.color,
                icon: updatedStockType.icon,
                examples: updatedStockType.examples
            });

            if (validationErrors.length > 0) {
                // İlk hatayı göster
                return;
            }

            await updateStockType(id, {
                name: updatedStockType.name,
                description: updatedStockType.description,
                color: updatedStockType.color,
                icon: updatedStockType.icon,
                examples: updatedStockType.examples
            });
            
            setEditingStockType(null);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Stok türü güncellenirken hata:', error);
        }
    };

    // Stok türü silme handler'ı
    const handleDeleteStockType = async (id: string) => {
        try {
            await deleteStockType(id);
        } catch (error) {
            console.error('Stok türü silinirken hata:', error);
        }
    };

    // Edit butonuna tıklanınca
    const handleEditClick = (stockType: any) => {
        // StockType formatına dönüştür
        const editableStockType: StockType = {
            id: stockType.id,
            name: stockType.name,
            description: stockType.description || '',
            color: stockType.color || 'from-gray-500 to-gray-600',
            icon: stockType.icon || '📦',
            examples: stockType.examples || [],
            itemCount: stockType.itemCount,
            createdAt: stockType.createdAt,
            updatedAt: stockType.updatedAt
        };
        setEditingStockType(editableStockType);
        setIsAddModalOpen(true);
    };

    // Delete butonuna tıklanınca
    const handleDeleteClick = async (stockType: any) => {
        const result = await confirm({
            title: 'Stok Türünü Sil',
            message: `"${stockType.name}" stok türünü silmek istediğinizden emin misiniz?`,
            type: 'danger',
            icon: '🗑️',
            confirmText: 'Evet, Sil',
            cancelText: 'İptal',
            data: stockType,
            details: [
                { label: 'Stok Türü', value: stockType.name },
                { label: 'Açıklama', value: stockType.description || '' },
                { label: 'Ürün Sayısı', value: `${stockType.itemCount} adet` }
            ],
            warnings: [
                'Bu işlem geri alınamaz',
                'Tüm ilişkili veriler silinecektir',
                `${stockType.itemCount} adet ürün etkilenecektir`,
                'Stok geçmişi kaybolacaktır'
            ]
        });

        if (result) {
            handleDeleteStockType(stockType.id);
        }
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingStockType(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                            <Tag size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Stok Türü İşlemleri</h2>
                            <p className="text-gray-600">Stok türlerini kategorize edin ve yönetin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                    >
                        <Plus size={20} />
                        Yeni Stok Türü
                    </button>
                </div>
            </div>

            {/* Stock Type Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Toplam Stok Türü</p>
                            <p className="text-2xl font-bold text-gray-800">{stockTypes.length}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                            <Package size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Toplam Ürün</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.totalProducts}
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                            <Tag size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">En Çok Kullanılan</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {getMostUsedStockType()}
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
                            <Tag size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Types List */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Stok Türleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stockTypes.map((type) => (
                        <div key={type.id} className="border relative border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 bg-gradient-to-br ${type.color} rounded-xl text-white`}>
                                        <span className="text-xl">{type.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 text-lg">{type.name}</h4>
                                        <p className="text-sm text-gray-600">{type.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditClick(type)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(type)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Ürün Sayısı</span>
                                    <span className="font-semibold text-gray-800">{type.itemCount} adet</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 bg-gradient-to-r ${type.color} rounded-full transition-all duration-300`}
                                        style={{ width: `${Math.min((type.itemCount / 50) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-2">Örnek ürünler:</p>
                                <div className="flex flex-wrap gap-2">
                                    {(type.examples || []).map((example, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                                        >
                                            {example}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                Güncellenme: {new Date(type.updatedAt || '').toLocaleDateString('tr-TR')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* Add/Edit Stock Type Modal */}
            <StockTypeAddModal
                open={isAddModalOpen}
                onClose={handleCloseModal}
                onAdd={handleAddStockType}
                onUpdate={handleUpdateStockType}
                editingStockType={editingStockType}
                isEditMode={!!editingStockType}
            />
        </div>
    );
};

export default StockTypeManagement;