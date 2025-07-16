import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { OverviewChartProps } from '../types';

const OverviewChart: React.FC<OverviewChartProps> = ({
    data,
    className = '',
    width = 280,
    height = 280,
    innerRadius = 65,
    outerRadius = 90
}) => {
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className={`${className}`}>
            <div className="flex items-center justify-center relative mb-6">
                <PieChart width={width} height={height}>
                    <Pie
                        activeIndex={activeIndex}
                        data={data}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={3}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke="none"
                                className="transition-all duration-300 hover:opacity-80"
                            />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                            fontSize: '14px'
                        }}
                    />
                </PieChart>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-2xl font-bold text-gray-800">
                        {data.reduce((sum, item) => sum + item.value, 0)}%
                    </div>
                    <div className="text-xs text-gray-500">Toplam</div>
                </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-1 gap-3">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OverviewChart;
