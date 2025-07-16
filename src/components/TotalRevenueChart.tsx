import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TotalRevenueChartProps } from '../types';

const TotalRevenueChart: React.FC<TotalRevenueChartProps> = ({
    data,
    className = '',
    showLegend = true
}) => {
    return (
        <div className={`${className}`}>
            {showLegend && (
                <div className="flex gap-4 text-sm mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600"></div>
                        <span className="text-gray-600">Gelir (₺)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                        <span className="text-gray-600">Sipariş Sayısı</span>
                    </div>
                </div>
            )}
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                            }}
                            itemStyle={{ fontSize: 12 }}
                            labelStyle={{ fontSize: 12, fontWeight: 'bold' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#f97316"
                            strokeWidth={3}
                            dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="orders"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TotalRevenueChart;
