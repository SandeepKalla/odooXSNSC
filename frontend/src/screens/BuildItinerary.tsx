import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../services/api';
import { getActivityImageUrl } from '../utils/images';
import '../styles/global.css';

interface Section {
  id: string;
  title?: string;
  notes?: string;
  startDate: string;
  endDate: string;
  budget: number;
  hasOverlapWarning: boolean;
  activities: any[];
}

interface Activity {
  id: string;
  name: string;
  type: string;
  cost: number;
  city: {
    name: string;
    country: string;
  };
}

const BuildItinerary = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [showPlacesLoader, setShowPlacesLoader] = useState(false);

  useEffect(() => {
    if (tripId) {
      loadTrip();
      loadActivities();
    }
  }, [tripId]);

  // Handle activity from search page
  useEffect(() => {
    const activityId = searchParams.get('activityId');
    if (activityId && sections.length > 0 && availableActivities.length > 0 && !loading) {
      // Auto-select the first section and add the activity
      const firstSection = sections[0];
      const activity = availableActivities.find(a => a.id === activityId);
      if (firstSection && activity) {
        // Small delay to ensure UI is ready
        const timer = setTimeout(() => {
          handleAddActivity(firstSection.id, activityId);
          // Remove query param
          navigate(`/trips/builder/${tripId}`, { replace: true });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length, availableActivities.length, searchParams, tripId, loading]);

  const loadTrip = async () => {
    try {
      const response = await api.getTrip(tripId!);
      if (response.data?.trip) {
        setTrip(response.data.trip);
        setSections(response.data.trip.sections || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await api.searchActivities();
      if (response.data?.activities) {
        setAvailableActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  };

  const loadPlacesFromOpenTripMap = async (sectionId: string) => {
    if (!trip) return;
    
    setLoadingPlaces(true);
    setShowPlacesLoader(true);
    try {
      // Get city from section or trip
      const citiesResponse = await api.searchCities();
      if (citiesResponse.data?.cities && citiesResponse.data.cities.length > 0) {
        const city = citiesResponse.data.cities[0]; // Use first city for now
        
        if (city.latitude && city.longitude) {
          const placesResponse = await api.getCityPlaces(city.id, 'interesting_places', 5000);
          if (placesResponse.data?.places) {
            // Convert OpenTripMap places to activities format
            const newActivities = placesResponse.data.places.slice(0, 10).map((place: any) => ({
              id: `opentripmap-${place.xid}`,
              name: place.name,
              type: 'EXPERIENCE',
              cost: 0, // Will be updated when details are loaded
              duration: 120,
              city: {
                name: city.name,
                country: city.country,
              },
              description: `Attraction in ${city.name}`,
              xid: place.xid, // Store for getting details
            }));
            
            // Add to available activities
            setAvailableActivities(prev => [...prev, ...newActivities]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load places from OpenTripMap:', err);
    } finally {
      setLoadingPlaces(false);
      setShowPlacesLoader(false);
    }
  };

  const handleAddSection = async () => {
    if (!trip) return;

    try {
      // Use trip dates instead of today/tomorrow
      const tripStartDate = new Date(trip.startDate);
      const tripEndDate = new Date(trip.endDate);
      
      // Calculate default dates within trip range
      // If there are existing sections, start after the last one
      let defaultStartDate = tripStartDate;
      let defaultEndDate = new Date(tripStartDate);
      defaultEndDate.setDate(defaultEndDate.getDate() + 1);
      
      if (sections.length > 0) {
        // Find the latest end date
        const latestEndDate = sections.reduce((latest, section) => {
          const sectionEnd = new Date(section.endDate);
          return sectionEnd > latest ? sectionEnd : latest;
        }, new Date(sections[0].endDate));
        
        // Start the new section after the latest end date
        defaultStartDate = new Date(latestEndDate);
        defaultStartDate.setDate(defaultStartDate.getDate() + 1);
        
        // End date is one day after start, but not beyond trip end
        defaultEndDate = new Date(defaultStartDate);
        defaultEndDate.setDate(defaultEndDate.getDate() + 1);
        
        // Ensure dates are within trip range
        if (defaultStartDate < tripStartDate) {
          defaultStartDate = tripStartDate;
        }
        if (defaultEndDate > tripEndDate) {
          defaultEndDate = tripEndDate;
        }
        if (defaultStartDate >= defaultEndDate) {
          // If no room for new section, use trip end date
          defaultEndDate = tripEndDate;
          defaultStartDate = new Date(tripEndDate);
          defaultStartDate.setDate(defaultStartDate.getDate() - 1);
        }
      }

      const response = await api.createSection(tripId!, {
        title: `Section ${sections.length + 1}`,
        notes: '',
        startDate: defaultStartDate.toISOString().split('T')[0],
        endDate: defaultEndDate.toISOString().split('T')[0],
        budget: 0,
        order: sections.length,
      });

      if (response.data?.section) {
        await loadTrip();
        setError(''); // Clear any previous errors
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add section. Make sure the dates are within your trip date range.');
    }
  };

  const handleUpdateSection = async (sectionId: string, updates: any) => {
    try {
      const response = await api.updateSection(tripId!, sectionId, updates);
      if (response.data?.section) {
        await loadTrip();
        setEditingSection(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update section');
    }
  };

  const handleAddActivity = async (sectionId: string, activityId: string) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;

      const startDate = new Date(section.startDate);
      const response = await api.addActivityToSection(sectionId, {
        activityId,
        scheduledDate: startDate.toISOString(),
        expense: availableActivities.find(a => a.id === activityId)?.cost || 0,
        order: section.activities.length,
      });

      if (response.data?.sectionActivity) {
        await loadTrip();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add activity');
    }
  };

  const handleRemoveActivity = async (sectionId: string, activityId: string) => {
    try {
      await api.removeActivityFromSection(sectionId, activityId);
      await loadTrip();
    } catch (err: any) {
      setError(err.message || 'Failed to remove activity');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px' }}>Build Itinerary</h1>

        {error && <div style={{ color: '#ff6b6b', marginBottom: '20px' }}>{error}</div>}

        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`container ${section.hasOverlapWarning ? 'overlap-warning' : ''}`}
            style={{ padding: '20px', marginBottom: '20px' }}
          >
            <h2 style={{ marginBottom: '15px' }}>Section {index + 1}:</h2>

            {editingSection === section.id ? (
              <SectionEditForm
                section={section}
                onSave={(updates) => handleUpdateSection(section.id, updates)}
                onCancel={() => setEditingSection(null)}
              />
            ) : (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Title/Notes:</strong> {section.title || section.notes || 'No information'}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Date Range:</strong> {new Date(section.startDate).toLocaleDateString()} to {new Date(section.endDate).toLocaleDateString()}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Budget:</strong> ${section.budget.toFixed(2)}
                  </div>
                </div>

                <button
                  className="button"
                  onClick={() => setEditingSection(section.id)}
                  style={{ marginBottom: '15px' }}
                >
                  Edit Section
                </button>

                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ marginBottom: '10px' }}>Activities:</h3>
                  {section.activities && section.activities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {section.activities.map((sa: any) => (
                        <div key={sa.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', border: '1px solid var(--border-primary)' }}>
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
                          <button
                            className="button"
                            onClick={() => handleRemoveActivity(section.id, sa.id)}
                            style={{ padding: '5px 10px' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', border: '1px solid var(--border-primary)' }}>
                      No activities added yet
                    </div>
                  )}

                  <div style={{ marginTop: '15px' }}>
                    <button
                      className="button"
                      onClick={() => loadPlacesFromOpenTripMap(section.id)}
                      disabled={loadingPlaces}
                      style={{ marginBottom: '10px', width: '100%' }}
                    >
                      {loadingPlaces ? 'Loading Real Attractions...' : '🌍 Discover Real Attractions'}
                    </button>
                    {showPlacesLoader && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Fetching nearby attractions from OpenTripMap...
                      </div>
                    )}
                    <ActivitySelector
                      activities={availableActivities}
                      onSelect={(activityId) => handleAddActivity(section.id, activityId)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        <button
          className="button"
          onClick={handleAddSection}
          style={{ width: '100%', marginTop: '20px', padding: '12px' }}
        >
          + Add another Section
        </button>

        <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
          <button
            className="button"
            onClick={() => navigate(`/trips/view/${tripId}`)}
            style={{ flex: 1 }}
          >
            View Itinerary
          </button>
          <button
            className="button"
            onClick={() => navigate('/trips')}
            style={{ flex: 1 }}
          >
            Back to Trips
          </button>
        </div>
      </div>
    </div>
  );
};

interface SectionEditFormProps {
  section: Section;
  onSave: (updates: any) => void;
  onCancel: () => void;
}

const SectionEditForm: React.FC<SectionEditFormProps> = ({ section, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: section.title || '',
    notes: section.notes || '',
    startDate: section.startDate.split('T')[0],
    endDate: section.endDate.split('T')[0],
    budget: section.budget.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      notes: formData.notes,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: parseFloat(formData.budget) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <textarea
        className="textarea"
        placeholder="All the necessary information about this section. This can be anything like travel section, hotel or any other activity"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={4}
      />
      <input
        type="date"
        className="input"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
      />
      <input
        type="date"
        className="input"
        value={formData.endDate}
        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
      />
      <input
        type="number"
        className="input"
        placeholder="Budget"
        value={formData.budget}
        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
        min="0"
        step="0.01"
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="button" style={{ flex: 1 }}>
          Save
        </button>
        <button type="button" className="button" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

interface ActivitySelectorProps {
  activities: Activity[];
  onSelect: (activityId: string) => void;
}

const ActivitySelector: React.FC<ActivitySelectorProps> = ({ activities, onSelect }) => {
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = activities.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ marginTop: '15px' }}>
      <button
        className="button"
        onClick={() => setShowSelector(!showSelector)}
        style={{ width: '100%' }}
      >
        {showSelector ? 'Hide Activities' : '+ Add Activity'}
      </button>

      {showSelector && (
        <div style={{ marginTop: '15px', border: '1px solid var(--border-primary)', padding: '15px' }}>
          <input
            type="text"
            className="input"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: '15px', width: '100%' }}
          />
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredActivities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                style={{
                  padding: '10px',
                  border: '1px solid var(--border-primary)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  onSelect(activity.id);
                  setShowSelector(false);
                }}
              >
                <img
                  src={getActivityImageUrl(activity.name, activity.type)}
                  alt={activity.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{activity.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>${activity.cost} - {activity.city.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildItinerary;

