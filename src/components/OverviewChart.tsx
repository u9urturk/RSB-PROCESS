import React, { useState, useMemo, useCallback } from 'react';
import { PieChart, Cell, Tooltip, Pie, ResponsiveContainer } from "recharts";
import { OverviewChartProps } from '../types';

const OverviewChart: React.FC<OverviewChartProps> = ({
    data,
    className = '',
    width = 280,
    height = 280,
    innerRadius = 65,
    outerRadius = 90
}) => {
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    const onPieEnter = useCallback((_data: any, index: number) => {
        setActiveIndex(index);
    }, []);

    const onPieLeave = useCallback(() => {
        setActiveIndex(-1);
    }, []);

    // Center text calculation - ensure it doesn't exceed 100%
    const totalValue = useMemo(() => {
        const sum = data.reduce((sum, item) => sum + item.value, 0);
        return Math.min(sum, 100);
    }, [data]);

    // Validate data
    const validData = useMemo(() => {
        return data.filter(item => item.value > 0 && item.name && item.color);
    }, [data]);

    if (validData.length === 0) {
        return (
            <div className={`${className} flex items-center justify-center`}>
                <p className="text-gray-500">Veri bulunamadı</p>
            </div>
        );
    }

    return (
        <div className={`${className}`} role="region" aria-label="Genel bakış grafiği">
            <div className="flex items-center justify-center relative mb-6">
                <ResponsiveContainer width={width} height={height}>
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            data={validData}
                            innerRadius={innerRadius}
                            outerRadius={outerRadius}
                            paddingAngle={3}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            aria-label="Pasta grafiği"
                        >
                            {validData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color}
                                    stroke="none"
                                    style={{
                                        filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                                        transition: 'filter 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                fontSize: '14px',
                                padding: '12px'
                            }}
                            formatter={(value: number, name: string) => [`%${value}`, name]}
                            labelStyle={{ display: 'none' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <div className="text-2xl font-bold text-gray-800">
                        %{totalValue.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Toplam</div>
                </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-2">
                {validData.map((item, index) => (
                    <div 
                        key={`legend-${index}`} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                            activeIndex === index 
                                ? 'bg-gray-100 shadow-sm' 
                                : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActiveIndex(activeIndex === index ? -1 : index);
                            }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`${item.name}: %${item.value}`}
                    >
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: item.color }}
                                aria-hidden="true"
                            />
                            <span className="text-sm font-medium text-gray-700 truncate">
                                {item.name}
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 ml-2">
                            %{item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OverviewChart;
