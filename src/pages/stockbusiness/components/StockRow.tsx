import { memo, useCallback } from "react";
import { Package, Plus, Minus, AlertTriangle, Eye, TrendingUp, Clock, Zap } from "lucide-react";
import { StockItem } from "../../../types";

interface StockRowProps {
    item: StockItem;
    onStockChange: (id: string, amount: number, type: "add" | "remove") => void; // still used for progress updates elsewhere maybe
    onOpenAdd: (item: StockItem) => void;
    onOpenRemove: (item: StockItem) => void;
    onOpenDetail: (item: StockItem) => void;
}

function StockRow({ item, onStockChange, onOpenAdd, onOpenRemove, onOpenDetail }: StockRowProps) {

    const isLow = item.quantity <= item.minQuantity;

    // useCallback ile event handler'lar optimize edildi
    const handleAddOpen = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenAdd(item);
    }, [item, onOpenAdd]);

    const handleRemoveOpen = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenRemove(item);
    }, [item, onOpenRemove]);

    const handleDetailOpen = useCallback(() => onOpenDetail(item), [item, onOpenDetail]);

    // Stok değişikliği işleyicileri
    const handleAddSubmit = useCallback((amount: number) => {
        onStockChange(item.id, amount, "add");
    }, [item.id, onStockChange]);

    const handleRemoveSubmit = useCallback((amount: number) => {
        onStockChange(item.id, amount, "remove");
    }, [item.id, onStockChange]);

    return (
            <div
                className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer overflow-hidden
                     ${isLow ? "ring-2 ring-red-200 shadow-red-100" : ""}`}
                onClick={handleDetailOpen}
            >
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 w-full h-1 ${isLow ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-green-500 to-green-600"}`}></div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">
                            {item.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 font-medium">
                                {item.category}
                            </span>
                            {isLow && (
                                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1">
                                    <AlertTriangle size={12} />
                                    Kritik
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${isLow ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                            <Package size={16} />
                        </div>
                    </div>
                </div>

                {/* Stock Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                        <div className="text-2xl font-bold text-gray-800">
                            {item.quantity}
                        </div>
                        <div className="text-sm text-gray-500">{item.unit}</div>
                        <div className="text-xs text-gray-400 mt-1">Mevcut Stok</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                        <div className="text-2xl font-bold text-orange-600">
                            {item.minQuantity}
                        </div>
                        <div className="text-sm text-orange-500">{item.unit}</div>
                        <div className="text-xs text-orange-400 mt-1">Min. Stok</div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                            <Zap size={14} />
                            Barkod
                        </span>
                        <span className="font-medium text-gray-700">
                            {item.barcode || "Yok"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                            <TrendingUp size={14} />
                            Birim Fiyat
                        </span>
                        <span className="font-medium text-gray-700">
                            ₺{item.unitPrice.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                            <Clock size={14} />
                            Güncelleme
                        </span>
                        <span className="font-medium text-gray-700">
                            {new Date(item.lastUpdated).toLocaleDateString('tr-TR')}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Stok Durumu</span>
                        <span className="text-xs text-gray-500">
                            {Math.round((item.quantity / (item.maxQuantity || 100)) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                                isLow ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-green-500 to-green-600"
                            }`}
                            style={{ width: `${Math.min(100, (item.quantity / (item.maxQuantity || 100)) * 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 relative z-10">
                    <button
                        className="group/btn flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2 relative overflow-hidden"
                        onClick={handleAddOpen}
                        type="button"
                    >
                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
                        <Plus size={16} className="relative z-10" />
                        <span className="relative z-10">Ekle</span>
                    </button>
                    <button
                        className="group/btn flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2 relative overflow-hidden"
                        onClick={handleRemoveOpen}
                        type="button"
                    >
                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
                        <Minus size={16} className="relative z-10" />
                        <span className="relative z-10">Çıkar</span>
                    </button>
                    <button
                        className="group/btn px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2 relative overflow-hidden"
                        onClick={handleDetailOpen}
                        type="button"
                    >
                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
                        <Eye size={16} className="relative z-10" />
                    </button>
                </div>
            </div>
    );
}

export default memo(StockRow);
