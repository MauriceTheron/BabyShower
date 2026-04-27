import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function CreateEventPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isHost, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isHost) navigate('/host/login');
  }, [isHost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/events', { name });
      navigate('/host/dashboard');
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-btn-category rounded-full p-4">
            <Calendar size={36} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Name your event</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          This will appear on your event page and generate your unique URL
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Emma & Jack's Baby Shower"
            required
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 bg-white"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-header text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:opacity-90"
          >
            {loading ? 'Creating…' : 'Create Event'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
