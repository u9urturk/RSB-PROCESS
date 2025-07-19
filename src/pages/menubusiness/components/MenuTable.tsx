import { Edit, Trash2, Eye, Star, Tag, MoreVertical } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import MenuDetailModal from "../modals/MenuDetailModal";
import { MenuItemDetailed, MenuTableProps } from "../../../types";

interface ExtendedMenuTableProps extends MenuTableProps {
    viewMode?: "grid" | "list";
}

export default function MenuTable({ items, onEdit, onDelete, onUpdate, viewMode = "grid" }: ExtendedMenuTableProps) {
    const [detailOpen, setDetailOpen] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<MenuItemDetailed | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const handleRowClick = (item: MenuItemDetailed): void => {
        setSelectedItem(item);
        setDetailOpen(true);
    };

    const handleUpdate = async (updatedItem: MenuItemDetailed): Promise<void> => {
        if (onUpdate) await onUpdate(updatedItem.id, updatedItem);
        setDetailOpen(false);
    };

    const handleDropdownToggle = (itemId: string) => {
        setActiveDropdown(activeDropdown === itemId ? null : itemId);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (viewMode === "grid") {
        return (
            <div className="p-6">
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {items.map(menuItem => (
                        <motion.div
                            key={menuItem.id}
                            variants={item}
                            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200"
                        >
                            {/* Image Container */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={menuItem.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80"}
                                    alt={menuItem.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                
                                {/* Status Badge */}
                                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                                    menuItem.status === "active" 
                                        ? "bg-green-500 text-white shadow-lg" 
                                        : "bg-gray-500 text-white shadow-lg"
                                }`}>
                                    {menuItem.status === "active" ? "Aktif" : "Pasif"}
                                </div>

                                {/* Price Badge */}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <span className="text-lg font-bold text-orange-600">{menuItem.price}₺</span>
                                </div>

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRowClick(menuItem);
                                        }}
                                        className="p-3 bg-white rounded-full hover:bg-gray-50 transition-colors"
                                        title="Detayları Görüntüle"
                                    >
                                        <Eye size={18} className="text-gray-700" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit && onEdit(menuItem);
                                        }}
                                        className="p-3 bg-white rounded-full hover:bg-gray-50 transition-colors"
                                        title="Düzenle"
                                    >
                                        <Edit size={18} className="text-orange-600" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete && onDelete(menuItem.id);
                                        }}
                                        className="p-3 bg-white rounded-full hover:bg-gray-50 transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 size={18} className="text-red-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 truncate flex-1 mr-2">
                                        {menuItem.name}
                                    </h3>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDropdownToggle(menuItem.id);
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                        >
                                            <MoreVertical size={16} className="text-gray-400" />
                                        </button>
                                        
                                        {activeDropdown === menuItem.id && (
                                            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-32">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRowClick(menuItem);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Eye size={14} />
                                                    Görüntüle
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit && onEdit(menuItem);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Edit size={14} />
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete && onDelete(menuItem.id);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                    Sil
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <Tag size={14} className="text-gray-400" />
                                    <span className="text-sm text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                                        {menuItem.category}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
                                    {menuItem.description || "Açıklama bulunmuyor..."}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Star size={16} className="text-yellow-400 fill-current" />
                                        <span className="text-sm text-gray-600">4.5</span>
                                    </div>
                                    <button
                                        onClick={() => handleRowClick(menuItem)}
                                        className="text-orange-600 hover:text-orange-700 font-medium text-sm hover:underline"
                                    >
                                        Detayları Gör
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

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

    // List View
    return (
        <div className="p-6">
            <div className="space-y-4">
                {items.map(menuItem => (
                    <motion.div
                        key={menuItem.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200 overflow-hidden"
                    >
                        <div className="flex items-center p-4">
                            {/* Image */}
                            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                                <img
                                    src={menuItem.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80"}
                                    alt={menuItem.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 ml-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">{menuItem.name}</h3>
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-sm text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                                                {menuItem.category}
                                            </span>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                menuItem.status === "active" 
                                                    ? "bg-green-100 text-green-700" 
                                                    : "bg-gray-200 text-gray-600"
                                            }`}>
                                                {menuItem.status === "active" ? "Aktif" : "Pasif"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-1">
                                            {menuItem.description || "Açıklama bulunmuyor..."}
                                        </p>
                                    </div>

                                    {/* Price and Actions */}
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-orange-600">{menuItem.price}₺</div>
                                            <div className="flex items-center gap-1 justify-end">
                                                <Star size={14} className="text-yellow-400 fill-current" />
                                                <span className="text-xs text-gray-500">4.5</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRowClick(menuItem)}
                                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
                                                title="Detayları Görüntüle"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => onEdit && onEdit(menuItem)}
                                                className="p-2 rounded-lg hover:bg-orange-100 text-orange-600 hover:text-orange-700 transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete && onDelete(menuItem.id)}
                                                className="p-2 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
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
