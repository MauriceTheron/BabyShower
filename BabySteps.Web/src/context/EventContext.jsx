import { createContext, useContext, useState } from 'react';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [event, setEvent] = useState(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [myRsvps, setMyRsvps] = useState([]);

  return (
    <EventContext.Provider value={{ event, setEvent, rsvpOpen, setRsvpOpen, myRsvps, setMyRsvps }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvent = () => useContext(EventContext);
