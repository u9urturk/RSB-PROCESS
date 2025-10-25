import { useState, useEffect, useRef } from "react";
import { Package, X, Save, ArrowRight, ArrowLeft } from "lucide-react";
import {  StockItemAddDto } from "@/types/index";
import { Supplier, Warehouse } from "@/types/stock";
import { useNotification } from "@/context/provider/NotificationProvider";
import productApi, { CreateProductDto, ProductStatus } from "../apis/productApi";
import inventoryApi, { CreateInventoryDto } from "../apis/inventoryApi";
import { StockTypeResponseDto } from "../apis/stockTypeApi";
import { BaseUnit, baseUnitApi } from "../apis/baseUnitApi";


// Inventory Form Data Interface (Stage 2)
interface InventoryFormData {
    currentQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    warehouseId: string;
    supplierId?: string;
    expirationDate?: string;
    lastCountedAt?: string;
    unitPrice?: number; // Optional unit price
}

interface StockAddModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (newStock: StockItemAddDto) => void;
    initialBarcode?: string;
    suppliers?: Supplier[];
    stockTypes?: StockTypeResponseDto[];
    warehouses?: Warehouse[];
    categories?: Array<{ id: string; name: string; }>;
    units?: BaseUnit[];
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
    // Notification hook
    const { showNotification } = useNotification();
    
    // Local units state (if not provided via props)
    const [localUnits, setLocalUnits] = useState<BaseUnit[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const hasFetchedUnits = useRef(false);
    
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
        expirationDate: "",
        lastCountedAt: "",
        unitPrice: 0
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
                expirationDate: "",
                lastCountedAt: "",
                unitPrice: 0
            });
        } else {
            // Modal kapandığında reset
            hasFetchedUnits.current = false;
        }
    }, [open, initialBarcode]);

    // Fetch units if not provided via props
    useEffect(() => {
        const fetchUnits = async () => {
            // Sadece modal açık ve units yok/boş ise ve daha önce fetch edilmemiş ise
            if (open && (!units || units.length === 0) && !hasFetchedUnits.current && !loadingUnits) {
                try {
                    setLoadingUnits(true);
                    hasFetchedUnits.current = true;
                    const fetchedUnits = await baseUnitApi.getAllBaseUnits();
                    setLocalUnits(fetchedUnits.filter(unit => unit.isActive)); // Sadece aktif olanları
                } catch (error) {
                    console.error('Error fetching units:', error);
                    showNotification('error', 'Birimler yüklenirken hata oluştu');
                    hasFetchedUnits.current = false; // Hata durumunda tekrar denemeye izin ver
                } finally {
                    setLoadingUnits(false);
                }
            }
        };

        fetchUnits();
    }, [open, units, loadingUnits]);

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

    // Use units from props or local state
    const availableUnits = units && units.length > 0 ? units : localUnits;

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
                expirationDate: "",
                lastCountedAt: "",
                unitPrice: 0
            });
            setCurrentStage(1);
            setCreatedProductId(null);
            onClose();
        }, 200);
    };

    const handleStage1Validation = () => {
        // Validate required fields for Stage 1
        if (!productData.name.trim()) {
            showNotification('error', 'Ürün adı zorunludur!');
            return false;
        }
        if (!productData.categoryId) {
            showNotification('error', 'Kategori seçimi zorunludur!');
            return false;
        }
        if (!productData.stockTypeId) {
            showNotification('error', 'Stok tipi seçimi zorunludur!');
            return false;
        }
        if (!productData.baseUnitId) {
            showNotification('error', 'Birim seçimi zorunludur!');
            return false;
        }
        return true;
    };

    const handleNextStage = async () => {
        if (handleStage1Validation()) {
            showNotification('success', 'Ürün bilgileri doğrulandı!');
            
            // TODO: Here we will call the backend to create the product
            console.log('Product data to be sent to backend:', productData);
            
            // Simulate backend call
            try {
                const productResponse = await productApi.createProduct(productData);
                console.log('Full product response:', productResponse);
                
                // Handle different response structures
                let productId: string;
                if (productResponse?.data?.id) {
                    // Standard API response structure
                    productId = productResponse.data.id;
                } else if ((productResponse as any)?.id) {
                    // Direct product response
                    productId = (productResponse as any).id;
                } else {
                    console.error('Unexpected response structure:', productResponse);
                    throw new Error('Ürün ID\'si alınamadı');
                }
                
                setCreatedProductId(productId);
                setCurrentStage(2);
                showNotification('success', 'Ürün başarıyla oluşturuldu! Stok bilgilerini giriniz.');
            } catch (error) {
                console.error('Error creating product:', error);
                showNotification('error', 'Ürün oluşturulurken hata oluştu!');
            }
        }
    };

    const handleStage2Submit = async () => {
        if (!createdProductId) {
            showNotification('error', 'Ürün bilgisi bulunamadı! Lütfen tekrar deneyin.');
            return;
        }

        // Validate Stage 2 fields
        if (!inventoryData.warehouseId) {
            showNotification('error', 'Depo seçimi zorunludur!');
            return;
        }
        if (inventoryData.currentQuantity < 0) {
            showNotification('error', 'Miktar 0 veya daha büyük olmalıdır!');
            return;
        }
        if (inventoryData.minStockLevel < 0) {
            showNotification('error', 'Minimum stok seviyesi 0 veya daha büyük olmalıdır!');
            return;
        }
        if (inventoryData.maxStockLevel < inventoryData.minStockLevel) {
            showNotification('error', 'Maksimum stok seviyesi minimum stok seviyesinden küçük olamaz!');
            return;
        }
        if (inventoryData.unitPrice !== undefined && inventoryData.unitPrice !== null) {
            // unitPrice varsa number olduğundan emin ol ve negatif kontrolü yap
            const unitPriceNumber = Number(inventoryData.unitPrice);
            if (isNaN(unitPriceNumber) || unitPriceNumber < 0) {
                showNotification('error', 'Birim fiyat geçerli bir sayı olmalı ve 0 veya daha büyük olmalıdır!');
                return;
            }
        }

        // Date validations
        const now = new Date();
    
        if (inventoryData.expirationDate) {
            const expirationDate = new Date(inventoryData.expirationDate);
            // Son kullanma tarihi için sadece tarih karşılaştırması (saat önemli değil)
            const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const expirationDateOnly = new Date(expirationDate.getFullYear(), expirationDate.getMonth(), expirationDate.getDate());
            
            if (expirationDateOnly < todayDate) {
                showNotification('error', 'Son kullanma tarihi bugünden önce olamaz!');
                return;
            }
        }

        if (inventoryData.lastCountedAt) {
            const lastCountedDateTime = new Date(inventoryData.lastCountedAt);
            // Son sayım tarihi ve saati şu andan ileri olamaz
            if (lastCountedDateTime > now) {
                showNotification('error', 'Son sayım tarihi ve saati gelecekte olamaz!');
                return;
            }
        }

        try {
            // Create inventory record with backend API
            const inventoryPayload: CreateInventoryDto = {
                productId: createdProductId,
                warehouseId: inventoryData.warehouseId,
                supplierId: inventoryData.supplierId || undefined,
                currentQuantity: Number(inventoryData.currentQuantity),
                minStockLevel: Number(inventoryData.minStockLevel),
                maxStockLevel: Number(inventoryData.maxStockLevel),
                unitPrice: inventoryData.unitPrice ? Number(inventoryData.unitPrice) : undefined, // Explicit number conversion
                lastCountedAt: inventoryData.lastCountedAt || undefined,
                expirationDate: inventoryData.expirationDate || undefined
            };

            console.log('Inventory data to be sent to backend:', inventoryPayload);
            const inventoryResponse = await inventoryApi.createInventory(inventoryPayload);
            console.log('Full inventory response:', inventoryResponse);
            
            // Handle different response structures - flexible parsing like Product API
            let inventoryId: string;
            let inventoryResponseData: any;
            if (inventoryResponse?.data?.id) {
                // Standard API response structure
                inventoryId = inventoryResponse.data.id;
                inventoryResponseData = inventoryResponse.data;
            } else if ((inventoryResponse as any)?.id) {
                // Direct inventory response
                inventoryId = (inventoryResponse as any).id;
                inventoryResponseData = inventoryResponse as any;
            } else {
                console.error('Unexpected inventory response structure:', inventoryResponse);
                throw new Error('Inventory ID\'si alınamadı');
            }
            
            // Create final stock item for local state management (if needed)
            const finalStockItem: StockItemAddDto = {
                id: inventoryId,
                name: productData.name,
                stockTypeId: productData.stockTypeId,
                quantity: inventoryData.currentQuantity,
                unitId: productData.baseUnitId,
                unitPrice: inventoryData.unitPrice || 0,
                totalPrice: (inventoryData.unitPrice || 0) * inventoryData.currentQuantity,
                minQuantity: inventoryData.minStockLevel,
                maxQuantity: inventoryData.maxStockLevel,
                status: productData.status.toLowerCase() as "active" | "inactive",
                lastUpdated: inventoryResponseData.updatedAt || inventoryResponseData.createdAt || new Date().toISOString(),
                barcode: productData.barcode,
                description: productData.description,
                warehouseId: inventoryData.warehouseId,
                supplierId: inventoryData.supplierId,
                notes: productData.note,
                lotNumber: inventoryResponseData.lotNumber || undefined
            };

            showNotification('success', 'Stok başarıyla eklendi!');
            console.log('Final stock item:', finalStockItem);
            console.log('Inventory response:', inventoryResponse);
            
            // Call parent callback and close modal
            onAdd(finalStockItem);
            onClose();
        } catch (error) {
            console.error('Error creating inventory:', error);
            showNotification('error', 'Stok oluşturulurken hata oluştu!');
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
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                                    currentStage >= 1 
                                        ? 'bg-white text-orange-600' 
                                        : 'bg-white/20 text-white/60'
                                }`}>
                                    1
                                </div>
                                <span className={`ml-3 font-medium transition-all duration-200 ${
                                    currentStage === 1 ? 'text-white' : 'text-white/70'
                                }`}>
                                    Ürün Bilgileri
                                </span>
                            </div>
                            
                            {/* Progress Line */}
                            <div className={`mx-6 h-0.5 w-16 transition-all duration-200 ${
                                currentStage >= 2 ? 'bg-white' : 'bg-white/30'
                            }`}></div>
                            
                            {/* Stage 2 */}
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                                    currentStage >= 2 
                                        ? 'bg-white text-orange-600' 
                                        : 'bg-white/20 text-white/60'
                                }`}>
                                    2
                                </div>
                                <span className={`ml-3 font-medium transition-all duration-200 ${
                                    currentStage === 2 ? 'text-white' : 'text-white/70'
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
                                        disabled={loadingUnits}
                                    >
                                        <option value="">
                                            {loadingUnits ? 'Birimler yükleniyor...' : 'Birim Seçiniz'}
                                        </option>
                                        {availableUnits.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.name} ({unit.symbol || unit.shortName}) {unit.desc && `- ${unit.desc}`}
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
                                        value={inventoryData.unitPrice || 0}
                                        onChange={(e) => setInventoryData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Son Sayım Tarihi */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Son Sayım Tarihi ve Saati
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="datetime-local"
                                            value={inventoryData.lastCountedAt || ""}
                                            onChange={(e) => setInventoryData(prev => ({ ...prev, lastCountedAt: e.target.value || undefined }))}
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                            placeholder="YYYY-MM-DD HH:MM"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const now = new Date();
                                                // ISO string'i datetime-local format'ına çevir (timezone offset'siz)
                                                const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                                setInventoryData(prev => ({ ...prev, lastCountedAt: localDateTime }));
                                            }}
                                            className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-medium text-sm whitespace-nowrap"
                                        >
                                            Şimdi
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Son stok sayımının yapıldığı tarih ve saat
                                    </p>
                                </div>
                            </div>

                            {/* Lot Number Bilgi Mesajı */}
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">
                                        <strong>Lot Numarası:</strong> Sistem tarafından otomatik olarak oluşturulacaktır (Format: LOT-YYYY-MMDD-XXXX)
                                    </span>
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
