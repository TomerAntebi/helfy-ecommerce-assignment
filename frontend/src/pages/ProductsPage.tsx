import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import * as productsService from '../services/products.service';
import type { Product, ProductFilters } from '../types';
import { extractApiError } from '../utils/apiError';

const LIMIT = 12;

export const ProductsPage = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Debounce min price
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [minPrice]);

  // Debounce max price
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMaxPrice(maxPrice);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [maxPrice]);

  const filters: ProductFilters = {
    search: debouncedSearch || undefined,
    category: category || undefined,
    min_price: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
    max_price: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
    page: currentPage,
    limit: LIMIT,
  };

  const { products, total, loading, error } = useProducts(filters);

  const totalPages = Math.ceil(total / LIMIT);

  // Load categories once
  useEffect(() => {
    productsService.getCategories().then(setCategories).catch(() => undefined);
  }, []);

  const handleAddToCart = useCallback(
    async (product: Product) => {
      if (!user) {
        navigate(`/login?redirect=/products/${product.id}`);
        return;
      }
      setAddingId(product.id);
      setAddError(null);
      try {
        await addItem(product.id, 1);
      } catch (err) {
        setAddError(extractApiError(err, 'Failed to add item'));
      } finally {
        setAddingId(null);
      }
    },
    [user, addItem, navigate]
  );

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">All Products</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-48">
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category */}
        <div className="min-w-36">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min $"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min={0}
            className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-slate-400 text-sm">–</span>
          <input
            type="number"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min={0}
            className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {addError && (
        <div className="mb-4">
          <ErrorMessage message={addError} />
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">No products found.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{total} product{total !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className={addingId === product.id ? 'opacity-70' : ''}>
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
