import type { CartItemWithProduct } from '../types';
import { getPlaceholderImage } from '../utils/images';

interface CartItemRowProps {
  item: CartItemWithProduct;
  onQuantityChange: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  loading?: boolean;
}

const PLACEHOLDER_IMAGE = getPlaceholderImage(100, 100);

export const CartItemRow = ({ item, onQuantityChange, onRemove, loading }: CartItemRowProps) => {
  const lineTotal = Number(item.product.price) * item.quantity;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-200 last:border-0">
      <img
        src={item.product.image_url ?? PLACEHOLDER_IMAGE}
        alt={item.product.name}
        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
        <p className="text-xs text-slate-500">{item.product.category}</p>
        <p className="text-sm font-medium text-indigo-600 mt-0.5">${Number(item.product.price).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
          disabled={loading}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center disabled:opacity-50 transition-colors"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          disabled={loading}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center disabled:opacity-50 transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className="text-right min-w-[70px]">
        <p className="text-sm font-bold text-slate-900">${lineTotal.toFixed(2)}</p>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        disabled={loading}
        className="text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
        aria-label="Remove item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};
