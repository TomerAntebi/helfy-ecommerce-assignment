import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useOrders } from '../hooks/useOrders';

export const OrdersPage = () => {
  const { orders, loading, error } = useOrders();

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="You haven't placed any orders. Start shopping!"
        actionLabel="Browse Products"
        actionTo="/products"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Order History</h1>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span>Order</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right">Total</span>
          <span />
        </div>

        {orders.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-6 py-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-bold text-slate-900">#{order.id}</span>
            <span className="text-sm text-slate-500">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span>
              <OrderStatusBadge status={order.status} />
            </span>
            <span className="text-sm font-bold text-slate-900 sm:text-right">
              ${Number(order.total_amount).toFixed(2)}
            </span>
            <div className="sm:text-right">
              <Link
                to={`/orders/${order.id}`}
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
