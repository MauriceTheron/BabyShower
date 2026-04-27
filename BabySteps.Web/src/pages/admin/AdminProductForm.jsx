import { useState, useEffect } from 'react';
import { Link2, Loader2 } from 'lucide-react';
import api from '../../api/client';
import ImagePicker from '../../components/ImagePicker';

export default function AdminProductForm({ product, stores, categories, slug, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    price: '',
    imageURL: '',
    productURL: '',
    notes: '',
    isPriority: false,
    isNappyList: false,
    stockQuantity: '1',
    categoryId: '',
    storeId: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        brand: product.brand,
        price: product.price.toString(),
        imageURL: product.imageURL || '',
        productURL: product.productURL || '',
        notes: product.notes || '',
        isPriority: product.isPriority,
        isNappyList: product.isNappyList,
        stockQuantity: product.stockQuantity.toString(),
        categoryId: product.categoryId.toString(),
        storeId: product.storeId.toString(),
      });
    }
  }, [product]);

  const set = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleFetchFromURL = async () => {
    if (!form.productURL) return;
    setFetchError('');
    setFetching(true);
    try {
      const { data } = await api.post('/product-scraper', { url: form.productURL });
      setForm(f => ({
        ...f,
        name: data.name || f.name,
        imageURL: data.imageURL || f.imageURL,
        price: data.price != null ? data.price.toString() : f.price,
      }));
    } catch {
      setFetchError('Could not fetch product details. Fill in manually or check the URL.');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity),
      categoryId: parseInt(form.categoryId),
      storeId: parseInt(form.storeId),
      productURL: form.productURL || null,
      notes: form.notes || null,
    };
    try {
      if (product) {
        await api.put(`/events/${slug}/products/${product.id}`, payload);
      } else {
        await api.post(`/events/${slug}/products`, payload);
      }
      onSaved();
    } catch {
      setError('Failed to save. Check all fields.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-header/20";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm mb-4 space-y-3">
      <h3 className="font-bold text-gray-800">{product ? 'Edit Product' : 'New Product'}</h3>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
          <Link2 size={12} /> Product Page URL <span className="text-gray-400">(optional)</span>
        </label>
        <div className="flex gap-2">
          <input
            value={form.productURL}
            onChange={set('productURL')}
            placeholder="https://www.takealot.com/..."
            type="url"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleFetchFromURL}
            disabled={!form.productURL || fetching}
            className="flex-shrink-0 flex items-center gap-1.5 bg-header/10 text-header font-semibold text-sm px-3 py-2 rounded-xl disabled:opacity-40 hover:bg-header/20 transition-colors"
          >
            {fetching ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
            {fetching ? 'Fetching…' : 'Fetch'}
          </button>
        </div>
        {fetchError && <p className="text-orange-500 text-xs">{fetchError}</p>}
      </div>

      <input value={form.name} onChange={set('name')} placeholder="Product name" required className={inputClass} />
      <input value={form.brand} onChange={set('brand')} placeholder="Brand" required className={inputClass} />

      <div className="flex gap-3">
        <input value={form.price} onChange={set('price')} placeholder="Price (R)" type="number" step="0.01" min="0" required className={inputClass} />
        <div className="w-40 flex-shrink-0">
          <input
            value={form.stockQuantity}
            onChange={set('stockQuantity')}
            placeholder="Qty available"
            type="number"
            min="1"
            required
            className={inputClass}
          />
        </div>
      </div>

      <ImagePicker
        label="Product Image"
        value={form.imageURL}
        onChange={(url) => setForm(f => ({ ...f, imageURL: url }))}
      />

      <select value={form.categoryId} onChange={set('categoryId')} required className={inputClass}>
        <option value="">Select category</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <select value={form.storeId} onChange={set('storeId')} required className={inputClass}>
        <option value="">Select store</option>
        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={form.isPriority} onChange={set('isPriority')} className="accent-header" />
          Priority Item
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={form.isNappyList} onChange={set('isNappyList')} className="accent-header" />
          Nappy List
        </label>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Host note <span className="text-gray-400">(optional — shown to guests)</span></label>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          placeholder="e.g. I only want blue, size 0–3 months…"
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex-1 bg-header text-white font-bold py-2.5 rounded-xl disabled:opacity-50">
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl">
          Cancel
        </button>
      </div>
    </form>
  );
}
