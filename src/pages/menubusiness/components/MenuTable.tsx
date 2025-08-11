import { Edit, Trash2, Eye, Star, Tag, Heart, TrendingUp } from "lucide-react";
import { useState, useCallback, memo } from "react";
import MenuDetailModal from "../modals/MenuDetailModal";
import { MenuItemDetailed, MenuTableProps, MenuImage } from "../../../types";
import "../animations.css";

interface ExtendedMenuTableProps extends MenuTableProps {
    viewMode?: "grid" | "list";
}

const MenuCard = memo(({ menuItem, index, onRowClick, onEdit, onDelete }: {
    menuItem: MenuItemDetailed;
    index: number;
    onRowClick: (item: MenuItemDetailed) => void;
    onEdit?: (item: MenuItemDetailed) => void;
    onDelete?: (id: string) => void;
}) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = useCallback(() => {
        setIsImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
        setImageError(true);
        setIsImageLoaded(true);
    }, []);

    const resolveMainImage = (): string | undefined => {
        const imgs = menuItem.images as any;
        if (!imgs) return menuItem.image;
        if (Array.isArray(imgs) && imgs.length) {
            if (typeof imgs[0] === 'string') return imgs[0] as string;
            const found = (imgs as MenuImage[]).find(i => i.mainPicture) || (imgs as MenuImage[])[0];
            return found?.url;
        }
        return menuItem.image;
    };
    const mainImg = resolveMainImage();
    return (
        <div
            className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-smooth overflow-hidden border border-white/50 hover:border-indigo-200 cursor-pointer hover-lift animate-fade-in-up"
            style={{ animationDelay: `${Math.min(8, index) * 80}ms` }}
            onClick={() => onRowClick(menuItem)}
        >
            {/* Image Container */}
            <div className="relative h-56 overflow-hidden">
                {!isImageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 shimmer"></div>
                )}
                
                <img
                    src={imageError ? "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80" : mainImg || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80"}
                    alt={menuItem.name}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-smooth ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Status Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                    menuItem.status === "active" 
                        ? "bg-emerald-500/90 text-white" 
                        : "bg-slate-500/90 text-white"
                }`}>
                    {menuItem.status === "active" ? "✅ Aktif" : "⏸️ Pasif"}
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {menuItem.price}₺
                    </span>
                </div>

                {/* Popularity Indicator */}
                {menuItem.popularity && menuItem.popularity > 80 && (
                    <div className="absolute bottom-4 left-4 bg-orange-500/90 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                        <TrendingUp size={12} />
                        Popüler
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth flex items-end justify-center pb-6">
                    <div className="flex gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRowClick(menuItem);
                            }}
                            className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl hover:bg-white transition-smooth shadow-lg hover-scale btn-press"
                            title="Detayları Görüntüle"
                        >
                            <Eye size={18} className="text-slate-700" />
                        </button>
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(menuItem);
                                }}
                                className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl hover:bg-white transition-smooth shadow-lg hover-scale btn-press"
                                title="Düzenle"
                            >
                                <Edit size={18} className="text-indigo-600" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(menuItem.id);
                                }}
                                className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl hover:bg-white transition-smooth shadow-lg hover-scale btn-press"
                                title="Sil"
                            >
                                <Trash2 size={18} className="text-red-500" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-xl text-slate-800 line-clamp-2 flex-1 mr-2 leading-tight">
                        {menuItem.name}
                    </h3>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                        <Tag size={14} className="text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            {menuItem.category}
                        </span>
                    </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10 leading-relaxed">
                    {menuItem.description || "Açıklama bulunmuyor..."}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Star size={16} className="text-amber-400 fill-current" />
                            <span className="text-sm font-medium text-slate-600">{menuItem.rating || 4.5}</span>
                        </div>
                        {menuItem.likes && (
                            <div className="flex items-center gap-1">
                                <Heart size={14} className="text-red-400 fill-current" />
                                <span className="text-xs text-slate-500">{menuItem.likes}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRowClick(menuItem);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm hover:underline transition-smooth"
                    >
                        Detayları Gör →
                    </button>
                </div>
            </div>
        </div>
    );
});

MenuCard.displayName = 'MenuCard';
export default function MenuTable({ items, onEdit, onDelete, onUpdate, viewMode = "grid" }: ExtendedMenuTableProps) {
    const [detailOpen, setDetailOpen] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<MenuItemDetailed | null>(null);

    const handleRowClick = useCallback((item: MenuItemDetailed): void => {
        setSelectedItem(item);
        setDetailOpen(true);
    }, []);

    const handleUpdate = useCallback(async (updatedItem: MenuItemDetailed): Promise<void> => {
        if (onUpdate) await onUpdate(updatedItem.id, updatedItem);
        setDetailOpen(false);
    }, [onUpdate]);

    if (viewMode === "grid") {
        return (
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {items.map((menuItem, index) => (
                        <MenuCard
                            key={menuItem.id}
                            menuItem={menuItem}
                            index={index}
                            onRowClick={handleRowClick}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>

                {selectedItem && (
                    <MenuDetailModal
                        isOpen={detailOpen}
                        onClose={() => setDetailOpen(false)}
                        item={selectedItem}
                        onUpdate={handleUpdate}
                    />
                )}
            </div>
        );
    }

    // List View - Enhanced
    return (
        <div className="p-6">
            <div className="space-y-6">
                {items.map((menuItem, idx) => (
                    <div
                        key={menuItem.id}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-smooth border border-white/50 hover:border-indigo-200 overflow-hidden cursor-pointer hover-lift animate-fade-in"
                        style={{ animationDelay: `${Math.min(12, idx) * 60}ms` }}
                        onClick={() => handleRowClick(menuItem)}
                    >
                        <div className="flex items-center p-6">
                            {/* Enhanced Image */}
                            <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
                                <img
                                    src={(() => { const imgs = menuItem.images as any; if (imgs && imgs.length){ if (typeof imgs[0] === 'string') return imgs[0]; const f=(imgs as MenuImage[]).find(i=>i.mainPicture)||(imgs as MenuImage[])[0]; return f?.url;} return menuItem.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80"; })()}
                                    alt={menuItem.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-smooth"
                                />
                            </div>

                            {/* Enhanced Content */}
                            <div className="flex-1 ml-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl text-slate-800 mb-2">{menuItem.name}</h3>
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                                                <Tag size={12} />
                                                {menuItem.category}
                                            </span>
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                                                menuItem.status === "active" 
                                                    ? "bg-emerald-100 text-emerald-700" 
                                                    : "bg-slate-200 text-slate-600"
                                            }`}>
                                                {menuItem.status === "active" ? "✅ Aktif" : "⏸️ Pasif"}
                                            </span>
                                            {menuItem.popularity && menuItem.popularity > 80 && (
                                                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                                                    <TrendingUp size={10} />
                                                    Popüler
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                            {menuItem.description || "Açıklama bulunmuyor..."}
                                        </p>
                                    </div>

                                    {/* Enhanced Price and Actions */}
                                    <div className="flex items-center gap-6 ml-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                {menuItem.price}₺
                                            </div>
                                            <div className="flex items-center gap-2 justify-center mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Star size={14} className="text-amber-400 fill-current" />
                                                    <span className="text-xs text-slate-500 font-medium">{menuItem.rating || 4.5}</span>
                                                </div>
                                                {menuItem.likes && (
                                                    <div className="flex items-center gap-1">
                                                        <Heart size={12} className="text-red-400 fill-current" />
                                                        <span className="text-xs text-slate-500">{menuItem.likes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRowClick(menuItem);
                                                }}
                                                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-smooth hover-scale btn-press"
                                                title="Detayları Görüntüle"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {onEdit && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(menuItem);
                                                    }}
                                                    className="p-3 rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-indigo-600 hover:text-indigo-700 transition-smooth hover-scale btn-press"
                                                    title="Düzenle"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(menuItem.id);
                                                    }}
                                                    className="p-3 rounded-2xl bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-smooth hover-scale btn-press"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedItem && (
                <MenuDetailModal
                    isOpen={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    item={selectedItem}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
}
