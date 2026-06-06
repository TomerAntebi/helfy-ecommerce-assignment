import api from './api';

export interface ValidateCartResponse {
  valid: boolean;
  errors: string[];
}

export const validateCart = async (
  cartItemIds: number[]
): Promise<ValidateCartResponse> => {
  const res = await api.post<{ success: true; data: ValidateCartResponse }>(
    '/api/checkout/validate',
    { cart_item_ids: cartItemIds }
  );
  return res.data.data;
};
