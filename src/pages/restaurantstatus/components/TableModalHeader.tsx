import { Info, Utensils, X } from "lucide-react";
import React from "react";

interface TableModalHeaderProps {
    table?: any;
    onClose?: () => void;
    onHint?: () => void;
}

const TableModalHeader: React.FC<TableModalHeaderProps> = ({ table, onClose, onHint }) => {
    return (
        <div className="relative rounded-t-xl sm:rounded-t-2xl p-3 sm:p-5 bg-white border-b border-gray-200">
            <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                        <Utensils size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                            Masa {table.number}
                        </h2>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5 hidden sm:block">Masa Yönetim Paneli</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <button
                        onClick={onHint}
                        className="p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        aria-label="İpucu Göster"
                        type="button"
                    >
                        <Info size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        aria-label="Kapat"
                        type="button"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>

    );
};

export default TableModalHeader;