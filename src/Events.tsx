import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const demoEvents = [
  { eventId: 'event1', title: 'Event 1' },
  { eventId: 'event2', title: 'Event 2' },
];

const Events = () => {
  const [events] = useState(demoEvents);
  const navigate = useNavigate();

  const goToTimeline = (eventId: string) => {
    navigate(`/timeline/${eventId}`);
  };

  return (
    <div>
      <h2>Events</h2>
      <button onClick={() => navigate("/auth")}>Go to Auth</button>
      {events.map((event) => (
        <div key={event.eventId} onClick={() => goToTimeline(event.eventId)}>
          {event.title}
        </div>
      ))}
    </div>
  );
};

export default Events;
