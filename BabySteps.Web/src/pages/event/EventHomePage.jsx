import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Grid2x2, Store, Utensils, CalendarCheck } from 'lucide-react';
import api from '../../api/client';
import ProductCard from '../../components/ProductCard';
import ProductModal from '../../components/ProductModal';
import { useEvent } from '../../context/EventContext';

function isRsvpClosed(event) {
  if (!event?.eventDate) return false;
  const cutoff = new Date(event.eventDate);
  cutoff.setDate(cutoff.getDate() - (event.rsvpDeadlineDays ?? 5));
  return new Date() >= cutoff;
}

export default function EventHomePage() {
  const { slug } = useParams();
  const { event, setRsvpOpen, myRsvps } = useEvent();
  const closed = isRsvpClosed(event);
  const hasRsvp = myRsvps?.length > 0;
  const [search, setSearch] = useState('');
  const [priorityProducts, setPriorityProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeProducts, setStoreProducts] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    api.get(`/events/${slug}/products?isPriority=true&isNappyList=false`).then(r => setPriorityProducts(r.data));
    api.get(`/events/${slug}/stores`).then(async (r) => {
      setStores(r.data);
      const byStore = {};
      await Promise.all(r.data.map(async (store) => {
        const res = await api.get(`/events/${slug}/products?storeId=${store.id}&isNappyList=false`);
        byStore[store.id] = res.data;
      }));
      setStoreProducts(byStore);
    });
  }, [slug]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/e/${slug}/search?q=${encodeURIComponent(search.trim())}`);
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
        <div className="mt-4 rounded-3xl overflow-hidden h-44 flex items-center justify-center relative bg-gradient-to-br from-header to-btn-store">
          {event?.heroImageUrl && (
            <>
              <img
                src={event.heroImageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </>
          )}
          <div className="relative text-center text-white px-4 drop-shadow">
            <p className="text-3xl font-bold">{event?.name || 'Welcome!'}</p>
            <p className="text-sm mt-1 opacity-80">Browse and reserve your gift</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate(`/e/${slug}/categories`)}
            className="flex-1 flex items-center justify-center gap-2 bg-btn-category text-white font-semibold py-3.5 rounded-2xl active:opacity-90"
          >
            <Grid2x2 size={20} />
            Category
          </button>
          <button
            onClick={() => navigate(`/e/${slug}/stores`)}
            className="flex-1 flex items-center justify-center gap-2 bg-btn-store text-white font-semibold py-3.5 rounded-2xl active:opacity-90"
          >
            <Store size={20} />
            Stores
          </button>
        </div>

        <div className="flex gap-3 mt-3">
          <button
            onClick={() => navigate(`/e/${slug}/nappy-list`)}
            className="flex-1 flex items-center justify-center gap-2 bg-btn-nappy text-white font-bold py-4 rounded-2xl text-base active:opacity-90"
          >
            <Utensils size={20} />
            Nappy List
          </button>
          <button
            onClick={() => setRsvpOpen(true)}
            disabled={closed}
            className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-base transition-colors
              ${closed
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : hasRsvp
                  ? 'bg-header/20 text-header active:opacity-90'
                  : 'bg-header text-white active:opacity-90'
              }`}
          >
            <CalendarCheck size={20} />
            {closed ? 'RSVPs Closed' : hasRsvp ? 'Edit RSVP' : 'RSVP'}
          </button>
        </div>

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

        {/* Store Sections */}
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
                  className="w-full h-20 rounded-2xl mb-3 flex items-center justify-center bg-btn-store cursor-pointer"
                  onClick={() => navigate(`/e/${slug}/stores/${store.id}`)}
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
        onReserved={(productId, qty) => {
          const update = ps => ps.map(p => p.id === productId ? { ...p, reservedQuantity: p.reservedQuantity + qty } : p);
          setPriorityProducts(update);
          setStoreProducts(prev => {
            const next = { ...prev };
            for (const storeId in next) next[storeId] = next[storeId].map(p => p.id === productId ? { ...p, reservedQuantity: p.reservedQuantity + qty } : p);
            return next;
          });
        }}
      />
    </div>
  );
}
