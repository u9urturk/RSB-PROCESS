import React, { useEffect, useState } from 'react';
import { CircleProps } from '../types';

const Circle: React.FC<CircleProps> = ({ 
    index, 
    label, 
    info, 
    value, 
    duration = 1000 
}) => {
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        let startTime: number | null = null;

        const animate = (timestamp: number): void => {
            if (!startTime) startTime = timestamp;
            const elapsedTime = timestamp - startTime;
            const progressPercentage = Math.min(
                (elapsedTime / duration) * value,
                value
            );

            setProgress(progressPercentage);

            if (progressPercentage < value) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <div key={index} className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle
                        className="text-gray-200 transition-all stroke-current"
                        strokeWidth="4"
                        fill="transparent"
                        r="16"
                        cx="18"
                        cy="18"
                    />
                    <circle
                        className="text-orange-500 duration-1000 transition-all stroke-current"
                        strokeWidth="4"
                        fill="transparent"
                        r="16"
                        cx="18"
                        cy="18"
                        strokeDasharray="100"
                        strokeDashoffset={100 - progress}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col font-semibold items-center justify-center text-sm">
                    {Math.round(progress)}%
                    {info && <span className="text-gray-500 text-sm">{info}</span>}
                </div>
            </div>
            <p className="text-sm mt-2 font-semibold">{label}</p>
        </div>
    );
};

export default Circle;
