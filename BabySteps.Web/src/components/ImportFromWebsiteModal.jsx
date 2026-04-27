import { useState } from 'react';
import { X, Globe, Check, AlertCircle, ChevronDown, ChevronRight, Download } from 'lucide-react';
import api from '../api/client';

export default function ImportFromWebsiteModal({ onClose, eventSlug, existingProducts, onImported }) {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState('url'); // 'url' | 'select' | 'done'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [collapsed, setCollapsed] = useState(new Set());
  const [result, setResult] = useState(null);

  const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase()));

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/import/thingstogetme/parse', { url });
      if (data.length === 0) {
        setError('No items found. Make sure the URL is a valid ThingsToGetMe wishlist.');
        return;
      }
      setParsedItems(data);
      // Pre-select all non-duplicate items
      const preSelected = new Set();
      data.forEach((item, i) => {
        if (!existingNames.has(item.name.toLowerCase())) preSelected.add(i);
      });
      setSelected(preSelected);
      setStep('select');
    } catch (err) {
      setError(typeof err.response?.data === 'string' ? err.response.data : 'Failed to fetch items. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const importItems = async () => {
    setLoading(true);
    setError('');
    try {
      const items = parsedItems.filter((_, i) => selected.has(i));
      const { data } = await api.post(`/events/${eventSlug}/import`, { items });
      setResult(data);
      setStep('done');
      onImported();
    } catch (err) {
      setError('Import failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (i) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleCategorySelection = (e, category) => {
    e.stopPropagation();
    const categoryIndices = parsedItems
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => item.categoryName === category)
      .map(({ i }) => i);
    const allSelected = categoryIndices.every(i => selected.has(i));
    setSelected(prev => {
      const next = new Set(prev);
      categoryIndices.forEach(i => allSelected ? next.delete(i) : next.add(i));
      return next;
    });
  };

  const toggleCollapse = (category) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  // Build ordered category groups preserving original order
  const categoryOrder = [];
  const categoryMap = {};
  parsedItems.forEach((item, i) => {
    if (!categoryMap[item.categoryName]) {
      categoryMap[item.categoryName] = [];
      categoryOrder.push(item.categoryName);
    }
    categoryMap[item.categoryName].push({ item, i });
  });

  const selectedCount = selected.size;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Import from Website</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 'url' && 'Paste a ThingsToGetMe wishlist URL'}
              {step === 'select' && `${parsedItems.length} items found — pick what to import`}
              {step === 'done' && 'Import complete!'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-4">

          {/* Step 1: URL input */}
          {step === 'url' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-2xl p-4 flex gap-3">
                <Globe size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Paste your <strong>ThingsToGetMe</strong> wishlist URL below. All items will be fetched and you can choose which ones to add to your event.
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Wishlist URL</label>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://www.thingstogetme.com/..."
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-header"
                  onKeyDown={e => e.key === 'Enter' && url && fetchItems()}
                />
              </div>
              {error && <ErrorBanner message={error} />}
            </div>
          )}

          {/* Step 2: Item selection */}
          {step === 'select' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">{selectedCount} of {parsedItems.length} selected</span>
                <div className="flex gap-3">
                  <button onClick={() => setSelected(new Set(parsedItems.map((_, i) => i)))}
                    className="text-xs text-header font-semibold">Select All</button>
                  <button onClick={() => setSelected(new Set())}
                    className="text-xs text-gray-400 font-semibold">None</button>
                </div>
              </div>

              {categoryOrder.map(category => {
                const catItems = categoryMap[category];
                const isCollapsed = collapsed.has(category);
                const allCatSelected = catItems.every(({ i }) => selected.has(i));

                return (
                  <div key={category} className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer select-none"
                      onClick={() => toggleCollapse(category)}
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed
                          ? <ChevronRight size={14} className="text-gray-400" />
                          : <ChevronDown size={14} className="text-gray-400" />}
                        <span className="text-sm font-semibold text-gray-700">{category}</span>
                        <span className="text-xs text-gray-400">({catItems.length})</span>
                      </div>
                      <button
                        onClick={(e) => toggleCategorySelection(e, category)}
                        className="text-xs text-header font-semibold"
                      >
                        {allCatSelected ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>

                    {!isCollapsed && (
                      <div className="divide-y divide-gray-50">
                        {catItems.map(({ item, i }) => {
                          const isDuplicate = existingNames.has(item.name.toLowerCase());
                          const isChecked = selected.has(i);

                          return (
                            <div
                              key={i}
                              className={`flex items-start gap-3 px-4 py-3 ${isDuplicate ? 'opacity-50' : 'cursor-pointer hover:bg-gray-50/50'}`}
                              onClick={() => !isDuplicate && toggleItem(i)}
                            >
                              {/* Checkbox */}
                              <div className={`w-4 h-4 rounded flex-shrink-0 mt-1 border-2 flex items-center justify-center transition-colors ${
                                isChecked ? 'bg-header border-header' : 'border-gray-300'
                              }`}>
                                {isChecked && <Check size={9} className="text-white" />}
                              </div>

                              {/* Thumbnail */}
                              {item.imageURL && (
                                <img
                                  src={item.imageURL}
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              )}

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                                  {item.isPriority && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full flex-shrink-0">★ High</span>
                                  )}
                                  {isDuplicate && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full flex-shrink-0">Already added</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {item.storeName} · R{item.price.toFixed(2)} · Qty: {item.quantity}
                                </p>
                                {item.notes && (
                                  <p className="text-xs text-gray-400 italic truncate mt-0.5">{item.notes}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {error && <ErrorBanner message={error} />}
            </div>
          )}

          {/* Step 3: Done */}
          {step === 'done' && result && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-bold text-gray-800 text-lg">Import complete!</p>
              <div className="flex justify-center gap-4 mt-5">
                <div className="bg-green-50 rounded-2xl px-6 py-4 text-center">
                  <p className="text-3xl font-bold text-green-700">{result.imported}</p>
                  <p className="text-xs text-green-600 font-semibold mt-0.5">Imported</p>
                </div>
                {result.skipped > 0 && (
                  <div className="bg-gray-50 rounded-2xl px-6 py-4 text-center">
                    <p className="text-3xl font-bold text-gray-500">{result.skipped}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Skipped</p>
                  </div>
                )}
              </div>
              {result.skipped > 0 && (
                <p className="text-xs text-gray-400 mt-3">Skipped items were already in your list.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 pb-5 pt-2 flex-shrink-0 space-y-2">
          {step === 'url' && (
            <button
              onClick={fetchItems}
              disabled={!url.trim() || loading}
              className="w-full bg-header text-white font-bold py-3 rounded-2xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download size={15} />
              {loading ? 'Fetching…' : 'Fetch Items'}
            </button>
          )}

          {step === 'select' && (
            <button
              onClick={importItems}
              disabled={selectedCount === 0 || loading}
              className="w-full bg-header text-white font-bold py-3 rounded-2xl text-sm disabled:opacity-50"
            >
              {loading ? 'Importing…' : `Import ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`}
            </button>
          )}

          {step === 'done' && (
            <button onClick={onClose} className="w-full bg-header text-white font-bold py-3 rounded-2xl text-sm">
              Done
            </button>
          )}

          {step !== 'done' && (
            <button onClick={onClose} className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl text-sm">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm">
      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
