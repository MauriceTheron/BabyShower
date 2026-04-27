import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Baby } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EventRegisterPage() {
  const { slug } = useParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { guestRegister, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(`/e/${slug}`);
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await guestRegister(firstName.trim(), lastName.trim());
      navigate(`/e/${slug}`);
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-header rounded-full p-4">
            <Baby size={40} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Welcome!</h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Enter your name to start reserving gifts
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First Name"
            required
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 bg-white"
          />
          <input
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Last Name"
            required
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-header/30 bg-white"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-header text-white font-bold py-3.5 rounded-2xl disabled:opacity-50"
          >
            {loading ? 'Registering…' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}
