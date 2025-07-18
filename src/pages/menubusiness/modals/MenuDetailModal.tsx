import React, { useState } from 'react';
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
    Image as ImageIcon
} from 'lucide-react';
import { MenuItemDetailed } from '../../../types';

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
    const [editedItem, setEditedItem] = useState<MenuItemDetailed>(item);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        onUpdate?.(editedItem);
        setIsEditing(false);
        setIsLoading(false);
    };

    const handleCancel = () => {
        setEditedItem(item);
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

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ChefHat size={24} />
                                <div>
                                    <h2 className="text-xl font-bold">Ürün Detayı</h2>
                                    <p className="text-purple-100 text-sm">{item.category}</p>
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
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square">
                                    {item.images && item.images.length > 0 ? (
                                        <img
                                            src={item.images[selectedImageIndex]}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
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
                                {item.images && item.images.length > 1 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {item.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`relative bg-gray-100 rounded-lg overflow-hidden aspect-square border-2 transition-colors ${
                                                    selectedImageIndex === index 
                                                        ? 'border-purple-500' 
                                                        : 'border-transparent hover:border-gray-300'
                                                }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${item.name} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="space-y-6">
                                {/* Name & Price */}
                                <div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedItem.name}
                                            onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                                            className="text-2xl font-bold w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                        />
                                    ) : (
                                        <h1 className="text-2xl font-bold text-gray-800">{item.name}</h1>
                                    )}
                                    
                                    <div className="flex items-center gap-4 mt-2">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editedItem.price}
                                                onChange={(e) => setEditedItem({ ...editedItem, price: Number(e.target.value) })}
                                                className="text-xl font-bold text-purple-600 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 w-32"
                                            />
                                        ) : (
                                            <span className="text-xl font-bold text-purple-600">{item.price}₺</span>
                                        )}
                                        
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star size={16} fill="currentColor" />
                                            <span className="text-sm font-medium">{item.rating || 4.5}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                                        <Eye size={20} className="text-purple-600 mx-auto mb-1" />
                                        <div className="text-sm font-medium text-purple-600">{item.views || 245}</div>
                                        <div className="text-xs text-gray-600">Görüntülenme</div>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3 text-center">
                                        <Heart size={20} className="text-red-600 mx-auto mb-1" />
                                        <div className="text-sm font-medium text-red-600">{item.likes || 89}</div>
                                        <div className="text-xs text-gray-600">Beğeni</div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <DollarSign size={20} className="text-green-600 mx-auto mb-1" />
                                        <div className="text-sm font-medium text-green-600">{item.popularity || 156}</div>
                                        <div className="text-xs text-gray-600">Satış</div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Açıklama</h3>
                                    {isEditing ? (
                                        <textarea
                                            value={editedItem.description}
                                            onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                                            rows={4}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                                            placeholder="Ürün açıklaması..."
                                        />
                                    ) : (
                                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                    )}
                                </div>

                                {/* Category & Tags */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Kategori</h3>
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-gray-500" />
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Preparation Time */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Hazırlık Süresi</h3>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-500" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedItem.prepTime || '15-20 dk'}
                                                onChange={(e) => setEditedItem({ ...editedItem, prepTime: e.target.value })}
                                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 w-32"
                                            />
                                        ) : (
                                            <span className="text-gray-600">{item.prepTime || '15-20 dk'}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    {isEditing && (
                        <div className="border-t border-gray-200 p-6">
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MenuDetailModal;
