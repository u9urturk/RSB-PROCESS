import { useState, useEffect } from "react";
import { StockChangeModalProps } from "../../../../types";
import { Plus, Minus, X, TrendingUp, Package } from "lucide-react";

export default function StockChangeModal({ open, onClose, item, type, onSubmit }: StockChangeModalProps) {
    const [amount, setAmount] = useState<number>(0);
    const [render, setRender] = useState(open);
    useEffect(() => { if (open) setRender(true); }, [open]);
    useEffect(() => { if (!open && render) { const t = setTimeout(() => setRender(false), 180); return () => clearTimeout(t);} }, [open, render]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount > 0) {
            onSubmit(amount);
            onClose();
            setAmount(0);
        }
    };

    if (!render) return null;

    const isAdd = type === "add";
    const icon = isAdd ? <Plus size={24} /> : <Minus size={24} />;
    const title = isAdd ? "Stok Ekle" : "Stok Çıkar";
    const buttonText = isAdd ? "Ekle" : "Çıkar";
    const gradientColor = isAdd ? "from-green-500 to-green-600" : "from-red-500 to-red-600";
    const hoverGradientColor = isAdd ? "hover:from-green-600 hover:to-green-700" : "hover:from-red-600 hover:to-red-700";

    const overlayCls = `fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-200 ${open ? 'bg-black/60 opacity-100' : 'bg-black/0 opacity-0 pointer-events-none'}`;
    const panelCls = `bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-200 ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`;
    return (
        <div className={overlayCls}>
            <div className={panelCls}>
                {/* Header */}
                <div className={`bg-gradient-to-r ${gradientColor} text-white p-6 rounded-t-2xl`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                {icon}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{title}</h2>
                                <p className="text-white/80 text-sm">{item.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Current Stock Info */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package size={16} className="text-gray-600" />
                                <span className="text-sm text-gray-600">Mevcut Stok</span>
                            </div>
                            <div className="text-lg font-bold text-gray-800">
                                {item.quantity} {item.unit}
                            </div>
                        </div>
                        
                        {/* Stock Bar */}
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        item.quantity <= item.minQuantity 
                                            ? "bg-gradient-to-r from-red-500 to-red-600" 
                                            : "bg-gradient-to-r from-green-500 to-green-600"
                                    }`}
                                    style={{ 
                                        width: `${Math.min(100, (item.quantity / (item.maxQuantity || 100)) * 100)}%` 
                                    }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Min: {item.minQuantity}</span>
                                <span>Max: {item.maxQuantity || "∞"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                {isAdd ? "Eklenecek Miktar" : "Çıkarılacak Miktar"} ({item.unit})
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300 text-lg font-semibold"
                                    placeholder="0"
                                    autoFocus
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <TrendingUp size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Prediction */}
                        {amount > 0 && (
                            <div className="bg-blue-50 rounded-xl p-4">
                                <div className="text-sm text-blue-600 mb-1">Yeni Stok Durumu</div>
                                <div className="text-lg font-bold text-blue-800">
                                    {isAdd 
                                        ? item.quantity + amount 
                                        : Math.max(0, item.quantity - amount)
                                    } {item.unit}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold hover:scale-105"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={amount <= 0}
                                className={`flex-1 px-4 py-3 bg-gradient-to-r ${gradientColor} ${hoverGradientColor} text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                            >
                                {icon}
                                {buttonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}