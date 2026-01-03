import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { getProfilePhotoUrl, getTripImageUrl, getCityImageUrl } from '../utils/images';
import '../styles/global.css';

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface SavedDestination {
  id: string;
  city: {
    id: string;
    name: string;
    country: string;
  };
}

const Profile = () => {
  const { user } = useAuth();
  const [preplannedTrips, setPreplannedTrips] = useState<Trip[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    additionalInfo: user?.additionalInfo || '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
    loadSavedDestinations();
  }, []);

  const loadTrips = async () => {
    try {
      const response = await api.getTrips();
      if (response.data?.trips) {
        const trips = response.data.trips;
        setPreplannedTrips(trips.filter((t: Trip) => t.status === 'UPCOMING').slice(0, 3));
        setPreviousTrips(trips.filter((t: Trip) => t.status === 'COMPLETED').slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    }
  };

  const loadSavedDestinations = async () => {
    try {
      const response = await api.getMe();
      if (response.data?.user?.savedDestinations) {
        setSavedDestinations(response.data.user.savedDestinations);
      }
    } catch (error) {
      console.error('Failed to load saved destinations:', error);
    }
  };

  const handleRemoveDestination = async (cityId: string) => {
    try {
      await api.removeSavedDestination(cityId);
      loadSavedDestinations();
    } catch (error) {
      console.error('Failed to remove destination:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.updateProfile(formData);
      if (response.data?.user) {
        // Update user context if needed
        setEditing(false);
        alert('Profile updated successfully!');
        window.location.reload(); // Refresh to get updated data
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px' }}>User Profile</h1>

        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <img
            src={user?.profilePhoto || getProfilePhotoUrl(
              user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.username || 'User',
              100
            )}
            alt="Profile"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '1px solid var(--border-primary)',
              objectFit: 'cover',
              flexShrink: 0
            }}
          />

          <div className="container" style={{ flex: 1, padding: '20px', minWidth: '300px' }}>
            <div style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '20px' }}>
              {user?.firstName} {user?.lastName} ({user?.username})
            </div>
            
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                <input
                  type="tel"
                  className="input"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
                <textarea
                  className="textarea"
                  placeholder="Additional Information"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  rows={3}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="button" onClick={handleSave} style={{ flex: 1 }}>
                    Save
                  </button>
                  <button className="button" onClick={() => setEditing(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div>User Details - Click to edit those information....</div>
                <button className="button" onClick={() => setEditing(true)} style={{ marginTop: '15px' }}>
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Preplanned Trips</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {preplannedTrips.length > 0 ? (
              preplannedTrips.map(trip => (
                <div key={trip.id} className="container" style={{ width: '250px', padding: 0, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={getTripImageUrl(trip.name)}
                    alt={trip.name}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div style={{ padding: '15px' }}>
                    <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>{trip.name}</div>
                    <button className="button" onClick={() => navigate(`/trips/view/${trip.id}`)} style={{ width: '100%' }}>
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="container" style={{ width: '250px', height: '150px' }} />
              ))
            )}
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Previous Trips</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {previousTrips.length > 0 ? (
              previousTrips.map(trip => (
                <div key={trip.id} className="container" style={{ width: '250px', padding: 0, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={getTripImageUrl(trip.name)}
                    alt={trip.name}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div style={{ padding: '15px' }}>
                    <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>{trip.name}</div>
                    <button className="button" onClick={() => navigate(`/trips/view/${trip.id}`)} style={{ width: '100%' }}>
                      View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="container" style={{ width: '250px', height: '150px' }} />
              ))
            )}
          </div>
        </div>

        {/* Saved Destinations */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Saved Destinations</h2>
          {savedDestinations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {savedDestinations.map(dest => (
                <div key={dest.id} className="container" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={getCityImageUrl(dest.city.name, dest.city.country)}
                    alt={dest.city.name}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div style={{ padding: '15px' }}>
                    <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                      {dest.city.name}, {dest.city.country}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="button"
                        onClick={() => navigate(`/search/cities?city=${dest.city.id}`)}
                        style={{ flex: 1, padding: '5px 10px', fontSize: '12px' }}
                      >
                        View
                      </button>
                      <button
                        className="button"
                        onClick={() => handleRemoveDestination(dest.city.id)}
                        style={{ flex: 1, padding: '5px 10px', fontSize: '12px', backgroundColor: '#ff6b6b', color: 'white' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
              No saved destinations yet. Explore cities and save your favorites!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

