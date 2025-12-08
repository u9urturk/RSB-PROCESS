import React, { useState, useEffect } from 'react';
import { X, Truck, User, Phone, Mail, MapPin, FileText, Calendar, CreditCard, Package } from 'lucide-react';
import { Supplier } from '@/types/stock';


interface SupplierAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Omit<Supplier, 'id' | 'totalOrders' | 'monthlyDeliveries'>) => Promise<void>;
    editingSupplier?: Supplier | null;
}

const SupplierAddModal: React.FC<SupplierAddModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingSupplier
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        phone: '',
        email: '',
        rating: 5,
        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'PENDING',
        address: '',
        contactPerson: '',
        taxNumber: '',
        paymentTerms: '',
        deliveryTime: 1,
        minimumOrder: 1000,
        products: [] as string[],
        contractStartDate: '',
        contractEndDate: '',
        contactInfo: '',
        leadTimeDays: 1,
        isActive: true
    });

    const [newProduct, setNewProduct] = useState('');

    // Utility function to format ISO date strings to YYYY-MM-DD for date inputs
    const formatDateForInput = (isoString: string | undefined) => {
        if (!isoString) return '';
        try {
            // If it's already in YYYY-MM-DD format, return as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
                return isoString;
            }
            // Otherwise, convert from ISO string to YYYY-MM-DD
            const date = new Date(isoString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.warn('Error formatting date:', isoString, error);
            return '';
        }
    };

    const categories = [
        'Genel Gıda',
        'Et Ürünleri',
        'Sebze & Meyve',
        'Süt Ürünleri',
        'Baharat & Bakliyat',
        'İçecek',
        'Temizlik Ürünleri',
        'Ambalaj Malzemeleri'
    ];

    const paymentTermOptions = [
        '7 gün',
        '15 gün',
        '21 gün',
        '30 gün',
        '45 gün',
        '60 gün',
        'Peşin'
    ];

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (editingSupplier) {
                setFormData({
                    name: editingSupplier.name,
                    category: editingSupplier.category,
                    phone: editingSupplier.phone,
                    email: editingSupplier.email,
                    rating: editingSupplier.rating,
                    status: editingSupplier.status,
                    address: editingSupplier.address,
                    contactPerson: editingSupplier.contactPerson,
                    taxNumber: editingSupplier.taxNumber,
                    paymentTerms: editingSupplier.paymentTerms,
                    deliveryTime: editingSupplier.deliveryTime,
                    minimumOrder: editingSupplier.minimumOrder,
                    products: [...editingSupplier.products],
                    contractStartDate: formatDateForInput(editingSupplier.contractStartDate),
                    contractEndDate: formatDateForInput(editingSupplier.contractEndDate),
                    contactInfo: editingSupplier.contactInfo || '',
                    leadTimeDays: editingSupplier.leadTimeDays || 1,
                    isActive: editingSupplier.isActive !== undefined ? editingSupplier.isActive : true
                });
            } else {
                // Reset form for new supplier
                setFormData({
                    name: '',
                    category: '',
                    phone: '',
                    email: '',
                    rating: 5,
                    status: 'ACTIVE',
                    address: '',
                    contactPerson: '',
                    taxNumber: '',
                    paymentTerms: '30 gün',
                    deliveryTime: 1,
                    minimumOrder: 1000,
                    products: [],
                    contractStartDate: '',
                    contractEndDate: '',
                    contactInfo: '',
                    leadTimeDays: 1,
                    isActive: true
                });
            }
        } else {
            setIsVisible(false);
        }
    }, [isOpen, editingSupplier]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
            setNewProduct('');
        }, 300);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim() || !formData.category || !formData.phone.trim() || 
            !formData.email.trim() || !formData.contactPerson.trim()) {
            alert('Lütfen zorunlu alanları doldurun!');
            return;
        }

        try {
            await onSave(formData);
            // Sadece başarılı olduğunda modal'ı kapat
            handleClose();
        } catch (error) {
            // Hata durumunda modal açık kalır
            console.error('Form kaydetme hatası:', error);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addProduct = () => {
        if (newProduct.trim() && !formData.products.includes(newProduct.trim())) {
            setFormData(prev => ({
                ...prev,
                products: [...prev.products, newProduct.trim()]
            }));
            setNewProduct('');
        }
    };

    const removeProduct = (product: string) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.filter(p => p !== product)
        }));
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0  flex items-center justify-center z-50 p-4
                ${isVisible ? 'backdrop-blur-xs bg-gray-700/20 bg-opacity-50' : 'backdrop-blur-none bg-opacity-0'} transition-all duration-300 ease-out`}
            onClick={handleBackdropClick}
        >
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80%] overflow-y-auto transform transition-all duration-300 ${
                isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}>
                {/* Header */}
                <div className="flex items-center sticky top-0 bg-white justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingSupplier ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle'}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {editingSupplier ? 'Tedarikçi bilgilerini güncelleyin' : 'Yeni tedarikçi bilgilerini girin'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Temel Bilgiler */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="inline mr-2" />
                                Firma Adı *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Firma adını girin"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Package size={16} className="inline mr-2" />
                                Kategori *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            >
                                <option value="">Kategori seçin</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone size={16} className="inline mr-2" />
                                Telefon *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="+90 212 555 0101"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail size={16} className="inline mr-2" />
                                E-posta *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="ornek@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="inline mr-2" />
                                İletişim Kişisi *
                            </label>
                            <input
                                type="text"
                                value={formData.contactPerson}
                                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Yetkili kişi adı"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText size={16} className="inline mr-2" />
                                Vergi Numarası
                            </label>
                            <input
                                type="text"
                                value={formData.taxNumber}
                                onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="1234567890"
                            />
                        </div>
                    </div>

                    {/* Adres */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin size={16} className="inline mr-2" />
                            Adres
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Tam adres bilgisi"
                        />
                    </div>

                    {/* İletişim Bilgileri */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone size={16} className="inline mr-2" />
                            Ek İletişim Bilgileri
                        </label>
                        <textarea
                            value={formData.contactInfo}
                            onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Ek iletişim bilgileri, notlar veya özel talimatlar"
                        />
                    </div>

                    {/* Ticari Bilgiler */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <CreditCard size={16} className="inline mr-2" />
                                Ödeme Vadesi
                            </label>
                            <select
                                value={formData.paymentTerms}
                                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                {paymentTermOptions.map(term => (
                                    <option key={term} value={term}>{term}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Teslimat Süresi (Gün)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={formData.deliveryTime}
                                onChange={(e) => handleInputChange('deliveryTime', parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Sipariş (TL)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="100"
                                value={formData.minimumOrder}
                                onChange={(e) => handleInputChange('minimumOrder', parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tedarik Süresi (Gün)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={formData.leadTimeDays}
                                onChange={(e) => handleInputChange('leadTimeDays', parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Sözleşme Tarihleri */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-2" />
                                Sözleşme Başlangıç
                            </label>
                            <input
                                type="date"
                                value={formData.contractStartDate}
                                onChange={(e) => handleInputChange('contractStartDate', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="inline mr-2" />
                                Sözleşme Bitiş
                            </label>
                            <input
                                type="date"
                                value={formData.contractEndDate}
                                onChange={(e) => handleInputChange('contractEndDate', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Ürünler */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Package size={16} className="inline mr-2" />
                            Tedarik Edilen Ürünler
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newProduct}
                                onChange={(e) => setNewProduct(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ürün adı girin"
                            />
                            <button
                                type="button"
                                onClick={addProduct}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                Ekle
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.products.map((product, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                                >
                                    {product}
                                    <button
                                        type="button"
                                        onClick={() => removeProduct(product)}
                                        className="hover:bg-purple-200 rounded-full p-1"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Status ve Rating */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Durum
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="ACTIVE">Aktif</option>
                                <option value="INACTIVE">Pasif</option>
                                <option value="PENDING">Beklemede</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Değerlendirme (1-5)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.1"
                                value={formData.rating}
                                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                <span>1</span>
                                <span className="font-medium">{formData.rating}</span>
                                <span>5</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                        >
                            {editingSupplier ? 'Güncelle' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierAddModal;