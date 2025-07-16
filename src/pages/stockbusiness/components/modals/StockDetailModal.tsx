import { StockDetailModalProps } from "../../../../types";

export default function StockDetailModal({ open, onClose, item }: StockDetailModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">{item.name} - Detaylar</h2>
                <div className="space-y-4">
                    <div>
                        <span className="font-medium">Kategori: </span>
                        <span>{item.category}</span>
                    </div>
                    <div>
                        <span className="font-medium">Barkod: </span>
                        <span>{item.barcode || "Barkodsuz"}</span>
                    </div>
                    <div>
                        <span className="font-medium">Mevcut Stok: </span>
                        <span>{item.quantity} {item.unit}</span>
                    </div>
                    <div>
                        <span className="font-medium">Kritik Stok Seviyesi: </span>
                        <span>{item.minQuantity} {item.unit}</span>
                    </div>
                    <div>
                        <span className="font-medium">Son Güncelleme: </span>
                        <span>{new Date(item.lastUpdated).toLocaleString("tr-TR")}</span>
                    </div>
                    <div>
                        <span className="font-medium">Açıklama: </span>
                        <p className="mt-1 text-gray-600">{item.description || "Açıklama bulunmuyor."}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}