import React, { useState, useEffect } from 'react';
import { X, Package, Palette, FileText, Hash, Lightbulb } from 'lucide-react';
import { StockType } from '@/types/stock';

interface StockTypeAddModalProps {
    open: boolean;
    onClose: () => void;
    onAdd?: (stockType: Omit<StockType, 'id' | 'itemCount'>) => void;
    onUpdate?: (id: string, stockType: Omit<StockType, 'id' | 'itemCount'>) => void;
    editingStockType?: StockType | null;
    isEditMode?: boolean;
}

const StockTypeAddModal: React.FC<StockTypeAddModalProps> = ({
    open,
    onClose,
    onAdd,
    onUpdate,
    editingStockType,
    isEditMode = false
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: 'from-blue-500 to-blue-600',
        icon: '📦',
        examples: ['']
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Animasyon kontrolü
    useEffect(() => {
        if (open) {
            setShouldRender(true);
            // Kısa bir delay ile animasyonu başlat
            setTimeout(() => setIsAnimating(true), 100);
        } else {
            setIsAnimating(false);
            // Animasyon bitimini bekle ve modal'ı DOM'dan kaldır
            setTimeout(() => setShouldRender(false), 200);
        }
    }, [open]);

    // Edit mode için form data'yı initialize et
    useEffect(() => {
        if (isEditMode && editingStockType && open) {
            setFormData({
                name: editingStockType.name,
                description: editingStockType.description,
                color: editingStockType.color,
                icon: editingStockType.icon,
                examples: [...editingStockType.examples]
            });
        } else if (!isEditMode && open) {
            // Add mode için default değerler
            setFormData({
                name: '',
                description: '',
                color: 'from-blue-500 to-blue-600',
                icon: '📦',
                examples: ['']
            });
        }
    }, [isEditMode, editingStockType, open]);

    // Önceden tanımlı renk seçenekleri
    const colorOptions = [
        { label: 'Mavi', value: 'from-blue-500 to-blue-600', preview: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { label: 'Yeşil', value: 'from-green-500 to-green-600', preview: 'bg-gradient-to-r from-green-500 to-green-600' },
        { label: 'Turuncu', value: 'from-orange-500 to-orange-600', preview: 'bg-gradient-to-r from-orange-500 to-orange-600' },
        { label: 'Kırmızı', value: 'from-red-500 to-red-600', preview: 'bg-gradient-to-r from-red-500 to-red-600' },
        { label: 'Mor', value: 'from-purple-500 to-purple-600', preview: 'bg-gradient-to-r from-purple-500 to-purple-600' },
        { label: 'Sarı', value: 'from-yellow-500 to-yellow-600', preview: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
        { label: 'Pembe', value: 'from-pink-500 to-pink-600', preview: 'bg-gradient-to-r from-pink-500 to-pink-600' },
        { label: 'Cyan', value: 'from-cyan-500 to-cyan-600', preview: 'bg-gradient-to-r from-cyan-500 to-cyan-600' }
    ];

    // Önceden tanımlı icon seçenekleri
    const iconOptions = [
        '📦', '🥗', '🍽️', '🧽', '🔧', '🥤', '🍔', '🍕', '🥘', '🍰',
        '☕', '🥖', '🧊', '🫖', '🍳', '🥄', '🍴', '📋', '🏷️', '📊'
    ];

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Stok türü adı gereklidir';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Stok türü adı en az 2 karakter olmalıdır';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Açıklama gereklidir';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Açıklama en az 10 karakter olmalıdır';
        }

        const validExamples = formData.examples.filter(example => example.trim());
        if (validExamples.length === 0) {
            newErrors.examples = 'En az bir örnek ürün eklemelisiniz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const validExamples = formData.examples.filter(example => example.trim());
            const stockTypeData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                color: formData.color,
                icon: formData.icon,
                examples: validExamples
            };

            if (isEditMode && editingStockType && onUpdate) {
                onUpdate(editingStockType.id, stockTypeData);
            } else if (!isEditMode && onAdd) {
                onAdd(stockTypeData);
            }

            handleClose();
        }
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setFormData({
                name: '',
                description: '',
                color: 'from-blue-500 to-blue-600',
                icon: '📦',
                examples: ['']
            });
            setErrors({});
            onClose();
        }, 200);
    };

    const addExampleField = () => {
        setFormData(prev => ({
            ...prev,
            examples: [...prev.examples, '']
        }));
    };

    const removeExampleField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            examples: prev.examples.filter((_, i) => i !== index)
        }));
    };

    const updateExample = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            examples: prev.examples.map((example, i) => i === index ? value : example)
        }));
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0  flex items-center justify-center z-50 p-4 transition-all duration-200 ease-out ${isAnimating
                    ? 'bg-opacity-50 bg-gray-700/20 backdrop-blur-sm'
                    : 'bg-opacity-0 backdrop-blur-none'
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80%] overflow-y-auto transition-all duration-200 ease-out transform ${isAnimating
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-95 opacity-0 translate-y-4'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex sticky top-0 bg-white z-10 items-center justify-between p-6 border-b border-gray-200 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 bg-gradient-to-r ${formData.color} rounded-xl text-white`}>
                            <span className="text-xl">{formData.icon}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditMode ? 'Stok Türünü Düzenle' : 'Yeni Stok Türü Ekle'}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {isEditMode ? 'Mevcut stok türünü güncelleyin' : 'Yeni bir stok türü oluşturun'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Stok Türü Adı */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Package size={16} />
                            Stok Türü Adı
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Örn: Hammadde, Temizlik Malzemesi..."
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Açıklama */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FileText size={16} />
                            Açıklama
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Bu stok türünün ne için kullanıldığını açıklayın..."
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Renk Seçimi */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Palette size={16} />
                            Renk Teması
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {colorOptions.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                                    className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${formData.color === color.value
                                            ? 'border-gray-800 ring-2 ring-gray-300'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`h-8 w-full ${color.preview} rounded-lg mb-1`}></div>
                                    <p className="text-xs text-gray-600">{color.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Icon Seçimi */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Hash size={16} />
                            Icon Seçimi
                        </label>
                        <div className="grid grid-cols-10 gap-2">
                            {iconOptions.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                    className={`p-3 rounded-lg border transition-all hover:scale-110 ${formData.icon === icon
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Örnek Ürünler */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Lightbulb size={16} />
                            Örnek Ürünler
                        </label>
                        <div className="space-y-3">
                            {formData.examples.map((example, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={example}
                                        onChange={(e) => updateExample(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={`Örnek ürün ${index + 1}`}
                                    />
                                    {formData.examples.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeExampleField(index)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addExampleField}
                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                            >
                                + Örnek Ekle
                            </button>
                        </div>
                        {errors.examples && <p className="text-red-500 text-sm mt-1">{errors.examples}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-6 py-3 bg-gradient-to-r ${formData.color} text-white rounded-xl hover:shadow-lg transition-all font-semibold transform hover:scale-105`}
                        >
                            {isEditMode ? 'Güncelle' : 'Stok Türü Ekle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockTypeAddModal;