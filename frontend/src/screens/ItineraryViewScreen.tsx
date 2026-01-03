import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import '../styles/global.css';

interface SectionActivity {
  id: string;
  scheduledDate: string;
  scheduledTime?: string;
  expense: number;
  order: number;
  activity: {
    id: string;
    name: string;
    type: string;
    cost: number;
    city: {
      name: string;
    };
  };
}

interface Section {
  id: string;
  title?: string;
  notes?: string;
  startDate: string;
  endDate: string;
  budget: number;
  activities: SectionActivity[];
}

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  sections: Section[];
}

const ItineraryViewScreen = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (tripId) {
      loadTrip();
    }
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const response = await api.getTrip(tripId!);
      if (response.data?.trip) {
        setTrip(response.data.trip);
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
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
        <div>Trip not found</div>
      </div>
    );
  }

  // Calculate budget metrics
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const numDays = days.length;
  const dailyBudget = trip.budget / numDays;

  // Group activities by day
  const activitiesByDay = new Map<string, SectionActivity[]>();
  trip.sections.forEach(section => {
    section.activities.forEach(sa => {
      const dateKey = format(new Date(sa.scheduledDate), 'yyyy-MM-dd');
      if (!activitiesByDay.has(dateKey)) {
        activitiesByDay.set(dateKey, []);
      }
      activitiesByDay.get(dateKey)!.push(sa);
    });
  });

  // Calculate totals
  let totalExpense = 0;
  const dayTotals = new Map<string, number>();
  days.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayActivities = activitiesByDay.get(dateKey) || [];
    const dayTotal = dayActivities.reduce((sum, sa) => sum + (sa.expense || sa.activity.cost || 0), 0);
    dayTotals.set(dateKey, dayTotal);
    totalExpense += dayTotal;
  });

  const avgPerDay = numDays > 0 ? totalExpense / numDays : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Itenary View Screenn with budget section (Screen 9)</h1>

        <SearchBar />

        <div style={{ marginBottom: '30px' }}>
          <h2>{trip.name} for a selected place</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ fontWeight: 'bold' }}>Physical Activity</div>
          <div style={{ fontWeight: 'bold' }}>Expense</div>
        </div>

        {days.map((day, dayIndex) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayActivities = activitiesByDay.get(dateKey) || [];
          const dayTotal = dayTotals.get(dateKey) || 0;
          const isOverBudget = dayTotal > dailyBudget;

          return (
            <div
              key={dateKey}
              className={`container ${isOverBudget ? 'overbudget' : ''}`}
              style={{ padding: '20px', marginBottom: '20px' }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>Day {dayIndex + 1}</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div>
                  {dayActivities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {dayActivities.map((sa, idx) => (
                        <div key={sa.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {idx > 0 && <div style={{ fontSize: '20px' }}>↓</div>}
                          <div className="container" style={{ padding: '10px', flex: 1 }}>
                            <div>{sa.activity.name}</div>
                            <div style={{ fontSize: '12px' }}>{sa.activity.city.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}>No activities</div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dayActivities.map(sa => (
                    <div key={sa.id} style={{ padding: '10px', border: '1px solid #ffffff' }}>
                      ${(sa.expense || sa.activity.cost || 0).toFixed(2)}
                    </div>
                  ))}
                  <div style={{ padding: '10px', border: '1px solid #ffffff', fontWeight: 'bold', marginTop: '10px' }}>
                    Total: ${dayTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Totals */}
        <div className="container" style={{ padding: '20px', marginTop: '30px' }}>
          <h3 style={{ marginBottom: '15px' }}>Budget Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>Total Trip Budget: ${trip.budget.toFixed(2)}</div>
            <div>Total Expenses: ${totalExpense.toFixed(2)}</div>
            <div>Average per Day: ${avgPerDay.toFixed(2)}</div>
            <div>Daily Budget: ${dailyBudget.toFixed(2)}</div>
            <div>Remaining: ${(trip.budget - totalExpense).toFixed(2)}</div>
          </div>
        </div>

        {!readOnly && (
          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button
              className="button"
              onClick={() => navigate(`/trips/builder/${tripId}`)}
              style={{ flex: 1 }}
            >
              Edit Itinerary
            </button>
            <button
              className="button"
              onClick={() => navigate(`/calendar/${tripId}`)}
              style={{ flex: 1 }}
            >
              View Calendar
            </button>
            <button
              className="button"
              onClick={async () => {
                try {
                  await api.publishTrip(tripId!);
                  alert('Trip published!');
                } catch (error) {
                  console.error('Failed to publish trip:', error);
                }
              }}
              style={{ flex: 1 }}
            >
              Publish to Community
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryViewScreen;

