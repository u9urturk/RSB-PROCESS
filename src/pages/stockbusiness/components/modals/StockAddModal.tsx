import { useState } from "react";
import { StockItem } from "../../../../types";
import { Package, X, Save } from "lucide-react";

interface StockAddModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (newStock: StockItem) => void;
    initialBarcode?: string; // yeni prop
}

const StockAddModal: React.FC<StockAddModalProps> = ({ open, onClose, onAdd, initialBarcode = "" }) => {
    const [formData, setFormData] = useState<Partial<StockItem>>({
        name: "",
        category: "",
        quantity: 0,
        unit: "adet",
        unitPrice: 0,
        minQuantity: 0,
        maxQuantity: 0,
        barcode: initialBarcode, 
        description: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            id: Date.now().toString(),
            lastUpdated: new Date().toISOString(),
            quantity: formData.quantity || 0,
            minQuantity: formData.minQuantity || 0,
            maxQuantity: formData.maxQuantity || 0,
            unitPrice: formData.unitPrice || 0
        } as StockItem);
        onClose();
    };

    if (!open) return null;



    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
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
                            onClick={onClose}
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

                        {/* Kategori */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Kategori *
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300"
                            >
                                <option value="">Kategori Seçiniz</option>
                                <option value="Gıda">Gıda</option>
                                <option value="İçecek">İçecek</option>
                                <option value="Temizlik">Temizlik</option>
                                <option value="Diğer">Diğer</option>
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

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
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
