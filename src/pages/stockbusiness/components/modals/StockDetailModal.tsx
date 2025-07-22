import { StockDetailModalProps } from "../../../../types";
import { MdClose, MdCategory, MdInventory, MdWarning, MdUpdate, MdDescription, MdBarcodeReader } from "react-icons/md";

const orange = "#ff9800";
const orangeDark = "#f57c00";

export default function StockDetailModal({ open, onClose, item }: StockDetailModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
                style={{ boxShadow: "0 8px 32px #ff980033" }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-orange-50 transition"
                    style={{ color: orangeDark }}
                    aria-label="Kapat"
                >
                    <MdClose size={24} />
                </button>
                <h2
                    className="text-2xl font-bold mb-2 flex items-center gap-2"
                    style={{ color: orange }}
                >
                    {item.name}
                </h2>
                <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                    style={{
                        background: "#fff3e0",
                        color: orangeDark,
                        border: `1px solid ${orange}`,
                    }}
                >
                    <MdCategory className="inline mr-1" /> {item.category}
                </span>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <MdBarcodeReader style={{ color: orangeDark }} />
                        <span className="font-medium">Barkod:</span>
                        <span>{item.barcode || "Barkodsuz"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MdInventory style={{ color: orangeDark }} />
                        <span className="font-medium">Mevcut Stok:</span>
                        <span className="font-bold">{item.quantity} {item.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MdWarning style={{ color: orangeDark }} />
                        <span className="font-medium">Kritik Stok:</span>
                        <span>{item.minQuantity} {item.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MdUpdate style={{ color: orangeDark }} />
                        <span className="font-medium">Son Güncelleme:</span>
                        <span>{new Date(item.lastUpdated).toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <MdDescription style={{ color: orangeDark, marginTop: 2 }} />
                        <span className="font-medium">Açıklama:</span>
                        <span className="text-gray-600">{item.description || "Açıklama bulunmuyor."}</span>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg font-semibold shadow"
                        style={{
                            background: orange,
                            color: "#fff",
                            border: "none",
                            boxShadow: "0 2px 8px #ff980033",
                            fontSize: "1rem",
                        }}
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}