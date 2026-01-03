import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../styles/global.css';

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [preplannedTrips, setPreplannedTrips] = useState<Trip[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);
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

  const handleSave = async () => {
    // In a real app, you'd update the user profile via API
    setEditing(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px' }}>User Profile</h1>

        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            border: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            Image of the User
          </div>

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
                <div key={trip.id} className="container" style={{ width: '250px', padding: '20px' }}>
                  <div style={{ marginBottom: '10px' }}>{trip.name}</div>
                  <button className="button" onClick={() => navigate(`/trips/view/${trip.id}`)} style={{ width: '100%' }}>
                    View
                  </button>
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
                <div key={trip.id} className="container" style={{ width: '250px', padding: '20px' }}>
                  <div style={{ marginBottom: '10px' }}>{trip.name}</div>
                  <button className="button" onClick={() => navigate(`/trips/view/${trip.id}`)} style={{ width: '100%' }}>
                    View
                  </button>
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="container" style={{ width: '250px', height: '150px' }} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

