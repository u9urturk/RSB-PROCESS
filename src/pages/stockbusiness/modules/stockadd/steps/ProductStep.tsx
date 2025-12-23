import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Search, Loader2, ScanLine, List } from 'lucide-react';
import { InventoryStepData, ProductStepData } from '../layout';
import { ProductStatus, ProductResponseDto, productApi } from '../../../apis/productApi';
import { useNotification } from '@/context/provider/NotificationProvider';
import { useCategories } from '../../../provider/CategoryProvider';
import { useBaseUnits } from '../../../provider/BaseUnitProvider';
import { useInventory } from '@/pages/stockbusiness/provider/InventoryProvider';
import Modal from '@/components/Modal';

interface ProductStepProps {
    onComplete: (data: ProductStepData | null, existingInventory: InventoryStepData | null, skipToSubInventory: boolean, productId: string | null) => void;
    initialData: ProductStepData | null;
}

const ProductStep: React.FC<ProductStepProps> = ({ onComplete, initialData }) => {
    const { showNotification } = useNotification();
    const { categories } = useCategories();
    const { baseUnits } = useBaseUnits();
    const { searchInventory } = useInventory();

    // Search state
    const [searchBarcode, setSearchBarcode] = useState('');
    const [searching, setSearching] = useState(false);
    const [existingProduct, setExistingProduct] = useState<ProductResponseDto | null>(null);
    const [existingInventory, setExistingInventory] = useState<InventoryStepData | null>(null);

    // Product selection from list (requires barcode confirmation)
    const [selectedProductFromList, setSelectedProductFromList] = useState<ProductResponseDto | null>(null);
    const [selectedProductBarcode, setSelectedProductBarcode] = useState('');
    const [validatingSelectedBarcode, setValidatingSelectedBarcode] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productSearchQuery, setProductSearchQuery] = useState('');


    // Form state for new product
    const [formData, setFormData] = useState({
        productName: initialData?.productName || '',
        categoryId: initialData?.categoryId || '',
        baseUnitId: initialData?.baseUnitId || '',
        productDescription: initialData?.productDescription || '',
        note: initialData?.note || '',
        status: initialData?.status || ProductStatus.ACTIVE
    });

    // Load products when modal opens
    useEffect(() => {
        if (isModalOpen) {
            loadAllProducts();
        }
    }, [isModalOpen]);

    const loadAllProducts = async () => {
        setLoadingProducts(true);
        try {
            const response = await productApi.getAllProducts();
            setAllProducts(response);
        } catch (error) {
            console.error('Error loading products:', error);
            showNotification('error', 'Ürünler yüklenirken hata oluştu');
        } finally {
            setLoadingProducts(false);
        }
    };

    // Filter products based on search query
    const filteredProducts = allProducts?.filter(product => {
        const query = productSearchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.categoryName?.toLowerCase().includes(query) ||
            product.barcode?.toLowerCase().includes(query)
        );
    });

    const handleSelectProductFromModal = async (product: ProductResponseDto) => {
        try {
            setSelectedProductFromList(product);
            setSelectedProductBarcode('');
            setExistingProduct(null);
            setExistingInventory(null);
            setIsModalOpen(false);
            console.log('Selected product from modal:', product);
            showNotification('success', 'Ürün seçildi. Barkod girip onaylayın.');
        } catch (error) {
            console.error('Error selecting product:', error);
            showNotification('error', 'Ürün seçilirken hata oluştu');
        }
    };

    const validateSelectedProductBarcode = async () => {
        if (!selectedProductFromList) return;

        const barcode = selectedProductBarcode.trim();
        if (!barcode) {
            showNotification('warning', 'Lütfen barkod numarası girin');
            return;
        }

        setValidatingSelectedBarcode(true);
        try {
            const results = await searchInventory(barcode);
            if (results.inventory.batchCount === 0) {
                showNotification('success', 'Barkod kullanılabilir');
                return;
            }

            if (results.product?.id === selectedProductFromList.id) {
                showNotification('info', 'Bu barkod zaten seçtiğiniz ürüne ait');
                return;
            }

            showNotification('error', 'Bu barkod başka bir ürüne ait');
        } catch (error) {
            console.error('Selected product barcode validation error:', error);
            showNotification('error', 'Barkod kontrolü sırasında hata oluştu');
        } finally {
            setValidatingSelectedBarcode(false);
        }
    };

    const handleConfirmSelectedProductWithBarcode = () => {
        if (!selectedProductFromList) return;

        const barcode = selectedProductBarcode.trim();
        if (!barcode) {
            showNotification('warning', 'Lütfen barkod numarası girin');
            return;
        }

        const inventoryData: InventoryStepData = {
            inventoryId: selectedProductFromList.inventory?.id,
            minStockLevel: selectedProductFromList.inventory?.minStockLevel ?? 0,
            maxStockLevel: selectedProductFromList.inventory?.maxStockLevel ?? 50,
            totalQuantity: selectedProductFromList.inventory?.totalQuantity
        };

        const data: ProductStepData = {
            isExisting: true,
            productId: selectedProductFromList.id,
            productName: selectedProductFromList.name,
            categoryId: selectedProductFromList.categoryId,
            baseUnitId: selectedProductFromList.baseUnitId,
            productDescription: selectedProductFromList.description,
            note: selectedProductFromList.note,
            imageUrls: selectedProductFromList.imageUrls,
            status: selectedProductFromList.status,
            barcode: barcode,
        };

        onComplete(data, inventoryData, true, selectedProductFromList.id);
    };

    const handleExistingProductConfirm = () => {
        if (!existingProduct) return;

        const data: ProductStepData = {
            isExisting: true,
            productId: existingProduct.id,
            productName: existingProduct.name,
            categoryId: existingProduct.categoryId,
            baseUnitId: existingProduct.baseUnitId,
            productDescription: existingProduct.description,
            note: existingProduct.note,
            imageUrls: existingProduct.imageUrls,
            status: existingProduct.status,
            barcode: existingProduct.barcode,
        };

        onComplete(data, existingInventory, true, null);
    };

    const handleNewProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.productName.trim()) {
            showNotification('warning', 'Ürün adı zorunludur');
            return;
        }
        if (!formData.categoryId) {
            showNotification('warning', 'Kategori seçimi zorunludur');
            return;
        }
        if (!formData.baseUnitId) {
            showNotification('warning', 'Birim seçimi zorunludur');
            return;
        }

        const data: ProductStepData = {
            isExisting: false,
            productName: formData.productName,
            categoryId: formData.categoryId,
            baseUnitId: formData.baseUnitId,
            productDescription: formData.productDescription,
            note: formData.note,
            status: formData.status
        };

        onComplete(data, null, false, null);
    };

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSearchProduct = async () => {
        if (!searchBarcode.trim()) {
            showNotification('warning', 'Lütfen barkod numarası girin');
            return;
        }

        setSearching(true);
        try {
            const results = await searchInventory(searchBarcode);
            if (results.inventory.batchCount === 0) {
                showNotification('info', 'Ürün bulunamadı. Yeni ürün oluşturabilirsiniz.');
                setExistingProduct(null);
            } else if (results.inventory.batchCount === 1) {
                setExistingProduct({
                    ...results.product, barcode: results.matchedBatch?.barcode || ''
                });
                setExistingInventory({
                    inventoryId: results.inventory.id,
                    minStockLevel: results.inventory.minStockLevel || 0,
                    maxStockLevel: results.inventory.maxStockLevel || 0,
                    totalQuantity: results.inventory.totalQuantity || 0
                });
                showNotification('success', 'Ürün bulundu!');
            } else {
                // Multiple products found, use the first one or show selection
                setExistingProduct({
                    ...results.product, barcode: results.matchedBatch?.barcode || ''
                });
                setExistingInventory({
                    inventoryId: results.inventory.id,
                    minStockLevel: results.inventory.minStockLevel || 0,
                    maxStockLevel: results.inventory.maxStockLevel || 0,
                    totalQuantity: results.inventory.totalQuantity || 0
                });
                showNotification('info', `${results.inventory.batchCount} ürün bulundu. İlk sonuç gösteriliyor.`);
            }
        } catch (error) {
            console.error('Product search error:', error);
            showNotification('error', 'Ürün araması sırasında hata oluştu');
            setExistingProduct(null);
        } finally {
            setSearching(false);
        }
    };

    const handleScanProduct = async () => {
        if (!searchBarcode.trim()) {
            showNotification('warning', 'Lütfen barkod numarası girin');
            return;
        }

        setSearching(true);
        try {
            const results = await searchInventory(searchBarcode);
            if (results.inventory.batchCount === 0) {
                showNotification('warning', 'Ürün bulunamadı. Lütfen önce ürünü oluşturun.');
                setExistingProduct(null);
            } else {
                const foundProduct = results.product;
                const barcode = results.matchedBatch?.barcode || searchBarcode;

                showNotification('success', 'Ürün bulundu! SubInventory adımına yönlendiriliyorsunuz...');

                // Direkt SubInventory adımına geç
                const data: ProductStepData = {
                    isExisting: true,
                    productId: foundProduct.id,
                    productName: foundProduct.name,
                    categoryId: foundProduct.categoryId,
                    baseUnitId: foundProduct.baseUnitId,
                    productDescription: foundProduct.description,
                    note: foundProduct.note,
                    imageUrls: foundProduct.imageUrls,
                    status: foundProduct.status,
                    barcode: barcode
                };

                onComplete(data, existingInventory, true, null);
            }
        } catch (error) {
            console.error('Product scan error:', error);
            showNotification('error', 'Ürün tarama sırasında hata oluştu');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Barcode Search Section */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Search size={20} className="text-orange-600" />
                    Barkod ile Ürün Ara
                </h3>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={searchBarcode}
                        onChange={(e) => setSearchBarcode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchProduct()}
                        placeholder="Barkod numarasını girin..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={searching}
                    />
                    <button
                        type="button"
                        onClick={handleScanProduct}
                        disabled={searching}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                    >
                        <ScanLine size={20} />
                        Tara
                    </button>
                    <button
                        type="button"
                        onClick={handleSearchProduct}
                        disabled={searching}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                    >
                        {searching ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Kontrol ediliyor...
                            </>
                        ) : (
                            <>
                                <Search size={20} />
                                Kontrol Et
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-300">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                        <List size={20} />
                        Tüm Ürünleri Listele
                    </button>
                </div>
            </div>

            {/* Selected Product (from list) - Barcode confirmation */}
            {selectedProductFromList && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="text-purple-700" size={24} />
                            <h3 className="text-lg font-semibold text-purple-900">Seçilen Ürün</h3>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedProductFromList.status === ProductStatus.ACTIVE
                                ? 'bg-green-200 text-green-800'
                                : selectedProductFromList.status === ProductStatus.INACTIVE
                                    ? 'bg-gray-200 text-gray-800'
                                    : 'bg-yellow-200 text-yellow-800'
                                }`}
                        >
                            {selectedProductFromList.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="col-span-2">
                            <label className="text-sm text-gray-600 block mb-1">Ürün Adı</label>
                            <div className="font-semibold text-gray-800">{selectedProductFromList.name}</div>
                        </div>

                        <div className="col-span-2">
                            <label className="text-sm text-gray-600 block mb-2">Yeni Barkod</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={selectedProductBarcode}
                                    onChange={(e) => setSelectedProductBarcode(e.target.value)}
                                    placeholder="Barkod numarasını girin / okutun..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={validatingSelectedBarcode}
                                />
                                <button
                                    type="button"
                                    onClick={validateSelectedProductBarcode}
                                    disabled={validatingSelectedBarcode}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                                >
                                    {validatingSelectedBarcode ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Kontrol...
                                        </>
                                    ) : (
                                        <>
                                            <ScanLine size={20} />
                                            Tara
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {selectedProductFromList.description && (
                            <div className="col-span-2">
                                <label className="text-sm text-gray-600 block mb-1">Açıklama</label>
                                <div className="text-gray-700">{selectedProductFromList.description}</div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleConfirmSelectedProductWithBarcode}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={20} />
                        Barkodu Onayla ve Devam Et
                    </button>
                </div>
            )}

            {/* Existing Product Display */}
            {!selectedProductFromList && existingProduct && (
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
            {!selectedProductFromList && !existingProduct && (
                <form onSubmit={handleNewProductSubmit} className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="text-blue-600" size={20} />
                            <h3 className="text-lg font-semibold text-blue-800">
                                Ürün Bilgileri
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ürün Adı <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.productName}
                                    onChange={(e) => handleInputChange('productName', e.target.value)}
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
                                    value={formData.productDescription}
                                    onChange={(e) => handleInputChange('productDescription', e.target.value)}
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

            {/* Product List Modal */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="w-[800px] max-w-[90vw]">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <List size={24} className="text-purple-600" />
                                Ürün Listesi
                            </h2>

                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={productSearchQuery}
                                onChange={(e) => setProductSearchQuery(e.target.value)}
                                placeholder="Ürün adı, açıklama veya barkod ile ara..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="p-6 max-h-[500px] overflow-y-auto">
                        {loadingProducts ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-purple-600" size={40} />
                            </div>
                        ) : filteredProducts?.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                {productSearchQuery ? 'Arama kriterlerine uygun ürün bulunamadı' : 'Henüz ürün bulunmamaktadır'}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredProducts.map((product) => {

                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => handleSelectProductFromModal(product)}
                                            className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-gray-800 group-hover:text-purple-700">
                                                            {product.name}
                                                        </h3>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status === ProductStatus.ACTIVE
                                                                ? 'bg-green-100 text-green-700'
                                                                : product.status === ProductStatus.INACTIVE
                                                                    ? 'bg-gray-100 text-gray-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                                }`}
                                                        >
                                                            {product.status}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">Kategori:</span> {product.categoryName}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Birim:</span> {product.baseUnitName} ({product.baseUnitSymbol})
                                                        </div>
                                                    </div>

                                                    {product.description && (
                                                        <p className="mt-2 text-sm text-gray-600">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <CheckCircle
                                                    className="text-gray-300 group-hover:text-purple-600 flex-shrink-0"
                                                    size={24}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProductStep;
