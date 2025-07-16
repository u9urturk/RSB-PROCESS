import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import MenuDetailModal from "../modals/MenuDetailModal";
import { MenuItemDetailed, MenuTableProps } from "../../../types";

export default function MenuTable({ items, onEdit, onDelete, onUpdate }: MenuTableProps) {
    const [detailOpen, setDetailOpen] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<MenuItemDetailed | null>(null);

    const handleRowClick = (item: MenuItemDetailed): void => {
        setSelectedItem(item);
        setDetailOpen(true);
    };

    const handleUpdate = (updatedItem: MenuItemDetailed): void => {
        if (onUpdate) onUpdate(updatedItem.id, updatedItem.status === "active");
        setDetailOpen(false);
    };

    return (
        <div className="bg-white rounded-xl shadow p-4">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 text-gray-700">
                        <th className="py-2 px-3 text-left">Ürün</th>
                        <th className="py-2 px-3 text-left">Kategori</th>
                        <th className="py-2 px-3 text-left">Fiyat (₺)</th>
                        <th className="py-2 px-3 text-left">Durum</th>
                        <th className="py-2 px-3 text-left">Açıklama</th>
                        <th className="py-2 px-3 text-left">İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-6 text-gray-400">
                                Menüde ürün bulunamadı.
                            </td>
                        </tr>
                    )}
                    {items.map(item => (
                        <tr
                            key={item.id}
                            className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleRowClick(item)}
                        >
                            <td className="py-2 px-3 font-semibold flex items-center gap-2">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                                ) : (
                                    <span className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-400">🍽️</span>
                                )}
                                {item.name}
                            </td>
                            <td className="py-2 px-3">{item.category}</td>
                            <td className="py-2 px-3">{item.price}</td>
                            <td className="py-2 px-3">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                                    {item.status === "active" ? "Aktif" : "Pasif"}
                                </span>
                            </td>
                            <td className="py-2 px-3">{item.description}</td>
                            <td className="py-2 px-3 flex gap-2"
                                onClick={e => e.stopPropagation()}>
                                <button
                                    className="p-1 rounded hover:bg-orange-100 text-orange-600"
                                    onClick={() => onEdit && onEdit(item)}
                                    title="Düzenle"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    className="p-1 rounded hover:bg-red-100 text-red-600"
                                    onClick={() => onDelete && onDelete(item.id)}
                                    title="Sil"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedItem && (
                <MenuDetailModal
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    item={selectedItem}
                    onUpdate={handleUpdate}
                    categories={[...new Set(items.map(item => item.category))]}
                />
            )}
        </div>
    );
}
