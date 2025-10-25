import React, { useState, useEffect } from 'react';
import { X, Folder, FileText } from 'lucide-react';
import { CreateCategoryDto } from '../apis/categoryApi';

interface CategoryAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (categoryData: CreateCategoryDto) => Promise<void>;
}

const CategoryAddModal: React.FC<CategoryAddModalProps> = ({
  open,
  onClose,
  onAdd
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    desc: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Animasyon kontrolü
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 100);
    } else {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 200);
    }
  }, [open]);

  // Modal açıldığında form'u sıfırla
  useEffect(() => {
    if (open) {
      setFormData({ name: '', desc: '' });
      setErrors({});
      setLoading(false);
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Kategori adı gereklidir';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Kategori adı en az 2 karakter olmalıdır';
    }
    if (formData.desc && formData.desc.trim().length > 0 && formData.desc.trim().length < 5) {
      newErrors.desc = 'Açıklama en az 5 karakter olmalıdır';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        name: formData.name.trim(),
        desc: formData.desc?.trim() || undefined
      });
      setFormData({ name: '', desc: '' });
      handleClose();
    } catch (error) {
      console.error('Error in CategoryAddModal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    
    setIsAnimating(false);
    setTimeout(() => {
      setFormData({ name: '', desc: '' });
      setErrors({});
      setLoading(false);
      onClose();
    }, 200);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-200 ease-out ${
        isAnimating
          ? 'bg-opacity-50 bg-gray-700/20 backdrop-blur-sm'
          : 'bg-opacity-0 backdrop-blur-none'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80%] overflow-y-auto transition-all duration-200 ease-out transform ${
          isAnimating
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex sticky top-0 bg-white z-10 items-center justify-between p-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white">
              <Folder size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Yeni Kategori Ekle
              </h2>
              <p className="text-sm text-gray-600">
                Yeni bir kategori oluşturun
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Kategori Adı */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Folder size={16} />
              Kategori Adı
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: İçecekler, Aperatifler..."
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Açıklama */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText size={16} />
              Açıklama (Opsiyonel)
            </label>
            <textarea
              name="desc"
              value={formData.desc || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all h-24 resize-none ${
                errors.desc ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Bu kategorinin ne için kullanıldığını açıklayın..."
              disabled={loading}
            />
            {errors.desc && <p className="text-red-500 text-sm mt-1">{errors.desc}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
            >
              {loading ? 'Ekleniyor...' : 'Kategori Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryAddModal;