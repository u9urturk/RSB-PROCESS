import { useState, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus, Trash2, Pencil } from "lucide-react";
import { useNotification } from "../../../context/provider/NotificationProvider";
import { MenuAddModalProps, MenuItemDetailed } from "../../../types";

export default function MenuAddModal({ open, onClose, onAdd, categories }: MenuAddModalProps) {
    const [name, setName] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [status, setStatus] = useState<"active" | "inactive">("active");
    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<(File | string)[]>([]);
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

    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        if (!name || !category || !price || images.length === 0) {
            showNotification("error", "Lütfen tüm zorunlu alanları ve en az bir görsel ekleyin.");
            return;
        }

        const newItem: MenuItemDetailed = {
            id: Date.now().toString(),
            name,
            category,
            price: Number(price),
            status,
            description,
            image: typeof images[0] === "string" ? images[0] : URL.createObjectURL(images[0] as File),
        };

        onAdd(newItem);
        setName("");
        setCategory("");
        setPrice("");
        setStatus("active");
        setDescription("");
        setImages([]);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
                        initial={{ scale: 0.95, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 40 }}
                        transition={{ type: "spring", duration: 0.3 }}
                    >
                        <button
                            className="absolute top-3 right-3 cursor-pointer transition-colors text-gray-400 hover:text-gray-700"
                            onClick={onClose}
                        >
                            <X size={22} />
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Yeni Menü Ürünü Ekle</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ürün Adı</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Kategori</label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Kategori seçiniz</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fiyat (₺)</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-full border rounded px-3 py-2"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Durum</label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={status}
                                    onChange={e => setStatus(e.target.value as "active" | "inactive")}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Pasif</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Açıklama</label>
                                <textarea
                                    className="w-full border rounded px-3 py-2"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 items-center gap-2">
                                    <ImagePlus size={18} /> Ürün Görselleri (en az 1, en fazla 3)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    disabled={images.length >= 3}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                />
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img
                                                src={typeof img === "string" ? img : URL.createObjectURL(img)}
                                                alt={`ürün görseli ${idx + 1}`}
                                                className="w-16 h-16 object-cover rounded border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-red-500 hover:bg-red-100 transition-opacity opacity-80 group-hover:opacity-100"
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateImageClick(idx)}
                                                className="absolute -bottom-2 right-0 bg-white rounded-full p-1 shadow text-orange-500 hover:bg-orange-100 transition-opacity opacity-80 group-hover:opacity-100"
                                                title="Güncelle"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <input
                                                id={`update-image-input-${idx}`}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUpdateImage(idx, file);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full cursor-pointer transition-colors bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg mt-2"
                            >
                                Kaydet
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
