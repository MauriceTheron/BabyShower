import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';
import ProductCard from '../../components/ProductCard';
import ProductModal from '../../components/ProductModal';

export default function EventNappyListPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get(`/events/${slug}/products?isNappyList=true`).then(r => setProducts(r.data));
  }, [slug]);

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">🧷 Nappy List</h1>
        <div className="grid grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="flex justify-center">
              <ProductCard product={p} onClick={setSelected} />
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-center text-gray-400 mt-12">No nappy list items yet.</p>
        )}
      </div>
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
