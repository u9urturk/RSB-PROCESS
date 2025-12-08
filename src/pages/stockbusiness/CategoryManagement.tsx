import React, { useState } from 'react';
import { Folder, Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { Category, CreateCategoryDto, UpdateCategoryDto } from './apis/categoryApi';
import { useCategories } from './provider/CategoryProvider';
import { useConfirm } from '../../context/provider/ConfirmProvider';
import CategoryAddModal from './modals/CategoryAddModal';
import CategoryEditModal from './modals/CategoryEditModal';
import PageTransition from '../../components/PageTransition';

const CategoryManagement: React.FC = () => {
  const { 
    loading, 
    stats,
    createCategory,
    updateCategory,
    deleteCategory,
    searchCategories,
  } = useCategories();
  const confirm = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = async (categoryData: CreateCategoryDto) => {
    try {
      await createCategory(categoryData);
      setIsAddModalOpen(false);
    } catch (error) {
      // Error handling in provider
    }
  };

  const handleUpdateCategory = async (id: string, categoryData: UpdateCategoryDto) => {
    try {
      await updateCategory(id, categoryData);
      setEditingCategory(null);
    } catch (error) {
      // Error handling in provider
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: 'Kategori Silme Onayı',
      message: `"${name}" kategorisini silmek istediğinizden emin misiniz?`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      type: 'danger',
      details: [
        { label: 'Kategori Adı', value: name },
        { label: 'İşlem', value: 'Kalıcı Silme' }
      ],
      warnings: [
        'Bu işlem geri alınamaz',
        'Bu kategoriye ait tüm ürünler etkilenebilir'
      ]
    });

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteCategory(id);
    } catch (error) {
      // Error handling in provider
    }
  };

  const filteredCategories = searchCategories(searchTerm);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Kategoriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Kategori</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCategories}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Folder className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ürünlü Kategori</p>
                <p className="text-2xl font-bold text-gray-800">{stats.categoriesWithProducts}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Filter className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Boş Kategori</p>
                <p className="text-2xl font-bold text-gray-800">{stats.emptyCategories}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Folder className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center font-semibold"
            >
              <Plus size={20} />
              Yeni Kategori
            </button>
          </div>
        </div>

        {/* Category Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Kategori Adı</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Açıklama</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Oluşturma Tarihi</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Folder className="text-orange-600" size={20} />
                          </div>
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">{category.desc || '-'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">
                          {category.createdAt 
                            ? new Date(category.createdAt).toLocaleDateString('tr-TR')
                            : '-'
                          }
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Folder className="text-gray-300" size={48} />
                        <p className="text-gray-500">
                          {searchTerm ? 'Arama kriterlerinize uygun kategori bulunamadı' : 'Henüz kategori eklenmemiş'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CategoryAddModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCategory}
      />

      {editingCategory && (
        <CategoryEditModal
          open={true}
          onClose={() => setEditingCategory(null)}
          onUpdate={(data: UpdateCategoryDto) => handleUpdateCategory(editingCategory.id, data)}
          category={editingCategory}
        />
      )}
    </PageTransition>
  );
};

export default CategoryManagement;