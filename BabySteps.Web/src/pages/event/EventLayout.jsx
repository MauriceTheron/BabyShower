import { useEffect, useState } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useEvent } from '../../context/EventContext';
import EventFooter from '../../components/EventFooter';
import RsvpModal from '../../components/RsvpModal';

const hexToRgb = (hex) => {
  const m = hex?.replace('#', '').match(/([a-f\d]{2})/gi);
  return m?.length === 3 ? m.map(x => parseInt(x, 16)).join(' ') : null;
};

const DEFAULTS = {
  '--color-header': '229 158 175',
  '--color-btn-category': '65 79 111',
  '--color-btn-store': '222 195 179',
};

function applyColors(event) {
  const root = document.documentElement;
  const set = (prop, hex, fallback) => {
    const val = hex ? hexToRgb(hex) : null;
    root.style.setProperty(prop, val || fallback);
  };
  set('--color-header', event.primaryColor, DEFAULTS['--color-header']);
  set('--color-btn-category', event.secondaryColor, DEFAULTS['--color-btn-category']);
  set('--color-btn-store', event.accentColor, DEFAULTS['--color-btn-store']);
}

function resetColors() {
  const root = document.documentElement;
  Object.keys(DEFAULTS).forEach(prop => root.style.removeProperty(prop));
}

export default function EventLayout() {
  const { slug } = useParams();
  const { setEvent, rsvpOpen, setRsvpOpen } = useEvent();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/events/${slug}`)
      .then(r => {
        setEvent(r.data);
        applyColors(r.data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });

    return () => {
      setEvent(null);
      resetColors();
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-gray-400">Loading event…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 px-4">
        <p className="text-2xl font-bold text-gray-700">Event not found</p>
        <p className="text-gray-400 text-sm text-center">This event link may be inactive or incorrect.</p>
        <button onClick={() => navigate('/')} className="bg-header text-white font-bold px-6 py-3 rounded-2xl">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="pb-16">
        <Outlet />
      </div>
      <EventFooter />
      {rsvpOpen && <RsvpModal onClose={() => setRsvpOpen(false)} />}
    </>
  );
}
