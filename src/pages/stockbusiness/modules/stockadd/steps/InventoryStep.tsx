import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, Warehouse, AlertCircle } from 'lucide-react';
import { ProductStepData, InventoryStepData } from '../layout';
import { useInventory } from '../../../provider/InventoryProvider';
import { useNotification } from '@/context/provider/NotificationProvider';
import { useStockTypes } from '../../../provider/StockTypeProvider';

interface InventoryStepProps {
  productData: ProductStepData;
  onComplete: (data: InventoryStepData) => void;
  onBack: () => void;
  initialData: InventoryStepData | null;
}

const InventoryStep: React.FC<InventoryStepProps> = ({
  productData,
  onComplete,
  onBack,
  initialData
}) => {
  const { showNotification } = useNotification();
  const { inventories, getInventoryByProductId } = useInventory();
  const { stockTypes } = useStockTypes();
  const [loading, setLoading] = useState(false);
  const [existingInventory, setExistingInventory] = useState<any>(null);

  // Form state - QuickAdd format'ına uygun
  const [formData, setFormData] = useState({
    minStockLevel: initialData?.minStockLevel || 10,
    maxStockLevel: initialData?.maxStockLevel || 500,
    inventoryDesc: initialData?.inventoryDesc || '',
    lastCountedAt: initialData?.lastCountedAt || '',
    stockTypeId: initialData?.stockTypeId || ''
  });

  // Check if product has existing inventory
  useEffect(() => {
    const checkExistingInventory = async () => {
      if (productData.isExisting && productData.productId) {
        setLoading(true);
        try {
          // Ürün varsa, inventory de var olmalı (1-1 ilişki)
          await getInventoryByProductId(productData.productId);
          
          // Context'ten inventory'yi bul
          const inventory = inventories.find(inv => inv.productId === productData.productId);
          
          if (inventory) {
            setExistingInventory(inventory);
            // Mevcut inventory bilgilerini forma yükle
            // setFormData({
            //   minStockLevel: inventory.minStockLevel,
            //   maxStockLevel: inventory.maxStockLevel,
            //   inventoryDesc: '',
            //   lastCountedAt: inventory.lastCountedAt || '',
            //   stockTypeId: inventory.stockTypeId || ''
            // });
            showNotification('info', 'Mevcut envanter bilgileri yüklendi');
          }
        } catch (error) {
          console.error('Inventory check error:', error);
          // Ürün var ama inventory yok - normal durum, quick add ile oluşturulacak
        } finally {
          setLoading(false);
        }
      }
    };

    checkExistingInventory();
  }, [productData, getInventoryByProductId, inventories, showNotification]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.stockTypeId) {
      showNotification('warning', 'Stok türü seçimi zorunludur');
      return;
    }
    if (formData.minStockLevel < 0) {
      showNotification('warning', 'Minimum stok seviyesi 0\'dan küçük olamaz');
      return;
    }
    if (formData.maxStockLevel <= formData.minStockLevel) {
      showNotification('warning', 'Maksimum stok seviyesi minimum seviyeden büyük olmalıdır');
      return;
    }

    const data: InventoryStepData = {
      minStockLevel: formData.minStockLevel,
      maxStockLevel: formData.maxStockLevel,
      inventoryDesc: formData.inventoryDesc || undefined,
      lastCountedAt: formData.lastCountedAt || undefined,
      stockTypeId: formData.stockTypeId || undefined,
    };

    onComplete(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Envanter bilgileri kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Summary */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">Seçili Ürün</h4>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="text-orange-600" size={20} />
          </div>
          <div>
            <div className="font-semibold text-gray-800">{productData.productName}</div>
            <div className="text-sm text-gray-600">
              {productData.barcode ? `Barkod: ${productData.barcode}` : 'Barkod yok'}
            </div>
          </div>
        </div>
      </div>

      {/* Existing Inventory Notice */}
      {existingInventory && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <strong>Mevcut Envanter:</strong> Bu ürün için envanter kaydı zaten mevcut. 
            Bilgileri kontrol edin ve gerekirse güncelleyin.
          </div>
        </div>
      )}

      {/* Inventory Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Warehouse className="text-orange-600" size={20} />
          <h3 className="text-lg font-semibold">
            {existingInventory ? 'Envanter Bilgilerini Kontrol Et' : 'Envanter Bilgilerini Gir'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stock Type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stok Türü <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.stockTypeId}
              onChange={(e) => handleInputChange('stockTypeId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Stok türü seçin</option>
              {stockTypes.map((stockType) => (
                <option key={stockType.id} value={stockType.id}>
                  {stockType.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Ürünün stok yönetim türünü belirler
            </p>
          </div>

          {/* Min Stock Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Stok Seviyesi <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.minStockLevel}
              onChange={(e) => handleInputChange('minStockLevel', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Örn: 10"
              min="0"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Bu seviyenin altında uyarı alınır
            </p>
          </div>

          {/* Max Stock Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maksimum Stok Seviyesi <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.maxStockLevel}
              onChange={(e) => handleInputChange('maxStockLevel', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Örn: 100"
              min={formData.minStockLevel + 1}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Hedef maksimum stok miktarı
            </p>
          </div>

          {/* Last Counted At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Son Sayım Tarihi
            </label>
            <input
              type="date"
              value={formData.lastCountedAt}
              onChange={(e) => handleInputChange('lastCountedAt', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>          

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Envanter Notları
            </label>
            <textarea
              value={formData.inventoryDesc}
              onChange={(e) => handleInputChange('inventoryDesc', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Özel saklama koşulları, notlar vb."
              rows={3}
            />
          </div>
        </div>

        {/* Stock Level Preview */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Stok Seviye Görünümü</h4>
          <div className="relative">
            <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500"
                style={{
                  width: `${(formData.minStockLevel / formData.maxStockLevel) * 100}%`
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>0</span>
              <span className="font-semibold text-orange-600">
                Min: {formData.minStockLevel}
              </span>
              <span className="font-semibold text-green-600">
                Max: {formData.maxStockLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2"
        >
          <ChevronLeft size={20} />
          Geri
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-semibold flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Onayla ve Devam Et
        </button>
      </div>
    </form>
  );
};

export default InventoryStep;
