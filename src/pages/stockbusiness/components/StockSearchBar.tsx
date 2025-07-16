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
            <div className="relative flex-1">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Stok ara... (İsim, Kategori veya Barkod)"
                    className="w-full px-4 py-3 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm hover:shadow-md"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            
            <button
                onClick={onBarcodeClick}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
                title="Barkod Okuyucu"
            >
                <ScanLine size={20} />
                <span className="hidden sm:inline">Barkod</span>
            </button>
            
            <button
                className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
                title="Filtreler"
            >
                <Filter size={20} />
                <span className="hidden sm:inline">Filtre</span>
            </button>
        </div>
    );
}

export default memo(StockSearchBar);