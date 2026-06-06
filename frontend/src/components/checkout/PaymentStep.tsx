import type { FormEvent } from 'react';
import type { PaymentFormData, PaymentMethod } from '../../types';

type PaymentErrors = { method?: string; last_four?: string };

interface PaymentStepProps {
  form: PaymentFormData;
  errors: PaymentErrors;
  onMethodChange: (method: PaymentMethod) => void;
  onLastFourChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

export const PaymentStep = ({
  form,
  errors,
  onMethodChange,
  onLastFourChange,
  onSubmit,
  onBack,
}: PaymentStepProps) => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h2 className="text-lg font-bold text-slate-800 mb-5">Payment Method</h2>
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {PAYMENT_OPTIONS.map(({ value, label }) => (
        <label key={value} className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="payment_method"
            value={value}
            checked={form.method === value}
            onChange={() => onMethodChange(value)}
            className="accent-indigo-600"
          />
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </label>
      ))}
      {errors.method && (
        <p className="text-red-500 text-xs">{errors.method}</p>
      )}

      {form.method === 'credit_card' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Last 4 digits of card
          </label>
          <input
            type="text"
            maxLength={4}
            placeholder="1234"
            value={form.last_four ?? ''}
            onChange={(e) => onLastFourChange(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.last_four ? 'border-red-400' : 'border-slate-300'
            }`}
          />
          {errors.last_four && (
            <p className="text-red-500 text-xs mt-1">{errors.last_four}</p>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onBack}
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
);
