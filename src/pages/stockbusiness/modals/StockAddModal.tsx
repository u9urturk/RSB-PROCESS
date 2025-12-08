import { useState, useEffect } from "react";
import { Package, X, Save, ArrowRight, ArrowLeft } from "lucide-react";
import { StockItemAddDto } from "@/types/index";
import { Supplier, Warehouse } from "@/types/stock";
import { CreateProductDto, ProductStatus } from "../apis/productApi";
import { CreateInventoryDto } from "../apis/inventoryApi";
import { StockTypeResponseDto } from "../apis/stockTypeApi";
import { useInventories } from "../provider/InventoryProvider";
import { useProducts } from "../provider/ProductProvider";


// Inventory Form Data Interface (Stage 2)
interface InventoryFormData {
    currentQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    warehouseId: string;
    supplierId?: string;
    unitPrice?: number; // Birim fiyat alanı eklendi
    lastCountedAt?: string; // ISO string format
    expirationDate?: string; // ISO string format
}

interface StockAddModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (newStock: StockItemAddDto) => void;
    initialBarcode?: string;
    suppliers: Supplier[];
    stockTypes?: StockTypeResponseDto[];
    warehouses?: Warehouse[];
    categories?: Array<{ id: string; name: string; }>;
    units?: Array<{ id: string; name: string; symbol?: string; description?: string; }>;
}

