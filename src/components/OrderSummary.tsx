import React from 'react';
import Circle from './Circle';
import Select from './Select';
import { OrderSummaryProps, OrderSummaryData } from '../types';

const defaultData: OrderSummaryData[] = [
    { label: "Tamamlanan", value: 75 },
    { label: "Hazırlanıyor", value: 15 },
    { label: "İptal", value: 10 }
];

const defaultOptions: string[] = [
    "Bugün",
    "Bu Hafta",
    "Bu Ay",
    "Tüm Zamanlar"
];

const OrderSummary: React.FC<OrderSummaryProps> = ({
    className = '',
    data = defaultData,
    periodOptions = defaultOptions
}) => {
    return (
        <div className={`${className}`}>
            <div className="flex justify-between items-center mb-6">
                <Select options={periodOptions} />
            </div>
            <div className="grid grid-cols-1 gap-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <Circle 
                                index={index} 
                                label={item.label} 
                                value={item.value} 
                                info={item.info}
                                duration={1000}
                            />
                            <div>
                                <div className="font-medium text-gray-800">{item.label}</div>
                                {item.info && <div className="text-xs text-gray-500">{item.info}</div>}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-gray-800">{item.value}%</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderSummary;
