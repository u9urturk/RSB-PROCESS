import React from 'react';
import { User, Clock } from 'lucide-react';
import { FaBroom } from 'react-icons/fa';
import { TableData } from '../../../../types';
import { getTableVisualStatus } from '../../utils/statusMaps';

interface Props { table: TableData; }

const TableStatusBadge: React.FC<Props> = ({ table }) => {
  const visual = getTableVisualStatus(table.status as any, table.cleanStatus);
  const icon = table.status === 'occupied'
    ? <User size={12} />
    : table.status === 'reserved'
      ? <Clock size={12} />
      : table.cleanStatus === false
        ? <FaBroom size={12} />
        : <span className="w-2 h-2 rounded-full bg-current" />;
  return (
    <span className={`${visual.chipBg} ${visual.chipText} px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium flex items-center gap-1 sm:gap-1.5 border border-gray-200`}> 
      <span className={`w-2 h-2 rounded-full ${visual.dot}`}></span>
      <span className="flex items-center gap-1">
        {icon}
        {visual.label}
      </span>
    </span>
  );
};

export default React.memo(TableStatusBadge);
