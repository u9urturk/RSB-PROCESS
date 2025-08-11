import { memo } from "react";
import { Package, Search } from "lucide-react";
import StockRow from "./StockRow";
import { StockItem } from "../../../types";

interface StockTableProps {
    items: StockItem[];
    onStockChange: (id: string, amount: number, type: "add" | "remove") => void;
    onOpenAdd: (item: StockItem) => void;
    onOpenRemove: (item: StockItem) => void;
    onOpenDetail: (item: StockItem) => void;
}

function StockTable({ items, onStockChange, onOpenAdd, onOpenRemove, onOpenDetail }: StockTableProps) {
    if (items.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="text-orange-600" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Stok Bulunamadı</h3>
                    <p className="text-gray-500 mb-6">
                        Aradığınız kriterlere uygun stok bulunmamaktadır. 
                        Arama terimlerinizi değiştirerek tekrar deneyin.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Package size={16} />
                        <span>Stok veritabanında arama yapılıyor...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                    Stok Listesi ({items.length} ürün)
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <StockRow
                            item={item}
                            onStockChange={onStockChange || (() => {})}
                            onOpenAdd={onOpenAdd}
                            onOpenRemove={onOpenRemove}
                            onOpenDetail={onOpenDetail}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default memo(StockTable);
