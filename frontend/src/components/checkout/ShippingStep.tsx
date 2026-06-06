import type { FormEvent } from 'react';
import type { ShippingFormData } from '../../types';

type ShippingErrors = Partial<Record<keyof ShippingFormData, string>>;

interface ShippingStepProps {
  form: ShippingFormData;
  errors: ShippingErrors;
  onChange: (key: keyof ShippingFormData, value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

const FIELDS: { key: keyof ShippingFormData; label: string; placeholder: string }[] = [
  { key: 'full_name', label: 'Full Name', placeholder: 'Jane Doe' },
  { key: 'street', label: 'Street Address', placeholder: '123 Main St' },
  { key: 'city', label: 'City', placeholder: 'New York' },
  { key: 'state', label: 'State', placeholder: 'NY' },
  { key: 'zip_code', label: 'ZIP Code', placeholder: '10001' },
  { key: 'country', label: 'Country', placeholder: 'United States' },
];

export const ShippingStep = ({ form, errors, onChange, onSubmit }: ShippingStepProps) => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h2 className="text-lg font-bold text-slate-800 mb-5">Shipping Address</h2>
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {FIELDS.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
          <input
            type="text"
            value={form[key]}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={placeholder}
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors[key] ? 'border-red-400' : 'border-slate-300'
            }`}
          />
          {errors[key] && (
            <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
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
);
