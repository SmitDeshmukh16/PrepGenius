import axios from 'axios';
import { useEffect, useState } from 'react';

function SessionMarquee() {
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const now = new Date();
        const upcoming = response.data
          .filter(session => new Date(session.dateTime) > now)
          .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
        setUpcomingSessions(upcoming);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, 2000);
    return () => clearInterval(interval);
  }, []);

  if (upcomingSessions.length === 0) return null;

  return (
    <div className="bg-gray-800 py-2 px-4 fixed top-20 w-full z-40">
      <div className="marquee-container overflow-hidden">
        <div className="animate-scroll-x whitespace-nowrap">
          {upcomingSessions.map((session, index) => (
            <span key={session._id} className="inline-block mx-8">
              <span className="text-blue-500">Upcoming Session:</span>{' '}
              {session.title} - {new Date(session.dateTime).toLocaleString()}
              {index < upcomingSessions.length - 1 && ' | '}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SessionMarquee;