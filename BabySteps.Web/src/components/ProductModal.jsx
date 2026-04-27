import { useState } from 'react';
import { X, Minus, Plus, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import api from '../api/client';

function fireConfetti() {
  const colors = ['#f9a8d4', '#fbcfe8', '#c4b5fd', '#a5b4fc', '#ffffff', '#fce7f3'];
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 120 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height * 0.5,
    vx: (Math.random() - 0.5) * 12,
    vy: -(Math.random() * 14 + 6),
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    gravity: 0.4,
    opacity: 1,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.012;
      if (p.opacity <= 0) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (alive) { frame = requestAnimationFrame(draw); }
    else { cancelAnimationFrame(frame); canvas.remove(); }
  }
  draw();
}

const placeholder = 'https://placehold.co/400x400/e59eaf/ffffff?text=Baby+Steps';

export default function ProductModal({ product, onClose, onReserved }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, guestToken } = useAuth();
  const { event } = useEvent();

  if (!product) return null;

  const available = product.stockQuantity - product.reservedQuantity;
  const fullyReserved = available <= 0;

  const handleReserve = async () => {
    if (!user && !guestToken) {
      setMessage('Please register as a guest first.');
      return;
    }
    if (!event) {
      setMessage('No event context found.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/events/${event.slug}/reservations`, {
        productId: product.id,
        quantity,
        guestToken: guestToken || '',
      });
      setMessage('Reserved!');
      onReserved?.(product.id, quantity);
      fireConfetti();
      setTimeout(onClose, 2000);
    } catch (err) {
      setMessage(err.response?.data || 'Failed to reserve. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={product.imageURL || placeholder}
            alt={product.name}
            className={`w-full h-64 object-cover ${fullyReserved ? 'grayscale' : ''}`}
            onError={(e) => { e.target.src = placeholder; }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow"
          >
            <X size={20} />
          </button>
          {fullyReserved && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="bg-white text-gray-800 font-bold px-5 py-2 rounded-full text-lg shadow">
                Fully Reserved
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-400">{product.brand}</p>
          <h2 className="text-xl font-bold text-gray-800 mt-1">{product.name}</h2>
          <p className="text-2xl font-bold text-header mt-2">R{product.price.toFixed(2)}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-500">{product.categoryName} · {product.storeName}</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              fullyReserved
                ? 'bg-gray-100 text-gray-500'
                : available <= 2
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-green-100 text-green-700'
            }`}>
              {fullyReserved ? 'Reserved' : `${available} left`}
            </span>
          </div>

          {product.notes && (
            <div className="mt-3 flex gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
              <span className="text-amber-500 text-base leading-none mt-0.5">💬</span>
              <p className="text-sm text-amber-800 leading-snug">{product.notes}</p>
            </div>
          )}

          {!fullyReserved && (
            <div className="flex items-center gap-4 mt-5">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="bg-gray-100 rounded-full p-2 active:bg-gray-200"
              >
                <Minus size={18} />
              </button>
              <span className="text-xl font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(available, q + 1))}
                className="bg-gray-100 rounded-full p-2 active:bg-gray-200"
              >
                <Plus size={18} />
              </button>
            </div>
          )}

          {message && (
            <p className={`mt-3 text-sm font-medium ${message === 'Reserved!' ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          <button
            onClick={fullyReserved ? onClose : handleReserve}
            disabled={loading}
            className={`mt-4 w-full font-bold py-3.5 rounded-2xl text-lg disabled:opacity-50 ${
              fullyReserved
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-header text-white active:opacity-90'
            }`}
          >
            {fullyReserved ? 'Fully Reserved' : loading ? 'Reserving…' : 'Reserve'}
          </button>

          {product.productURL && (
            <a
              href={product.productURL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-header py-2 rounded-2xl border border-gray-200 hover:border-header/30 transition-colors"
            >
              <ExternalLink size={15} />
              View Product Page
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
