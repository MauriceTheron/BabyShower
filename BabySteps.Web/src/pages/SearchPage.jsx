import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (q) api.get(`/products?search=${encodeURIComponent(q)}`).then(r => setProducts(r.data));
  }, [q]);

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Search results</h1>
        <p className="text-sm text-gray-400 mb-5">"{q}"</p>
        <div className="grid grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="flex justify-center">
              <ProductCard product={p} onClick={setSelected} />
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-center text-gray-400 mt-12">No results found.</p>
        )}
      </div>
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
