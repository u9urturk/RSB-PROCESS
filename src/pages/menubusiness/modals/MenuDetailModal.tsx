import { useState, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, ImageIcon, Upload } from "lucide-react";
import { MenuDetailModalProps, MenuItemDetailed } from "../../../types";

type MenuForm = MenuItemDetailed & {
    images?: (File | string)[];
};

export default function MenuDetailModal({ open, onClose, item, onUpdate, categories }: MenuDetailModalProps) {
    const [editMode, setEditMode] = useState<boolean>(false);
    const [form, setForm] = useState<MenuForm>(item);
    const [imageFiles, setImageFiles] = useState<(File | string)[]>(item?.images || [item.image].filter(Boolean));

    // Form güncelleme
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Görsel güncelleme
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        let updatedImages = [...imageFiles];
        updatedImages[idx] = file;
        setImageFiles(updatedImages);
        setForm((prev) => ({ ...prev, images: updatedImages }));
    };

    // Yeni görsel ekle
    const handleAddImage = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        let updatedImages = [...imageFiles];
        if (updatedImages.length < 3) {
            updatedImages.push(file);
            setImageFiles(updatedImages);
            setForm((prev) => ({ ...prev, images: updatedImages }));
        }
    };

    // Görsel sil
    const handleRemoveImage = (idx: number) => {
        let updatedImages = [...imageFiles];
        updatedImages.splice(idx, 1);
        setImageFiles(updatedImages);
        setForm((prev) => ({ ...prev, images: updatedImages }));
    };

    // Kaydet
    const handleSave = () => {
        const updatedItem: MenuItemDetailed = {
            ...form,
            image: typeof imageFiles[0] === "string" ? imageFiles[0] : URL.createObjectURL(imageFiles[0] as File),
        };
        onUpdate(updatedItem);
        setEditMode(false);
    };

    // Modal içeriği
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
                        initial={{ scale: 0.95, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 40 }}
                        transition={{ type: "spring", duration: 0.3 }}
                    >
                        <button
                            className="absolute top-4 right-4 cursor-pointer transition-colors text-gray-400 hover:text-gray-700"
                            onClick={onClose}
                        >
                            <X size={24} />
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                            <ImageIcon size={32} className="text-orange-500" />
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editMode ? (
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="border-b border-orange-300 px-2 py-1 text-xl font-bold outline-none"
                                    />
                                ) : (
                                    item.name
                                )}
                            </h2>
                            {!editMode && (
                                <button
                                    className="ml-2 text-orange-600 hover:text-orange-800"
                                    onClick={() => setEditMode(true)}
                                    title="Düzenle"
                                >
                                    <Pencil size={20} />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4 mb-4">
                            <div className="flex flex-col gap-2 w-1/2">
                                <div>
                                    <span className="text-xs text-gray-500">Kategori</span>
                                    <div className="font-semibold">
                                        {editMode ? (
                                            <select
                                                name="category"
                                                value={form.category}
                                                onChange={handleChange}
                                                className="border-b border-orange-300 px-2 py-1 outline-none w-full"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            item.category
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Fiyat</span>
                                    <div className="font-semibold">
                                        {editMode ? (
                                            <input
                                                name="price"
                                                type="number"
                                                value={form.price}
                                                onChange={handleChange}
                                                className="border-b border-orange-300 px-2 py-1 outline-none"
                                            />
                                        ) : (
                                            `${item.price} ₺`
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Durum</span>
                                    <div className="font-semibold">
                                        {editMode ? (
                                            <select
                                                name="status"
                                                value={form.status}
                                                onChange={handleChange}
                                                className="border-b border-orange-300 px-2 py-1 outline-none"
                                            >
                                                <option value="active">Aktif</option>
                                                <option value="inactive">Pasif</option>
                                            </select>
                                        ) : (
                                            item.status === "active" ? "Aktif" : "Pasif"
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col items-center">
                                <span className="text-xs text-gray-500 mb-1">Görseller</span>
                                <div className="flex gap-2 flex-wrap">
                                    {imageFiles.length > 0 ? (
                                        imageFiles.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={typeof img === "string" ? img : URL.createObjectURL(img)}
                                                    alt={`menü görseli ${idx + 1}`}
                                                    className="w-20 h-20 object-cover rounded border"
                                                />
                                                {editMode && (
                                                    <>
                                                        <label
                                                            className="absolute bottom-1 left-1 bg-white rounded-full p-1 shadow text-orange-500 hover:bg-orange-100 cursor-pointer transition-opacity opacity-80 group-hover:opacity-100"
                                                            title="Görseli Güncelle"
                                                        >
                                                            <Upload size={16} />
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={e => handleImageChange(e, idx)}
                                                            />
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(idx)}
                                                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow text-red-500 hover:bg-red-100 transition-opacity opacity-80 group-hover:opacity-100"
                                                            title="Sil"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <span className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded border text-gray-400">Yok</span>
                                    )}
                                    {editMode && imageFiles.length < 3 && (
                                        <label
                                            className="w-20 h-20 flex items-center justify-center bg-orange-50 rounded border border-dashed cursor-pointer hover:bg-orange-100 transition"
                                            title="Yeni görsel ekle"
                                        >
                                            <Upload size={28} className="text-orange-400" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAddImage}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <span className="text-xs text-gray-500">Açıklama</span>
                            <div className="font-semibold">
                                {editMode ? (
                                    <textarea
                                        name="description"
                                        value={form.description || ""}
                                        onChange={handleChange}
                                        className="border-b border-orange-300 px-2 py-1 outline-none w-full"
                                        rows={2}
                                    />
                                ) : (
                                    item.description
                                )}
                            </div>
                        </div>
                        {editMode && (
                            <div className="flex justify-end gap-2">
                                <button
                                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                    onClick={() => {
                                        setEditMode(false);
                                        setForm(item);
                                        setImageFiles(item?.images || [item.image].filter(Boolean));
                                    }}
                                >
                                    Vazgeç
                                </button>
                                <button
                                    className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={handleSave}
                                >
                                    Kaydet
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
