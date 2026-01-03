import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import '../styles/global.css';

interface SectionActivity {
  scheduledDate: string;
  expense: number;
  activity: {
    name: string;
    cost: number;
  };
}

interface Section {
  id: string;
  startDate: string;
  endDate: string;
  hasOverlapWarning: boolean;
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

const CalendarView = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

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
        setCurrentMonth(new Date(response.data.trip.startDate));
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trip) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  
  // Calculate budget metrics
  const tripStart = new Date(trip.startDate);
  const tripEnd = new Date(trip.endDate);
  const numDays = Math.ceil((tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const dailyBudget = trip.budget / numDays;

  // Group activities by day and calculate expenses
  const dayData = new Map<string, { expense: number; hasActivity: boolean; isOverBudget: boolean; hasGap: boolean; hasOverlap: boolean }>();
  
  trip.sections.forEach(section => {
    const sectionStart = new Date(section.startDate);
    const sectionEnd = new Date(section.endDate);
    const sectionDays = eachDayOfInterval({ start: sectionStart, end: sectionEnd });
    
    sectionDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      if (!dayData.has(dateKey)) {
        dayData.set(dateKey, { expense: 0, hasActivity: false, isOverBudget: false, hasGap: false, hasOverlap: section.hasOverlapWarning });
      }
      const data = dayData.get(dateKey)!;
      data.hasOverlap = data.hasOverlap || section.hasOverlapWarning;
    });

    section.activities.forEach(sa => {
      const dateKey = format(new Date(sa.scheduledDate), 'yyyy-MM-dd');
      if (!dayData.has(dateKey)) {
        dayData.set(dateKey, { expense: 0, hasActivity: false, isOverBudget: false, hasGap: false, hasOverlap: false });
      }
      const data = dayData.get(dateKey)!;
      data.expense += sa.expense || sa.activity.cost || 0;
      data.hasActivity = true;
      data.isOverBudget = data.expense > dailyBudget;
    });
  });

  // Mark gap days (days in trip range without any section coverage)
  const tripDays = eachDayOfInterval({ start: tripStart, end: tripEnd });
  tripDays.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    if (!dayData.has(dateKey)) {
      dayData.set(dateKey, { expense: 0, hasActivity: false, isOverBudget: false, hasGap: true, hasOverlap: false });
    }
  });

  const getDayData = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return dayData.get(dateKey) || { expense: 0, hasActivity: false, isOverBudget: false, hasGap: false, hasOverlap: false };
  };

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Calendar View</h1>

        <SearchBar />

        <div className="container" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button
              className="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              ←
            </button>
            <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
            <button
              className="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
            {weekDays.map(day => (
              <div key={day} style={{ textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>
                {day}
              </div>
            ))}
            
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: '80px' }} />
            ))}
            
            {monthDays.map(day => {
              const data = getDayData(day);
              const isInTrip = day >= tripStart && day <= tripEnd;
              const isToday = isSameDay(day, new Date());
              
              let bgColor = 'transparent';
              if (data.isOverBudget) bgColor = 'rgba(255, 107, 107, 0.3)';
              else if (data.hasGap && isInTrip) bgColor = 'rgba(0, 0, 0, 0.05)';
              else if (data.hasOverlap) bgColor = 'rgba(255, 200, 0, 0.2)';
              else if (data.hasActivity) bgColor = 'rgba(100, 200, 100, 0.2)';

              return (
                <div
                  key={day.toISOString()}
                  className="container"
                  style={{
                    minHeight: '80px',
                    padding: '5px',
                    backgroundColor: bgColor,
                    borderColor: isToday ? '#4ade80' : 'var(--border-primary)',
                  }}
                >
                  <div style={{ fontWeight: isToday ? 'bold' : 'normal' }}>
                    {format(day, 'd')}
                  </div>
                  {data.hasActivity && (
                    <div style={{ fontSize: '10px', marginTop: '5px' }}>
                      {trip.name}
                    </div>
                  )}
                  {data.expense > 0 && (
                    <div style={{ fontSize: '10px', marginTop: '2px' }}>
                      ${data.expense.toFixed(0)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

