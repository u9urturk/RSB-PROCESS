import React from 'react';
import { Settings } from 'lucide-react';

interface InDevelopmentOverlayProps {
  text?: string;
  icon?: React.ReactNode;
  className?: string;
}

const InDevelopmentOverlay: React.FC<InDevelopmentOverlayProps> = ({
  text = 'In development',
  icon = <Settings size={54} strokeWidth={2.2} className="animate-spin spin-slow text-gray-500" />,
  className = '',
}) => (
  <h3
    className={`text-3xl font-bold absolute top-0 left-0 w-full h-full flex flex-col gap-y-4 items-center justify-center bg-gray-100/50 text-gray-500 ${className}`}
  >
    {text} <span>{icon}</span>
  </h3>
);

export default InDevelopmentOverlay;
