import { ErrorMessage } from '../ErrorMessage';
import type { CartItemWithProduct, ShippingFormData, PaymentFormData } from '../../types';

interface ReviewStepProps {
  items: CartItemWithProduct[];
  total: number;
  shippingData: ShippingFormData;
  paymentData: PaymentFormData;
  onPlaceOrder: () => void;
  onBack: () => void;
  submitting: boolean;
  error: string | null;
}

export const ReviewStep = ({
  items,
  total,
  shippingData,
  paymentData,
  onPlaceOrder,
  onBack,
  submitting,
  error,
}: ReviewStepProps) => (
  <div className="space-y-4">
    {/* Order summary */}
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h2>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">{item.product.name}</p>
            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
          </div>
          <p className="text-sm font-bold text-slate-900">
            ${(Number(item.product.price) * item.quantity).toFixed(2)}
          </p>
        </div>
      ))}
      <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-200">
        <span className="font-bold text-slate-700">Total</span>
        <span className="text-xl font-extrabold text-slate-900">${Number(total).toFixed(2)}</span>
      </div>
    </div>

    {/* Shipping */}
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Shipping Address</h3>
      <p className="text-sm text-slate-700">{shippingData.full_name}</p>
      <p className="text-sm text-slate-700">{shippingData.street}</p>
      <p className="text-sm text-slate-700">
        {shippingData.city}, {shippingData.state} {shippingData.zip_code}
      </p>
      <p className="text-sm text-slate-700">{shippingData.country}</p>
    </div>

    {/* Payment */}
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Payment</h3>
      <p className="text-sm text-slate-700 capitalize">
        {paymentData.method.replace('_', ' ')}
        {paymentData.last_four ? ` ending in ${paymentData.last_four}` : ''}
      </p>
    </div>

    {error && <ErrorMessage message={error} />}

    <div className="flex gap-3">
      <button
        onClick={onBack}
        className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
      >
        ← Back
      </button>
      <button
        onClick={() => void onPlaceOrder()}
        disabled={submitting}
        className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Placing order...' : 'Place Order'}
      </button>
    </div>
  </div>
);
