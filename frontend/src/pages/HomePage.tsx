import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import * as productsService from '../services/products.service';
import type { Product } from '../types';
import type { AxiosError } from 'axios';

export const HomePage = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const result = await productsService.getProducts({ limit: 8, page: 1 });
        setFeatured(result.products);
      } catch {
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };
    void fetchFeatured();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      navigate(`/login?redirect=/products/${product.id}`);
      return;
    }
    setAddingId(product.id);
    setAddError(null);
    try {
      await addItem(product.id, 1);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setAddError(axiosErr.response?.data?.error ?? 'Failed to add item');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-80 h-80 rounded-full bg-white" />
          <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
            Discover Premium Products
          </h1>
          <p className="text-indigo-100 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Shop the finest selection of curated goods — delivered to your door.
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg text-lg"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
          <Link
            to="/products"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View all →
          </Link>
        </div>

        {addError && (
          <div className="mb-4">
            <ErrorMessage message={addError} />
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <div key={product.id} className={addingId === product.id ? 'opacity-70' : ''}>
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
