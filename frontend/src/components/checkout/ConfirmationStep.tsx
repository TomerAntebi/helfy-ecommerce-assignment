import { Link } from 'react-router-dom';

interface ConfirmationStepProps {
  orderId: number;
}

export const ConfirmationStep = ({ orderId }: ConfirmationStepProps) => (
  <div className="bg-white rounded-2xl shadow-md p-10 text-center">
    <div className="text-6xl mb-4">🎉</div>
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Order placed successfully!</h2>
    <p className="text-slate-600 mb-2">
      Your order <span className="font-bold text-indigo-600">#{orderId}</span> is confirmed.
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
);
