import { useState, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus, Trash2, Pencil, Upload, Camera, Star, DollarSign, Tag, FileText } from "lucide-react";
import { useNotification } from "../../../context/provider/NotificationProvider";
import { MenuAddModalProps, MenuItemDetailed } from "../../../types";

export default function MenuAddModal({ open, onClose, onAdd, categories }: MenuAddModalProps) {
    const [name, setName] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [status, setStatus] = useState<"active" | "inactive">("active");
    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<(File | string)[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { showNotification } = useNotification();

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 3) {
            showNotification("error", "En fazla 3 görsel ekleyebilirsiniz.");
            return;
        }
        const newImages = files.slice(0, 3 - images.length);
        setImages([...images, ...newImages]);
    };

    const handleRemoveImage = (idx: number): void => {
        setImages(images.filter((_, i) => i !== idx));
    };

    const handleUpdateImage = (idx: number, file: File): void => {
        setImages(images.map((img, i) => (i === idx ? file : img)));
    };

    const handleUpdateImageClick = (idx: number): void => {
        const input = document.getElementById(`update-image-input-${idx}`) as HTMLInputElement;
        if (input) input.click();
    };

    const resetForm = () => {
        setName("");
        setCategory("");
        setPrice("");
        setStatus("active");
        setDescription("");
        setImages([]);
    };

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        
        if (!name.trim() || !category || !price || images.length === 0) {
            showNotification("error", "Lütfen tüm zorunlu alanları ve en az bir görsel ekleyin.");
            return;
        }

        if (Number(price) <= 0) {
            showNotification("error", "Fiyat 0'dan büyük olmalıdır.");
            return;
        }

        setLoading(true);
        
        try {
            const newItem: MenuItemDetailed = {
                id: Date.now().toString(),
                name: name.trim(),
                category,
                price: Number(price),
                status,
                description: description.trim(),
                image: typeof images[0] === "string" ? images[0] : URL.createObjectURL(images[0] as File),
                images: images.map(img => typeof img === "string" ? img : URL.createObjectURL(img as File))
            };

            await onAdd(newItem);
            resetForm();
            onClose();
        } catch (error) {
            showNotification("error", "Ürün eklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => e.target === e.currentTarget && handleClose()}
                >
                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.4 }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 relative">
                            <button
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                <X size={24} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <ImagePlus size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Yeni Menü Ürünü</h2>
                                    <p className="text-orange-100 mt-1">Restoranınıza yeni lezzet ekleyin</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Product Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Tag size={16} />
                                        Ürün Adı *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400"
                                        placeholder="Örn: Margherita Pizza"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Category and Status Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <FileText size={16} />
                                            Kategori *
                                        </label>
                                        <select
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Kategori seçiniz</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <Star size={16} />
                                            Durum
                                        </label>
                                        <select
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
                                            value={status}
                                            onChange={e => setStatus(e.target.value as "active" | "inactive")}
                                            disabled={loading}
                                        >
                                            <option value="active">🟢 Aktif</option>
                                            <option value="inactive">🔴 Pasif</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <DollarSign size={16} />
                                        Fiyat (₺) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400"
                                            placeholder="0.00"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₺</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <FileText size={16} />
                                        Açıklama
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 resize-none"
                                        placeholder="Ürün hakkında detaylar..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={3}
                                        disabled={loading}
                                    />
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Camera size={16} />
                                        Ürün Görselleri * (En az 1, en fazla 3)
                                    </label>
                                    
                                    {/* Image Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-square">
                                                <img
                                                    src={typeof img === "string" ? img : URL.createObjectURL(img)}
                                                    alt={`Ürün görseli ${idx + 1}`}
                                                    className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                                />
                                                
                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateImageClick(idx)}
                                                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                                        title="Güncelle"
                                                        disabled={loading}
                                                    >
                                                        <Pencil size={16} className="text-orange-600" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(idx)}
                                                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                                        title="Sil"
                                                        disabled={loading}
                                                    >
                                                        <Trash2 size={16} className="text-red-600" />
                                                    </button>
                                                </div>
                                                
                                                {/* Update Input */}
                                                <input
                                                    id={`update-image-input-${idx}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleUpdateImage(idx, file);
                                                    }}
                                                    disabled={loading}
                                                />
                                            </div>
                                        ))}
                                        
                                        {/* Add Image Button */}
                                        {images.length < 3 && (
                                            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all group">
                                                <Upload size={24} className="text-gray-400 group-hover:text-orange-500 mb-2" />
                                                <span className="text-sm text-gray-500 group-hover:text-orange-600 font-medium">
                                                    Görsel Ekle
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    disabled={loading || images.length >= 3}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    
                                    <p className="text-xs text-gray-500">
                                        JPG, PNG formatında, maksimum 5MB boyutunda olmalıdır.
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                    disabled={loading}
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !name.trim() || !category || !price || images.length === 0}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <ImagePlus size={18} />
                                            Ürünü Kaydet
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
