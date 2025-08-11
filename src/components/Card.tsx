import React, { useEffect, useRef } from 'react';
import { CardProps } from '../types';

const Card: React.FC<CardProps> = ({ 
  value, 
  title, 
  icon, 
  type = 'str', 
  targetProgress = 75, 
  duration = 1200 
}) => {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let start: number | null = null;
        let frame: number;
        
        const animate = (timestamp: number) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const percent = Math.min((elapsed / duration) * targetProgress, targetProgress);
            
            if (progressRef.current) {
                progressRef.current.style.background = `conic-gradient(
                    #fb923c ${percent}%, 
                    #f3f4f6 ${percent}% 100%
                )`;
            }
            
            if (percent < targetProgress) {
                frame = requestAnimationFrame(animate);
            }
        };
        
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [targetProgress, duration]);

    return (
        <div className={"card flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-4 min-h-[120px] transition hover:shadow-lg hover:-translate-y-1"}>
            <div className="flex flex-col items-center justify-center gap-3 w-full">
                <div
                    ref={progressRef}
                    className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-orange-200 transition"
                    style={{
                        background: `conic-gradient(#fb923c 0%, #f3f4f6 0% 100%)`,
                        minWidth: 56,
                        minHeight: 56,
                    }}
                >
                    <span className="text-white bg-orange-500 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow">
                        {icon}
                    </span>
                </div>
                <span className="font-bold text-2xl text-gray-800 mt-2">
                    {type === "price" ? "₺" : ""}{value}
                </span>
                <span className="text-xs font-semibold text-gray-500 text-center">{title}</span>
            </div>
        </div>
    );
};

export default Card;
