import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function LandingPage() {
  const { isHost, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isHost) navigate('/host/dashboard');
    else if (isAdmin) navigate('/admin');
  }, [isHost, isAdmin]);

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-4 pb-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Littlelist" className="h-16 w-auto mb-4" />
          <p className="text-gray-500 text-center mt-2 text-sm">
            Create a beautiful gift registry for your baby shower
          </p>
        </div>

        {/* Feature highlights */}
        <div className="space-y-3 mb-10">
          <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
            <div className="bg-btn-category/10 rounded-xl p-2.5">
              <Calendar size={20} className="text-btn-category" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Host your event</p>
              <p className="text-xs text-gray-400">Create a personalised registry page</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
            <div className="bg-btn-store/10 rounded-xl p-2.5">
              <Users size={20} className="text-btn-store" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Share with guests</p>
              <p className="text-xs text-gray-400">A unique link for all your invitees</p>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/host/register')}
            className="w-full bg-header text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:opacity-90"
          >
            Host an Event
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => navigate('/host/login')}
            className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-4 rounded-2xl active:bg-gray-50"
          >
            Sign in as Host
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Have an event link?{' '}
          <span className="text-header font-medium">Use the URL shared by your host</span>
        </p>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-xs text-gray-300 hover:text-gray-400 transition-colors"
          >
            Admin access
          </button>
        </div>
      </div>
    </div>
  );
}
