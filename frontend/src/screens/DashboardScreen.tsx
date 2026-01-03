import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import '../styles/global.css';

interface City {
  id: string;
  name: string;
  country: string;
  popularityScore: number;
}

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

const DashboardScreen = () => {
  const [topCities, setTopCities] = useState<City[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load top cities
        const citiesResponse = await api.searchCities();
        if (citiesResponse.data?.cities) {
          setTopCities(citiesResponse.data.cities.slice(0, 5));
        }

        // Load previous trips
        const tripsResponse = await api.getTrips('COMPLETED');
        if (tripsResponse.data?.trips) {
          setPreviousTrips(tripsResponse.data.trips.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Main Landing Page</h1>

        {/* Banner Image */}
        <div className="container" style={{ 
          height: '200px', 
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          Banner Image
        </div>

        {/* Search and Filter Bar */}
        <SearchBar />

        {/* Top Regional Selections */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Top Regional Selections</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {loading ? (
              <div>Loading...</div>
            ) : topCities.length > 0 ? (
              topCities.map((city) => (
                <div
                  key={city.id}
                  className="container"
                  style={{
                    width: '150px',
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/search?city=${city.id}`)}
                >
                  {city.name}
                </div>
              ))
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="container"
                  style={{
                    width: '150px',
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Previous Trips */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Previous Trips</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {loading ? (
              <div>Loading...</div>
            ) : previousTrips.length > 0 ? (
              previousTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="container"
                  style={{
                    width: '200px',
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/trips/view/${trip.id}`)}
                >
                  {trip.name}
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="container"
                  style={{
                    width: '200px',
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Plan a trip button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button
            className="button"
            onClick={() => navigate('/trips/new')}
            style={{ padding: '12px 24px', fontSize: '18px' }}
          >
            + Plan a trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;

