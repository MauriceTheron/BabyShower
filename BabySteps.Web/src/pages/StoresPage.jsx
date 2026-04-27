import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../api/client';

const placeholder = 'https://placehold.co/80x80/dec3b3/ffffff?text=Store';

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/stores').then(r => setStores(r.data));
  }, []);

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Stores</h1>
        <div className="space-y-3">
          {stores.map(store => (
            <button
              key={store.id}
              onClick={() => navigate(`/stores/${store.id}`, { state: { name: store.name } })}
              className="w-full flex items-center gap-4 bg-white rounded-2xl p-3 shadow-sm active:bg-gray-50"
            >
              <img
                src={store.featureImageURL || placeholder}
                alt={store.name}
                className="w-16 h-16 rounded-xl object-cover"
                onError={e => { e.target.src = placeholder; }}
              />
              <span className="font-semibold text-gray-800 flex-1 text-left">{store.name}</span>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
        {stores.length === 0 && (
          <p className="text-center text-gray-400 mt-12">No stores yet.</p>
        )}
      </div>
    </div>
  );
}
