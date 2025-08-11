import React from 'react';
import { CustomerMapProps } from '../types';

const CustomerMap: React.FC<CustomerMapProps> = ({
  data,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      <div className="flex gap-3 text-xs mb-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span className="text-gray-600">Hazırlanıyor</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-gray-600">Yolda</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-gray-600">Teslim Edildi</span>
        </div>
      </div>

      <div className="relative w-full h-[200px] rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          {data.map((customer) => (
            <div
              key={customer.id}
              className={`
                absolute w-4 h-4 rounded-full
                transform -translate-x-1/2 -translate-y-1/2
                cursor-pointer group
                animate-pulse
                ${
                  customer.orderStatus === 'preparing'
                    ? 'bg-orange-500 shadow-orange-500/50'
                    : customer.orderStatus === 'onTheWay'
                    ? 'bg-blue-500 shadow-blue-500/50'
                    : 'bg-green-500 shadow-green-500/50'
                }
                shadow-lg
              `}
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`
              }}
              title={`${customer.name} - ${customer.address}`}
            >
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="font-medium">{customer.name}</div>
                <div className="text-gray-500">{customer.address}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {data.slice(0, 3).map((customer) => (
          <div
            key={customer.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-3 h-3 rounded-full
                  ${
                    customer.orderStatus === 'preparing'
                      ? 'bg-orange-500'
                      : customer.orderStatus === 'onTheWay'
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                  }
                `}
              ></div>
              <div>
                <div className="font-medium text-sm text-gray-800">{customer.name}</div>
                <div className="text-xs text-gray-500">{customer.address}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-600">{customer.orderTime}</div>
              {customer.deliveryTime && (
                <div className="text-xs text-gray-500">{customer.deliveryTime}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerMap;
