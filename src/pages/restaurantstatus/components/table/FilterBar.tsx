import React from 'react';
import { Filter } from 'lucide-react';

export interface FilterState {
  occupied: boolean | null;
  reserved: boolean;
  cleanStatus: boolean | null;
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => (
  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100">
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="flex items-center gap-2 text-gray-700 font-semibold">
        <Filter size={20} className="text-orange-500" />
        <span>Masa Durumu:</span>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          aria-pressed={(filters.occupied === null && filters.reserved === false && filters.cleanStatus === null) ? 'true' : 'false'}
          onClick={() => setFilters({ occupied: null, reserved: false, cleanStatus: null })}
          className={`group px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 relative overflow-hidden ${
            filters.occupied === null && filters.reserved === false && filters.cleanStatus === null
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <span className="relative z-10">Tümü</span>
        </button>
        <button
          aria-pressed={filters.occupied === true ? 'true' : 'false'}
          onClick={() => setFilters({ ...filters, occupied: filters.occupied ? null : true })}
          className={`group px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 relative overflow-hidden ${
            filters.occupied === true
              ? 'bg-red-500 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <span className="relative z-10">Dolu</span>
        </button>
        <button
          aria-pressed={filters.occupied === false ? 'true' : 'false'}
          onClick={() => setFilters({ ...filters, occupied: filters.occupied === false ? null : false })}
          className={`group px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 relative overflow-hidden ${
            filters.occupied === false
              ? 'bg-green-500 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <span className="relative z-10">Boş</span>
        </button>
        <button
          aria-pressed={filters.reserved ? 'true' : 'false'}
          onClick={() => setFilters({ ...filters, reserved: !filters.reserved })}
          className={`group px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 relative overflow-hidden ${
            filters.reserved
              ? 'bg-blue-500 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <span className="relative z-10">Rezerve</span>
        </button>
        <button
          aria-pressed={filters.cleanStatus === true ? 'true' : 'false'}
          onClick={() => setFilters({ ...filters, cleanStatus: filters.cleanStatus ? null : true })}
          className={`group px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 relative overflow-hidden ${
            filters.cleanStatus
              ? 'bg-emerald-500 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <span className="relative z-10">Temiz</span>
        </button>
        <button
          aria-pressed={filters.cleanStatus === false ? 'true' : 'false'}
          onClick={() => setFilters({ ...filters, cleanStatus: filters.cleanStatus === false ? null : false })}
          className={`group px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 relative overflow-hidden ${
            filters.cleanStatus === false
              ? 'bg-yellow-500 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <span className="relative z-10">Temizlenecek</span>
        </button>
      </div>
    </div>
  </div>
);

export default FilterBar;
