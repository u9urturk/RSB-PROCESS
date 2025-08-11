// Centralized status style maps for tables and orders
// Stage 1 refactor: single source of truth for labels & classes

export type TableRuntimeStatus = 'occupied' | 'available' | 'reserved';
export type OrderRuntimeStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

interface StatusStyle {
  label: string;
  chipBg: string;
  chipText: string;
  dot: string;
}

export const tableStatusStyles: Record<TableRuntimeStatus, StatusStyle> = {
  occupied: { label: 'Dolu', chipBg: 'bg-red-100', chipText: 'text-red-700', dot: 'bg-red-500' },
  reserved: { label: 'Rezerve', chipBg: 'bg-blue-100', chipText: 'text-blue-700', dot: 'bg-blue-500' },
  available: { label: 'Boş', chipBg: 'bg-green-100', chipText: 'text-green-700', dot: 'bg-green-500' }
};

interface OrderStatusStyle {
  label: string;
  badge: string; // combined classes for badge
}

export const orderStatusStyles: Record<OrderRuntimeStatus, OrderStatusStyle> = {
  pending: { label: 'Beklemede', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  preparing: { label: 'Hazırlanıyor', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  ready: { label: 'Hazır', badge: 'bg-green-100 text-green-800 border-green-200' },
  delivered: { label: 'Teslim', badge: 'bg-gray-100 text-gray-800 border-gray-200' }
};

// Helper to derive final table “visual status” considering cleanStatus
export function getTableVisualStatus(status: TableRuntimeStatus, cleanStatus?: boolean) {
  if (status === 'available' && cleanStatus === false) {
    return {
      label: 'Temizlenecek',
      chipBg: 'bg-amber-100',
      chipText: 'text-amber-700',
      dot: 'bg-amber-500'
    } as StatusStyle;
  }
  return tableStatusStyles[status];
}

export function getOrderStatusStyle(status: OrderRuntimeStatus) {
  return orderStatusStyles[status];
}
