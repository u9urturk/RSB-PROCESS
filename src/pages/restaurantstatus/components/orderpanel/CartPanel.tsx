import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CartItem } from './types';
import { TableData } from '../../../../types';

export interface CartPanelProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  table: TableData;
  onConfirm: () => void;
  onUpdateExistingOrder: (orderId: string, updateData: any) => void;
  onRemoveExistingOrder: (orderId: string) => void;
  onClearCart: () => void;
  onClose: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ cart, setCart, table, onConfirm, onUpdateExistingOrder, onRemoveExistingOrder, onClearCart, onClose }) => {
  const handleQtyChange = (id: string, delta: number) => {
    setCart(prev => prev
      .map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
      .filter(item => item.quantity > 0));
  };
  const handleRemove = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const existingOrders = table.orders || [];
  const existingTotal = existingOrders.reduce((sum, order: any) => sum + (order.total || 0), 0);
  const grandTotal = existingTotal + totalAmount;
  const [showOrdersMobile, setShowOrdersMobile] = useState(true);
  const [showCartMobile, setShowCartMobile] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">{existingOrders.length + cart.length}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Sipariş Yönetimi</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">₺{grandTotal.toFixed(2)}</span>
          {totalAmount > 0 && <p className="text-xs text-gray-500">Yeni: +₺{totalAmount.toFixed(2)}</p>}
        </div>
      </div>
      {existingOrders.length > 0 && (
        <div className="border-b border-gray-200">
          <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded-t-xl sm:hidden" onClick={() => setShowOrdersMobile(v => !v)}>
            <span className="font-semibold text-gray-700 text-sm">Mevcut Siparişler</span>
            <span className="text-xs text-gray-500">{showOrdersMobile ? 'Kapat' : 'Aç'}</span>
          </button>
          <div className={`p-3 bg-gray-50 ${showOrdersMobile ? '' : 'hidden'} sm:block`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Mevcut Siparişler</h4>
              <span className="text-sm font-bold text-gray-600">₺{existingTotal.toFixed(2)}</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {existingOrders.map((order: any, idx: number) => (
                <div key={order.id || idx} className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800 text-sm">{order.productName}</h5>
                      {order.note && order.note.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {order.note.map((tag: string, i: number) => (
                            <span key={i} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-gray-800 text-sm">₺{(order.total || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">₺{(order.price || 0).toFixed(2)} x {order.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {order.quantity === 1 ? (
                        <button className="w-6 h-6 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center text-xs" onClick={() => onRemoveExistingOrder(order.id)} title="Siparişi sil">
                          <X size={12} />
                        </button>
                      ) : (
                        <button className="w-6 h-6 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-xs font-bold" onClick={() => onUpdateExistingOrder(order.id, { quantity: order.quantity - 1 })}>-</button>
                      )}
                      <span className="min-w-[1.5rem] text-center font-semibold text-xs">{order.quantity}</span>
                      <button className="w-6 h-6 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-xs font-bold" onClick={() => onUpdateExistingOrder(order.id, { quantity: order.quantity + 1 })}>+</button>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : order.status === 'ready' ? 'bg-blue-100 text-blue-600' : order.status === 'preparing' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                      {order.status === 'pending' ? 'Bekliyor' : order.status === 'preparing' ? 'Hazırlanıyor' : order.status === 'ready' ? 'Hazır' : 'Teslim'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded-t-xl sm:hidden mb-2" onClick={() => setShowCartMobile(v => !v)}>
          <span className="font-semibold text-gray-700 text-sm">Sepet</span>
          <span className="text-xs text-gray-500">{showCartMobile ? 'Kapat' : 'Aç'}</span>
        </button>
        <div className={`${showCartMobile ? '' : 'hidden'} sm:block`}>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🛒</div>
              <p className="text-gray-500 font-medium">Sepet boş</p>
              <p className="text-sm text-gray-400">Ürün ekleyerek siparişe başlayın</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 min-w-[180px] max-w-[220px] flex-1">
                  <div className="flex flex-col gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{item.productName}</h4>
                      {item.note && item.note.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.note.map((tag, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-gray-800 text-sm">₺{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">₺{item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {item.quantity === 1 ? (
                        <button className="w-7 h-7 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center" onClick={() => handleRemove(item.id)} title="Ürünü sepetten çıkar">
                          <X size={14} />
                        </button>
                      ) : (
                        <button className="w-7 h-7 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm font-bold" onClick={() => handleQtyChange(item.id, -1)}>-</button>
                      )}
                      <span className="min-w-[1.5rem] text-center font-semibold text-sm">{item.quantity}</span>
                      <button className="w-7 h-7 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm font-bold" onClick={() => handleQtyChange(item.id, 1)}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 space-y-3">
        {cart.length > 0 && (
          <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/25" onClick={onConfirm}>
            Yeni Ürünleri Ekle ({cart.length} ürün)
          </button>
        )}
        <button className="w-full py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors" onClick={cart.length > 0 ? onClearCart : onClose}>
          {cart.length > 0 ? 'Sepeti Temizle' : 'Kapat'}
        </button>
      </div>
    </div>
  );
};

export default CartPanel;
