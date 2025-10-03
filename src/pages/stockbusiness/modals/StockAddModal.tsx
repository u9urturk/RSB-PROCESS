import { useState, useEffect } from "react";
import { Package, X, Save } from "lucide-react";
import { StockItem } from "@/types/index";
import { Supplier, StockType, Warehouse } from "@/types/stock";
import { stockTypeDatas } from "../mocks/stockTypeData";
import { warehouseData } from "../mocks/warehouseData";

interface StockAddModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (newStock: StockItem) => void;
    initialBarcode?: string; // yeni prop
    suppliers?: Supplier[]; // tedarikçi listesi
    stockTypes?: StockType[]; // stok tipleri listesi
    warehouses?: Warehouse[]; // depo listesi
}

const StockAddModal: React.FC<StockAddModalProps> = ({ 
    open, 
    onClose, 
    onAdd, 
    initialBarcode = "", 
    suppliers = [], 
    stockTypes = stockTypeDatas,
    warehouses = warehouseData
}) => {
    const [formData, setFormData] = useState<Partial<StockItem>>({
        name: "",
        stockTypeId: "",
        quantity: 0,
        unit: "adet",
        unitPrice: 0,
        minQuantity: 0,
        maxQuantity: 0,
        barcode: initialBarcode,
        description: "",
        supplierId: "",
        warehouseId: "",
        status: "active",
        notes: ""
    });

    const [render, setRender] = useState(open);
    const [isAnimating, setIsAnimating] = useState(false);

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
        setTimeout(() => onClose(), 200);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const quantity = formData.quantity || 0;
        const unitPrice = formData.unitPrice || 0;
        const totalPrice = quantity * unitPrice;

        onAdd({
            ...formData,
            id: Date.now().toString(),
            lastUpdated: new Date().toISOString(),
            quantity,
            minQuantity: formData.minQuantity || 0,
            maxQuantity: formData.maxQuantity || 0,
            unitPrice,
            totalPrice,
            status: formData.status || "active",
            stockTypeId: formData.stockTypeId || "",
            supplierId: formData.supplierId || undefined,
            warehouseId: formData.warehouseId || undefined,
            notes: formData.notes || undefined,
            description: formData.description || undefined,
            barcode: formData.barcode || undefined
        } as StockItem);
        onClose();
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
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Package size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Yeni Stok Ekle</h2>
                                <p className="text-orange-100">Envantere yeni ürün ekleyin</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Barkod */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Barkod
                            </label>
                            <input
                                type="text"
                                value={formData.barcode}
                                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                placeholder="Barkod numarası"
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
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                placeholder="Ürün adını giriniz"
                            />
                        </div>

                        {/* Stok Tipi */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Stok Tipi *
                            </label>
                            <select
                                required
                                value={formData.stockTypeId}
                                onChange={(e) => setFormData(prev => ({ ...prev, stockTypeId: e.target.value }))}
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

                        {/* Tedarikçi */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Tedarikçi
                            </label>
                            <select
                                value={formData.supplierId}
                                onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                            >
                                <option value="">Tedarikçi Seçiniz</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name} - {supplier.category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Depo */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Depo *
                            </label>
                            <select
                                required
                                value={formData.warehouseId}
                                onChange={(e) => setFormData(prev => ({ ...prev, warehouseId: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                            >
                                <option value="">Depo Seçiniz</option>
                                {warehouses.map((warehouse) => (
                                    <option key={warehouse.id} value={warehouse.id}>
                                        {warehouse.name} - {warehouse.location} ({warehouse.warehouseType})
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
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "active" | "inactive" }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Pasif</option>
                            </select>
                        </div>

                        {/* Miktar */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Başlangıç Miktarı *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                placeholder="0"
                            />
                        </div>

                        {/* Birim */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Birim *
                            </label>
                            <select
                                required
                                value={formData.unit}
                                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                            >
                                <option value="adet">Adet</option>
                                <option value="kg">Kilogram</option>
                                <option value="gr">Gram</option>
                                <option value="lt">Litre</option>
                                <option value="ml">Mililitre</option>
                                <option value="paket">Paket</option>
                                <option value="kutu">Kutu</option>
                                <option value="şişe">Şişe</option>
                            </select>
                        </div>

                        {/* Minimum Miktar */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Minimum Stok *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.minQuantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: Number(e.target.value) }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                placeholder="0"
                            />
                        </div>

                        {/* Maksimum Miktar */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Maksimum Stok
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.maxQuantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: Number(e.target.value) }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                placeholder="0"
                            />
                        </div>

                        {/* Birim Fiyat */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Birim Fiyat (₺) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.unitPrice}
                                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Açıklama */}
                    <div className="mt-6 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Açıklama
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300 resize-none"
                            placeholder="Ürün hakkında ek bilgiler..."
                        />
                    </div>

                    {/* Notlar */}
                    <div className="mt-4 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Notlar
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300 resize-none"
                            placeholder="İç notlar, uyarılar vb..."
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold hover:scale-105"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                        >
                            <Save size={20} />
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAddModal;
