import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import { getTripImageUrl } from '../utils/images';
import '../styles/global.css';

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  budget: number;
}

const TripListing = () => {
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

  const handleDelete = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await api.deleteTrip(tripId);
        loadTrips();
      } catch (error) {
        console.error('Failed to delete trip:', error);
        alert('Failed to delete trip');
      }
    }
  };

  const TripCard = ({ trip, colorClass }: { trip: Trip; colorClass: string }) => (
    <div
      className={`container ${colorClass}`}
      style={{
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        minHeight: '200px',
      }}
    >
      <img
        src={getTripImageUrl(trip.name)}
        alt={trip.name}
        style={{
          width: '100%',
          height: '150px',
          objectFit: 'cover',
          display: 'block',
          cursor: 'pointer'
        }}
        onClick={() => navigate(`/trips/view/${trip.id}`)}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <div style={{
        padding: '15px',
        background: 'white'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', cursor: 'pointer' }} onClick={() => navigate(`/trips/view/${trip.id}`)}>
          {trip.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="button"
            onClick={() => navigate(`/trips/view/${trip.id}`)}
            style={{ flex: 1, padding: '5px 10px', fontSize: '12px' }}
          >
            View
          </button>
          <button
            className="button"
            onClick={() => navigate(`/trips/builder/${trip.id}`)}
            style={{ flex: 1, padding: '5px 10px', fontSize: '12px' }}
          >
            Edit
          </button>
          <button
            className="button"
            onClick={(e) => handleDelete(trip.id, e)}
            style={{ flex: 1, padding: '5px 10px', fontSize: '12px', backgroundColor: '#ff6b6b', color: 'white' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>User Trip Listing</h1>

        <SearchBar />

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Ongoing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {loading ? (
              <div>Loading...</div>
            ) : ongoingTrips.length > 0 ? (
              ongoingTrips.map((trip, idx) => {
                const colorClasses = ['card-green', 'card-blue', 'card-cyan'];
                return <TripCard key={trip.id} trip={trip} colorClass={colorClasses[idx % colorClasses.length]} />;
              })
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
              upcomingTrips.map((trip, idx) => {
                const colorClasses = ['card-blue', 'card-purple', 'card-pink'];
                return <TripCard key={trip.id} trip={trip} colorClass={colorClasses[idx % colorClasses.length]} />;
              })
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
              completedTrips.map((trip, idx) => {
                const colorClasses = ['card-orange', 'card-purple', 'card-cyan'];
                return <TripCard key={trip.id} trip={trip} colorClass={colorClasses[idx % colorClasses.length]} />;
              })
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

export default TripListing;

