import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function SuperAdminDashboard() {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);
  const [newList, setNewList] = useState({ name: '', description: '' });
  const [editingList, setEditingList] = useState(null);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newItem, setNewItem] = useState(blankItem());
  const [editingItem, setEditingItem] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) { navigate('/admin/login'); return; }
    loadLists();
  }, [isSuperAdmin]);

  function blankItem() {
    return { name: '', brand: '', price: '', imageURL: '', isPriority: false, isNappyList: false, stockQuantity: 1, categoryName: '', storeName: '' };
  }

  const loadLists = async () => {
    const { data } = await api.get('/product-lists');
    setLists(data);
  };

  const expandList = async (id) => {
    if (expandedId === id) { setExpandedId(null); setExpandedItems([]); return; }
    setExpandedId(id);
    setShowItemForm(false);
    setEditingItem(null);
    const { data } = await api.get(`/product-lists/${id}`);
    setExpandedItems(data.items);
  };

  const createList = async (e) => {
    e.preventDefault();
    await api.post('/product-lists', newList);
    setNewList({ name: '', description: '' });
    setShowNewListForm(false);
    loadLists();
  };

  const saveListEdit = async (e) => {
    e.preventDefault();
    await api.put(`/product-lists/${editingList.id}`, { name: editingList.name, description: editingList.description });
    setEditingList(null);
    loadLists();
  };

  const deleteList = async (id) => {
    if (!confirm('Delete this list and all its items?')) return;
    await api.delete(`/product-lists/${id}`);
    if (expandedId === id) { setExpandedId(null); setExpandedItems([]); }
    loadLists();
  };

  const addItem = async (e) => {
    e.preventDefault();
    await api.post(`/product-lists/${expandedId}/items`, {
      ...newItem,
      price: parseFloat(newItem.price) || 0,
      stockQuantity: parseInt(newItem.stockQuantity) || 1,
    });
    setNewItem(blankItem());
    setShowItemForm(false);
    const { data } = await api.get(`/product-lists/${expandedId}`);
    setExpandedItems(data.items);
    loadLists();
  };

  const saveItemEdit = async (e) => {
    e.preventDefault();
    await api.put(`/product-lists/${expandedId}/items/${editingItem.id}`, {
      name: editingItem.name, brand: editingItem.brand,
      price: parseFloat(editingItem.price) || 0,
      imageURL: editingItem.imageURL || null,
      isPriority: editingItem.isPriority, isNappyList: editingItem.isNappyList,
      stockQuantity: parseInt(editingItem.stockQuantity) || 1,
      categoryName: editingItem.categoryName, storeName: editingItem.storeName,
    });
    setEditingItem(null);
    const { data } = await api.get(`/product-lists/${expandedId}`);
    setExpandedItems(data.items);
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/product-lists/${expandedId}/items/${itemId}`);
    setExpandedItems(prev => prev.filter(i => i.id !== itemId));
    loadLists();
  };

  return (
    <div className="bg-background min-h-screen pb-10">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Product Templates</h1>
            <p className="text-sm text-gray-400 mt-0.5">Hosts can seed their event from these lists.</p>
          </div>
          <button
            onClick={() => setShowNewListForm(v => !v)}
            className="flex items-center gap-1.5 bg-header text-white font-bold px-4 py-2.5 rounded-2xl text-sm"
          >
            <Plus size={16} /> New List
          </button>
        </div>

        {showNewListForm && (
          <form onSubmit={createList} className="bg-white rounded-2xl p-4 shadow-sm mb-4 space-y-3">
            <h3 className="font-semibold text-gray-700">New Template List</h3>
            <input value={newList.name} onChange={e => setNewList(s => ({ ...s, name: e.target.value }))}
              placeholder="List name" required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <input value={newList.description} onChange={e => setNewList(s => ({ ...s, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <div className="flex gap-2">
              <button type="submit" className="bg-header text-white font-bold px-4 py-2 rounded-xl text-sm">Create</button>
              <button type="button" onClick={() => setShowNewListForm(false)}
                className="bg-gray-100 text-gray-600 font-medium px-4 py-2 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {lists.map(list => (
            <div key={list.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* List header */}
              {editingList?.id === list.id ? (
                <form onSubmit={saveListEdit} className="p-4 space-y-2">
                  <input value={editingList.name} onChange={e => setEditingList(s => ({ ...s, name: e.target.value }))}
                    required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none font-semibold" />
                  <input value={editingList.description || ''} onChange={e => setEditingList(s => ({ ...s, description: e.target.value }))}
                    placeholder="Description" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex items-center gap-1 bg-header text-white font-bold px-3 py-1.5 rounded-xl text-xs"><Check size={13} />Save</button>
                    <button type="button" onClick={() => setEditingList(null)}
                      className="flex items-center gap-1 bg-gray-100 text-gray-600 font-medium px-3 py-1.5 rounded-xl text-xs"><X size={13} />Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => expandList(list.id)} className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">{list.name}</p>
                    {list.description && <p className="text-xs text-gray-400 mt-0.5">{list.description}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{list.itemCount} item{list.itemCount !== 1 ? 's' : ''}</p>
                  </button>
                  <button onClick={() => setEditingList({ ...list })}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteList(list.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => expandList(list.id)} className="p-1.5 text-gray-400">
                    {expandedId === list.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              )}

              {/* Expanded items */}
              {expandedId === list.id && (
                <div className="border-t border-gray-100 px-4 pt-3 pb-4 space-y-2">
                  {expandedItems.map(item => (
                    <div key={item.id}>
                      {editingItem?.id === item.id ? (
                        <form onSubmit={saveItemEdit} className="bg-gray-50 rounded-xl p-3 space-y-2">
                          <ItemFields values={editingItem} onChange={setEditingItem} />
                          <div className="flex gap-2">
                            <button type="submit" className="flex items-center gap-1 bg-header text-white font-bold px-3 py-1.5 rounded-xl text-xs"><Check size={13} />Save</button>
                            <button type="button" onClick={() => setEditingItem(null)}
                              className="flex items-center gap-1 bg-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-xl text-xs"><X size={13} />Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.brand} · R{item.price.toFixed(2)} · {item.categoryName} · {item.storeName}</p>
                          </div>
                          <button onClick={() => setEditingItem({ ...item })}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteItem(item.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {expandedItems.length === 0 && !showItemForm && (
                    <p className="text-xs text-gray-400 py-1">No items yet.</p>
                  )}

                  {showItemForm ? (
                    <form onSubmit={addItem} className="bg-gray-50 rounded-xl p-3 space-y-2 mt-2">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Add Item</p>
                      <ItemFields values={newItem} onChange={setNewItem} />
                      <div className="flex gap-2">
                        <button type="submit" className="flex items-center gap-1 bg-header text-white font-bold px-3 py-1.5 rounded-xl text-xs"><Check size={13} />Add</button>
                        <button type="button" onClick={() => { setShowItemForm(false); setNewItem(blankItem()); }}
                          className="flex items-center gap-1 bg-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-xl text-xs"><X size={13} />Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => { setShowItemForm(true); setEditingItem(null); }}
                      className="flex items-center gap-1.5 text-xs text-header font-semibold mt-2 hover:underline">
                      <Plus size={13} /> Add item
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {lists.length === 0 && (
            <p className="text-center text-gray-400 mt-12">No template lists yet. Create one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemFields({ values, onChange }) {
  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onChange(prev => ({ ...prev, [key]: val }));
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      <input value={values.name} onChange={set('name')} placeholder="Product name" required
        className="col-span-2 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none" />
      <input value={values.brand} onChange={set('brand')} placeholder="Brand" required
        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none" />
      <input value={values.price} onChange={set('price')} placeholder="Price" type="number" min="0" step="0.01" required
        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none" />
      <input value={values.categoryName} onChange={set('categoryName')} placeholder="Category" required
        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none" />
      <input value={values.storeName} onChange={set('storeName')} placeholder="Store" required
        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none" />
      <input value={values.stockQuantity} onChange={set('stockQuantity')} placeholder="Qty" type="number" min="1" required
        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none" />
      <input value={values.imageURL || ''} onChange={set('imageURL')} placeholder="Image URL (optional)"
        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none" />
      <div className="col-span-2 flex gap-4">
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={values.isPriority} onChange={set('isPriority')} className="rounded" />
          Priority
        </label>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={values.isNappyList} onChange={set('isNappyList')} className="rounded" />
          Nappy List
        </label>
      </div>
    </div>
  );
}
