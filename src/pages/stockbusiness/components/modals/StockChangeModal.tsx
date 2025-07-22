import { useState } from "react";
import { StockChangeModalProps } from "../../../../types";

export default function StockChangeModal({ open, onClose, item, type, onSubmit }: StockChangeModalProps) {
    const [amount, setAmount] = useState<number>(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount > 0) {
            onSubmit(amount);
            onClose();
            setAmount(0);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm  flex items-center justify-center z-50">
            <div className="bg-gray-200 shadow-2xl mx-4 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                    {type === "add" ? "Stok Ekle" : "Stok Çıkar"} - {item.name}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                            {type === "add" ? "Eklenecek Miktar" : "Çıkarılacak Miktar"} ({item.unit})
                        </label>
                        <input
                            type="number"
                            id="amount"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={amount <= 0}
                            className={`px-4 py-2 rounded text-white
                                ${type === "add" 
                                    ? "bg-green-600 hover:bg-green-700" 
                                    : "bg-red-600 hover:bg-red-700"}
                                ${amount <= 0 ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        >
                            {type === "add" ? "Ekle" : "Çıkar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}