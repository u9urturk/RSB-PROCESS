import React, { useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { BaseUnit, CreateBaseUnitDto, UpdateBaseUnitDto } from './apis/baseUnitApi';
import { useBaseUnits } from './provider/BaseUnitProvider';
import { useConfirm } from '../../context/provider/ConfirmProvider';
import PageTransition from '../../components/PageTransition';
import BaseUnitAddModal from './modals/BaseUnitAddModal';
import BaseUnitEditModal from './modals/BaseUnitEditModal';

const BaseUnitManagement: React.FC = () => {
  const { 
    baseUnits,
    loading, 
    createBaseUnit,
    updateBaseUnit,
    deleteBaseUnit,
    searchBaseUnits,
    toggleBaseUnitStatus
  } = useBaseUnits();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBaseUnit, setEditingBaseUnit] = useState<BaseUnit | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Client-side stats hesaplama
  const calculateStats = () => {
    const totalUnits = baseUnits.length;
    const activeUnits = baseUnits.filter(unit => unit.isActive).length;
    const inactiveUnits = baseUnits.filter(unit => !unit.isActive).length;
    // unitsWithProducts için şimdilik 0 döndürüyoruz, gerçek veri geldiğinde güncellenebilir
    const unitsWithProducts = 0;

    return {
      totalUnits,
      activeUnits,
      inactiveUnits,
      unitsWithProducts
    };
  };

  const stats = calculateStats();

  // Birim ekleme
  const handleAddBaseUnit = async (unitData: CreateBaseUnitDto) => {
    try {
      await createBaseUnit(unitData);
      setIsAddModalOpen(false);
    } catch (error) {
      // Error handling in provider
    }
  };

  // Birim güncelleme
  const handleUpdateBaseUnit = async (id: string, unitData: UpdateBaseUnitDto) => {
    try {
      await updateBaseUnit(id, unitData);
      setEditingBaseUnit(null);
    } catch (error) {
      // Error handling in provider
    }
  };

  // Birim silme
  const handleDeleteBaseUnit = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: 'Birim Silme Onayı',
      message: `"${name}" birimini silmek istediğinizden emin misiniz?`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      type: 'danger',
      details: [
        { label: 'Birim Adı', value: name },
        { label: 'İşlem', value: 'Kalıcı Silme' }
      ],
      warnings: [
        'Bu işlem geri alınamaz',
        'Bu birimle ilişkili tüm veriler silinecektir'
      ]
    });

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteBaseUnit(id);
    } catch (error) {
      // Error handling in provider
    }
  };

  // Birim durumu değiştirme
  const handleToggleStatus = async (id: string) => {
    try {
      await toggleBaseUnitStatus(id);
    } catch (error) {
      // Error handling in provider
    }
  };

  // Arama ve filtreleme
  const getFilteredBaseUnits = () => {
    // Önce search uygula
    let filtered = searchTerm.trim() 
      ? searchBaseUnits(searchTerm)
      : baseUnits;
    
    // Sonra status filter uygula
    if (filterStatus === 'active') {
      filtered = filtered.filter(unit => unit.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(unit => !unit.isActive);
    }
    
    return filtered;
  };

  const filteredBaseUnits = getFilteredBaseUnits();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Birimler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br rounded-2xl from-gray-50 to-gray-100 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Birim</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalUnits}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Aktif Birimler</p>
                <p className="text-2xl font-bold text-gray-800">{stats.activeUnits}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Power className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pasif Birimler</p>
                <p className="text-2xl font-bold text-gray-800">{stats.inactiveUnits}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <PowerOff className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ürünlü Birimler</p>
                <p className="text-2xl font-bold text-gray-800">{stats.unitsWithProducts}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter and Add */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Birim ara (ad, kısa ad, sembol, açıklama)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {(['all', 'active', 'inactive'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      filterStatus === status
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'Tümü' : status === 'active' ? 'Aktif' : 'Pasif'}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center font-semibold"
            >
              <Plus size={20} />
              Yeni Birim
            </button>
          </div>
        </div>

        {/* Base Units Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Birim Adı</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Kısa Ad</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Sembol</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Açıklama</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Durum</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Oluşturma Tarihi</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBaseUnits.length > 0 ? (
                  filteredBaseUnits.map((baseUnit) => (
                    <tr key={baseUnit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Package className="text-orange-600" size={20} />
                          </div>
                          <span className="font-medium text-gray-900">{baseUnit.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {baseUnit.shortName}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600 font-mono">
                          {baseUnit.symbol || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">
                          {baseUnit.desc || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          baseUnit.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {baseUnit.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">
                          {baseUnit.createdAt 
                            ? new Date(baseUnit.createdAt).toLocaleDateString('tr-TR')
                            : '-'
                          }
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(baseUnit.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              baseUnit.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={baseUnit.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                          >
                            {baseUnit.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                          </button>
                          <button
                            onClick={() => setEditingBaseUnit(baseUnit)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteBaseUnit(baseUnit.id, baseUnit.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Package className="text-gray-300" size={48} />
                        <p className="text-gray-500">
                          {searchTerm || filterStatus !== 'all' 
                            ? 'Arama kriterlerinize uygun birim bulunamadı' 
                            : 'Henüz birim eklenmemiş'
                          }
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

      <BaseUnitAddModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBaseUnit}
      />

      {editingBaseUnit && (
        <BaseUnitEditModal
          open={true}
          onClose={() => setEditingBaseUnit(null)}
          onUpdate={handleUpdateBaseUnit}
          baseUnit={editingBaseUnit}
        />
      )}
    </PageTransition>
  );
};

export default BaseUnitManagement;