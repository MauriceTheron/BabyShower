import { useState, useEffect } from 'react';
import { X, PartyPopper, HelpCircle, XCircle, Check, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

const STATUSES = [
  { value: 'Going', label: "Going", icon: PartyPopper, color: 'bg-green-50 border-green-300 text-green-700', active: 'bg-green-500 border-green-500 text-white' },
  { value: 'Maybe', label: 'Maybe', icon: HelpCircle, color: 'bg-yellow-50 border-yellow-300 text-yellow-700', active: 'bg-yellow-400 border-yellow-400 text-white' },
  { value: 'NotGoing', label: "Can't make it", icon: XCircle, color: 'bg-gray-50 border-gray-300 text-gray-500', active: 'bg-gray-400 border-gray-400 text-white' },
];

const EVENT_TYPES = [
  { value: 'NappyBraai', label: 'Nappy Braai' },
  { value: 'BabyShower', label: 'Baby Shower' },
];

function isRsvpClosed(event) {
  if (!event?.eventDate) return false;
  const cutoff = new Date(event.eventDate);
  cutoff.setDate(cutoff.getDate() - (event.rsvpDeadlineDays ?? 5));
  return new Date() >= cutoff;
}

function StatusPicker({ selected, onSelect }) {
  return (
    <div className="flex gap-2">
      {STATUSES.map(s => {
        const Icon = s.icon;
        const isActive = selected === s.value;
        return (
          <button
            key={s.value}
            onClick={() => onSelect(isActive ? null : s.value)}
            className={`flex-1 flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${isActive ? s.active : s.color}`}
          >
            <Icon size={16} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export default function RsvpModal({ onClose }) {
  const { user, guestToken } = useAuth();
  const { event, setMyRsvps } = useEvent();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [selections, setSelections] = useState({ NappyBraai: null, BabyShower: null });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const isRegistered = !!(user || guestToken);
  const closed = isRsvpClosed(event);
  const hasAnySelection = selections.NappyBraai || selections.BabyShower;

  useEffect(() => {
    if (!isRegistered) { setFetching(false); return; }
    const params = guestToken ? `?guestToken=${guestToken}` : '';
    api.get(`/events/${slug}/rsvp/my${params}`)
      .then(r => {
        const rsvps = r.data;
        const sel = { NappyBraai: null, BabyShower: null };
        let msg = '';
        rsvps.forEach(r => {
          sel[r.eventType] = r.status;
          if (r.message) msg = r.message;
        });
        setSelections(sel);
        setMessage(msg);
        setMyRsvps(rsvps);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [slug, isRegistered]);

  const handleSubmit = async () => {
    if (!hasAnySelection) return;
    setLoading(true);
    setError('');
    try {
      const calls = EVENT_TYPES
        .filter(et => selections[et.value])
        .map(et =>
          api.post(`/events/${slug}/rsvp`, {
            status: selections[et.value],
            message: message || null,
            guestToken: guestToken || '',
            eventType: et.value,
          })
        );
      await Promise.all(calls);

      const updated = EVENT_TYPES
        .filter(et => selections[et.value])
        .map(et => ({ status: selections[et.value], message: message || null, eventType: et.value }));
      setMyRsvps(updated);
      setDone(true);
      setTimeout(onClose, 1800);
    } catch {
      setError('Something went wrong. Please try again.');
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
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-header to-btn-store px-5 pt-5 pb-6 relative">
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/20 rounded-full p-1.5">
            <X size={18} className="text-white" />
          </button>
          <p className="text-white text-xl font-bold">{event?.name}</p>
          <p className="text-white/80 text-sm mt-0.5">Which event(s) are you attending?</p>
        </div>

        <div className="p-5">
          {done ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="bg-green-100 rounded-full p-3">
                <Check size={28} className="text-green-600" />
              </div>
              <p className="font-bold text-gray-800 text-lg">RSVP saved!</p>
              <p className="text-sm text-gray-500">Thanks for letting us know.</p>
            </div>
          ) : closed ? (
            <div className="flex flex-col items-center py-6 gap-3 text-center">
              <div className="bg-gray-100 rounded-full p-3">
                <Lock size={24} className="text-gray-400" />
              </div>
              <p className="font-bold text-gray-700">RSVPs are closed</p>
              <p className="text-sm text-gray-400">
                RSVPs closed {event?.rsvpDeadlineDays ?? 5} days before the event.
              </p>
            </div>
          ) : !isRegistered ? (
            <div className="flex flex-col items-center py-4 gap-4 text-center">
              <p className="text-gray-600 text-sm">You need to register as a guest before you can RSVP.</p>
              <button
                onClick={() => { onClose(); navigate(`/e/${slug}/register`); }}
                className="bg-header text-white font-bold px-6 py-3 rounded-2xl w-full"
              >
                Register as Guest
              </button>
            </div>
          ) : fetching ? (
            <div className="flex justify-center py-6">
              <p className="text-gray-400 text-sm">Loading…</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {EVENT_TYPES.map(et => (
                  <div key={et.value}>
                    <p className="text-sm font-bold text-gray-700 mb-2">{et.label}</p>
                    <StatusPicker
                      selected={selections[et.value]}
                      onSelect={val => setSelections(prev => ({ ...prev, [et.value]: val }))}
                    />
                  </div>
                ))}
              </div>

              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Leave a message (optional)"
                rows={2}
                className="mt-4 w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 resize-none"
              />

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={!hasAnySelection || loading}
                className="mt-4 w-full bg-header text-white font-bold py-3.5 rounded-2xl text-base disabled:opacity-40 active:opacity-90"
              >
                {loading ? 'Saving…' : 'Confirm RSVP'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
