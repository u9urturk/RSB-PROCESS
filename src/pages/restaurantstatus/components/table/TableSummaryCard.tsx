import React, { useMemo } from 'react';
import { Users, Clock, DollarSign, ShoppingCart, Sparkles, UserCheck } from 'lucide-react';
import { TableData } from '../../../../types';
import { getTableVisualStatus } from '../../utils/statusMaps';
import { calculateTableTotal } from '../../utils/tableCalculations';
import { formatCurrencyTRY, formatHHMM, formatOccupiedDuration } from '../../utils/format';

interface Props {
  table: TableData;
  transferMode: boolean;
}

const TableSummaryCard: React.FC<Props> = ({ table, transferMode }) => {
  const style = getTableVisualStatus(table.status as any, table.cleanStatus);
  const statusText = style.label;

  const totalBill = useMemo(() => calculateTableTotal(table), [table.orders]);

  const timeDisplay = useMemo(() => (
    table.status === 'occupied'
      ? formatOccupiedDuration(table.occupiedAt)
      : formatHHMM(table.occupiedAt)
  ), [table.status, table.occupiedAt]);

  const isTransferTarget = transferMode && table.status === 'available' && table.cleanStatus === true;
  const isTransferInactive = transferMode && !isTransferTarget;

  return (
    <div
      className={`relative bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-[150px] sm:h-[160px] group overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-400/60 ${isTransferTarget ? 'ring-2 ring-blue-300 shadow-md' : ''} ${isTransferInactive ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <div className="p-3 pb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 font-semibold text-gray-700 text-sm">{table.number}</div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-800 text-sm truncate">{table.name || 'Masa'}</h3>
            <p className="text-[11px] text-gray-500">Kapasite: {table.capacity || 4}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${style.chipBg} ${style.chipText}`}>
          <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
          {statusText}
        </span>
      </div>
      <div className="px-3 pb-3 mt-auto space-y-2">
        {table.waiterName && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
            <UserCheck size={12} className="text-purple-500" />
            <span className="truncate font-medium">{table.waiterName}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock size={12} className="text-orange-500" />
            <span className="font-medium">{timeDisplay}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <DollarSign size={12} className="text-green-500" />
            <span className="font-semibold text-green-700">{formatCurrencyTRY(totalBill)}</span>
          </div>
        </div>
        {table.orders && table.orders.length > 0 && (
          <div className="flex items-center justify-center text-[11px] text-gray-600">
            <ShoppingCart size={12} className="text-blue-500" />
            <span className="font-medium ml-1">{table.orders.length} sipariş</span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-orange-50/10 to-red-50/10 pointer-events-none" />
      {isTransferTarget && (
        <div className="absolute inset-0 bg-blue-50/70 flex items-center justify-center">
          <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-sm">
            <Users size={12} /> Aktarılabilir
          </div>
        </div>
      )}
      {!table.cleanStatus && table.status === 'available' && (
        <div className="absolute top-1 left-1 w-5 h-5 rounded-md bg-amber-400 flex items-center justify-center shadow-sm" title="Temizlenecek">
          <Sparkles size={12} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default React.memo(TableSummaryCard);
