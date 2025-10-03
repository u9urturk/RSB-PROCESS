import { useState, useEffect } from "react";
import { Plus, Minus, X, TrendingUp, Package, DollarSign, Truck } from "lucide-react";
import { StockChangeModalProps } from "@/types/index";
import { Supplier } from "@/types/stock";
import mockSuppliers from "../mocks/supplierData";

export default function StockChangeModal({ open, onClose, item, type, onSubmit }: StockChangeModalProps) {
    const [amount, setAmount] = useState<number>(0);
    const [unitPrice, setUnitPrice] = useState<number>(item.unitPrice);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>(item.supplierId || "");
    const [reason, setReason] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [render, setRender] = useState(open);
    const [isAnimating, setIsAnimating] = useState(false);
    const [suppliers] = useState<Supplier[]>(mockSuppliers);

    useEffect(() => { 
        if (open) {
            setRender(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
        }
    }, [open]);
    
    useEffect(() => { 
        if (!open && render) { 
            const t = setTimeout(() => setRender(false), 200); 
            return () => clearTimeout(t);
        } 
    }, [open, render]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => onClose(), 200);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount > 0) {
            // Güncellenecek veriler - sadece değişebilir parametreler
            const updateData = {
                quantity: type === "add" ? item.quantity + amount : Math.max(0, item.quantity - amount),
                unitPrice: unitPrice,
                supplierId: selectedSupplierId,
                lastUpdated: new Date().toISOString(),
                // Stok hareketi için ekstra bilgiler
                movementData: {
                    type: type,
                    amount: amount,
                    reason: reason,
                    notes: notes,
                    supplierId: selectedSupplierId,
                    unitPrice: type === "add" ? unitPrice : undefined // Çıkışlarda fiyat bilgisi yok
                }
            };
            
            onSubmit(amount, updateData);
            handleClose();
            setAmount(0);
            setReason("");
            setNotes("");
        }
    };

    if (!render) return null;

    const isAdd = type === "add";
    const icon = isAdd ? <Plus size={24} /> : <Minus size={24} />;
    const title = isAdd ? "Stok Ekle" : "Stok Çıkar";
    const buttonText = isAdd ? "Ekle" : "Çıkar";
    const gradientColor = isAdd ? "from-green-500 to-green-600" : "from-red-500 to-red-600";
    const hoverGradientColor = isAdd ? "hover:from-green-600 hover:to-green-700" : "hover:from-red-600 hover:to-red-700";

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-200 ease-out ${isAnimating
                ? 'bg-opacity-50 bg-gray-700/20 backdrop-blur-sm'
                : 'bg-opacity-0 backdrop-blur-none'
            }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-200 ease-out transform ${isAnimating
                    ? 'scale-100 opacity-100 translate-y-0'
                    : 'scale-95 opacity-0 translate-y-4'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
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
                            onClick={handleClose}
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

                    {/* Supplier Selection - Sadece stok girişlerinde */}
                    {isAdd && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Truck size={16} className="text-gray-600" />
                                    <span className="text-sm font-semibold text-gray-700">Tedarikçi</span>
                                </div>
                                <select
                                    value={selectedSupplierId}
                                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                                    required
                                >
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Amount Input */}
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

                            {/* Unit Price - Sadece stok girişlerinde */}
                            {isAdd && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Birim Fiyat (₺)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={unitPrice}
                                            onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-orange-300 text-lg font-semibold"
                                            placeholder="0.00"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <DollarSign size={16} className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Sebep
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                                required
                            >
                                <option value="">Sebep seçin</option>
                                {isAdd ? (
                                    <>
                                        <option value="Yeni sevkiyat">Yeni sevkiyat</option>
                                        <option value="Acil sevkiyat">Acil sevkiyat</option>
                                        <option value="Toplu satın alma">Toplu satın alma</option>
                                        <option value="Diğer">Diğer</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Mutfak kullanımı">Mutfak kullanımı</option>
                                        <option value="Sipariş teslimi">Sipariş teslimi</option>
                                        <option value="Fire/Kayıp">Fire/Kayıp</option>
                                        <option value="Transfer">Transfer</option>
                                        <option value="Diğer">Diğer</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Notlar (İsteğe bağlı)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
                                rows={3}
                                placeholder="Ek açıklamalar..."
                            />
                        </div>

                        {/* Prediction */}
                        {amount > 0 && (
                            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                                <div className="text-sm text-blue-600 mb-1">Yeni Stok Durumu</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-blue-500">Miktar</div>
                                        <div className="text-lg font-bold text-blue-800">
                                            {isAdd 
                                                ? item.quantity + amount 
                                                : Math.max(0, item.quantity - amount)
                                            } {item.unit}
                                        </div>
                                    </div>
                                    {isAdd && (
                                        <div>
                                            <div className="text-xs text-blue-500">Birim Fiyat</div>
                                            <div className="text-lg font-bold text-blue-800">
                                                ₺{unitPrice.toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {isAdd && (
                                    <div className="border-t border-blue-200 pt-2">
                                        <div className="text-xs text-blue-500">Toplam Değer (Eklenen)</div>
                                        <div className="text-xl font-bold text-green-600">
                                            ₺{(amount * unitPrice).toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold hover:scale-105"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={amount <= 0 || !reason || (isAdd && (!selectedSupplierId || unitPrice <= 0))}
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