import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, ShoppingCart, Package, AlertCircle, Loader2 } from 'lucide-react';
import { InventoryStepData, SubInventoryStepData } from '../layout';
import { useNotification } from '@/context/provider/NotificationProvider';
import { useWarehouses } from '../../../provider/WarehouseProvider';
import { useSuppliers } from '../../../provider/SupplierProvider';

interface SubInventoryStepProps {
  inventoryData: InventoryStepData;
  onComplete: (data: SubInventoryStepData) => void;
  onBack: () => void;
  initialData: SubInventoryStepData | null;
  loading: boolean;
}

const SubInventoryStep: React.FC<SubInventoryStepProps> = ({
  inventoryData,
  onComplete,
  onBack,
  initialData,
  loading
}) => {
  const { showNotification } = useNotification();
  const { warehouses } = useWarehouses();
  const { suppliers } = useSuppliers();

  // Form state
  const [formData, setFormData] = useState({
    warehouseId: initialData?.warehouseId || '',
    supplierId: initialData?.supplierId || '',
    quantity: initialData?.quantity || 0,
    unitPrice: initialData?.unitPrice || 0,
    expirationDate: initialData?.expirationDate || '',
    desc: initialData?.desc || ''
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
    if (formData.quantity <= 0) {
      showNotification('warning', 'Miktar 0\'dan büyük olmalıdır');
      return;
    }
    if (formData.unitPrice <= 0) {
      showNotification('warning', 'Birim fiyat 0\'dan büyük olmalıdır');
      return;
    }

    const data: SubInventoryStepData = {
      inventoryId: inventoryData.inventoryId || '', // Backend'de oluşturulacaksa boş olabilir
      warehouseId: formData.warehouseId,
      supplierId: formData.supplierId || undefined,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      expirationDate: formData.expirationDate || undefined,
      desc: formData.desc || undefined
    };

    onComplete(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Inventory Summary */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Envanter Özeti</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Min Stok:</span>
            <span className="ml-2 font-semibold text-orange-600">
              {inventoryData.minStockLevel}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Max Stok:</span>
            <span className="ml-2 font-semibold text-green-600">
              {inventoryData.maxStockLevel}
            </span>
          </div>
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
              Açıklama / Notlar
            </label>
            <textarea
              value={formData.desc}
              onChange={(e) => handleInputChange('desc', e.target.value)}
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
