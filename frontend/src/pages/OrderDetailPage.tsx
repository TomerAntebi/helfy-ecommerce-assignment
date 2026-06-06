import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import * as ordersService from '../services/orders.service';
import type { Order, OrderItemWithProduct } from '../types';
import { getPlaceholderImage } from '../utils/images';
import { extractApiError } from '../utils/apiError';

const PLACEHOLDER_IMAGE = getPlaceholderImage(80, 80);

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const result = await ordersService.getOrderById(Number(id));
        setOrder(result.order);
        setItems(result.items);
      } catch (err) {
        setError(extractApiError(err, 'Order not found'));
      } finally {
        setLoading(false);
      }
    };
    void fetchOrder();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorMessage message={error ?? 'Order not found'} />
        <div className="mt-4 text-center">
          <Link to="/orders" className="text-indigo-600 hover:underline text-sm">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/orders" className="text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6 inline-block">
        ← Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Order #{order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-5">
        {/* Meta */}
        <div className="bg-white rounded-2xl shadow-md p-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Order Date</p>
            <p className="text-sm text-slate-900">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Total</p>
            <p className="text-lg font-extrabold text-slate-900">${Number(order.total_amount).toFixed(2)}</p>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Shipping Address</h2>
          <p className="text-sm text-slate-700">{order.shipping_full_name}</p>
          <p className="text-sm text-slate-700">{order.shipping_street}</p>
          <p className="text-sm text-slate-700">
            {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
          </p>
          <p className="text-sm text-slate-700">{order.shipping_country}</p>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Payment</h2>
          <p className="text-sm text-slate-700 capitalize">
            {order.payment_method.replace('_', ' ')}
            {order.payment_last_four ? ` ending in ${order.payment_last_four}` : ''}
          </p>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Items</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.product.image_url ?? PLACEHOLDER_IMAGE}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity} × ${Number(item.price_at_purchase).toFixed(2)}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 flex-shrink-0">
                  ${(item.quantity * Number(item.price_at_purchase)).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-200">
            <span className="font-bold text-slate-700">Order Total</span>
            <span className="text-xl font-extrabold text-slate-900">${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
