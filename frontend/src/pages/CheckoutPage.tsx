import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckoutStepIndicator } from '../components/CheckoutStepIndicator';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCart } from '../hooks/useCart';
import * as ordersService from '../services/orders.service';
import type {
  CheckoutState,
  ShippingFormData,
  PaymentFormData,
  PaymentMethod,
} from '../types';
import type { AxiosError } from 'axios';

type ShippingErrors = Partial<Record<keyof ShippingFormData, string>>;
type PaymentErrors = { method?: string; last_four?: string };

const INITIAL_SHIPPING: ShippingFormData = {
  full_name: '',
  street: '',
  city: '',
  state: '',
  zip_code: '',
  country: '',
};

const INITIAL_PAYMENT: PaymentFormData = { method: 'credit_card' };

export const CheckoutPage = () => {
  const { items, total, loading: cartLoading, fetchCart } = useCart();

  const [state, setState] = useState<CheckoutState>({
    currentStep: 1,
    shippingData: null,
    paymentData: null,
    confirmedOrderId: null,
  });

  const [shippingForm, setShippingForm] = useState<ShippingFormData>(INITIAL_SHIPPING);
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>(INITIAL_PAYMENT);
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});

  const [submitting, setSubmitting] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);

  // ── Step 1 validation ──────────────────────────────────────────────────────
  const validateShipping = (): boolean => {
    const errors: ShippingErrors = {};
    if (!shippingForm.full_name.trim()) errors.full_name = 'Full name is required';
    if (!shippingForm.street.trim()) errors.street = 'Street is required';
    if (!shippingForm.city.trim()) errors.city = 'City is required';
    if (!shippingForm.state.trim()) errors.state = 'State is required';
    if (!shippingForm.zip_code.trim()) errors.zip_code = 'ZIP code is required';
    if (!shippingForm.country.trim()) errors.country = 'Country is required';
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Step 2 validation ──────────────────────────────────────────────────────
  const validatePayment = (): boolean => {
    const errors: PaymentErrors = {};
    if (!paymentForm.method) errors.method = 'Payment method is required';
    if (paymentForm.method === 'credit_card') {
      if (!paymentForm.last_four) errors.last_four = 'Last 4 digits are required';
      else if (!/^\d{4}$/.test(paymentForm.last_four)) errors.last_four = 'Must be exactly 4 digits';
    }
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateShipping()) return;
    setState((s) => ({ ...s, currentStep: 2, shippingData: { ...shippingForm } }));
  };

  const handleStep2Submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;
    setState((s) => ({ ...s, currentStep: 3, paymentData: { ...paymentForm } }));
  };

  const handlePlaceOrder = async () => {
    if (!state.shippingData || !state.paymentData) return;
    setSubmitting(true);
    setPlaceOrderError(null);
    try {
      const order = await ordersService.createOrder({
        shipping_full_name: state.shippingData.full_name,
        shipping_street: state.shippingData.street,
        shipping_city: state.shippingData.city,
        shipping_state: state.shippingData.state,
        shipping_zip_code: state.shippingData.zip_code,
        shipping_country: state.shippingData.country,
        payment_method: state.paymentData.method,
        payment_last_four: state.paymentData.last_four,
      });
      await fetchCart();
      setState((s) => ({ ...s, currentStep: 4, confirmedOrderId: order.id }));
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setPlaceOrderError(axiosErr.response?.data?.error ?? 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">Checkout</h1>
      <CheckoutStepIndicator currentStep={state.currentStep} />

      {/* ── Step 1: Shipping ─────────────────────────────────────────────── */}
      {state.currentStep === 1 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Shipping Address</h2>
          <form onSubmit={handleStep1Submit} noValidate className="space-y-4">
            {(
              [
                { key: 'full_name', label: 'Full Name', placeholder: 'Jane Doe' },
                { key: 'street', label: 'Street Address', placeholder: '123 Main St' },
                { key: 'city', label: 'City', placeholder: 'New York' },
                { key: 'state', label: 'State', placeholder: 'NY' },
                { key: 'zip_code', label: 'ZIP Code', placeholder: '10001' },
                { key: 'country', label: 'Country', placeholder: 'United States' },
              ] as { key: keyof ShippingFormData; label: string; placeholder: string }[]
            ).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={shippingForm[key]}
                  onChange={(e) => setShippingForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    shippingErrors[key] ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {shippingErrors[key] && (
                  <p className="text-red-500 text-xs mt-1">{shippingErrors[key]}</p>
                )}
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-2"
            >
              Continue to Payment →
            </button>
          </form>
        </div>
      )}

      {/* ── Step 2: Payment ──────────────────────────────────────────────── */}
      {state.currentStep === 2 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Payment Method</h2>
          <form onSubmit={handleStep2Submit} noValidate className="space-y-4">
            {(
              [
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
              ] as { value: PaymentMethod; label: string }[]
            ).map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment_method"
                  value={value}
                  checked={paymentForm.method === value}
                  onChange={() => setPaymentForm({ method: value })}
                  className="accent-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </label>
            ))}
            {paymentErrors.method && (
              <p className="text-red-500 text-xs">{paymentErrors.method}</p>
            )}

            {paymentForm.method === 'credit_card' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last 4 digits of card
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="1234"
                  value={paymentForm.last_four ?? ''}
                  onChange={(e) =>
                    setPaymentForm((f) => ({ ...f, last_four: e.target.value }))
                  }
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    paymentErrors.last_four ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {paymentErrors.last_four && (
                  <p className="text-red-500 text-xs mt-1">{paymentErrors.last_four}</p>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, currentStep: 1 }))}
                className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Review Order →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Step 3: Review ───────────────────────────────────────────────── */}
      {state.currentStep === 3 && state.shippingData && state.paymentData && (
        <div className="space-y-4">
          {/* Cart items */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h2>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
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
            <p className="text-sm text-slate-700">{state.shippingData.full_name}</p>
            <p className="text-sm text-slate-700">{state.shippingData.street}</p>
            <p className="text-sm text-slate-700">
              {state.shippingData.city}, {state.shippingData.state} {state.shippingData.zip_code}
            </p>
            <p className="text-sm text-slate-700">{state.shippingData.country}</p>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Payment</h3>
            <p className="text-sm text-slate-700 capitalize">
              {state.paymentData.method.replace('_', ' ')}
              {state.paymentData.last_four ? ` ending in ${state.paymentData.last_four}` : ''}
            </p>
          </div>

          {placeOrderError && <ErrorMessage message={placeOrderError} />}

          <div className="flex gap-3">
            <button
              onClick={() => setState((s) => ({ ...s, currentStep: 2 }))}
              className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => void handlePlaceOrder()}
              disabled={submitting}
              className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Confirmation ─────────────────────────────────────────── */}
      {state.currentStep === 4 && state.confirmedOrderId !== null && (
        <div className="bg-white rounded-2xl shadow-md p-10 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order placed successfully!</h2>
          <p className="text-slate-600 mb-2">
            Your order <span className="font-bold text-indigo-600">#{state.confirmedOrderId}</span> is confirmed.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            We&apos;ll start processing your order right away.
          </p>
          <Link
            to="/orders"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            View My Orders
          </Link>
        </div>
      )}
    </div>
  );
};
