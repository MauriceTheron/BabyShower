import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Store, Grid2x2, ClipboardList, Star, Utensils, Link, Copy, Check, Settings, CalendarCheck, Wand2, X, Pencil, BookmarkPlus, Sparkles, Users, Trash2, Globe } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ImagePicker from '../../components/ImagePicker';
import IconPicker from '../../components/IconPicker';
import HostProductForm from './HostProductForm';
import ImportFromWebsiteModal from '../../components/ImportFromWebsiteModal';

export default function HostDashboard() {
  const { isHost, user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
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
  const [copied, setCopied] = useState(false);

  // Template modal state
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [templateLists, setTemplateLists] = useState([]);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  // Import from website state
  const [showImportModal, setShowImportModal] = useState(false);

  // Save as template state
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [saveTemplateForm, setSaveTemplateForm] = useState({ name: '', description: '' });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [savedTemplateDone, setSavedTemplateDone] = useState(false);

  // Edit my template state
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editTemplateForm, setEditTemplateForm] = useState({ name: '', description: '' });
  const [savingEditTemplate, setSavingEditTemplate] = useState(false);

  const [settingsForm, setSettingsForm] = useState({ name: '', eventDate: '', location: '', locationUrl: '', thankYouNote: '', heroImageUrl: '', primaryColor: '#e59eaf', secondaryColor: '#414f6f', accentColor: '#dec3b3', rsvpDeadlineDays: 5 });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [rsvps, setRsvps] = useState([]);

  useEffect(() => {
    if (!isHost) { navigate('/host/login'); return; }
    loadEvent();
  }, [isHost]);

  const loadEvent = async () => {
    try {
      const { data } = await api.get('/events/my');
      setEvent(data);
      setSettingsForm({
        name: data.name,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 16) : '',
        location: data.location || '',
        locationUrl: data.locationUrl || '',
        thankYouNote: data.thankYouNote || '',
        heroImageUrl: data.heroImageUrl || '',
        primaryColor: data.primaryColor || '#e59eaf',
        secondaryColor: data.secondaryColor || '#414f6f',
        accentColor: data.accentColor || '#dec3b3',
      });
      loadAll(data.slug);
    } catch (err) {
      if (err.response?.status === 404) navigate('/host/create-event');
    }
  };

  const loadAll = (slug) => {
    api.get(`/events/${slug}/products`).then(r => setProducts(r.data));
    api.get(`/events/${slug}/stores`).then(r => setStores(r.data));
    api.get(`/events/${slug}/categories`).then(r => setCategories(r.data));
    api.get(`/events/${slug}/reservations`).then(r => setReservations(r.data));
    api.get(`/events/${slug}/rsvp`).then(r => setRsvps(r.data));
  };

  const eventUrl = event ? `${window.location.origin}/e/${event.slug}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    await api.put(`/events/${event.id}`, {
      name: settingsForm.name,
      isActive: event.isActive,
      eventDate: settingsForm.eventDate || null,
      location: settingsForm.location || null,
      locationUrl: settingsForm.locationUrl || null,
      thankYouNote: settingsForm.thankYouNote || null,
      heroImageUrl: settingsForm.heroImageUrl || null,
      primaryColor: settingsForm.primaryColor || null,
      secondaryColor: settingsForm.secondaryColor || null,
      accentColor: settingsForm.accentColor || null,
    });
    await loadEvent();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/events/${event.slug}/products/${id}`);
    loadAll(event.slug);
  };

  const openSeedModal = async () => {
    const { data } = await api.get('/product-lists');
    setTemplateLists(data);
    setShowSeedModal(true);
    setSeedDone(false);
    setEditingTemplate(null);
  };

  const seedFromList = async (listId) => {
    if (!confirm('This will add all items from the template to your event. Continue?')) return;
    setSeeding(true);
    try {
      await api.post(`/events/${event.slug}/seed`, { productListId: listId });
      setSeedDone(true);
      loadAll(event.slug);
    } finally {
      setSeeding(false);
    }
  };

  const togglePriority = async (id) => {
    await api.patch(`/events/${event.slug}/products/${id}/priority`);
    loadAll(event.slug);
  };

  const saveStore = async (e) => {
    e.preventDefault();
    await api.put(`/events/${event.slug}/stores/${editingStore.id}`, {
      name: editingStore.name, featureImageURL: editingStore.featureImageURL || null,
    });
    setEditingStore(null);
    loadAll(event.slug);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    await api.put(`/events/${event.slug}/categories/${editingCategory.id}`, {
      name: editingCategory.name, icon: editingCategory.icon || null,
    });
    setEditingCategory(null);
    loadAll(event.slug);
  };

  const deleteStore = async (id) => {
    if (!confirm('Delete this store?')) return;
    await api.delete(`/events/${event.slug}/stores/${id}`);
    loadAll(event.slug);
  };

  const addStore = async (e) => {
    e.preventDefault();
    await api.post(`/events/${event.slug}/stores`, storeForm);
    setStoreForm({ name: '', featureImageURL: '' });
    loadAll(event.slug);
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/events/${event.slug}/categories/${id}`);
    loadAll(event.slug);
  };

  const addCategory = async (e) => {
    e.preventDefault();
    await api.post(`/events/${event.slug}/categories`, catForm);
    setCatForm({ name: '', icon: '' });
    loadAll(event.slug);
  };

  const openSaveTemplateModal = () => {
    setSaveTemplateForm({ name: event.name + ' List', description: '' });
    setSavedTemplateDone(false);
    setShowSaveTemplateModal(true);
  };

  const saveAsTemplate = async (e) => {
    e.preventDefault();
    if (products.length === 0) return;
    setSavingTemplate(true);
    try {
      await api.post(`/product-lists/from-event/${event.slug}`, saveTemplateForm);
      setSavedTemplateDone(true);
      setTimeout(() => setShowSaveTemplateModal(false), 1500);
    } finally {
      setSavingTemplate(false);
    }
  };

  const startEditTemplate = (list) => {
    setEditingTemplate(list.id);
    setEditTemplateForm({ name: list.name, description: list.description || '' });
  };

  const saveEditTemplate = async (e) => {
    e.preventDefault();
    setSavingEditTemplate(true);
    try {
      await api.put(`/product-lists/mine/${editingTemplate}`, editTemplateForm);
      setEditingTemplate(null);
      const { data } = await api.get('/product-lists');
      setTemplateLists(data);
    } finally {
      setSavingEditTemplate(false);
    }
  };

  const deleteMyTemplate = async (id) => {
    if (!confirm('Delete this template? This cannot be undone.')) return;
    await api.delete(`/product-lists/mine/${id}`);
    const { data } = await api.get('/product-lists');
    setTemplateLists(data);
  };

  const autoLists = templateLists.filter(l => l.isAuto);
  const myLists = templateLists.filter(l => !l.isAuto && l.hostId === user?.userId);
  const communityLists = templateLists.filter(l => !l.isAuto && l.hostId !== user?.userId);

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'categories', label: 'Categories', icon: Grid2x2 },
    { id: 'reservations', label: 'Reservations', icon: ClipboardList },
    { id: 'rsvp', label: 'RSVPs', icon: CalendarCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!event) return <div className="flex justify-center items-center min-h-screen"><p className="text-gray-400">Loading…</p></div>;

  return (
    <>
    <div className="bg-background min-h-screen pb-10">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{event.name}</h1>

        {/* Event link */}
        <div className="flex items-center gap-2 mb-5 bg-white rounded-2xl px-4 py-3 shadow-sm">
          <Link size={16} className="text-header flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate flex-1">{eventUrl}</span>
          <button
            onClick={copyLink}
            className="flex items-center gap-1 text-xs font-semibold text-header px-3 py-1.5 rounded-xl bg-header/10 flex-shrink-0"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

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
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => { setEditProduct(null); setShowForm(true); }}
                className="bg-header text-white font-bold px-5 py-2.5 rounded-2xl text-sm"
              >
                + Add Product
              </button>
              <button
                onClick={openSeedModal}
                className="flex items-center gap-1.5 bg-btn-category text-white font-bold px-4 py-2.5 rounded-2xl text-sm"
              >
                <Wand2 size={15} /> Use Template
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-2xl text-sm"
              >
                <Globe size={15} /> Import
              </button>
              {products.length > 0 && (
                <button
                  onClick={openSaveTemplateModal}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-2xl text-sm"
                >
                  <BookmarkPlus size={15} /> Save as Template
                </button>
              )}
            </div>

            {showForm && (
              <HostProductForm
                product={editProduct}
                stores={stores}
                categories={categories}
                slug={event.slug}
                onSaved={() => { setShowForm(false); loadAll(event.slug); }}
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
                        p.reservedQuantity >= p.stockQuantity
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-green-50 text-green-700'
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
              {products.length === 0 && <p className="text-center text-gray-400 mt-8">No products yet. Add your first product!</p>}
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
                aspect={16 / 5}
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
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="bg-header/10 text-header font-bold px-3 py-1 rounded-full text-sm">x{r.quantity}</span>
                    <p className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleDateString()}</p>
                    <button
                      onClick={async () => {
                        await api.delete(`/events/${event.slug}/reservations/${r.id}`);
                        setReservations(prev => prev.filter(x => x.id !== r.id));
                      }}
                      className="text-xs text-red-400 font-medium hover:text-red-600"
                    >
                      Unreserve
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {reservations.length === 0 && <p className="text-center text-gray-400 mt-8">No reservations yet.</p>}
          </div>
        )}

        {/* RSVPs Tab */}
        {tab === 'rsvp' && (
          <div className="space-y-6">
            {rsvps.length === 0 && <p className="text-center text-gray-400 mt-8">No RSVPs yet.</p>}
            {[
              { type: 'NappyBraai', label: 'Nappy Braai' },
              { type: 'BabyShower', label: 'Baby Shower' },
            ].map(({ type, label }) => {
              const group = rsvps.filter(r => r.eventType === type);
              if (group.length === 0) return null;
              return (
                <div key={type}>
                  <h3 className="font-bold text-gray-700 mb-3">{label}</h3>
                  <div className="flex gap-3 mb-3">
                    {[
                      { status: 'Going', label: 'Going', color: 'bg-green-50 text-green-700 border-green-100' },
                      { status: 'Maybe', label: 'Maybe', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
                      { status: 'NotGoing', label: 'Not Going', color: 'bg-gray-50 text-gray-500 border-gray-100' },
                    ].map(({ status, label: sLabel, color }) => (
                      <div key={status} className={`flex-1 rounded-2xl border p-3 text-center ${color}`}>
                        <p className="text-2xl font-bold">{group.filter(r => r.status === status).length}</p>
                        <p className="text-xs font-medium mt-0.5">{sLabel}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {group.map(r => (
                      <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800">{r.userFirstName} {r.userLastName}</p>
                          {r.message && <p className="text-xs text-gray-400 mt-0.5 truncate">"{r.message}"</p>}
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${
                          r.status === 'Going' ? 'bg-green-100 text-green-700'
                          : r.status === 'Maybe' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500'
                        }`}>
                          {r.status === 'NotGoing' ? 'Not Going' : r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <form onSubmit={saveSettings} className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="font-semibold text-gray-700">Event Details</h3>
              <div>
                <label className="text-xs text-gray-500 font-medium">Event Name</label>
                <input
                  value={settingsForm.name}
                  onChange={e => setSettingsForm(s => ({ ...s, name: e.target.value }))}
                  required
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Date & Time</label>
                <input
                  type="datetime-local"
                  value={settingsForm.eventDate}
                  onChange={e => setSettingsForm(s => ({ ...s, eventDate: e.target.value }))}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Location Name</label>
                <input
                  value={settingsForm.location}
                  onChange={e => setSettingsForm(s => ({ ...s, location: e.target.value }))}
                  placeholder="e.g. The Grand Venue, Johannesburg"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Google Maps Link (optional)</label>
                <input
                  value={settingsForm.locationUrl}
                  onChange={e => setSettingsForm(s => ({ ...s, locationUrl: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Thank You Note</label>
                <p className="text-xs text-gray-400 mb-1">Shown on guests' reserved items page after they reserve something.</p>
                <textarea
                  value={settingsForm.thankYouNote}
                  onChange={e => setSettingsForm(s => ({ ...s, thankYouNote: e.target.value }))}
                  placeholder="e.g. Thank you so much for your generous gift! We're so grateful to have you celebrating with us. 💕"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none resize-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
              <h3 className="font-semibold text-gray-700">Hero Image</h3>
              <p className="text-xs text-gray-400">Background of the banner on your event home page.</p>
              <ImagePicker
                label=""
                value={settingsForm.heroImageUrl}
                onChange={url => setSettingsForm(s => ({ ...s, heroImageUrl: url }))}
                aspect={16 / 7}
              />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-700">Color Scheme</h3>
              {[
                { key: 'primaryColor', label: 'Primary', hint: 'Header, icons & main buttons' },
                { key: 'secondaryColor', label: 'Secondary', hint: 'Category & nav buttons' },
                { key: 'accentColor', label: 'Accent', hint: 'Store buttons & highlights' },
              ].map(({ key, label, hint }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{hint}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400 font-mono">{settingsForm[key]}</span>
                    <input
                      type="color"
                      value={settingsForm[key]}
                      onChange={e => setSettingsForm(s => ({ ...s, [key]: e.target.value }))}
                      className="w-9 h-9 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-header text-white font-bold py-3 rounded-2xl"
            >
              {settingsSaved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>

    {/* Use Template Modal */}
    {showSeedModal && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSeedModal(false)} />
        <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slide-up flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Choose a Template</h2>
              <p className="text-xs text-gray-400 mt-0.5">Products will be added to your event.</p>
            </div>
            <button onClick={() => setShowSeedModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {seedDone && (
              <div className="bg-green-50 text-green-700 text-sm font-medium px-4 py-3 rounded-2xl">
                Products added successfully!
              </div>
            )}

            {templateLists.length === 0 && (
              <p className="text-center text-gray-400 py-6 text-sm">No templates available yet.</p>
            )}

            {/* Auto lists */}
            {autoLists.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={13} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Smart Lists</span>
                </div>
                <div className="space-y-2">
                  {autoLists.map(list => (
                    <TemplateListRow key={list.id} list={list} onAdd={() => seedFromList(list.id)} seeding={seeding} />
                  ))}
                </div>
              </div>
            )}

            {/* My templates */}
            {myLists.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <BookmarkPlus size={13} className="text-header" />
                  <span className="text-xs font-bold text-header uppercase tracking-wide">My Templates</span>
                </div>
                <div className="space-y-2">
                  {myLists.map(list => (
                    <div key={list.id}>
                      {editingTemplate === list.id ? (
                        <form onSubmit={saveEditTemplate} className="bg-gray-50 rounded-2xl p-3 space-y-2">
                          <input
                            value={editTemplateForm.name}
                            onChange={e => setEditTemplateForm(f => ({ ...f, name: e.target.value }))}
                            required
                            placeholder="Template name"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                          />
                          <input
                            value={editTemplateForm.description}
                            onChange={e => setEditTemplateForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Description (optional)"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                          />
                          <div className="flex gap-2">
                            <button type="submit" disabled={savingEditTemplate}
                              className="flex items-center gap-1 bg-btn-category text-white font-bold px-3 py-1.5 rounded-xl text-xs disabled:opacity-50">
                              <Check size={12} />{savingEditTemplate ? 'Saving…' : 'Save'}
                            </button>
                            <button type="button" onClick={() => setEditingTemplate(null)}
                              className="flex items-center gap-1 bg-gray-100 text-gray-600 font-medium px-3 py-1.5 rounded-xl text-xs">
                              <X size={12} />Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 text-sm truncate">{list.name}</p>
                            {list.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{list.description}</p>}
                            <p className="text-xs text-gray-400">{list.itemCount} item{list.itemCount !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button onClick={() => startEditTemplate(list)}
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-700">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => deleteMyTemplate(list.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:text-red-600">
                              <Trash2 size={13} />
                            </button>
                            <button
                              onClick={() => seedFromList(list.id)}
                              disabled={seeding}
                              className="bg-header text-white font-bold text-xs px-3 py-1.5 rounded-xl disabled:opacity-50"
                            >
                              {seeding ? '…' : 'Add'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community lists */}
            {communityLists.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Users size={13} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Community</span>
                </div>
                <div className="space-y-2">
                  {communityLists.map(list => (
                    <TemplateListRow key={list.id} list={list} onAdd={() => seedFromList(list.id)} seeding={seeding} showUsage />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pb-5 pt-2 flex-shrink-0">
            <button onClick={() => setShowSeedModal(false)}
              className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Import from Website Modal */}
    {showImportModal && (
      <ImportFromWebsiteModal
        onClose={() => setShowImportModal(false)}
        eventSlug={event.slug}
        existingProducts={products}
        onImported={() => loadAll(event.slug)}
      />
    )}

    {/* Save as Template Modal */}
    {showSaveTemplateModal && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSaveTemplateModal(false)} />
        <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Save as Template</h2>
              <p className="text-xs text-gray-400 mt-0.5">Share your {products.length}-item list with the community.</p>
            </div>
            <button onClick={() => setShowSaveTemplateModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={20} />
            </button>
          </div>

          {savedTemplateDone ? (
            <div className="px-5 py-8 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-bold text-gray-800">Template saved!</p>
              <p className="text-xs text-gray-400 mt-1">Other hosts can now use your list.</p>
            </div>
          ) : (
            <form onSubmit={saveAsTemplate} className="px-5 py-4 space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Template Name</label>
                <input
                  value={saveTemplateForm.name}
                  onChange={e => setSaveTemplateForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="e.g. Complete Newborn Essentials"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Description (optional)</label>
                <input
                  value={saveTemplateForm.description}
                  onChange={e => setSaveTemplateForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Everything you need for the first 3 months"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={savingTemplate}
                  className="flex-1 bg-header text-white font-bold py-3 rounded-2xl text-sm disabled:opacity-50"
                >
                  {savingTemplate ? 'Saving…' : 'Save Template'}
                </button>
                <button type="button" onClick={() => setShowSaveTemplateModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}
    </>
  );
}

function TemplateListRow({ list, onAdd, seeding, showUsage }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-800 text-sm truncate">{list.name}</p>
        {list.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{list.description}</p>}
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-gray-400">{list.itemCount} item{list.itemCount !== 1 ? 's' : ''}</p>
          {showUsage && list.usageCount > 0 && (
            <span className="text-xs text-gray-400">· used by {list.usageCount} host{list.usageCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      <button
        onClick={onAdd}
        disabled={seeding}
        className="bg-header text-white font-bold text-xs px-4 py-2 rounded-xl disabled:opacity-50 flex-shrink-0"
      >
        {seeding ? '…' : 'Add'}
      </button>
    </div>
  );
}
