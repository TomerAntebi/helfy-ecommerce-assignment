import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
}

export const EmptyState = ({ title, description, actionLabel, actionTo }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500 mb-6 max-w-sm">{description}</p>
      <Link
        to={actionTo}
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        {actionLabel}
      </Link>
    </div>
  );
};
