import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { api } from '../services/api';
import '../styles/global.css';

const PublicTripScreen = () => {
  const { slug } = useParams<{ slug: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      loadPublicTrip();
    }
  }, [slug]);

  const loadPublicTrip = async () => {
    try {
      const response = await api.getPublicTrip(slug!);
      if (response.data?.trip) {
        setTrip(response.data.trip);
      }
    } catch (error) {
      console.error('Failed to load public trip:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Public trip not found</div>
      </div>
    );
  }

  // Render read-only itinerary view
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <Header />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Public Trip: {trip.name}</h1>
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ffffff' }}>
          <div>This is a read-only view of a public trip.</div>
          <button
            className="button"
            onClick={async () => {
              try {
                const response = await api.copyTrip(slug!);
                if (response.data?.trip) {
                  navigate(`/trips/view/${response.data.trip.id}`);
                }
              } catch (error: any) {
                alert(error.message || 'Failed to copy trip');
              }
            }}
            style={{ marginTop: '10px' }}
          >
            Copy Trip
          </button>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h2>{trip.name}</h2>
          <div>
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </div>
        </div>
        {trip.sections && trip.sections.length > 0 && (
          <div>
            {trip.sections.map((section: any, idx: number) => (
              <div key={section.id} className="container" style={{ padding: '20px', marginBottom: '15px' }}>
                <h3>Section {idx + 1}: {section.title || 'Untitled'}</h3>
                <div>{section.notes}</div>
                {section.activities && section.activities.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <h4>Activities:</h4>
                    {section.activities.map((sa: any) => (
                      <div key={sa.id} style={{ marginTop: '10px', padding: '10px', border: '1px solid #ffffff' }}>
                        <div>{sa.activity.name}</div>
                        <div style={{ fontSize: '12px' }}>{sa.activity.city.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTripScreen;

