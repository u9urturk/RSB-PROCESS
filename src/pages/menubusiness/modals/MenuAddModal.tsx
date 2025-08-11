import { useState, ChangeEvent, FormEvent, useCallback, useMemo, useEffect } from "react";
import { X, Trash2, Pencil, Camera, Star, DollarSign, Tag, FileText, Plus } from "lucide-react";
import { useNotification } from "../../../context/provider/NotificationProvider";
import { MenuAddModalProps, MenuItemDetailed, MenuImage } from "../../../types";
import "../animations.css";

export default function MenuAddModal({ open, onClose, onAdd, categories }: MenuAddModalProps) {
    // form state
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState<"active" | "inactive">("active");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<(File | MenuImage | string)[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { showNotification } = useNotification();

    // ---------- helpers ----------
    const baseInput = "w-full border rounded-xl px-4 py-2.5 text-sm md:text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500 transition disabled:opacity-60";
    const labelCls = "flex items-center gap-1.5 text-xs font-medium text-slate-600";

    const previewUrl = useCallback((img: File | MenuImage | string) => {
        if (typeof img === "string") return img;
        if (img instanceof File) return URL.createObjectURL(img);
        return img.url;
    }, []);

    const normalizeImages = useCallback((): MenuImage[] => {
        const mapped = images.map((img, i) => {
            if (typeof img === "string") return { url: img, mainPicture: i === 0 } as MenuImage;
            if (img instanceof File) return { url: URL.createObjectURL(img), mainPicture: i === 0 } as MenuImage;
            return { url: img.url, mainPicture: !!img.mainPicture };
        });
        // ensure single mainPicture (fallback first)
        const hasMain = mapped.some(m => m.mainPicture);
        if (!hasMain && mapped[0]) mapped[0].mainPicture = true;
        if (hasMain) {
            let flagged = false;
            mapped.forEach(m => {
                if (m.mainPicture) {
                    if (!flagged) flagged = true; else m.mainPicture = false;
                }
            });
        }
        return mapped;
    }, [images]);

    const validate = useCallback(() => {
        const next: Record<string, string> = {};
        if (!name.trim()) next.name = "Ürün adı gereklidir";
        if (!category) next.category = "Kategori seçiniz";
        if (!price || Number(price) <= 0) next.price = "Geçerli fiyat";
        if (images.length === 0) next.images = "En az 1 görsel";
        setErrors(next);
        return Object.keys(next).length === 0;
    }, [name, category, price, images.length]);

    // ---------- image handlers ----------
    const addImages = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        if (images.length + files.length > 3) {
            showNotification("error", "En fazla 3 görsel");
            return;
        }
        setImages(prev => [...prev, ...files.slice(0, 3 - prev.length)]);
        setErrors(prev => ({ ...prev, images: "" }));
    }, [images.length, showNotification]);

    const replaceImage = useCallback((idx: number, file: File) => {
        setImages(prev => prev.map((img, i) => (i === idx ? file : img)));
    }, []);

    const removeImage = useCallback((idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    }, []);

    const makeMain = useCallback((idx: number) => {
        setImages(prev => prev.map((img, i) => {
            if (typeof img === "string" || img instanceof File) {
                if (i === idx) return { url: previewUrl(img), mainPicture: true } as MenuImage;
                return img;
            }
            return { ...img, mainPicture: i === idx };
        }));
    }, [previewUrl]);

    // ---------- submit ----------
    const reset = useCallback(() => {
        setName("");
        setCategory("");
        setPrice("");
        setStatus("active");
        setDescription("");
        setImages([]);
        setErrors({});
    }, []);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            showNotification("error", "Zorunlu alanları kontrol edin");
            return;
        }
        setLoading(true);
        try {
            const imgs = normalizeImages();
            const main = imgs.find(i => i.mainPicture) || imgs[0];
            const item: MenuItemDetailed = {
                id: Date.now().toString(),
                name: name.trim(),
                category,
                price: Number(price),
                status,
                description: description.trim(),
                image: main?.url,
                images: imgs
            };
            await onAdd(item);
            reset();
            onClose();
            showNotification("success", "Ürün eklendi");
        } catch (err) {
            showNotification("error", "Kayıt hatası");
        } finally {
            setLoading(false);
        }
    }, [validate, normalizeImages, name, category, price, status, description, onAdd, reset, onClose, showNotification]);

    const close = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    // Derived boolean to disable submit
    const canSubmit = useMemo(() => !!name.trim() && !!category && !!price && images.length > 0 && !loading, [name, category, price, images.length, loading]);

    // lock background scroll while open
    useEffect(() => {
        if (!open) return;
        const root = document.documentElement;
        const prevOverflow = root.style.overflow;
        const prevPaddingRight = root.style.paddingRight;
        const scrollBarWidth = window.innerWidth - root.clientWidth;
        if (scrollBarWidth > 0) root.style.paddingRight = `${scrollBarWidth}px`;
        root.style.overflow = 'hidden';
        return () => {
            root.style.overflow = prevOverflow;
            root.style.paddingRight = prevPaddingRight;
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-items-center items-center justify-center p-2 sm:p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && close()}>
            <div
                className="bg-white w-full h-[80dvh] max-w-full max-h-none rounded-xl md:rounded-2xl md:h-auto md:max-w-2xl md:max-h-[92vh] flex flex-col shadow-xl border border-slate-200/70 overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Tag size={16} className="text-indigo-500" /> Yeni Ürün
                    </h2>
                    <button onClick={close} disabled={loading} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                {/* Scrollable Content */}
                <div className="overflow-y-auto px-4 sm:px-6 py-5 space-y-6 flex-1 min-h-0 pb-24 md:pb-5" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}>
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className={labelCls}><Tag size={14} className="text-indigo-500" /> Ürün Adı *</label>
                        <input
                            className={`${baseInput} ${errors.name ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-300'}`}
                            value={name}
                            placeholder="Örn: Margherita Pizza"
                            onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                            disabled={loading}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    {/* Category / Status */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className={labelCls}><FileText size={14} className="text-purple-500" /> Kategori *</label>
                            <select
                                className={`${baseInput} ${errors.category ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-300'}`}
                                value={category}
                                onChange={e => { setCategory(e.target.value); setErrors(p => ({ ...p, category: '' })); }}
                                disabled={loading}
                            >
                                <option value="">Seçiniz</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}><Star size={14} className="text-amber-500" /> Durum</label>
                            <select
                                className={`${baseInput} border-slate-300`}
                                value={status}
                                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                                disabled={loading}
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Pasif</option>
                            </select>
                        </div>
                    </div>
                    {/* Price */}
                    <div className="space-y-1.5">
                        <label className={labelCls}><DollarSign size={14} className="text-green-500" /> Fiyat (₺) *</label>
                        <div className="relative">
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                className={`${baseInput} pr-10 ${errors.price ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-300'}`}
                                value={price}
                                placeholder="0.00"
                                onChange={e => { setPrice(e.target.value); setErrors(p => ({ ...p, price: '' })); }}
                                disabled={loading}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₺</span>
                        </div>
                        {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                    </div>
                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className={labelCls}><FileText size={14} className="text-blue-500" /> Açıklama</label>
                        <textarea
                            rows={3}
                            className={`${baseInput} resize-none border-slate-300`}
                            value={description}
                            placeholder="Ürün hakkında kısa açıklama"
                            onChange={e => setDescription(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    {/* Images */}
                    <div className="space-y-2">
                        <label className={labelCls}><Camera size={14} className="text-pink-500" /> Görseller * (max 3)</label>
                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                            {images.map((img, idx) => {
                                const url = previewUrl(img);
                                const isMain = ((): boolean => {
                                    if (typeof img === 'string' || img instanceof File) return idx === 0; // provisional first
                                    return !!img.mainPicture;
                                })();
                                return (
                                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border bg-slate-50">
                                        <img src={url} alt="ürün" className="w-full h-full object-cover" />
                                        {isMain && <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">ANA</span>}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                            <button type="button" onClick={() => makeMain(idx)} disabled={isMain || loading} className="p-2 rounded bg-white/90 hover:bg-white text-slate-700 text-xs font-medium">
                                                {isMain ? 'Ana' : 'Ana Yap'}
                                            </button>
                                            <button type="button" onClick={() => removeImage(idx)} disabled={loading} className="p-2 rounded bg-white/90 hover:bg-white text-red-600">
                                                <Trash2 size={14} />
                                            </button>
                                            <label className="p-2 rounded bg-white/90 hover:bg-white text-indigo-600 cursor-pointer">
                                                <Pencil size={14} />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0];
                                                        if (f) replaceImage(idx, f);
                                                    }}
                                                    disabled={loading}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                            {images.length < 3 && (
                                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer text-xs gap-1">
                                    <Plus size={20} />
                                    <span>Ekle</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={addImages} disabled={loading} />
                                </label>
                            )}
                        </div>
                        {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
                        <p className="text-[10px] text-slate-400">JPG/PNG önerilir. İlk görsel varsayılan ana görsel olur.</p>
                    </div>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-4 rounded-xl md:rounded-2xl mb-2 sm:px-6 py-3 border-t bg-slate-50 mt-auto sticky bottom-0 md:static" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                        <button type="button" onClick={close} disabled={loading} className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600">İptal</button>
                        <button type="submit" disabled={!canSubmit} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                            Kaydet
                        </button>
                </div>
                </form>
            </div>
        </div>
    );
}
