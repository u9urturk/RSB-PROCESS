import React from 'react';

interface ProductGridItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  status: string;
}

interface ProductGridProps {
  products: ProductGridItem[];
  onAddToCart: (product: ProductGridItem) => void;
  onAddToCartWithNote: (product: ProductGridItem) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onAddToCartWithNote }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
    {products.map(product => (
      <div
        key={product.id}
        className="group bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 flex-1 pr-2">
            {product.name}
          </h4>
          <span className="font-bold text-blue-600 text-sm whitespace-nowrap">
            ₺{product.price}
          </span>
        </div>
        {product.description && (
          <p className="text-[11px] text-gray-500 mb-2 line-clamp-2 leading-snug">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex gap-2">
          <button
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold py-2 hover:bg-gray-200 transition-colors"
            onClick={() => onAddToCart(product)}
          >
            Ekle
          </button>
          <button
            className="px-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
            onClick={() => onAddToCartWithNote(product)}
            title="Not ile ekle"
          >
            +Not
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default ProductGrid;
