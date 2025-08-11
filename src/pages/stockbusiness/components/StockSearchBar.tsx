import { memo } from "react";
import { Search, Filter, ScanLine } from "lucide-react";

interface StockSearchBarProps {
    search: string;
    setSearch: (value: string) => void;
    onAddClick?: () => void;
    onBarcodeClick?: () => void;
}

function StockSearchBar({ search, setSearch, onBarcodeClick }: StockSearchBarProps) {
    return (
        <div className="flex gap-3 items-center">
            <div className="relative flex-1 group">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Stok ara... (İsim, Kategori veya Barkod)"
                    className="w-full px-4 py-3 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-orange-300"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" size={20} />
                
                {/* Search highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            
            <button
                onClick={onBarcodeClick}
                className="group px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2 relative overflow-hidden"
                title="Barkod Okuyucu"
            >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <ScanLine size={20} className="relative z-10" />
                <span className="hidden sm:inline relative z-10">Barkod</span>
            </button>
            
            <button
                className="group px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2 relative overflow-hidden"
                title="Filtreler"
            >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <Filter size={20} className="relative z-10" />
                <span className="hidden sm:inline relative z-10">Filtre</span>
            </button>
        </div>
    );
}

export default memo(StockSearchBar);