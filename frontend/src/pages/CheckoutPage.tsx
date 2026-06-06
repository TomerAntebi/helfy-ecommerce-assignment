import { useState, type FormEvent } from 'react';
import { CheckoutStepIndicator } from '../components/CheckoutStepIndicator';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ShippingStep } from '../components/checkout/ShippingStep';
import { PaymentStep } from '../components/checkout/PaymentStep';
import { ReviewStep } from '../components/checkout/ReviewStep';
import { ConfirmationStep } from '../components/checkout/ConfirmationStep';
import { useCart } from '../hooks/useCart';
import * as ordersService from '../services/orders.service';
import * as checkoutService from '../services/checkout.service';
import {
  CHECKOUT_STEP,
  type CheckoutState,
  type ShippingFormData,
  type PaymentFormData,
  type PaymentMethod,
} from '../types';
import { extractApiError } from '../utils/apiError';

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
    currentStep: CHECKOUT_STEP.SHIPPING,
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
    setState((s) => ({ ...s, currentStep: CHECKOUT_STEP.PAYMENT, shippingData: { ...shippingForm } }));
  };

  const handleStep2Submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;
    setState((s) => ({ ...s, currentStep: CHECKOUT_STEP.REVIEW, paymentData: { ...paymentForm } }));
  };

  const handlePlaceOrder = async () => {
    if (!state.shippingData || !state.paymentData) return;
    setSubmitting(true);
    setPlaceOrderError(null);
    try {
      // Validate cart stock before creating the order
      const validation = await checkoutService.validateCart(items.map((item) => item.id));
      if (!validation.valid) {
        setPlaceOrderError(validation.errors.join(' '));
        return;
      }

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
      setState((s) => ({ ...s, currentStep: CHECKOUT_STEP.CONFIRMATION, confirmedOrderId: order.id }));
    } catch (err) {
      setPlaceOrderError(extractApiError(err, 'Failed to place order'));
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) return <LoadingSpinner />;

  // Guard: show empty state when cart has no items (unless we already confirmed the order)
  if (items.length === 0 && state.currentStep !== CHECKOUT_STEP.CONFIRMATION) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <EmptyState
          title="Your cart is empty"
          description="Add some items to your cart before checking out."
          actionLabel="Browse Products"
          actionTo="/products"
          icon="🛍️"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">Checkout</h1>
      <CheckoutStepIndicator currentStep={state.currentStep} />

      {state.currentStep === CHECKOUT_STEP.SHIPPING && (
        <ShippingStep
          form={shippingForm}
          errors={shippingErrors}
          onChange={(key, value) => setShippingForm((f) => ({ ...f, [key]: value }))}
          onSubmit={handleStep1Submit}
        />
      )}

      {state.currentStep === CHECKOUT_STEP.PAYMENT && (
        <PaymentStep
          form={paymentForm}
          errors={paymentErrors}
          onMethodChange={(method: PaymentMethod) => setPaymentForm({ method })}
          onLastFourChange={(value) => setPaymentForm((f) => ({ ...f, last_four: value }))}
          onSubmit={handleStep2Submit}
          onBack={() => setState((s) => ({ ...s, currentStep: CHECKOUT_STEP.SHIPPING }))}
        />
      )}

      {state.currentStep === CHECKOUT_STEP.REVIEW && state.shippingData && state.paymentData && (
        <ReviewStep
          items={items}
          total={total}
          shippingData={state.shippingData}
          paymentData={state.paymentData}
          onPlaceOrder={handlePlaceOrder}
          onBack={() => setState((s) => ({ ...s, currentStep: CHECKOUT_STEP.PAYMENT }))}
          submitting={submitting}
          error={placeOrderError}
        />
      )}

      {state.currentStep === CHECKOUT_STEP.CONFIRMATION && state.confirmedOrderId !== null && (
        <ConfirmationStep orderId={state.confirmedOrderId} />
      )}
    </div>
  );
};
