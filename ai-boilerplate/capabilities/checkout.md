# Checkout Capability

This document defines the checkout step definitions, state shape, progression rules, and field mapping for the frontend multi-step checkout form.

---

## 1. Checkout Step Definitions

The checkout page is a single-page multi-step form. Step state is managed with local React state (`currentStep`).

| Step | Name | Fields | Notes |
|------|------|--------|-------|
| 1 | Shipping Address | full_name, street, city, state, zip_code, country | All required. Show inline validation. |
| 2 | Payment Method | method (credit_card / paypal / bank_transfer), last_four (if credit_card) | Method required. |
| 3 | Review Order | Read-only: items, address, payment, total | "Place Order" calls POST /api/orders. |
| 4 | Confirmation | Order ID, success message, link to order history | Terminal state — no back navigation. |

Back navigation is allowed between Steps 1, 2, and 3. The cart is cleared by the backend after successful order creation. Step 4 is reached only after the API returns success.

---

## 2. State Shape

```typescript
interface CheckoutState {
  currentStep: 1 | 2 | 3 | 4;
  shippingData: ShippingFormData | null;
  paymentData: PaymentFormData | null;
  confirmedOrderId: number | null;
}

interface ShippingFormData {
  full_name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface PaymentFormData {
  method: 'credit_card' | 'paypal' | 'bank_transfer';
  last_four?: string;
}
```

---

## 3. Step Progression Rules

- Step 1 → Step 2: Only if all shipping fields pass validation
- Step 2 → Step 3: Only if a payment method is selected; `last_four` required if `method === 'credit_card'`
- Step 3 → Step 4: Only after `POST /api/orders` returns success
- Step 4: Terminal. No back navigation. `currentStep` cannot decrease from 4.

---

## 4. ShippingFormData to API Body Field Mapping

The checkout form uses short field names (`full_name`, `street`, etc.) for simplicity. The `POST /api/orders` API body requires the prefixed field names (`shipping_full_name`, `shipping_street`, etc.). The frontend service must perform this mapping explicitly when building the request payload. Do not pass the `ShippingFormData` object directly to the API.

```typescript
// orders.service.ts (frontend) — buildOrderPayload
const orderPayload = {
  shipping_full_name: shippingData.full_name,
  shipping_street:    shippingData.street,
  shipping_city:      shippingData.city,
  shipping_state:     shippingData.state,
  shipping_zip_code:  shippingData.zip_code,
  shipping_country:   shippingData.country,
  payment_method:     paymentData.method,
  payment_last_four:  paymentData.last_four ?? undefined,
};
await api.post('/api/orders', orderPayload);
```

---

## 5. Step Indicator Component

A visual step indicator at the top of the checkout page shows the four steps with the current step highlighted. Completed steps show a checkmark icon. Future steps are grayed out.

Component: `CheckoutStepIndicator` in `src/components/CheckoutStepIndicator.tsx`.
