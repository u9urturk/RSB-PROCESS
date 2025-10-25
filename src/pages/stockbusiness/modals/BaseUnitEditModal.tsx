import React, { useState, useEffect } from 'react';
import { X, Package, AlertCircle } from 'lucide-react';
import { BaseUnit, UpdateBaseUnitDto } from '../apis/baseUnitApi';

interface BaseUnitEditModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateBaseUnitDto) => Promise<void>;
  baseUnit: BaseUnit | null;
}

const BaseUnitEditModal: React.FC<BaseUnitEditModalProps> = ({ open, onClose, onUpdate, baseUnit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<UpdateBaseUnitDto>({
    name: '',
    shortName: '',
    desc: '',
    symbol: '',
    conversionFactor: undefined,
    baseUnit: '',
    isActive: true
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Modal açılma/kapanma animasyonları
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [open]);

  // Birim bilgilerini form'a yükle
  useEffect(() => {
    if (baseUnit && open) {
      setFormData({
        name: baseUnit.name || '',
        shortName: baseUnit.shortName || '',
        desc: baseUnit.desc || '',
        symbol: baseUnit.symbol || '',
        conversionFactor: baseUnit.conversionFactor || undefined,
        baseUnit: baseUnit.baseUnit || '',
        isActive: baseUnit.isActive
      });
      setErrors({});
    }
  }, [baseUnit, open]);

  // Modal kapatıldığında temizle
  useEffect(() => {
    if (!open) {
      setErrors({});
      setLoading(false);
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Birim adı zorunludur';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Birim adı en az 2 karakter olmalıdır';
    }

    if (!formData.shortName?.trim()) {
      newErrors.shortName = 'Kısa ad zorunludur';
    } else if (formData.shortName.trim().length < 1) {
      newErrors.shortName = 'Kısa ad en az 1 karakter olmalıdır';
    }

    if (formData.conversionFactor !== undefined && formData.conversionFactor <= 0) {
      newErrors.conversionFactor = 'Dönüşüm faktörü 0\'dan büyük olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UpdateBaseUnitDto, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!baseUnit || !validateForm()) return;

    try {
      setLoading(true);
      
      // Boş alanları undefined yap
      const submitData: UpdateBaseUnitDto = {
        name: formData.name?.trim() || undefined,
        shortName: formData.shortName?.trim() || undefined,
        desc: formData.desc?.trim() || undefined,
        symbol: formData.symbol?.trim() || undefined,
        baseUnit: formData.baseUnit?.trim() || undefined,
        conversionFactor: formData.conversionFactor || undefined,
        isActive: formData.isActive
      };

      await onUpdate(baseUnit.id, submitData);
      onClose();
    } catch (error) {
      console.error('Error updating base unit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 p-4
        ${isVisible ? 'backdrop-blur-xs bg-gray-700/20 bg-opacity-50' : 'backdrop-blur-none bg-opacity-0'} transition-all duration-300 ease-out`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80%] overflow-y-auto transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 sticky top-0 rounded-t-2xl shadow-md z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Birim Düzenle</h3>
                {baseUnit && (
                  <p className="text-sm text-blue-100">{baseUnit.name}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Birim Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birim Adı *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="örn. Kilogram"
              disabled={loading}
            />
            {errors.name && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {errors.name}
              </div>
            )}
          </div>

          {/* Kısa Ad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kısa Ad *
            </label>
            <input
              type="text"
              value={formData.shortName || ''}
              onChange={(e) => handleInputChange('shortName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.shortName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="örn. kg"
              disabled={loading}
            />
            {errors.shortName && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {errors.shortName}
              </div>
            )}
          </div>

          {/* Sembol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sembol
            </label>
            <input
              type="text"
              value={formData.symbol || ''}
              onChange={(e) => handleInputChange('symbol', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="örn. kg"
              disabled={loading}
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.desc || ''}
              onChange={(e) => handleInputChange('desc', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Birim hakkında açıklama yazınız..."
              disabled={loading}
            />
          </div>

          {/* Dönüşüm Faktörü */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dönüşüm Faktörü
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.conversionFactor || ''}
              onChange={(e) => handleInputChange('conversionFactor', parseFloat(e.target.value) || undefined)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.conversionFactor ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="örn. 1000 (1 kg = 1000 g)"
              disabled={loading}
            />
            {errors.conversionFactor && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {errors.conversionFactor}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Temel birime göre dönüşüm faktörü (opsiyonel)
            </p>
          </div>

          {/* Temel Birim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temel Birim Referansı
            </label>
            <input
              type="text"
              value={formData.baseUnit || ''}
              onChange={(e) => handleInputChange('baseUnit', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="örn. gram"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Dönüşüm için referans birim (opsiyonel)
            </p>
          </div>

          {/* Aktif Durumu */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Aktif Durumu
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Birim aktif olarak kullanılabilir mi?
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="sr-only peer"
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {/* Bilgi Kutusu */}
          {baseUnit && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="text-blue-600" size={14} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-800">Mevcut Birim Bilgileri</p>
                  <div className="mt-2 text-sm text-blue-700 space-y-1">
                    <p><span className="font-medium">ID:</span> {baseUnit.id}</p>
                    {baseUnit.createdAt && (
                      <p><span className="font-medium">Oluşturma:</span> {new Date(baseUnit.createdAt).toLocaleDateString('tr-TR')}</p>
                    )}
                    {baseUnit.updatedAt && (
                      <p><span className="font-medium">Son Güncelleme:</span> {new Date(baseUnit.updatedAt).toLocaleDateString('tr-TR')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !baseUnit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                'Değişiklikleri Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BaseUnitEditModal;