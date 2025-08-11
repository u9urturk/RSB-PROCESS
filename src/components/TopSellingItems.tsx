import React from 'react';
import { TopSellingItemsProps } from '../types';

const TopSellingItems: React.FC<TopSellingItemsProps> = ({
  items,
  className = '',
  maxItems = 5
}) => {
  return (
    <div className={`${className}`}>
      <div className="space-y-3">
        {items.slice(0, maxItems).map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-8 h-8 rounded-xl 
                  flex items-center justify-center 
                  font-bold text-sm
                  transition-all duration-200
                  ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
                      : index === 2
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600'
                  }
                  group-hover:scale-110
                `}
              >
                #{index + 1}
              </div>
              <div>
                <div className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">
                  {item.percentage}% satış oranı
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">{item.count}</div>
              <div className="text-xs text-gray-500">adet</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingItems;
