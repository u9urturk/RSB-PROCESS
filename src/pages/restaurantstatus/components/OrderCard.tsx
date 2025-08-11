import React from "react";
import { Clock, Package, DollarSign } from "lucide-react";
import StatusBadge from "./StatusBadge";
import NoteTag from "./NoteTag";

interface OrderCardProps {
  order: {
    productName: string;
    status?: string;
    quantity: number;
    price: number;
    note?: string[];
    orderedAt?: string;
  };
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, getStatusColor, getStatusText }) => (
  <div className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
    {/* Hover overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    
    <div className="flex items-start justify-between relative z-10">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <h4 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-200">{order.productName}</h4>
          {order.status && (
            <StatusBadge
              status={order.status}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-full">
            <Package size={12} className="text-blue-500" />
            <span className="font-medium">Adet: {order.quantity}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
            <DollarSign size={12} className="text-green-500" />
            <span className="font-medium">Birim: {order.price}₺</span>
          </span>
        </div>
        {order.note && order.note.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {order.note.map((note, idx) => (
              <NoteTag key={idx}>{note}</NoteTag>
            ))}
          </div>
        )}
        {order.orderedAt && (
          <p className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full w-fit">
            <Clock size={12} className="text-orange-500" />
            <span>
              {new Date(order.orderedAt).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </p>
        )}
      </div>
      <div className="text-right ml-4">
        <p className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-200">
          {order.price * order.quantity}₺
        </p>
        <p className="text-sm text-gray-500">{order.price}₺ x {order.quantity}</p>
      </div>
    </div>
  </div>
);

export default OrderCard;
