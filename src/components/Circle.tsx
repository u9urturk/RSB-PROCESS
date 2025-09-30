import React from 'react';
import { CircleProps } from '../types';

// Pure CSS driven variant: we set a CSS variable to drive stroke offset + text via inline style.
const Circle: React.FC<CircleProps> = ({ index, label, info, value }) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div key={index} className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <circle
            className="text-gray-200 stroke-current"
            strokeWidth="4"
            fill="transparent"
            r="16"
            cx="18"
            cy="18"
          />
          <circle
            className="text-orange-500 stroke-current transition-[stroke-dashoffset] duration-700 ease-out"
            strokeWidth="4"
            fill="transparent"
            r="16"
            cx="18"
            cy="18"
            strokeDasharray="100"
            strokeDashoffset={100 - clamped}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col font-semibold items-center justify-center text-sm select-none">
          {Math.round(clamped)}%
          {info && <span className="text-gray-500 text-[11px] leading-tight font-normal mt-0.5">{info}</span>}
        </div>
      </div>
      <p className="text-sm mt-2 font-semibold text-gray-700">{label}</p>
    </div>
  );
};

export default Circle;
