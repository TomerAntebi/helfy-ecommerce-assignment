import type { CheckoutStep } from '../types';

interface CheckoutStepIndicatorProps {
  currentStep: CheckoutStep;
}

const STEPS = [
  { number: 1, label: 'Shipping' },
  { number: 2, label: 'Payment' },
  { number: 3, label: 'Review' },
  { number: 4, label: 'Confirmation' },
] as const;

export const CheckoutStepIndicator = ({ currentStep }: CheckoutStepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${
                  isCurrent ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 -mt-5 transition-colors duration-200 ${
                  currentStep > step.number ? 'bg-emerald-400' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
