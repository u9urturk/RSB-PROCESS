import { useState } from "react";
import { StockItem } from "../../../../types";
import { motion, AnimatePresence } from "framer-motion";

interface StockAddModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (newStock: StockItem) => void;
    initialBarcode?: string; // yeni prop
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
};

const orange = "#ff9800";
const orangeDark = "#f57c00";

const StockAddModal: React.FC<StockAddModalProps> = ({ open, onClose, onAdd, initialBarcode = "" }) => {
    const [formData, setFormData] = useState<Partial<StockItem>>({
        name: "",
        category: "",
        quantity: 0,
        unit: "adet",
        unitPrice: 0,
        minQuantity: 0,
        maxQuantity: 0,
        barcode: initialBarcode, // barcode burada başlatılıyor
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



    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: "rgba(255,152,0,0.08)" }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={modalVariants}
                    transition={{ duration: 0.25 }}
                >
                    <div
                        className="rounded-xl shadow-2xl w-full max-w-lg"
                        style={{
                            background: "#fff",
                            padding: "2rem",
                            border: `2px solid ${orange}`,
                        }}
                    >
                        <h2
                            className="text-2xl font-bold text-center"
                            style={{ color: orange }}
                        >
                            Yeni Stok Ekle
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-1">
                            <div className="grid grid-cols-3 gap-x-4">
                                <div>
                                    <label htmlFor="barcode" className="block text-sm font-semibold " style={{ color: orangeDark }}>
                                        Barkod
                                    </label>
                                    <input
                                        type="text"
                                        id="barcode"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                                        className="w-full p-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: orange,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold " style={{ color: orangeDark }}>
                                        Ürün Adı*
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full p-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: orange
                                        }}
                                    />
                                </div>
                                <div >
                                    <label htmlFor="category" className="block text-sm w-full font-semibold mb-1" style={{ color: orangeDark }}>
                                        Kategori*
                                    </label>
                                    <select
                                        id="category"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full p-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: orange,
                                        }}
                                    >
                                        <option value="">Kategori Seçiniz</option>
                                        <option value="Gıda">Gıda</option>
                                        <option value="İçecek">İçecek</option>
                                        <option value="Temizlik">Temizlik</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-semibold mb-1" style={{ color: orangeDark }}>
                                        Miktar*
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        required
                                        min="0"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                        className="w-full p-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: orange,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="unit" className="block text-sm font-semibold mb-1" style={{ color: orangeDark }}>
                                        Birim*
                                    </label>
                                    <select
                                        id="unit"
                                        required
                                        value={formData.unit}
                                        onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                                        className="w-full p-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: orange,
                                        }}
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
                                <div>
                                    <label htmlFor="minQuantity" className="block text-sm font-semibold mb-1" style={{ color: orangeDark }}>
                                        Minimum Miktar*
                                    </label>
                                    <input
                                        type="number"
                                        id="minQuantity"
                                        required
                                        min="0"
                                        value={formData.minQuantity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: Number(e.target.value) }))}
                                        className="w-full p-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: orange,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="maxQuantity" className="block text-sm font-semibold mb-1" style={{ color: orangeDark }}>
                                        Maksimum Miktar
                                    </label>
                                    <input
                                        type="number"
                                        id="maxQuantity"
                                        min="0"
                                        value={formData.maxQuantity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: Number(e.target.value) }))}
                                        className="w-full p-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: orange,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="unitPrice" className="block text-sm font-semibold mb-1" style={{ color: orangeDark }}>
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
                                        className="w-full p-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: orange,
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-semibold mb-1" style={{ color: orangeDark }}>
                                    Açıklama
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full p-1 px-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: orange,
                                    }}
                                />
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2 rounded-lg font-semibold"
                                    style={{
                                        background: "#fff3e0",
                                        color: orangeDark,
                                        border: `1px solid ${orange}`,
                                        transition: "background 0.2s",
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg font-semibold"
                                    style={{
                                        background: orange,
                                        color: "#fff",
                                        border: `1px solid ${orangeDark}`,
                                        boxShadow: `0 2px 8px ${orange}33`,
                                        transition: "background 0.2s",
                                    }}
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StockAddModal;
