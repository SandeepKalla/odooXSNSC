import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { api } from '../services/api';
import { getTripImageUrl, getActivityImageUrl } from '../utils/images';
import '../styles/global.css';

const PublicTrip = () => {
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
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Public trip not found</div>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareText = `Check out this amazing trip: ${trip.name}`;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  // Render read-only itinerary view
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Public Trip: {trip.name}</h1>
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--border-primary)' }}>
          <div style={{ marginBottom: '15px' }}>This is a read-only view of a public trip.</div>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Share this trip:</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="button"
                onClick={() => handleShare('facebook')}
                style={{ padding: '8px 16px', backgroundColor: '#1877f2', color: 'white' }}
              >
                Facebook
              </button>
              <button
                className="button"
                onClick={() => handleShare('twitter')}
                style={{ padding: '8px 16px', backgroundColor: '#1da1f2', color: 'white' }}
              >
                Twitter
              </button>
              <button
                className="button"
                onClick={() => handleShare('linkedin')}
                style={{ padding: '8px 16px', backgroundColor: '#0077b5', color: 'white' }}
              >
                LinkedIn
              </button>
              <button
                className="button"
                onClick={() => handleShare('whatsapp')}
                style={{ padding: '8px 16px', backgroundColor: '#25d366', color: 'white' }}
              >
                WhatsApp
              </button>
              <button
                className="button"
                onClick={() => handleShare('copy')}
                style={{ padding: '8px 16px' }}
              >
                Copy Link
              </button>
            </div>
          </div>

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
          <img
            src={getTripImageUrl(trip.name)}
            alt={trip.name}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '15px'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
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
                      <div key={sa.id} style={{ marginTop: '10px', padding: '10px', border: '1px solid var(--border-primary)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img
                          src={getActivityImageUrl(sa.activity.name, sa.activity.type)}
                          alt={sa.activity.name}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            flexShrink: 0
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold' }}>{sa.activity.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sa.activity.city.name}</div>
                        </div>
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

export default PublicTrip;

