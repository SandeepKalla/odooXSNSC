import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import '../styles/global.css';

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  user: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

const CommunityScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPublicTrips();
  }, []);

  const loadPublicTrips = async () => {
    try {
      const response = await api.getPublicTrips();
      if (response.data?.trips) {
        setTrips(response.data.trips);
      }
    } catch (error) {
      console.error('Failed to load public trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async (slug: string) => {
    try {
      const response = await api.copyTrip(slug);
      if (response.data?.trip) {
        navigate(`/trips/view/${response.data.trip.id}`);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to copy trip');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Community tab Screen (Screen 10)</h1>

        <SearchBar />

        <div className="container" style={{ padding: '20px', marginBottom: '30px' }}>
          <div>
            Community section where all about a certain trip or activity. Using the search, groupby or filter and sortby option, the user can narrow down the result that he is looking for...
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: '20px' }}>Community tab</h2>
          {loading ? (
            <div>Loading...</div>
          ) : trips.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {trips.map(trip => (
                <div key={trip.id} className="container" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    border: '1px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {trip.user.username[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{trip.name}</div>
                    <div style={{ fontSize: '14px' }}>
                      by {trip.user.firstName || trip.user.username} {trip.user.lastName}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="button"
                      onClick={() => navigate(`/trips/view/${trip.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="button"
                      onClick={async () => {
                        try {
                          // Try to get slug from public share
                          const publicResponse = await api.getPublicTrips();
                          const publicTrip = publicResponse.data?.trips?.find((t: any) => t.id === trip.id);
                          if (publicTrip) {
                            // We need the slug - for now, try to construct it or use trip ID
                            const slug = trip.name.toLowerCase().replace(/\s+/g, '-') + '-' + trip.id.slice(0, 8);
                            await handleCopyTrip(slug);
                          } else {
                            // Fallback: navigate to view
                            navigate(`/trips/view/${trip.id}`);
                          }
                        } catch (error) {
                          console.error('Failed to copy trip:', error);
                        }
                      }}
                    >
                      Copy Trip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
              No public trips available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityScreen;

