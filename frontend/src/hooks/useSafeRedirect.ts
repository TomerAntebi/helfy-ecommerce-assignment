import { useSearchParams } from 'react-router-dom';

// Reads the `redirect` query param and validates it is a safe internal path.
// Only relative paths starting with a single / are allowed, preventing
// open-redirect to external origins (e.g. ?redirect=//evil.com).
export const useSafeRedirect = (): string => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect;
  }
  return '/';
};
