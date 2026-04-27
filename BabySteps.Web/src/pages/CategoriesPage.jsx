import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import api from '../api/client';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Categories</h1>
        <div className="space-y-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/category/${cat.id}`, { state: { name: cat.name } })}
              className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon || '🛍️'}</span>
                <span className="font-semibold text-gray-800">{cat.name}</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
        {categories.length === 0 && (
          <p className="text-center text-gray-400 mt-12">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
