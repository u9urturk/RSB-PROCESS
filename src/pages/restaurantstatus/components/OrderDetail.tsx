import { Clock, User, Receipt } from "lucide-react";
import { formatHHMM, formatCurrencyTRY } from "../utils/format";
import OrderCard from "./OrderCard";
import { TableData } from "../../../types";
import TableModalHeader from "./TableModalHeader";
import InfoCard from "./InfoCard";


interface OrderDetailProps {
    table: TableData;
    onClose: () => void;
}

const OrderDetail = ({ table, onClose }: OrderDetailProps) => {
    const total = Array.isArray(table.orders)
        ? table.orders.reduce((sum, order) => sum + (order.price * order.quantity), 0)
        : 0;


    return (
        <div className="flex flex-col bg-gray-50  rounded-2xl">
            <div className="w-full sticky top-0 z-10 bg-white">
                <TableModalHeader table={table} onClose={onClose} />

            </div>
            <div className="border-b px-2 py-4 border-gray-200">
                <div className="flex items-center justify-between ">
                    {table.waiterName && (
                        <InfoCard
                            title={<span className="flex items-center gap-2"><User size={20} className="text-purple-600" /> Garson</span>}
                            value={<span className="font-semibold text-gray-800">{table.waiterName}</span>}
                            bgGradient="linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0.02) 100%)"
                            boxShadow="0 2px 8px rgba(139, 92, 246, 0.08)"
                            className="p-4"
                        />
                    )}

                    {table.occupiedAt && (
                        <InfoCard
                            title={<span className="flex items-center gap-2"><Clock size={20} className="text-green-600" /> Açılış Saati</span>}
                            value={<span className="font-semibold text-gray-800">{formatHHMM(table.occupiedAt)}</span>}
                            bgGradient="linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)"
                            boxShadow="0 2px 8px rgba(16, 185, 129, 0.08)"
                            className="p-4"
                        />
                    )}
                </div>
            </div>

            <div className="overflow-y-auto no-scrollbar h-auto max-h-[calc(100vh-32rem)]  p-2">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold  text-gray-800 ">Sipariş İçeriği</h3>
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
                        {table.orders?.length || 0} ürün
                    </div>
                </div>

                {table.orders && table.orders.length > 0 ? (
                    <div className="space-y-2">
                        {table.orders.map((order, i) => (
                            <OrderCard
                                key={i}
                                order={{
                                    ...order,
                                    productName: order.productName || "Ürün"
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📋</div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Sipariş Bulunamadı</h3>
                        <p className="text-gray-500">Bu masada aktif sipariş bulunmuyor</p>
                    </div>
                )}
            </div>

            {table.orders && table.orders.length > 0 && (
                <InfoCard
                    title={<span className="flex items-center gap-2"><Receipt size={20} className="text-green-600" /> Toplam Tutar</span>}
                    value={<span className="text-2xl font-bold text-green-600">{formatCurrencyTRY(total)}</span>}
                    desc={<span className="text-xs text-gray-500">{table.orders.length} ürün • KDV Dahil</span>}
                    bgGradient="linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)"
                    boxShadow="0 2px 8px rgba(16, 185, 129, 0.08)"
                    className="sticky bottom-0  p-4 mt-2"
                />
            )}
        </div>
    );
};

export default OrderDetail;