import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, ShoppingCart, Package, AlertCircle, Loader2 } from 'lucide-react';
import { ProductStepData, InventoryStepData, SubInventoryStepData } from '../layout';
import { useNotification } from '@/context/provider/NotificationProvider';
import { useWarehouses } from '../../../provider/WarehouseProvider';
import { useSuppliers } from '../../../provider/SupplierProvider';
import inventoryApi, { CreateSubInventoryDto } from '@/pages/stockbusiness/apis/inventoryApi';
import { useInventory } from '@/pages/stockbusiness/provider/InventoryProvider';

interface SubInventoryStepProps {
  productData: ProductStepData;
  inventoryData: InventoryStepData;
  onComplete: (data: SubInventoryStepData) => void;
  onBack: () => void;
  handleClose: () => void;
  initialData: SubInventoryStepData | null;
  loading: boolean;
  newSubInventory: boolean;
}

const SubInventoryStep: React.FC<SubInventoryStepProps> = ({
  productData,
  inventoryData,
  onComplete,
  onBack,
  handleClose,
  initialData,
  loading,
  newSubInventory
}) => {
  const { showNotification } = useNotification();
  const { warehouses } = useWarehouses();
  const { suppliers } = useSuppliers();
  const { refreshInventories } = useInventory();

  // Form state
  const [formData, setFormData] = useState({
    warehouseId: initialData?.warehouseId || '',
    supplierId: initialData?.supplierId || '',
    quantity: initialData?.quantity || 0,
    unitPrice: initialData?.unitPrice || 0,
    expirationDate: initialData?.expirationDate || '',
    subInventoryDesc: initialData?.subInventoryDesc || '',
    barcode: initialData?.barcode || productData.barcode || ''
  });

  const [totalValue, setTotalValue] = useState(0);

  // Calculate total value
  useEffect(() => {
    setTotalValue(formData.quantity * formData.unitPrice);
  }, [formData.quantity, formData.unitPrice]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.warehouseId) {
      showNotification('warning', 'Depo seçimi zorunludur');
      return;
    }
    if (!formData.supplierId) {
      showNotification('warning', 'Tedarikçi seçimi zorunludur');
      return;
    }
    if (formData.quantity <= 0) {
      showNotification('warning', 'Miktar 0\'dan büyük olmalıdır');
      return;
    }
    if (formData.unitPrice <= 0) {
      showNotification('warning', 'Birim fiyat 0\'dan büyük olmalıdır');
      return;
    }

    const data: SubInventoryStepData = {
      warehouseId: formData.warehouseId,
      supplierId: formData.supplierId,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      expirationDate: formData.expirationDate || undefined,
      subInventoryDesc: formData.subInventoryDesc || undefined,
      barcode: formData.barcode || ""
    };

    if (newSubInventory) {
      if (!inventoryData.inventoryId) {
        showNotification('error', 'Envanter ID bulunamadı. Lütfen tekrar deneyin.');
        return;
      }
      const createData: CreateSubInventoryDto = {
        inventoryId: inventoryData.inventoryId,
        barcode: formData.barcode,
        warehouseId: formData.warehouseId,
        supplierId: formData.supplierId,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        expirationDate: formData.expirationDate,
        desc: formData.subInventoryDesc,
      };

      console.log('Creating new sub-inventory with data:', createData);

      inventoryApi.createSubInventory(createData).then(() => {
        showNotification('success', 'Parti/Lot kaydı başarıyla oluşturuldu');
        refreshInventories();
        handleClose();
      }).catch((error) => {
        console.error('Parti/Lot oluşturma hatası:', error);
        showNotification('error', 'Parti/Lot kaydı oluşturulurken bir hata oluştu');
      });
    } else {
      onComplete(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product & Inventory Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Package size={18} className="text-blue-600" />
          Ürün ve Envanter Özeti
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-600 block">Ürün:</span>
            <span className="font-semibold text-gray-800">
              {productData.productName}
            </span>
          </div>
          <div>
            <span className="text-gray-600 block">Barkod:</span>
            <span className="font-semibold text-gray-800">
              {productData.barcode || 'N/A'}
            </span>
          </div>
        </div>

        {/* Stock Level Visualization */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Stok Durumu</span>
            <span className="text-xs text-gray-500">
              {inventoryData.totalQuantity || 0} / {inventoryData.maxStockLevel} birim
            </span>
          </div>

          {(() => {
            const totalStock = inventoryData.totalQuantity || 0;
            const minStock = inventoryData.minStockLevel || 0;
            const maxStock = inventoryData.maxStockLevel || 100;
            const range = maxStock - minStock;

            // Calculate percentages
            const minPercentage = (minStock / maxStock) * 100;
            const currentPercentage = (totalStock / maxStock) * 100;

            // Determine color based on stock level
            let barColor = 'bg-red-500';
            let statusText = 'Kritik Seviye';
            let statusColor = 'text-red-600';

            if (totalStock >= minStock) {
              const fillRatio = ((totalStock - minStock) / range) * 100;
              if (fillRatio >= 70) {
                barColor = 'bg-green-500';
                statusText = 'Optimal Seviye';
                statusColor = 'text-green-600';
              } else if (fillRatio >= 30) {
                barColor = 'bg-yellow-500';
                statusText = 'Orta Seviye';
                statusColor = 'text-yellow-600';
              } else {
                barColor = 'bg-orange-500';
                statusText = 'Düşük Seviye';
                statusColor = 'text-orange-600';
              }
            }

            return (
              <>
                {/* Progress Bar */}
                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                  {/* Filled portion */}
                  <div
                    className={`absolute h-full ${barColor} transition-all duration-500 ease-out rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                  >
                    {currentPercentage > 15 && (
                      <span className="text-white text-xs font-bold">
                        {currentPercentage.toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {/* Min level indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10"
                    style={{ left: `${minPercentage}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-orange-600 font-medium whitespace-nowrap">
                      Min
                    </div>
                  </div>
                </div>

                {/* Stock level details */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div className="text-center">
                    <div className="text-gray-500">Minimum</div>
                    <div className="font-bold text-orange-600">{minStock}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Mevcut</div>
                    <div className={`font-bold ${statusColor}`}>{totalStock}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Maksimum</div>
                    <div className="font-bold text-green-600">{maxStock}</div>
                  </div>
                </div>

                {/* Status badge */}
                <div className="mt-3 flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusText === 'Optimal Seviye' ? 'bg-green-100 text-green-700' :
                    statusText === 'Orta Seviye' ? 'bg-yellow-100 text-yellow-700' :
                      statusText === 'Düşük Seviye' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {statusText}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
        <div className="text-sm text-blue-800">
          <strong>Parti/Lot Kaydı:</strong> Aynı üründen birden fazla parti/lot kaydı olabilir.
          Her kayıt farklı depo, tedarikçi ve fiyatlara sahip olabilir.
        </div>
      </div>

      {/* Sub-Inventory Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="text-orange-600" size={20} />
          <h3 className="text-lg font-semibold">Parti/Lot Bilgileri</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Warehouse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Depo <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.warehouseId}
              onChange={(e) => handleInputChange('warehouseId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Depo seçin</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.location}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tedarikçi <span className="text-gray-400">(Opsiyonel)</span>
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => handleInputChange('supplierId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Tedarikçi seçin</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} - {supplier.contactPerson}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Miktar <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Örn: 50"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birim Fiyat (₺) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Örn: 12.50"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Son Kullanma Tarihi
            </label>
            <input
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleInputChange('expirationDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Total Value (Calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Toplam Değer (Hesaplanan)
            </label>
            <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-green-600 text-lg">
              ₺{totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parti/Batch Notları
            </label>
            <textarea
              value={formData.subInventoryDesc}
              onChange={(e) => handleInputChange('subInventoryDesc', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Örn: Organik sertifikalı parti, Farm A'dan"
              rows={3}
            />
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
          <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <Package size={16} />
            Kayıt Özeti
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Miktar:</span>
              <span className="ml-2 font-semibold">{formData.quantity || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Birim Fiyat:</span>
              <span className="ml-2 font-semibold">
                ₺{formData.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="col-span-2 pt-2 border-t border-orange-200">
              <span className="text-gray-600">Toplam Değer:</span>
              <span className="ml-2 font-bold text-lg text-green-600">
                ₺{totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
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
          disabled={loading}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
          Geri
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Kaydet ve Tamamla
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default SubInventoryStep;
