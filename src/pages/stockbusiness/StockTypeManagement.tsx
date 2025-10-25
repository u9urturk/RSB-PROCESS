import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit, Trash2, Tag } from 'lucide-react';
import StockTypeAddModal from './modals/StockTypeAddModal';
import { useConfirm } from '@/context/provider/ConfirmProvider';
import { useNotification } from '@/context/provider/NotificationProvider';
import { StockType } from '@/types/stock';
import { stockTypeApi } from './apis/stockTypeApi';
import { validateStockType } from '@/utils/validation';
import { ErrorHandlerService } from '@/utils/ErrorHandlerService';

const StockTypeManagement: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingStockType, setEditingStockType] = useState<StockType | null>(null);   
    // Restoran sektörüne uygun stok türleri - state olarak tanımlandı
    const [stockTypes, setStockTypes] = useState<StockType[]>([]);
    const [stockTypeStats, setStockTypeStats] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false); // Duplicate load prevention
    const confirm = useConfirm();
    const { showNotification } = useNotification();

    useEffect(() => {
      // Duplicate load prevention
      if (isLoaded) return;

      stockTypeApi.getAllStockTypes().then(data => {
        const formattedData: StockType[] = data.data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          color: item.color || 'from-gray-500 to-gray-600',
          icon: item.icon || '📦',
          examples: item.examples || [],
          itemCount: item.itemCount,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        setStockTypes(formattedData);
        setStockTypeStats({total: data.total, activeCount: data.activeCount, inactiveCount: data.inactiveCount,
             totalProducts: data.totalProducts, averageProductsPerStockType: data.averageProductsPerStockType, 
             mostUsedStockType: data.mostUsedStockType, topStockTypes: data.topStockTypes, lastUpdated: data.lastUpdated});
        
        setIsLoaded(true); // Mark as loaded
        // Success bildirimi kaldırıldı - sadece user action'larda bildirim gösterelim
      }).catch(error => {
        console.error('Stok türleri yüklenirken hata:', error);
        const errorMessage = ErrorHandlerService.extractErrorMessage(error);
        showNotification('error', `Stok türleri yüklenirken hata: ${errorMessage}`);
      });


      return () => {
      }
    }, [])

    // Yeni stok türü ekleme handler'ı
    const handleAddStockType = async (newStockType: Omit<StockType, 'id' | 'itemCount'>) => {
        try {
            // Client-side validation
            const validationResult = validateStockType({
                name: newStockType.name,
                description: newStockType.description,
                color: newStockType.color,
                icon: newStockType.icon,
                examples: newStockType.examples
            });

            if (!validationResult.isValid) {
                showNotification('error', validationResult.error || 'Geçersiz veri');
                return;
            }

            const created = await stockTypeApi.createStockType(newStockType);
            
            // API response'unu StockType formatına dönüştür
            const stockTypeToAdd: StockType = {
                id: created.id,
                name: created.name,
                description: created.description || '', // StockType'da zorunlu olduğu için default value
                color: created.color || 'from-gray-500 to-gray-600',
                icon: created.icon || '📦',
                examples: created.examples || [],
                itemCount: created.itemCount,
                createdAt: created.createdAt,
                updatedAt: created.updatedAt
            };
            
            setStockTypes(prev => [...prev, stockTypeToAdd]);
            setIsAddModalOpen(false);
            showNotification('success', `"${stockTypeToAdd.name}" stok türü başarıyla oluşturuldu`);
        } catch (error) {
            console.error('Stok türü oluşturulurken hata:', error);
            const errorMessage = ErrorHandlerService.extractErrorMessage(error);
            showNotification('error', `Stok türü oluşturulurken hata: ${errorMessage}`);
        }
    };

    // Stok türü güncelleme handler'ı
    const handleUpdateStockType = async (id: string, updatedStockType: Omit<StockType, 'id' | 'itemCount'>) => {
        try {
            // Client-side validation
            const validationResult = validateStockType({
                name: updatedStockType.name,
                description: updatedStockType.description,
                color: updatedStockType.color,
                icon: updatedStockType.icon,
                examples: updatedStockType.examples
            });

            if (!validationResult.isValid) {
                showNotification('error', validationResult.error || 'Geçersiz veri');
                return;
            }

            const updated = await stockTypeApi.updateStockType(id, updatedStockType);
            
            // API response'unu StockType formatına dönüştür
            const stockTypeToUpdate: StockType = {
                id: updated.id,
                name: updated.name,
                description: updated.description || '',
                color: updated.color || 'from-gray-500 to-gray-600',
                icon: updated.icon || '📦',
                examples: updated.examples || [],
                itemCount: updated.itemCount,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt
            };
            
            setStockTypes(prev => prev.map(type =>
                type.id === id ? stockTypeToUpdate : type
            ));
            setEditingStockType(null);
            setIsAddModalOpen(false);
            showNotification('success', `"${stockTypeToUpdate.name}" stok türü başarıyla güncellendi`);
        } catch (error) {
            console.error('Stok türü güncellenirken hata:', error);
            const errorMessage = ErrorHandlerService.extractErrorMessage(error);
            showNotification('error', `Stok türü güncellenirken hata: ${errorMessage}`);
        }
    };

    // Stok türü silme handler'ı
    const handleDeleteStockType = async (id: string) => {
        try {
            // Silinecek stok türünün adını al
            const stockTypeToDelete = stockTypes.find(type => type.id === id);
            const stockTypeName = stockTypeToDelete?.name || 'Bilinmeyen';

            await stockTypeApi.deleteStockType(id);
            setStockTypes(prev => prev.filter(type => type.id !== id));
            showNotification('success', `"${stockTypeName}" stok türü başarıyla silindi`);
        } catch (error) {
            console.error('Stok türü silinirken hata:', error);
            const errorMessage = ErrorHandlerService.extractErrorMessage(error);
            showNotification('error', `Stok türü silinirken hata: ${errorMessage}`);
        }
    };

    // Edit butonuna tıklanınca
    const handleEditClick = (stockType: StockType) => {
        setEditingStockType(stockType);
        setIsAddModalOpen(true);
    };

    // Delete butonuna tıklanınca
    const handleDeleteClick = async (stockType: StockType) => {
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
                { label: 'Açıklama', value: stockType.description },
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
                                {stockTypeStats ? stockTypeStats.totalProducts : 0}
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
                                {stockTypeStats?.mostUsedStockType?.mostUsedStockTypeName || 'N/A'}
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
                                    {type.examples.map((example, idx) => (
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