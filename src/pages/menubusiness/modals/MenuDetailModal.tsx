import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Edit3, 
    Save, 
    Star, 
    Eye, 
    Heart, 
    DollarSign, 
    Tag, 
    Clock,
    ChefHat,
    Image as ImageIcon,
    Trash2,
    Plus,
    ArrowLeftCircle,
    ArrowRightCircle
} from 'lucide-react';
import { MenuItemDetailed, MenuImage } from '../../../types';

// Locally narrowed type to ensure images are always concrete MenuImage[] inside the modal state
type LocalMenuItemDetailed = Omit<MenuItemDetailed, 'images'> & { images: MenuImage[] };

interface MenuDetailModalProps {
    item: MenuItemDetailed;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (updatedItem: MenuItemDetailed) => void;
}

const MenuDetailModal: React.FC<MenuDetailModalProps> = ({ 
    item, 
    isOpen, 
    onClose, 
    onUpdate 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const normalizeImages = (imgs: MenuItemDetailed['images']): MenuImage[] => {
        if (!imgs) return [];
        if (Array.isArray(imgs) && imgs.length && typeof imgs[0] === 'string') {
            return (imgs as string[]).map((url, i) => ({ url, mainPicture: i === 0 }));
        }
    return (imgs as MenuImage[]).map(m => ({ ...m, mainPicture: !!m.mainPicture }));
    };

    const [editedItem, setEditedItem] = useState<LocalMenuItemDetailed>({
        ...(item as MenuItemDetailed),
        images: normalizeImages(item.images)
    });
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState('');

    const STATUS_OPTIONS = [
        { value: 'active', label: 'Aktif' },
        { value: 'inactive', label: 'Pasif' },
        { value: 'draft', label: 'Taslak' }
    ];

    const handleFieldChange = <K extends keyof LocalMenuItemDetailed>(key: K, value: LocalMenuItemDetailed[K]) => {
        setEditedItem(prev => ({ ...prev, [key]: value }));
    };

   
    useEffect(() => {
        if (!isOpen) return;
        const docEl = document.documentElement;
        const prevOverflow = docEl.style.overflow;
        const prevPaddingRight = docEl.style.paddingRight;
        const scrollBarWidth = window.innerWidth - docEl.clientWidth;
        if (scrollBarWidth > 0) docEl.style.paddingRight = `${scrollBarWidth}px`;
        docEl.style.overflow = 'hidden';
        const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', escHandler);
        return () => {
            window.removeEventListener('keydown', escHandler);
            docEl.style.overflow = prevOverflow;
            docEl.style.paddingRight = prevPaddingRight;
        };
    }, [isOpen, onClose]);

    useEffect(() => {
    if (isOpen && !isEditing) setEditedItem({ ...(item as MenuItemDetailed), images: normalizeImages(item.images) });
    }, [item, isOpen, isEditing]);

    const handleSave = async () => {
        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
    let images = editedItem.images || [];
        if (images.length && !images.some(i => i.mainPicture)) {
            images = images.map((img, idx) => ({ ...img, mainPicture: idx === 0 }));
        }
    onUpdate?.({ ...(editedItem as MenuItemDetailed), images });
        setIsEditing(false);
        setIsLoading(false);
    };

    const handleCancel = () => {
    setEditedItem({ ...(item as MenuItemDetailed), images: normalizeImages(item.images) });
        setIsEditing(false);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', text: 'Aktif' },
            inactive: { color: 'bg-red-100 text-red-800', text: 'Pasif' },
            draft: { color: 'bg-yellow-100 text-yellow-800', text: 'Taslak' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    if (!isOpen) return null;


    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow">
                    <div className="flex items-center gap-3">
                        <ChefHat size={24} />
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold leading-none">Ürün Detayı</h2>
                            <p className="text-purple-100 text-xs sm:text-sm mt-1">{item.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <Edit3 size={18} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content area */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    className="flex-1 overflow-y-auto p-4 sm:p-6"
                >
                    {/* Header */}
                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video sm:aspect-square shadow">
                                    {editedItem.images && (editedItem.images as MenuImage[]).length > 0 ? (
                                        <>
                                            <img
                                                src={(editedItem.images as MenuImage[])[selectedImageIndex]?.url}
                                                alt={editedItem.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {isEditing && (
                                                <div className="absolute bottom-2 right-2 flex gap-2 bg-white/80 backdrop-blur px-2 py-1 rounded-lg shadow">
                                                    <button
                                                        type="button"
                                                        aria-label="Önceki"
                                                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                                                        disabled={selectedImageIndex === 0}
                                                        onClick={() => setSelectedImageIndex(i => Math.max(0, i - 1))}
                                                    >
                                                        <ArrowLeftCircle size={20} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Sonraki"
                                                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                                                        disabled={selectedImageIndex >= (editedItem.images?.length || 1) - 1}
                                                        onClick={() => setSelectedImageIndex(i => Math.min((editedItem.images?.length || 1) - 1, i + 1))}
                                                    >
                                                        <ArrowRightCircle size={20} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Görseli sil"
                                                        className="p-1 rounded hover:bg-red-100"
                                                        onClick={() => {
                                                            setEditedItem((prev: LocalMenuItemDetailed) => {
                                                                const imgs: MenuImage[] = [...prev.images];
                                                                imgs.splice(selectedImageIndex, 1);
                                                                return { ...prev, images: imgs };
                                                            });
                                                            setSelectedImageIndex(i => Math.max(0, i - 1));
                                                        }}
                                                    >
                                                        <Trash2 size={18} className="text-red-600" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon size={64} />
                                        </div>
                                    )}
                                    
                                    {/* Status Badge Overlay */}
                                    <div className="absolute top-4 left-4">
                                        {getStatusBadge(item.status)}
                                    </div>
                                </div>

                                {/* Thumbnail Gallery */}
                                {editedItem.images && (editedItem.images as MenuImage[]).length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {(editedItem.images as MenuImage[]).map((image, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedImageIndex(index);} }}
                                                className={`relative bg-gray-100 rounded-lg overflow-hidden w-20 h-20 flex-shrink-0 border-2 transition-colors cursor-pointer ${
                                                    selectedImageIndex === index 
                                                        ? 'border-purple-500' 
                                                        : 'border-transparent hover:border-gray-300'
                                                }`}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`${item.name} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                {image.mainPicture && (
                                                    <span className="absolute bottom-1 left-1 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold shadow">ANA</span>
                                                )}
                                                {isEditing && (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditedItem((prev: LocalMenuItemDetailed) => {
                                                                const imgs: MenuImage[] = prev.images.map(i => ({ ...i }));
                                                                imgs.splice(index, 1);
                                                                return { ...prev, images: imgs };
                                                            });
                                                            if (selectedImageIndex >= (editedItem.images?.length || 1) - 1) {
                                                                setSelectedImageIndex(i => Math.max(0, i - 1));
                                                            }
                                                        }}
                                                        className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 hover:bg-red-100"
                                                    >
                                                        <Trash2 size={14} className="text-red-600" />
                                                    </span>
                                                )}
                                                {isEditing && !image.mainPicture && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditedItem((prev: LocalMenuItemDetailed) => ({
                                                                ...prev,
                                                                images: prev.images.map((img, i) => ({ ...img, mainPicture: i === index }))
                                                            }));
                                                        }}
                                                        className="absolute bottom-1 right-1 bg-white/80 hover:bg-white text-[10px] px-1 py-0.5 rounded font-medium shadow"
                                                    >
                                                        ANA YAP
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add new image */}
                                {isEditing && (
                                    <form
                                        className="flex gap-2 items-center pt-1"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!newImageUrl.trim()) return;
                                            setEditedItem((prev: LocalMenuItemDetailed) => ({
                                                ...prev,
                                                images: [
                                                    ...prev.images,
                                                    { url: newImageUrl.trim(), mainPicture: !prev.images.some(i => i.mainPicture) }
                                                ]
                                            }));
                                            setNewImageUrl('');
                                        }}
                                    >
                                        <input
                                            value={newImageUrl}
                                            onChange={e => setNewImageUrl(e.target.value)}
                                            placeholder="Yeni görsel URL"
                                            className="flex-1 min-w-0 p-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                        />
                                        <button
                                            type="submit"
                                            className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                                            disabled={!newImageUrl.trim()}
                                        >
                                            <Plus size={14} /> Ekle
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="space-y-6">
                                {/* Name & Price */}
                                <div>
                                    {isEditing ? (
                                        <div className="flex flex-col gap-3">
                                            <input
                                                type="text"
                                                value={editedItem.name}
                                                onChange={(e) => handleFieldChange('name', e.target.value as any)}
                                                className="text-2xl font-bold w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                            />
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input
                                                    type="text"
                                                    value={editedItem.category}
                                                    onChange={(e) => handleFieldChange('category', e.target.value as any)}
                                                    placeholder="Kategori"
                                                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                                                />
                                                <select
                                                    value={editedItem.status as any}
                                                    onChange={(e) => handleFieldChange('status', e.target.value as any)}
                                                    className="p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                                                >
                                                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <h1 className="text-2xl font-bold text-gray-800">{editedItem.name}</h1>
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{editedItem.category}</span>
                                                {getStatusBadge(editedItem.status as any)}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-4 mt-2">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="number"
                                                    value={editedItem.price}
                                                    onChange={(e) => handleFieldChange('price', Number(e.target.value) as any)}
                                                    className="text-xl font-bold text-purple-600 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 w-32"
                                                />
                                                <div className="flex items-center gap-2 text-amber-500">
                                                    <Star size={16} fill="currentColor" />
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={5}
                                                        step={0.1}
                                                        value={editedItem.rating as any || 0}
                                                        onChange={(e) => handleFieldChange('rating', parseFloat(e.target.value) as any)}
                                                        className="w-20 p-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 text-sm bg-white"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xl font-bold text-purple-600">{editedItem.price}₺</span>
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    <Star size={16} fill="currentColor" />
                                                    <span className="text-sm font-medium">{editedItem.rating || 4.5}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[{
                                        key: 'views',
                                        icon: Eye,
                                        label: 'Görüntülenme',
                                        color: 'purple',
                                        value: (editedItem as any).views || 245
                                    }, {
                                        key: 'likes',
                                        icon: Heart,
                                        label: 'Beğeni',
                                        color: 'red',
                                        value: (editedItem as any).likes || 89
                                    }, {
                                        key: 'popularity',
                                        icon: DollarSign,
                                        label: 'Popülerlik',
                                        color: 'green',
                                        value: (editedItem as any).popularity || 156
                                    }].map(stat => (
                                        <div key={stat.key} className={`rounded-lg p-3 text-center bg-${stat.color}-50`}>
                                            <stat.icon size={20} className={`text-${stat.color}-600 mx-auto mb-1`} />
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={stat.value}
                                                    onChange={e => setEditedItem(prev => ({ ...prev, [stat.key]: Number(e.target.value) } as any))}
                                                    className={`w-full text-center text-sm font-medium text-${stat.color}-700 p-1 border rounded focus:outline-none focus:border-${stat.color}-400`}
                                                />
                                            ) : (
                                                <div className={`text-sm font-medium text-${stat.color}-600`}>{stat.value}</div>
                                            )}
                                            <div className="text-xs text-gray-600">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Açıklama</h3>
                                    {isEditing ? (
                                        <textarea
                                            value={editedItem.description}
                                            onChange={(e) => handleFieldChange('description', e.target.value as any)}
                                            rows={5}
                                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                                            placeholder="Ürün açıklaması..."
                                        />
                                    ) : (
                                        <p className="text-gray-600 leading-relaxed">{editedItem.description}</p>
                                    )}
                                </div>

                                {/* Category & Tags */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Kategori</h3>
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-gray-500" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedItem.category}
                                                onChange={(e) => handleFieldChange('category', e.target.value as any)}
                                                className="px-3 py-2 rounded-full border-2 border-gray-300 bg-white text-sm focus:outline-none focus:border-purple-500"
                                            />
                                        ) : (
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                                {editedItem.category}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Preparation Time */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Hazırlık Süresi</h3>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-500" />
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editedItem.prepTime || 15}
                                                onChange={(e) => handleFieldChange('prepTime', (parseInt(e.target.value) || 15) as any)}
                                                className="p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 w-32"
                                                min="1"
                                                max="120"
                                            />
                                        ) : (
                                            <span className="text-gray-600">{editedItem.prepTime || 15} dk</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/* Footer (sticks to bottom on mobile) */}
                    {isEditing && (
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end max-w-5xl mx-auto">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Kaydet
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default MenuDetailModal;
