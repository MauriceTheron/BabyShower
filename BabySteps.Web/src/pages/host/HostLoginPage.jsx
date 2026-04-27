import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Baby } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HostLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { hostLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await hostLogin(email, password);
      // If host already has an event, go to dashboard; otherwise create one
      if (data.eventSlug) {
        navigate('/host/dashboard');
      } else {
        navigate('/host/create-event');
      }
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-header rounded-full p-4">
            <Baby size={36} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Sign in to manage your event</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 bg-white"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 bg-white"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-header text-white font-bold py-3.5 rounded-2xl disabled:opacity-50 active:opacity-90"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          New host?{' '}
          <Link to="/host/register" className="text-header font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
