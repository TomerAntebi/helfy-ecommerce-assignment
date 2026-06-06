import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import * as productsService from '../services/products.service';
import type { Product } from '../types';
import type { AxiosError } from 'axios';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const result = await productsService.getProductById(Number(id));
        setProduct(result);
      } catch {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    void fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      navigate(`/login?redirect=/products/${product.id}`);
      return;
    }
    setAdding(true);
    setAddError(null);
    setAddSuccess(false);
    try {
      await addItem(product.id, 1);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setAddError(axiosErr.response?.data?.error ?? 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorMessage message={error ?? 'Product not found'} />
        <div className="mt-4 text-center">
          <Link to="/products" className="text-indigo-600 hover:underline text-sm">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products" className="text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6 inline-block">
        ← Back to Products
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden shadow-md bg-slate-100 aspect-square">
          <img
            src={product.image_url ?? PLACEHOLDER_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full self-start mb-3">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{product.name}</h1>
          <p className="text-slate-600 text-base leading-relaxed mb-6">
            {product.description ?? 'No description available.'}
          </p>
          <div className="text-3xl font-extrabold text-slate-900 mb-4">
            ${Number(product.price).toFixed(2)}
          </div>
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-emerald-600 text-sm font-semibold">
                ✓ In stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-500 text-sm font-semibold">✗ Out of stock</span>
            )}
          </div>

          {addError && (
            <div className="mb-4">
              <ErrorMessage message={addError} />
            </div>
          )}
          {addSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
              ✓ Added to cart!
            </div>
          )}

          {product.stock > 0 && (
            <button
              onClick={() => void handleAddToCart()}
              disabled={adding}
              className="bg-indigo-600 text-white py-3 px-8 rounded-xl font-bold text-base hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
