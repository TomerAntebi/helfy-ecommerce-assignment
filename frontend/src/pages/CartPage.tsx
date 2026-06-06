import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CartItemRow } from '../components/CartItemRow';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCart } from '../hooks/useCart';
import { extractApiError } from '../utils/apiError';

export const CartPage = () => {
  const { items, total, loading, updateItem, removeItem } = useCart();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleQuantityChange = async (itemId: number, quantity: number) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await updateItem(itemId, quantity);
    } catch (err) {
      setActionError(extractApiError(err, 'Failed to update item'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (itemId: number) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await removeItem(itemId);
    } catch (err) {
      setActionError(extractApiError(err, 'Failed to remove item'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Looks like you haven't added anything yet."
        actionLabel="Browse Products"
        actionTo="/products"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      {actionError && (
        <div className="mb-4">
          <ErrorMessage message={actionError} />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onQuantityChange={(itemId, qty) => void handleQuantityChange(itemId, qty)}
            onRemove={(itemId) => void handleRemove(itemId)}
            loading={actionLoading}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold text-slate-700">Total</span>
          <span className="text-2xl font-extrabold text-slate-900">${Number(total).toFixed(2)}</span>
        </div>
        <Link
          to="/checkout"
          className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold text-base hover:bg-indigo-700 transition-colors shadow-md"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};
