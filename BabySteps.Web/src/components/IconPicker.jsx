import { useState, useRef, useEffect } from 'react';
import { Smile, X, Search } from 'lucide-react';

const ICONS = [
  // Baby essentials
  '🍼', '🧸', '👶', '🛁', '🛏️', '🧷', '🩲', '👕', '🧦', '🧤', '🧢', '👗',
  // Feeding
  '🥄', '🍽️', '🥛', '🍵', '🧃', '🥣',
  // Health & care
  '🩺', '💊', '🩹', '🧴', '🧼', '🪥', '🌡️', '💉',
  // Toys & play
  '🎠', '🎡', '🧩', '🎲', '🪀', '🎯', '🎨', '✏️', '📚', '🪁',
  // Travel & gear
  '🚗', '🚼', '🛒', '🎒', '👜', '🧳',
  // Nursery
  '🌙', '⭐', '🌟', '☁️', '🌈', '🌸', '🌺', '🌻', '🦋', '🐣',
  // Animals (plushies)
  '🐻', '🦁', '🐘', '🦒', '🐼', '🐨', '🐰', '🦊', '🐸', '🦄',
  // Celebration
  '🎁', '🎀', '🎊', '🎉', '🍰', '🧁', '💝', '💖', '💛', '💙',
  // Clothing & accessories
  '👟', '🧣', '🎓', '👒', '🧩',
  // Misc
  '🏠', '🌿', '🍃', '🌱', '💤', '🎵', '🎶',
];

export default function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = search.trim()
    ? ICONS.filter(icon => icon.includes(search.trim()))
    : ICONS;

  const select = (icon) => {
    onChange(icon);
    setOpen(false);
    setSearch('');
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="relative" ref={ref}>
      <p className="text-sm font-medium text-gray-600 mb-1.5">Icon</p>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-white hover:border-header/50 transition-colors"
      >
        {value ? (
          <>
            <span className="text-2xl leading-none">{value}</span>
            <span className="text-sm text-gray-500 flex-1 text-left">Change icon</span>
            <span onClick={clear} className="text-gray-400 hover:text-red-400 p-0.5 rounded-full">
              <X size={14} />
            </span>
          </>
        ) : (
          <>
            <Smile size={20} className="text-gray-400" />
            <span className="text-sm text-gray-400 flex-1 text-left">Pick an icon</span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-3">
          {/* Search */}
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search emoji…"
              className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-header/20"
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
            {filtered.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => select(icon)}
                className={`text-xl p-1.5 rounded-lg hover:bg-header/10 transition-colors leading-none ${
                  value === icon ? 'bg-header/20 ring-1 ring-header/40' : ''
                }`}
              >
                {icon}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-8 text-center text-xs text-gray-400 py-4">No icons found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
