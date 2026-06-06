import { describe, it, expect } from 'vitest';
import { isValidEmail } from '../../utils/validators';

describe('isValidEmail', () => {
  it('returns true for a well-formed email address', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('returns false when the @ symbol is missing', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('returns false when the domain part is missing', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('returns false for multiple @ symbols', () => {
    expect(isValidEmail('user@@example.com')).toBe(false);
  });
});
