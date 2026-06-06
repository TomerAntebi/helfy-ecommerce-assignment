import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/auth.service';
import { extractApiError } from '../utils/apiError';

interface LoginForm {
  email: string;
  password: string;
}

type LoginFormErrors = Partial<Record<keyof LoginForm, string>>;

export const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const validate = (data: LoginForm): boolean => {
    const newErrors: LoginFormErrors = {};
    if (!data.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Invalid email format';
    if (!data.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate(form)) return;
    setSubmitting(true);
    try {
      const result = await authService.login(form);
      login(result.token, result.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setApiError(extractApiError(err, 'Login failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        {apiError && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.email ? 'border-red-400' : 'border-slate-300'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.password ? 'border-red-400' : 'border-slate-300'
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
