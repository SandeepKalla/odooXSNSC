import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../services/api';
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

const BuildItineraryScreen = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    if (tripId) {
      loadTrip();
      loadActivities();
    }
  }, [tripId]);

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

  const handleAddSection = async () => {
    if (!trip) return;

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await api.createSection(tripId!, {
        title: `Section ${sections.length + 1}`,
        notes: '',
        startDate: today.toISOString().split('T')[0],
        endDate: tomorrow.toISOString().split('T')[0],
        budget: 0,
        order: sections.length,
      });

      if (response.data?.section) {
        await loadTrip();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add section');
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
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px' }}>Build Itenary Screen (Screen 5)</h1>

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
                        <div key={sa.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ffffff' }}>
                          <div>
                            <div>{sa.activity.name}</div>
                            <div style={{ fontSize: '12px' }}>{sa.activity.city.name}</div>
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
                    <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ffffff' }}>
                      No activities added yet
                    </div>
                  )}

                  <ActivitySelector
                    activities={availableActivities}
                    onSelect={(activityId) => handleAddActivity(section.id, activityId)}
                  />
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
        <div style={{ marginTop: '15px', border: '1px solid #ffffff', padding: '15px' }}>
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
                  border: '1px solid #ffffff',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  onSelect(activity.id);
                  setShowSelector(false);
                }}
              >
                <div>{activity.name}</div>
                <div style={{ fontSize: '12px' }}>${activity.cost} - {activity.city.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildItineraryScreen;

