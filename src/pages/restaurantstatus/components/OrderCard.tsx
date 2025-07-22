import React from "react";
import { Clock } from "lucide-react";
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
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-semibold text-gray-800">{order.productName}</h4>
          {order.status && (
            <StatusBadge
              status={order.status}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
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
        {order.note && order.note.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {order.note.map((note, idx) => (
              <NoteTag key={idx}>{note}</NoteTag>
            ))}
          </div>
        )}
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
);

export default OrderCard;
