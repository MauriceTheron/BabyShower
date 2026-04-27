import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../api/client';
import ProductCard from '../../components/ProductCard';
import ProductModal from '../../components/ProductModal';

export default function EventStoreProductsPage() {
  const { slug, id } = useParams();
  const { state } = useLocation();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get(`/events/${slug}/products?storeId=${id}&isNappyList=false`).then(r => setProducts(r.data));
  }, [slug, id]);

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">{state?.name || 'Store'}</h1>
        <div className="grid grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="flex justify-center">
              <ProductCard product={p} onClick={setSelected} />
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-center text-gray-400 mt-12">No products at this store.</p>
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