const StockAddModal: React.FC<StockAddModalProps> = ({
    open,
    onClose,
    onAdd,
    initialBarcode = "",
    suppliers = [],
    stockTypes = [],
    warehouses = [],
    categories = [],
    units = []
}) => {
    // InventoryProvider hook
    const { createInventory } = useInventories();
    const {  createProduct } = useProducts();

    // Stage Management
    const [currentStage, setCurrentStage] = useState<1 | 2>(1);
    const [createdProductId, setCreatedProductId] = useState<string | null>(null);

    // Product Form Data (Stage 1)
    const [productData, setProductData] = useState<CreateProductDto>({
        name: "",
        description: "",
        note: "",
        imageUrls: [],
        status: ProductStatus.ACTIVE,
        categoryId: "",
        stockTypeId: "",
        baseUnitId: "",
        barcode: initialBarcode
    });

    // Inventory Form Data (Stage 2)
    const [inventoryData, setInventoryData] = useState<InventoryFormData>({
        currentQuantity: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        warehouseId: "",
        supplierId: "",
        unitPrice: 0,
        lastCountedAt: "",
        expirationDate: ""
    });

    const [render, setRender] = useState(open);
    const [isAnimating, setIsAnimating] = useState(false);

    // Reset form data when modal opens
    useEffect(() => {
        if (open) {
            setCurrentStage(1);
            setCreatedProductId(null);
            setProductData({
                name: "",
                description: "",
                note: "",
                imageUrls: [],
                status: ProductStatus.ACTIVE,
                categoryId: "",
                stockTypeId: "",
                baseUnitId: "",
                barcode: initialBarcode
            });
            setInventoryData({
                warehouseId: "",
                supplierId: "",
                currentQuantity: 0,
                minStockLevel: 0,
                maxStockLevel: 0,
                unitPrice: 0,
                lastCountedAt: "",
                expirationDate: ""
            });
        }
    }, [open, initialBarcode]);

    useEffect(() => {
        if (open) {
            setRender(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open && render) {
            const t = setTimeout(() => setRender(false), 200);
            return () => clearTimeout(t);
        }
    }, [open, render]);

    if (!render) return null;

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            // Reset form data
            setProductData({
                barcode: '',
                name: '',
                description: '',
                note: '',
                imageUrls: [],
                status: ProductStatus.ACTIVE,
                categoryId: '',
                stockTypeId: '',
                baseUnitId: ''
            });
            setInventoryData({
                warehouseId: "",
                supplierId: "",
                currentQuantity: 0,
                minStockLevel: 0,
                maxStockLevel: 0,
                unitPrice: 0,
                lastCountedAt: "",
                expirationDate: ""
            });
            setCurrentStage(1);
            setCreatedProductId(null);
            onClose();
        }, 200);
    };

    const handleStage1Validation = () => {
        // Validate required fields for Stage 1
        if (!productData.name.trim()) {
            console.log('error', 'Ürün adı zorunludur!');
            return false;
        }
        if (!productData.categoryId) {
            console.log('error', 'Kategori seçimi zorunludur!');
            return false;
        }
        if (!productData.stockTypeId) {
            console.log('error', 'Stok tipi seçimi zorunludur!');
            return false;
        }
        if (!productData.baseUnitId) {
            console.log('error', 'Birim seçimi zorunludur!');
            return false;
        }
        return true;
    };

    const handleNextStage = async () => {
        if (handleStage1Validation()) {
            console.log('success', 'Ürün bilgileri doğrulandı!');

            // TODO: Here we will call the backend to create the product
            console.log('Product data to be sent to backend:', productData);

            try {
                const productResponse = await createProduct(productData);
                setCreatedProductId(productResponse.id);
                setCurrentStage(2);
                console.log('success', 'Ürün başarıyla oluşturuldu! Stok bilgilerini giriniz.');
            } catch (error) {
                console.error('Error creating product:', error);
                console.log('error', 'Ürün oluşturulurken hata oluştu!');
            }
        }
    };

    const handleStage2Submit = async () => {
        if (!createdProductId) {
            console.log('error', 'Ürün bilgisi bulunamadı! Lütfen tekrar deneyin.');
            return;
        }

        // Validate Stage 2 fields
        if (!inventoryData.warehouseId) {
            console.log('error', 'Depo seçimi zorunludur!');
            return;
        }
        if (inventoryData.currentQuantity < 0) {
            console.log('error', 'Miktar 0 veya daha büyük olmalıdır!');
            return;
        }
        if (inventoryData.minStockLevel < 0) {
            console.log('error', 'Minimum stok seviyesi 0 veya daha büyük olmalıdır!');
            return;
        }
        if (inventoryData.maxStockLevel < inventoryData.minStockLevel) {
            console.log('error', 'Maksimum stok seviyesi minimum stok seviyesinden küçük olamaz!');
            return;
        }

        try {
            // Create inventory record with backend API
            const inventoryPayload: CreateInventoryDto = {
                productId: createdProductId,
                warehouseId: inventoryData.warehouseId,
                supplierId: inventoryData.supplierId || undefined,
                currentQuantity: inventoryData.currentQuantity,
                minStockLevel: inventoryData.minStockLevel,
                maxStockLevel: inventoryData.maxStockLevel,
                unitPrice: inventoryData.unitPrice || undefined,
                lastCountedAt: inventoryData.lastCountedAt || undefined,
                expirationDate: inventoryData.expirationDate || undefined
            };

            console.log('Inventory data to be sent to backend:', inventoryPayload);
            const inventoryResponse = await createInventory(inventoryPayload);

            // Get string values for display
            const selectedStockType = stockTypes.find(st => st.id === productData.stockTypeId);
            const selectedUnit = units.find(unit => unit.id === productData.baseUnitId);
            const selectedWarehouse = warehouses.find(wh => wh.id === inventoryData.warehouseId);
            const selectedSupplier = suppliers.find(sup => sup.id === inventoryData.supplierId);

            const finalStockItem: StockItemAddDto = {
                id: inventoryResponse.id,
                barcode: productData.barcode,
                name: productData.name,
                stockType: selectedStockType?.name || '',
                unitType: selectedUnit?.name || '',
                quantity: inventoryData.currentQuantity,
                minQuantity: inventoryData.minStockLevel,
                maxQuantity: inventoryData.maxStockLevel,
                unitPrice: inventoryData.unitPrice || 0,
                totalPrice: inventoryData.currentQuantity * (inventoryData.unitPrice || 0),
                status: productData.status.toLowerCase() as "active" | "inactive",
                lastUpdated: inventoryResponse.lastUpdated || new Date().toISOString(),
                supplier: selectedSupplier?.name,
                warehouse: selectedWarehouse?.name,
                description: productData.description,
                notes: productData.note,
                lotNumber: inventoryResponse.lotNumber,

                // IDs for backend relations
                productId: createdProductId,
                warehouseId: inventoryData.warehouseId,
                supplierId: inventoryData.supplierId,
                categoryId: productData.categoryId,
                stockTypeId: productData.stockTypeId,
                baseUnitId: productData.baseUnitId
            };

            console.log('success', 'Stok başarıyla eklendi!');
            onAdd(finalStockItem);
            onClose();
        } catch (error) {
            console.error('Error creating inventory:', error);
            console.log('error', 'Stok oluşturulurken hata oluştu!');
        }
    };

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-200 ease-out ${isAnimating
                ? 'bg-opacity-50 bg-gray-700/20 backdrop-blur-sm'
                : 'bg-opacity-0 backdrop-blur-none'
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-all duration-200 ease-out transform ${isAnimating
                    ? 'scale-100 opacity-100 translate-y-0'
                    : 'scale-95 opacity-0 translate-y-4'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r sticky top-0 from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Package size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Yeni Stok Ekle</h2>
                                <p className="text-orange-100">
                                    {currentStage === 1 ? "Ürün bilgilerini giriniz" : `Stok bilgilerini giriniz ${createdProductId ? `(Ürün ID: ${createdProductId})` : ''}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-6">
                        <div className="flex items-center justify-center">
                            {/* Stage 1 */}
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${currentStage >= 1
                                    ? 'bg-white text-orange-600'
                                    : 'bg-white/20 text-white/60'
                                    }`}>
                                    1
                                </div>
                                <span className={`ml-3 font-medium transition-all duration-200 ${currentStage === 1 ? 'text-white' : 'text-white/70'
                                    }`}>
                                    Ürün Bilgileri
                                </span>
                            </div>

                            {/* Progress Line */}
                            <div className={`mx-6 h-0.5 w-16 transition-all duration-200 ${currentStage >= 2 ? 'bg-white' : 'bg-white/30'
                                }`}></div>

                            {/* Stage 2 */}
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${currentStage >= 2
                                    ? 'bg-white text-orange-600'
                                    : 'bg-white/20 text-white/60'
                                    }`}>
                                    2
                                </div>
                                <span className={`ml-3 font-medium transition-all duration-200 ${currentStage === 2 ? 'text-white' : 'text-white/70'
                                    }`}>
                                    Stok Bilgileri
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {currentStage === 1 && (
                        <>
                            {/* Stage 1: Product Information */}
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-3">
                                Ürün Bilgileri
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Barkod */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Barkod
                                    </label>
                                    <input
                                        type="text"
                                        value={productData.barcode || ""}
                                        onChange={(e) => setProductData(prev => ({ ...prev, barcode: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                        placeholder="Barkod numarası (opsiyonel)"
                                    />
                                </div>

                                {/* Ürün Adı */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Ürün Adı *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={productData.name}
                                        onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                        placeholder="Ürün adını giriniz"
                                    />
                                </div>

                                {/* Kategori ID */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Kategori *
                                    </label>
                                    <select
                                        required
                                        value={productData.categoryId}
                                        onChange={(e) => setProductData(prev => ({ ...prev, categoryId: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                    >
                                        <option value="">Kategori Seçiniz</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stok Tipi */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Stok Tipi *
                                    </label>
                                    <select
                                        required
                                        value={productData.stockTypeId}
                                        onChange={(e) => setProductData(prev => ({ ...prev, stockTypeId: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                    >
                                        <option value="">Stok Tipi Seçiniz</option>
                                        {stockTypes.map((stockType) => (
                                            <option key={stockType.id} value={stockType.id}>
                                                {stockType.icon} {stockType.name} - {stockType.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Base Unit */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Temel Birim *
                                    </label>
                                    <select
                                        required
                                        value={productData.baseUnitId}
                                        onChange={(e) => setProductData(prev => ({ ...prev, baseUnitId: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                    >
                                        <option value="">Birim Seçiniz</option>
                                        {units.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.name} ({unit.symbol}) - {unit.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Durum */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Durum *
                                    </label>
                                    <select
                                        required
                                        value={productData.status}
                                        onChange={(e) => setProductData(prev => ({ ...prev, status: e.target.value as ProductStatus }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                    >
                                        <option value={ProductStatus.ACTIVE}>Aktif</option>
                                        <option value={ProductStatus.INACTIVE}>Pasif</option>
                                        <option value={ProductStatus.DRAFT}>Taslak</option>
                                    </select>
                                </div>
                            </div>

                            {/* Açıklama */}
                            <div className="mt-6 space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Açıklama
                                </label>
                                <textarea
                                    value={productData.description || ""}
                                    onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300 resize-none"
                                    placeholder="Ürün açıklaması (opsiyonel)"
                                />
                            </div>

                            {/* Not */}
                            <div className="mt-4 space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Not
                                </label>
                                <textarea
                                    value={productData.note || ""}
                                    onChange={(e) => setProductData(prev => ({ ...prev, note: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300 resize-none"
                                    placeholder="Ek notlar (opsiyonel)"
                                />
                            </div>

                            {/* Image URLs */}
                            <div className="mt-4 space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Ürün Görselleri (Max 3)
                                </label>
                                <div className="space-y-2">
                                    {[0, 1, 2].map((index) => (
                                        <input
                                            key={index}
                                            type="url"
                                            value={productData.imageUrls?.[index] || ""}
                                            onChange={(e) => {
                                                const newImageUrls = [...(productData.imageUrls || [])];
                                                if (e.target.value) {
                                                    newImageUrls[index] = e.target.value;
                                                } else {
                                                    newImageUrls.splice(index, 1);
                                                }
                                                setProductData(prev => ({ ...prev, imageUrls: newImageUrls.filter(url => url) }));
                                            }}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                            placeholder={`Görsel URL ${index + 1} (opsiyonel)`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {currentStage === 2 && (
                        <>
                            {/* Stage 2: Stock Information */}
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-3">
                                Stok Bilgileri
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Depo */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Depo *
                                    </label>
                                    <select
                                        required
                                        value={inventoryData.warehouseId}
                                        onChange={(e) => setInventoryData(prev => ({ ...prev, warehouseId: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                    >
                                        <option value="">Depo Seçiniz</option>
                                        {warehouses.map((warehouse) => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tedarikçi */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Tedarikçi
                                    </label>
                                    <select
                                        value={inventoryData.supplierId || ""}
                                        onChange={(e) => setInventoryData(prev => ({ ...prev, supplierId: e.target.value || undefined }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                    >
                                        <option value="">Tedarikçi Seçiniz</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Başlangıç Miktarı */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Başlangıç Miktarı *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={inventoryData.currentQuantity}
                                        onChange={(e) => setInventoryData(prev => ({ ...prev, currentQuantity: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Minimum Stok Seviyesi */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Minimum Stok Seviyesi *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={inventoryData.minStockLevel}
                                        onChange={(e) => setInventoryData(prev => ({ ...prev, minStockLevel: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Maksimum Stok Seviyesi */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Maksimum Stok Seviyesi *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={inventoryData.maxStockLevel}
                                        onChange={(e) => setInventoryData(prev => ({ ...prev, maxStockLevel: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Son Kullanma Tarihi */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Son Kullanma Tarihi
                                    </label>
                                    <input
                                        type="date"
                                        value={inventoryData.expirationDate || ""}
                                        onChange={(e) => setInventoryData(prev => ({ ...prev, expirationDate: e.target.value || undefined }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                    />
                                </div>

                                {/* Birim Fiyat */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Birim Fiyat (₺)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={inventoryData.unitPrice || ""}
                                        onChange={(e) => setInventoryData(prev => ({ ...prev, unitPrice: e.target.value ? Number(e.target.value) : undefined }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Son Sayım Tarihi */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Son Sayım Tarihi
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={inventoryData.lastCountedAt || ""}
                                        onChange={(e) => setInventoryData(prev => ({ ...prev, lastCountedAt: e.target.value || undefined }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                        {currentStage === 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold hover:scale-105"
                                >
                                    İptal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextStage}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                                >
                                    <ArrowRight size={20} />
                                    Sonraki Adım
                                </button>
                            </>
                        )}

                        {currentStage === 2 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStage(1)}
                                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold hover:scale-105 flex items-center gap-2"
                                >
                                    <ArrowLeft size={20} />
                                    Geri
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStage2Submit}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                                >
                                    <Save size={20} />
                                    Stok Ekle
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockAddModal;


