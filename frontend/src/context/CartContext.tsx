import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  type ReactNode,
} from 'react';
import type { CartItemWithProduct } from '../types';
import * as cartService from '../services/cart.service';
import { AuthContext } from './AuthContext';

export interface CartContextValue {
  items: CartItemWithProduct[];
  total: number;
  itemCount: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
}

export const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const authCtx = useContext(AuthContext);
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!authCtx?.user) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const result = await cartService.getCart();
      setItems(result.items);
      setTotal(result.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [authCtx?.user]);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (productId: number, quantity: number) => {
      await cartService.addItem(productId, quantity);
      await fetchCart();
    },
    [fetchCart]
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => {
      await cartService.updateItem(itemId, quantity);
      await fetchCart();
    },
    [fetchCart]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      await cartService.removeItem(itemId);
      await fetchCart();
    },
    [fetchCart]
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, total, itemCount, loading, fetchCart, addItem, updateItem, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
};
