import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import { getActivityImageUrl } from '../utils/images';
import '../styles/global.css';

interface Activity {
  id: string;
  name: string;
  type: string;
  description?: string;
  cost: number;
  duration: number;
  city: {
    id: string;
    name: string;
    country: string;
  };
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || 'Paragliding');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [maxCost, setMaxCost] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [availableCities, setAvailableCities] = useState<Array<{ id: string; name: string; country: string }>>([]);
  const [userTrips, setUserTrips] = useState<Array<{ id: string; name: string }>>([]);
  const [showTripSelector, setShowTripSelector] = useState(false);
  const [activityToAdd, setActivityToAdd] = useState<Activity | null>(null);

  useEffect(() => {
    performSearch();
    loadCities();
    loadUserTrips();
  }, []);

  const loadUserTrips = async () => {
    try {
      const response = await api.getTrips();
      if (response.data?.trips) {
        setUserTrips(response.data.trips);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    }
  };

  const handleAddToTrip = (activity: Activity) => {
    if (userTrips.length === 0) {
      alert('You need to create a trip first. Redirecting to create trip page...');
      navigate('/trips/new');
      return;
    }
    setActivityToAdd(activity);
    setShowTripSelector(true);
  };

  const handleSelectTrip = async (tripId: string) => {
    if (!activityToAdd) return;
    
    try {
      // Navigate to trip builder with activity info
      navigate(`/trips/builder/${tripId}?activityId=${activityToAdd.id}`);
      setShowTripSelector(false);
      setActivityToAdd(null);
    } catch (error) {
      console.error('Failed to navigate to trip builder:', error);
      alert('Failed to add activity to trip');
    }
  };

  useEffect(() => {
    performSearch();
  }, [typeFilter, maxCost, selectedCity]);

  const loadCities = async () => {
    try {
      const response = await api.searchCities();
      if (response.data?.cities) {
        const uniqueCities = Array.from(
          new Map(activities.map(a => [a.city.id, a.city])).values()
        );
        setAvailableCities(uniqueCities);
      }
    } catch (error) {
      console.error('Failed to load cities:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await api.searchActivities(
        searchQuery || undefined,
        typeFilter || undefined,
        selectedCity || undefined,
        maxCost ? parseFloat(maxCost) : undefined
      );
      if (response.data?.activities) {
        setActivities(response.data.activities);
        // Update available cities from results
        const uniqueCities = Array.from(
          new Map(response.data.activities.map((a: Activity) => [a.city.id, a.city])).values()
        );
        setAvailableCities(uniqueCities);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Activity Search</h1>

        <SearchBar
          placeholder="Search activities..."
          value={searchQuery}
          onChange={setSearchQuery}
          onFilter={handleSearch}
          onSortBy={handleSearch}
        />

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Type:</label>
            <select
              className="input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '8px', minWidth: '150px' }}
            >
              <option value="">All Types</option>
              <option value="TRAVEL">Travel</option>
              <option value="STAY">Stay</option>
              <option value="EXPERIENCE">Experience</option>
              <option value="BUFFER">Buffer</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Max Cost:</label>
            <input
              type="number"
              className="input"
              placeholder="Max cost"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              style={{ padding: '8px', width: '120px' }}
              min="0"
              step="0.01"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>City:</label>
            <select
              className="input"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ padding: '8px', minWidth: '200px' }}
            >
              <option value="">All Cities</option>
              {availableCities.map(city => (
                <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: '20px' }}>Results ({activities.length} activities)</h2>
          {loading ? (
            <div>Loading...</div>
          ) : activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className="container"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    gap: '15px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedActivity(activity)}
                >
                  <img
                    src={getActivityImageUrl(activity.name, activity.type)}
                    alt={activity.name}
                    style={{
                      width: '150px',
                      height: '120px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div style={{ padding: '15px', flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{activity.name}</div>
                    <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                      {activity.city.name}, {activity.city.country}
                    </div>
                    {activity.description && (
                      <div style={{ fontSize: '12px', marginTop: '10px', color: 'var(--text-muted)' }}>
                        {activity.description.substring(0, 100)}...
                      </div>
                    )}
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                      Type: {activity.type} | Cost: ${activity.cost} | Duration: {activity.duration} min
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        className="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActivity(activity);
                        }}
                        style={{ padding: '5px 10px', fontSize: '12px', flex: 1 }}
                      >
                        Quick View
                      </button>
                      <button
                        className="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToTrip(activity);
                        }}
                        style={{ padding: '5px 10px', fontSize: '12px', flex: 1, backgroundColor: 'var(--accent-blue)' }}
                      >
                        Add to Trip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
              No results found
            </div>
          )}
        </div>

        {/* Quick View Modal */}
        {selectedActivity && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setSelectedActivity(null)}
          >
            <div
              className="container"
              style={{
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '30px',
                backgroundColor: 'white',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedActivity(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px 10px',
                }}
              >
                ×
              </button>
              <img
                src={getActivityImageUrl(selectedActivity.name, selectedActivity.type)}
                alt={selectedActivity.name}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <h2 style={{ marginBottom: '10px' }}>{selectedActivity.name}</h2>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                {selectedActivity.city.name}, {selectedActivity.city.country}
              </div>
              {selectedActivity.description && (
                <div style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  {selectedActivity.description}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
                <div className="container" style={{ padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Type</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedActivity.type}</div>
                </div>
                <div className="container" style={{ padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cost</div>
                  <div style={{ fontWeight: 'bold' }}>${selectedActivity.cost}</div>
                </div>
                <div className="container" style={{ padding: '15px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duration</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedActivity.duration} min</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trip Selector Modal */}
        {showTripSelector && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => {
              setShowTripSelector(false);
              setActivityToAdd(null);
            }}
          >
            <div
              className="container"
              style={{
                maxWidth: '500px',
                padding: '30px',
                backgroundColor: 'white',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowTripSelector(false);
                  setActivityToAdd(null);
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px 10px',
                }}
              >
                ×
              </button>
              <h2 style={{ marginBottom: '20px' }}>Select a Trip</h2>
              <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
                Choose a trip to add "{activityToAdd?.name}" to:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                {userTrips.map(trip => (
                  <button
                    key={trip.id}
                    className="button"
                    onClick={() => handleSelectTrip(trip.id)}
                    style={{ padding: '15px', textAlign: 'left', width: '100%' }}
                  >
                    {trip.name}
                  </button>
                ))}
              </div>
              <button
                className="button"
                onClick={() => navigate('/trips/new')}
                style={{ marginTop: '20px', width: '100%', padding: '12px' }}
              >
                Create New Trip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

