import { X, Clock, User, Receipt } from "lucide-react";
import { TableData } from "../../../types";

interface OrderDetailProps {
    table: TableData;
    onClose: () => void;
}

const OrderDetail = ({ table, onClose }: OrderDetailProps) => {
    // Toplam tutarı hesapla
    const total = Array.isArray(table.orders)
        ? table.orders.reduce((sum, order) => sum + (order.price * order.quantity), 0)
        : 0;

    // Sipariş durumu renk kodları
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ready': return 'bg-green-100 text-green-800 border-green-200';
            case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Sipariş durumu metni
    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Beklemede';
            case 'preparing': return 'Hazırlanıyor';
            case 'ready': return 'Hazır';
            case 'delivered': return 'Teslim Edildi';
            default: return 'Belirsiz';
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-2xl overflow-hidden">
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Receipt size={24} />
                            Sipariş Detayı
                        </h2>
                        <p className="text-purple-100 mt-1">Masa {table.number}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                        aria-label="Kapat"
                    >
                        <X size={24} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Masa Bilgileri */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Garson Bilgisi */}
                    {table.waiterName && (
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Garson</p>
                                    <p className="font-semibold text-gray-800">{table.waiterName}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Süre Bilgisi */}
                    {table.occupiedAt && (
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Clock size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Açılış Saati</p>
                                    <p className="font-semibold text-gray-800">
                                        {new Date(table.occupiedAt).toLocaleTimeString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sipariş Listesi */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Sipariş İçeriği</h3>
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
                        {table.orders?.length || 0} ürün
                    </div>
                </div>

                {table.orders && table.orders.length > 0 ? (
                    <div className="space-y-3">
                        {table.orders.map((order, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-gray-800">{order.productName}</h4>
                                            {order.status && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                Adet: {order.quantity}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                Birim: {order.price}₺
                                            </span>
                                        </div>

                                        {/* Notlar */}
                                        {order.note && order.note.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {order.note.map((note, idx) => (
                                                    <span key={idx} className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full border border-amber-200">
                                                        {note}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Zaman bilgisi */}
                                        {order.orderedAt && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(order.orderedAt).toLocaleTimeString('tr-TR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-800">{order.price * order.quantity}₺</p>
                                        <p className="text-sm text-gray-500">{order.price}₺ x {order.quantity}</p>
                                    </div>
                                </div>
                            </div>
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

            {/* Toplam Tutar */}
            {table.orders && table.orders.length > 0 && (
                <div className="border-t border-gray-200 p-6 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Receipt size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Toplam Tutar</p>
                                <p className="text-xs text-gray-500">{table.orders.length} ürün</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">{total}₺</p>
                            <p className="text-sm text-gray-500">KDV Dahil</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;