import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/auth.service';
import type { AxiosError } from 'axios';

interface SignupForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

type SignupFormErrors = Partial<Record<keyof SignupForm, string>>;

export const SignupPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const [form, setForm] = useState<SignupForm>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const validate = (data: SignupForm): boolean => {
    const newErrors: SignupFormErrors = {};
    if (!data.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!data.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!data.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Invalid email format';
    if (!data.password) newErrors.password = 'Password is required';
    else if (data.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate(form)) return;
    setSubmitting(true);
    try {
      const result = await authService.signup(form);
      login(result.token, result.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setApiError(axiosErr.response?.data?.error ?? 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof SignupForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
    className: `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
      errors[key] ? 'border-red-400' : 'border-slate-300'
    }`,
  });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
          <p className="text-slate-500 mt-1 text-sm">Join Helfy Store today</p>
        </div>

        {apiError && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-1">
                First name
              </label>
              <input id="first_name" type="text" autoComplete="given-name" {...field('first_name')} />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-1">
                Last name
              </label>
              <input id="last_name" type="text" autoComplete="family-name" {...field('last_name')} />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input id="email" type="email" autoComplete="email" {...field('email')} placeholder="you@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input id="password" type="password" autoComplete="new-password" {...field('password')} placeholder="Min. 8 characters" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
