import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={product.image_url ?? PLACEHOLDER_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full self-start mb-2">
          {product.category}
        </span>
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors mb-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1">
          {product.description ?? 'No description available.'}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-slate-900">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.stock > 0 ? (
            <button
              onClick={() => onAddToCart?.(product)}
              className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Add to Cart
            </button>
          ) : (
            <span className="text-sm text-slate-400 font-medium">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
};
