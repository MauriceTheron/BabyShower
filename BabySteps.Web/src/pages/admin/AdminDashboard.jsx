import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Store, Grid2x2, ClipboardList, Star, Utensils, ArrowLeft, CalendarDays, Pencil, Check, X } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import AdminProductForm from './AdminProductForm';
import ImagePicker from '../../components/ImagePicker';
import IconPicker from '../../components/IconPicker';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [storeForm, setStoreForm] = useState({ name: '', featureImageURL: '' });
  const [catForm, setCatForm] = useState({ name: '', icon: '' });
  const [editingStore, setEditingStore] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    api.get('/events').then(r => setEvents(r.data));
  }, [isAdmin]);

  const selectEvent = (event) => {
    setSelectedEvent(event);
    loadAll(event.slug);
  };

  const loadAll = (slug) => {
    api.get(`/events/${slug}/products`).then(r => setProducts(r.data));
    api.get(`/events/${slug}/stores`).then(r => setStores(r.data));
    api.get(`/events/${slug}/categories`).then(r => setCategories(r.data));
    api.get(`/events/${slug}/reservations`).then(r => setReservations(r.data));
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/events/${selectedEvent.slug}/products/${id}`);
    loadAll(selectedEvent.slug);
  };

  const togglePriority = async (id) => {
    await api.patch(`/events/${selectedEvent.slug}/products/${id}/priority`);
    loadAll(selectedEvent.slug);
  };

  const saveStore = async (e) => {
    e.preventDefault();
    await api.put(`/events/${selectedEvent.slug}/stores/${editingStore.id}`, {
      name: editingStore.name, featureImageURL: editingStore.featureImageURL || null,
    });
    setEditingStore(null);
    loadAll(selectedEvent.slug);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    await api.put(`/events/${selectedEvent.slug}/categories/${editingCategory.id}`, {
      name: editingCategory.name, icon: editingCategory.icon || null,
    });
    setEditingCategory(null);
    loadAll(selectedEvent.slug);
  };

  const deleteStore = async (id) => {
    if (!confirm('Delete this store?')) return;
    await api.delete(`/events/${selectedEvent.slug}/stores/${id}`);
    loadAll(selectedEvent.slug);
  };

  const addStore = async (e) => {
    e.preventDefault();
    await api.post(`/events/${selectedEvent.slug}/stores`, storeForm);
    setStoreForm({ name: '', featureImageURL: '' });
    loadAll(selectedEvent.slug);
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/events/${selectedEvent.slug}/categories/${id}`);
    loadAll(selectedEvent.slug);
  };

  const addCategory = async (e) => {
    e.preventDefault();
    await api.post(`/events/${selectedEvent.slug}/categories`, catForm);
    setCatForm({ name: '', icon: '' });
    loadAll(selectedEvent.slug);
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'categories', label: 'Categories', icon: Grid2x2 },
    { id: 'reservations', label: 'Reservations', icon: ClipboardList },
  ];

  // Event list view
  if (!selectedEvent) {
    return (
      <div className="bg-background min-h-screen pb-10">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-5">Admin Dashboard</h1>
          <h2 className="text-lg font-semibold text-gray-600 mb-3">All Events</h2>
          <div className="space-y-3">
            {events.map(e => (
              <button
                key={e.id}
                onClick={() => selectEvent(e)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between active:bg-gray-50"
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-800">{e.name}</p>
                  <p className="text-sm text-gray-400">Host: {e.hostFirstName} {e.hostLastName}</p>
                  <p className="text-xs text-gray-300 mt-0.5">/e/{e.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${e.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {e.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <CalendarDays size={18} className="text-gray-400" />
                </div>
              </button>
            ))}
            {events.length === 0 && (
              <p className="text-center text-gray-400 mt-12">No events yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Event management view
  return (
    <div className="bg-background min-h-screen pb-10">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button
          onClick={() => setSelectedEvent(null)}
          className="flex items-center gap-2 text-gray-500 mb-4 text-sm"
        >
          <ArrowLeft size={16} /> All Events
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">{selectedEvent.name}</h1>
        <p className="text-sm text-gray-400 mb-5">/e/{selectedEvent.slug}</p>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'bg-btn-category text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div>
            <button
              onClick={() => { setEditProduct(null); setShowForm(true); }}
              className="mb-4 bg-header text-white font-bold px-5 py-2.5 rounded-2xl"
            >
              + Add Product
            </button>

            {showForm && (
              <AdminProductForm
                product={editProduct}
                stores={stores}
                categories={categories}
                slug={selectedEvent.slug}
                onSaved={() => { setShowForm(false); loadAll(selectedEvent.slug); }}
                onCancel={() => setShowForm(false)}
              />
            )}

            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 items-start">
                  <img
                    src={p.imageURL || 'https://placehold.co/60x60/e59eaf/fff?text=P'}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.src = 'https://placehold.co/60x60/e59eaf/fff?text=P'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.brand} · R{p.price.toFixed(2)}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {p.isPriority && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Star size={10} />Priority</span>}
                      {p.isNappyList && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Utensils size={10} />Nappy</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.reservedQuantity >= p.stockQuantity ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'
                      }`}>
                        {p.reservedQuantity}/{p.stockQuantity} reserved
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => togglePriority(p.id)}
                      className="text-xs px-2 py-1 rounded-lg bg-yellow-50 text-yellow-600 font-medium">
                      {p.isPriority ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => { setEditProduct(p); setShowForm(true); }}
                      className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">
                      Edit
                    </button>
                    <button onClick={() => deleteProduct(p.id)}
                      className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {tab === 'stores' && (
          <div>
            <form onSubmit={addStore} className="bg-white rounded-2xl p-4 shadow-sm mb-4 space-y-3">
              <h3 className="font-semibold text-gray-700">Add Store</h3>
              <input value={storeForm.name} onChange={e => setStoreForm(s => ({ ...s, name: e.target.value }))}
                placeholder="Store name" required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
              <ImagePicker
                label="Feature Image"
                value={storeForm.featureImageURL}
                onChange={(url) => setStoreForm(s => ({ ...s, featureImageURL: url }))}
              />
              <button type="submit" className="bg-btn-category text-white font-bold px-4 py-2 rounded-xl text-sm">Add</button>
            </form>
            <div className="space-y-2">
              {stores.map(s => (
                <div key={s.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {editingStore?.id === s.id ? (
                    <form onSubmit={saveStore} className="p-4 space-y-3">
                      <input value={editingStore.name} onChange={e => setEditingStore(v => ({ ...v, name: e.target.value }))}
                        placeholder="Store name" required
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
                      <ImagePicker
                        label="Feature Image"
                        value={editingStore.featureImageURL || ''}
                        onChange={url => setEditingStore(v => ({ ...v, featureImageURL: url }))}
                        aspect={16 / 5}
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="flex items-center gap-1 bg-btn-category text-white font-bold px-3 py-1.5 rounded-xl text-xs"><Check size={13} />Save</button>
                        <button type="button" onClick={() => setEditingStore(null)}
                          className="flex items-center gap-1 bg-gray-100 text-gray-600 font-medium px-3 py-1.5 rounded-xl text-xs"><X size={13} />Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 flex justify-between items-center">
                      <span className="font-medium text-gray-800">{s.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingStore({ ...s })}
                          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium flex items-center gap-1"><Pencil size={11} />Edit</button>
                        <button onClick={() => deleteStore(s.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {tab === 'categories' && (
          <div>
            <form onSubmit={addCategory} className="bg-white rounded-2xl p-4 shadow-sm mb-4 space-y-3">
              <h3 className="font-semibold text-gray-700">Add Category</h3>
              <input value={catForm.name} onChange={e => setCatForm(c => ({ ...c, name: e.target.value }))}
                placeholder="Category name" required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
              <IconPicker
                value={catForm.icon}
                onChange={(icon) => setCatForm(c => ({ ...c, icon }))}
              />
              <button type="submit" className="bg-btn-category text-white font-bold px-4 py-2 rounded-xl text-sm">Add</button>
            </form>
            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {editingCategory?.id === c.id ? (
                    <form onSubmit={saveCategory} className="p-4 space-y-3">
                      <input value={editingCategory.name} onChange={e => setEditingCategory(v => ({ ...v, name: e.target.value }))}
                        placeholder="Category name" required
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
                      <IconPicker
                        value={editingCategory.icon || ''}
                        onChange={icon => setEditingCategory(v => ({ ...v, icon }))}
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="flex items-center gap-1 bg-btn-category text-white font-bold px-3 py-1.5 rounded-xl text-xs"><Check size={13} />Save</button>
                        <button type="button" onClick={() => setEditingCategory(null)}
                          className="flex items-center gap-1 bg-gray-100 text-gray-600 font-medium px-3 py-1.5 rounded-xl text-xs"><X size={13} />Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 flex justify-between items-center">
                      <span className="font-medium text-gray-800">{c.icon} {c.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingCategory({ ...c })}
                          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium flex items-center gap-1"><Pencil size={11} />Edit</button>
                        <button onClick={() => deleteCategory(c.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reservations Tab */}
        {tab === 'reservations' && (
          <div className="space-y-3">
            {reservations.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{r.productName}</p>
                    <p className="text-xs text-gray-400">{r.productBrand}</p>
                    <p className="text-sm text-gray-600 mt-1">By: {r.userFirstName} {r.userLastName}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-header/10 text-header font-bold px-3 py-1 rounded-full text-sm">x{r.quantity}</span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {reservations.length === 0 && <p className="text-center text-gray-400 mt-8">No reservations yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
