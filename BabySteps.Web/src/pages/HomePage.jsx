import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid2x2, Store, Utensils } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [priorityProducts, setPriorityProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeProducts, setStoreProducts] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products?isPriority=true').then(r => setPriorityProducts(r.data));
    api.get('/stores').then(async (r) => {
      setStores(r.data);
      const byStore = {};
      await Promise.all(r.data.map(async (store) => {
        const res = await api.get(`/products?storeId=${store.id}`);
        byStore[store.id] = res.data;
      }));
      setStoreProducts(byStore);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="max-w-lg mx-auto px-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for product here"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm outline-none focus:ring-2 focus:ring-header/30"
            />
          </div>
        </form>

        {/* Hero */}
        <div className="mt-4 rounded-3xl overflow-hidden bg-gradient-to-br from-header to-btn-store h-44 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-3xl font-bold">Welcome!</p>
            <p className="text-sm mt-1 opacity-80">Your perfect baby shower registry</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate('/categories')}
            className="flex-1 flex items-center justify-center gap-2 bg-btn-category text-white font-semibold py-3.5 rounded-2xl active:opacity-90"
          >
            <Grid2x2 size={20} />
            Category
          </button>
          <button
            onClick={() => navigate('/stores')}
            className="flex-1 flex items-center justify-center gap-2 bg-btn-store text-white font-semibold py-3.5 rounded-2xl active:opacity-90"
          >
            <Store size={20} />
            Stores
          </button>
        </div>

        <button
          onClick={() => navigate('/nappy-list')}
          className="mt-3 w-full flex items-center justify-center gap-3 bg-btn-nappy text-white font-bold py-4 rounded-2xl text-lg active:opacity-90"
        >
          <Utensils size={22} />
          Nappy List
        </button>

        {/* Priority Items */}
        {priorityProducts.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Priority Items</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {priorityProducts.map(p => (
                <ProductCard key={p.id} product={p} onClick={setSelectedProduct} />
              ))}
            </div>
          </section>
        )}

        {/* Brand Sections */}
        {stores.map(store => {
          const products = storeProducts[store.id] || [];
          if (products.length === 0) return null;
          return (
            <section key={store.id} className="mt-6">
              {store.featureImageURL ? (
                <img
                  src={store.featureImageURL}
                  alt={store.name}
                  className="w-full h-32 object-cover rounded-2xl mb-3"
                />
              ) : (
                <div
                  className="w-full h-20 rounded-2xl mb-3 flex items-center justify-center bg-btn-store"
                  onClick={() => navigate(`/stores/${store.id}`)}
                >
                  <span className="text-white text-xl font-bold">{store.name}</span>
                </div>
              )}
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onClick={setSelectedProduct} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
