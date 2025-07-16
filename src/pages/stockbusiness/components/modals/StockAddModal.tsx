import { useState } from "react";
import { StockItem } from "../../../../types";

interface StockAddModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (newStock: StockItem) => void;
}

const StockAddModal: React.FC<StockAddModalProps> = ({ open, onClose, onAdd }) => {
    const [formData, setFormData] = useState<Partial<StockItem>>({
        name: "",
        category: "",
        quantity: 0,
        unit: "adet",
        unitPrice: 0,
        minQuantity: 0,
        maxQuantity: 0,
        barcode: "",
        description: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            id: Date.now().toString(), // Geçici ID üretimi
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Yeni Stok Ekle</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Ürün Adı*
                        </label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Kategori*
                        </label>
                        <input
                            type="text"
                            id="category"
                            required
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                Miktar*
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                required
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                                Birim*
                            </label>
                            <input
                                type="text"
                                id="unit"
                                required
                                value={formData.unit}
                                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700">
                                Minimum Miktar*
                            </label>
                            <input
                                type="number"
                                id="minQuantity"
                                required
                                min="0"
                                value={formData.minQuantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: Number(e.target.value) }))}
                                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="maxQuantity" className="block text-sm font-medium text-gray-700">
                                Maksimum Miktar
                            </label>
                            <input
                                type="number"
                                id="maxQuantity"
                                min="0"
                                value={formData.maxQuantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: Number(e.target.value) }))}
                                className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
                            Birim Fiyat*
                        </label>
                        <input
                            type="number"
                            id="unitPrice"
                            required
                            min="0"
                            step="0.01"
                            value={formData.unitPrice}
                            onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                            Barkod
                        </label>
                        <input
                            type="text"
                            id="barcode"
                            value={formData.barcode}
                            onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Açıklama
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StockAddModal;
