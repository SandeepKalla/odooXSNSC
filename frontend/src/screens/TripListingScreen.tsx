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
  status: string;
  budget: number;
}

const TripListingScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const response = await api.getTrips();
      if (response.data?.trips) {
        setTrips(response.data.trips);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const ongoingTrips = trips.filter(t => t.status === 'ONGOING');
  const upcomingTrips = trips.filter(t => t.status === 'UPCOMING');
  const completedTrips = trips.filter(t => t.status === 'COMPLETED');

  const TripCard = ({ trip }: { trip: Trip }) => (
    <div
      className="container"
      style={{
        padding: '20px',
        cursor: 'pointer',
        minHeight: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={() => navigate(`/trips/view/${trip.id}`)}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{trip.name}</div>
        <div style={{ fontSize: '14px' }}>Short Over View of the Trip</div>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>User Trip Listing (Screen 6)</h1>

        <SearchBar />

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Ongoing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {loading ? (
              <div>Loading...</div>
            ) : ongoingTrips.length > 0 ? (
              ongoingTrips.map(trip => <TripCard key={trip.id} trip={trip} />)
            ) : (
              <div className="container" style={{ padding: '20px', textAlign: 'center' }}>
                No ongoing trips
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Up-coming</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {loading ? (
              <div>Loading...</div>
            ) : upcomingTrips.length > 0 ? (
              upcomingTrips.map(trip => <TripCard key={trip.id} trip={trip} />)
            ) : (
              <div className="container" style={{ padding: '20px', textAlign: 'center' }}>
                No upcoming trips
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Completed</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {loading ? (
              <div>Loading...</div>
            ) : completedTrips.length > 0 ? (
              completedTrips.map(trip => <TripCard key={trip.id} trip={trip} />)
            ) : (
              <div className="container" style={{ padding: '20px', textAlign: 'center' }}>
                No completed trips
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripListingScreen;

