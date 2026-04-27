import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../api/client';
import ProductCard from '../../components/ProductCard';
import ProductModal from '../../components/ProductModal';

export default function EventSearchPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const [input, setInput] = useState(q);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setInput(q);
    if (!q) { setProducts([]); return; }
    setLoading(true);
    api.get(`/events/${slug}/products?search=${encodeURIComponent(q)}&isNappyList=false`)
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [slug, q]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) navigate(`/e/${slug}/search?q=${encodeURIComponent(input.trim())}`);
  };

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <form onSubmit={handleSearch} className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search for a product..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm outline-none focus:ring-2 focus:ring-header/30"
            />
          </div>
        </form>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Search results</h1>
        {q && !loading && (
          <p className="text-sm text-gray-400 mb-5">
            {products.length} {products.length === 1 ? 'result' : 'results'} for "{q}"
          </p>
        )}

        {loading && (
          <div className="flex justify-center mt-12">
            <div className="w-8 h-8 border-4 border-header border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="flex justify-center">
                <ProductCard product={p} onClick={setSelected} />
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && q && (
          <p className="text-center text-gray-400 mt-12">No results found for "{q}".</p>
        )}
      </div>
      <ProductModal
        product={selected}
        onClose={() => setSelected(null)}
        onReserved={(productId, qty) =>
          setProducts(ps => ps.map(p => p.id === productId ? { ...p, reservedQuantity: p.reservedQuantity + qty } : p))
        }
      />
    </div>
  );
}
