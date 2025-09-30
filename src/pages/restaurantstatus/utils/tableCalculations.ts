import { TableData } from '../../../types';

// Calculates the total bill (sum of quantity * price) for all orders on a table.
// Guarded against missing or malformed order arrays.
export function calculateTableTotal(table: TableData): number {
  if (!table?.orders || !Array.isArray(table.orders) || table.orders.length === 0) return 0;
  return table.orders.reduce<number>((sum, order) => sum + (order.quantity * order.price), 0);
}
