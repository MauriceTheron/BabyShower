import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const placeholder = 'https://placehold.co/80x80/e59eaf/ffffff?text=Baby';

export default function ReservedPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, guestToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !guestToken) { setLoading(false); return; }
    const params = guestToken && !user ? `?guestToken=${guestToken}` : '';
    api.get(`/reservations/my${params}`)
      .then(r => setReservations(r.data))
      .finally(() => setLoading(false));
  }, [user, guestToken]);

  if (!user && !guestToken) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag size={48} className="text-header" />
        <p className="text-gray-600 text-center">Register as a guest to see your reserved items.</p>
        <button onClick={() => navigate('/register')}
          className="bg-header text-white font-bold px-6 py-3 rounded-2xl">
          Register
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Reserved Items</h1>

        {loading && <p className="text-center text-gray-400 mt-12">Loading…</p>}

        {!loading && reservations.length === 0 && (
          <div className="text-center mt-12">
            <ShoppingBag size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No items reserved yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-center">
              <img
                src={r.productImageURL || placeholder}
                alt={r.productName}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                onError={e => { e.target.src = placeholder; }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 truncate">{r.productBrand}</p>
                <p className="font-semibold text-gray-800 truncate">{r.productName}</p>
                <p className="text-header font-bold">R{r.productPrice.toFixed(2)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="bg-header/10 text-header font-bold px-3 py-1 rounded-full text-sm">
                  x{r.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
