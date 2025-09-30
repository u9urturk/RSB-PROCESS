import React from 'react';
import { getOrderStatusStyle } from '../../utils/statusMaps';

interface Props { status: 'pending' | 'preparing' | 'ready' | 'delivered'; }

const OrderStatusBadge: React.FC<Props> = ({ status }) => {
  const style = getOrderStatusStyle(status);
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style.badge} inline-flex items-center gap-1`}> 
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {style.label}
    </span>
  );
};

export default React.memo(OrderStatusBadge);
