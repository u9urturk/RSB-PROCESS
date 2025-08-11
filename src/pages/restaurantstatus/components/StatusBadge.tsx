import React from "react";

interface StatusBadgeProps {
  status: string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, getStatusColor, getStatusText }) => (
  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${getStatusColor(status)} relative overflow-hidden group`}>
    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></div>
    <span className="relative z-10">{getStatusText(status)}</span>
  </span>
);

export default StatusBadge;
