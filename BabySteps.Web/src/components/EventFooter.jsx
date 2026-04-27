import { Calendar, MapPin, Navigation, CalendarCheck } from 'lucide-react';
import { useEvent } from '../context/EventContext';

function isRsvpClosed(event) {
  if (!event?.eventDate) return false;
  const cutoff = new Date(event.eventDate);
  cutoff.setDate(cutoff.getDate() - (event.rsvpDeadlineDays ?? 5));
  return new Date() >= cutoff;
}

export default function EventFooter() {
  const { event, setRsvpOpen, myRsvp } = useEvent();

  if (!event) return null;

  const closed = isRsvpClosed(event);
  const hasRsvp = !!myRsvp;

  const formattedDate = event.eventDate
    ? new Intl.DateTimeFormat('en-ZA', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(event.eventDate))
    : null;

  const directionsUrl =
    event.locationUrl ||
    (event.location ? `https://maps.google.com/?q=${encodeURIComponent(event.location)}` : null);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-pink-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-header flex-shrink-0" />
              <span className="text-xs text-gray-600">{formattedDate}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin size={12} className="text-header flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate">{event.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-header/10 text-header text-xs font-bold px-3 py-2 rounded-xl active:opacity-90"
            >
              <Navigation size={13} />
              Directions
            </a>
          )}
          <button
            onClick={() => setRsvpOpen(true)}
            disabled={closed}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors
              ${closed
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : hasRsvp
                  ? 'bg-header/20 text-header active:opacity-90'
                  : 'bg-header text-white active:opacity-90'
              }`}
          >
            <CalendarCheck size={13} />
            {closed ? 'RSVPs Closed' : hasRsvp ? 'Edit RSVP' : 'RSVP'}
          </button>
        </div>
      </div>
    </div>
  );
}
