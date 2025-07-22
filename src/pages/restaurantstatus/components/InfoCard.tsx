import React from "react";

interface InfoCardProps {
    title: string | React.ReactNode;
    value: React.ReactNode;
    desc?: React.ReactNode;
    icon?: React.ReactNode;
    bgGradient?: string;
    boxShadow?: string;
    className?: string;
    children?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({
    title,
    value,
    desc,
    icon,
    bgGradient = "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)",
    boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)",
    className = "",
    children,
}) => (
    <div
        className={`relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-4 backdrop-blur-md border border-white/20 ${className}`}
        style={{
            background: bgGradient,
            boxShadow: boxShadow,
        }}
    >
        <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 mb-1 sm:mb-2 font-medium">{title}</p>
                <div>{value}</div>
                {desc && <div className="mt-1">{desc}</div>}
                {children}
            </div>
            {icon && (
                <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center">
                    {icon}
                </div>
            )}
        </div>
    </div>
);

export default InfoCard;