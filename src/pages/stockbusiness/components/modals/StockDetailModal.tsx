import { StockDetailModalProps } from "../../../../types";
import { 
    X, 
    Package, 
    AlertTriangle, 
    Calendar, 
    FileText, 
    Zap, 
    TrendingUp,
    Tag,
    BarChart3
} from "lucide-react";

export default function StockDetailModal({ open, onClose, item }: StockDetailModalProps) {
    if (!open) return null;

    const isLowStock = item.quantity <= item.minQuantity;
    const stockPercentage = Math.min(100, (item.quantity / (item.maxQuantity || 100)) * 100);
    const totalValue = item.quantity * item.unitPrice;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className={`bg-gradient-to-r ${isLowStock ? 'from-red-500 to-red-600' : 'from-orange-500 to-red-600'} text-white p-6 rounded-t-2xl`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Package size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{item.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                        {item.category}
                                    </span>
                                    {isLowStock && (
                                        <span className="px-3 py-1 bg-red-900/30 rounded-full text-sm font-medium flex items-center gap-1">
                                            <AlertTriangle size={14} />
                                            Kritik Stok
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Main Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg text-white">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <div className="text-sm text-blue-600">Mevcut Stok</div>
                                    <div className="text-2xl font-bold text-blue-800">
                                        {item.quantity}
                                    </div>
                                    <div className="text-sm text-blue-600">{item.unit}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 rounded-lg text-white">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <div className="text-sm text-green-600">Toplam Değer</div>
                                    <div className="text-2xl font-bold text-green-800">
                                        ₺{totalValue.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-green-600">
                                        ₺{item.unitPrice}/birim
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`bg-gradient-to-br ${isLowStock ? 'from-red-50 to-red-100' : 'from-orange-50 to-orange-100'} rounded-xl p-4`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 ${isLowStock ? 'bg-red-500' : 'bg-orange-500'} rounded-lg text-white`}>
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <div className={`text-sm ${isLowStock ? 'text-red-600' : 'text-orange-600'}`}>
                                        Stok Durumu
                                    </div>
                                    <div className={`text-2xl font-bold ${isLowStock ? 'text-red-800' : 'text-orange-800'}`}>
                                        %{Math.round(stockPercentage)}
                                    </div>
                                    <div className={`text-sm ${isLowStock ? 'text-red-600' : 'text-orange-600'}`}>
                                        Doluluk Oranı
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Stok Seviyesi</span>
                            <span className="text-sm text-gray-500">
                                {item.quantity} / {item.maxQuantity || "∞"} {item.unit}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                    isLowStock 
                                        ? "bg-gradient-to-r from-red-500 to-red-600" 
                                        : "bg-gradient-to-r from-green-500 to-green-600"
                                }`}
                                style={{ width: `${stockPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Min: {item.minQuantity}</span>
                            <span>Max: {item.maxQuantity || "Sınırsız"}</span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {item.barcode && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-purple-500 rounded-lg text-white">
                                    <Zap size={16} />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Barkod</div>
                                    <div className="font-mono font-semibold text-gray-800">
                                        {item.barcode}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                <Tag size={16} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Kategori</div>
                                <div className="font-semibold text-gray-800">{item.category}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-teal-500 rounded-lg text-white">
                                <Calendar size={16} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Son Güncelleme</div>
                                <div className="font-semibold text-gray-800">
                                    {new Date(item.lastUpdated).toLocaleDateString("tr-TR", {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-amber-500 rounded-lg text-white">
                                <TrendingUp size={16} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Birim Fiyat</div>
                                <div className="font-semibold text-gray-800">
                                    ₺{item.unitPrice.toLocaleString()} / {item.unit}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-500 rounded-lg text-white">
                                    <FileText size={16} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-600 mb-1">Açıklama</div>
                                    <div className="text-gray-800 leading-relaxed">
                                        {item.description}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}