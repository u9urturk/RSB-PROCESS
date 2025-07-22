import React from "react";

interface StatusBadgeProps {
  status: string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, getStatusColor, getStatusText }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
    {getStatusText(status)}
  </span>
);

export default StatusBadge;
