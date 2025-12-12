import React, { useState, useCallback } from 'react';
import { Search, Loader2, Package, CheckCircle } from 'lucide-react';
import { ProductStepData } from '../layout';
import { ProductStatus, productApi, ProductResponseDto } from '../../../apis/productApi';
import { useNotification } from '@/context/provider/NotificationProvider';
import { useCategories } from '../../../provider/CategoryProvider';
import { useStockTypes } from '../../../provider/StockTypeProvider';
import { useBaseUnits } from '../../../provider/BaseUnitProvider';
import { useProducts } from '@/pages/stockbusiness/provider/ProductProvider';

interface ProductStepProps {
    onComplete: (data: ProductStepData) => void;
    initialData: ProductStepData | null;
}

const ProductStep: React.FC<ProductStepProps> = ({ onComplete, initialData }) => {
    const { showNotification } = useNotification();
    const { categories } = useCategories();
    const { stockTypes } = useStockTypes();
    const { baseUnits } = useBaseUnits();
    const { createProduct } = useProducts();

    const [searchBarcode, setSearchBarcode] = useState('');
    const [searching, setSearching] = useState(false);
    const [existingProduct, setExistingProduct] = useState<ProductResponseDto | null>(null);
    const [showNotFound, setShowNotFound] = useState(false);

    // Form state for new product
    const [formData, setFormData] = useState<Omit<ProductStepData, 'isExisting'>>({
        barcode: initialData?.barcode || '',
        name: initialData?.name || '',
        description: initialData?.description || '',
        note: initialData?.note || '',
        imageUrls: initialData?.imageUrls || [],
        status: initialData?.status || ProductStatus.ACTIVE,
        categoryId: initialData?.categoryId || '',
        stockTypeId: initialData?.stockTypeId || '',
        baseUnitId: initialData?.baseUnitId || ''
    });



    const handleExistingProductConfirm = () => {
        if (!existingProduct) return;

        const data: ProductStepData = {
            isExisting: true,
            productId: existingProduct.id,
            barcode: existingProduct.barcode,
            name: existingProduct.name,
            description: existingProduct.description,
            note: existingProduct.note,
            imageUrls: existingProduct.imageUrls,
            status: existingProduct.status,
            categoryId: existingProduct.categoryId,
            stockTypeId: existingProduct.stockTypeId,
            baseUnitId: existingProduct.baseUnitId
        };

        onComplete(data);
    };

    const handleNewProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            showNotification('warning', 'Ürün adı zorunludur');
            return;
        }
        if (!formData.categoryId) {
            showNotification('warning', 'Kategori seçimi zorunludur');
            return;
        }
        if (!formData.stockTypeId) {
            showNotification('warning', 'Stok türü seçimi zorunludur');
            return;
        }
        if (!formData.baseUnitId) {
            showNotification('warning', 'Birim seçimi zorunludur');
            return;
        }

        const data: ProductStepData = {
            isExisting: false,
            ...formData
        };

        onComplete(data);
    };

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Barcode Search Section */}
            {/* <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search size={20} className="text-orange-600" />
          Barkod ile Ürün Ara
        </h3>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={searchBarcode}
            onChange={(e) => setSearchBarcode(e.target.value)}
            placeholder="Barkod numarasını girin..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={searching}
          />
          <button
            disabled={searching}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            {searching ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Aranıyor...
              </>
            ) : (
              <>
                <Search size={20} />
                Ara
              </>
            )}
          </button>
        </div>
      </div> */}

            {/* Existing Product Display */}
            {existingProduct && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-600" size={24} />
                            <h3 className="text-lg font-semibold text-green-800">Ürün Bulundu!</h3>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${existingProduct.status === ProductStatus.ACTIVE
                                    ? 'bg-green-200 text-green-800'
                                    : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            {existingProduct.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-sm text-gray-600 block mb-1">Barkod</label>
                            <div className="font-mono font-semibold text-gray-800">
                                {existingProduct.barcode || 'Yok'}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 block mb-1">Ürün Adı</label>
                            <div className="font-semibold text-gray-800">{existingProduct.name}</div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm text-gray-600 block mb-1">Açıklama</label>
                            <div className="text-gray-700">
                                {existingProduct.description || 'Açıklama yok'}
                            </div>
                        </div>
                        {existingProduct.note && (
                            <div className="col-span-2">
                                <label className="text-sm text-gray-600 block mb-1">Not</label>
                                <div className="text-gray-700">{existingProduct.note}</div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleExistingProductConfirm}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={20} />
                        Bu Ürünü Onayla ve Devam Et
                    </button>
                </div>
            )}

            {/* New Product Form */}
            {(showNotFound || !existingProduct) && (
                <form onSubmit={handleNewProductSubmit} className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="text-blue-600" size={20} />
                            <h3 className="text-lg font-semibold text-blue-800">
                                {showNotFound ? 'Yeni Ürün Ekle' : 'Ürün Bilgileri'}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Barcode */}
                            {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barkod <span className="text-gray-400">(Opsiyonel)</span>
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Barkod numarası"
                />
              </div> */}

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ürün Adı <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Ürün adını girin"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Açıklama
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Ürün açıklaması"
                                    rows={3}
                                />
                            </div>

                            {/* Note */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Not
                                </label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => handleInputChange('note', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Ek notlar"
                                    rows={2}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                >
                                    <option value="">Kategori seçin</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Stock Type */}
                            <div>
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
                            </div>

                            {/* Base Unit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Birim <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.baseUnitId}
                                    onChange={(e) => handleInputChange('baseUnitId', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                >
                                    <option value="">Birim seçin</option>
                                    {baseUnits.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name} ({unit.symbol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Durum
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value as ProductStatus)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value={ProductStatus.ACTIVE}>Aktif</option>
                                    <option value={ProductStatus.INACTIVE}>Pasif</option>
                                    <option value={ProductStatus.DRAFT}>Taslak</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={20} />
                        Ürün Bilgilerini Onayla ve Devam Et
                    </button>
                </form>
            )}

            {/* Empty State */}
            {!existingProduct && !showNotFound && (
                <div className="text-center py-12 text-gray-500">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Başlamak için barkod ile ürün arayın veya yeni ürün bilgilerini girin</p>
                </div>
            )}
        </div>
    );
};

export default ProductStep;
