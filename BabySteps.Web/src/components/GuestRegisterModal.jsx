import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';

const DISMISSED_KEY = 'guestModalDismissed';

export default function GuestRegisterModal() {
  const { user, guestRegister } = useAuth();
  const { event } = useEvent();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only show the modal when we're in an event context and user isn't logged in
  useEffect(() => {
    if (!event) return;
    if (!user && !sessionStorage.getItem(DISMISSED_KEY)) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [user, event]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await guestRegister(firstName.trim(), lastName.trim());
      setOpen(false);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-header px-5 pt-6 pb-8 text-white text-center relative">
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="flex justify-center mb-3">
            <img src="/logo.png" alt="Littlelist" className="h-10 w-auto" />
          </div>
          <h2 className="text-xl font-bold">Welcome to {event?.name || 'Littlelist'}!</h2>
          <p className="text-sm text-white/80 mt-1">
            Register to start reserving gifts for the little one.
          </p>
        </div>

        <div className="-mt-4 bg-white rounded-t-3xl px-5 pb-6 pt-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First Name"
              required
              autoFocus
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 bg-gray-50"
            />
            <input
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last Name"
              required
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 bg-gray-50"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-header text-white font-bold py-3.5 rounded-2xl text-base disabled:opacity-50 active:opacity-90 transition-opacity"
            >
              {loading ? 'Registering…' : "Let's Go!"}
            </button>
          </form>

          <button
            onClick={dismiss}
            className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
          >
            Browse first
          </button>
        </div>
      </div>
    </div>
  );
}
