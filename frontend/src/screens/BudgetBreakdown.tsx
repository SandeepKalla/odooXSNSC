import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../services/api';
import { format, eachDayOfInterval } from 'date-fns';
import '../styles/global.css';

interface SectionActivity {
  id: string;
  scheduledDate: string;
  expense: number;
  activity: {
    id: string;
    name: string;
    type: string;
    cost: number;
  };
}

interface Section {
  id: string;
  title?: string;
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

const BudgetBreakdown = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']);

  useEffect(() => {
    if (tripId) {
      loadTrip();
      loadExchangeRates();
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

  const loadExchangeRates = async () => {
    try {
      // Always use USD as base for consistency
      const response = await api.getExchangeRates('USD');
      if (response.data?.rates) {
        setExchangeRates(response.data.rates);
        // Update available currencies from rates
        if (response.data.rates.conversion_rates) {
          const currencies = Object.keys(response.data.rates.conversion_rates);
          setAvailableCurrencies(['USD', ...currencies.slice(0, 15)]);
        }
      }
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
    }
  };

  const convertCurrency = (amount: number): number => {
    if (!exchangeRates) return amount;
    // If base is USD and we want USD, return as is
    if (exchangeRates.base_code === 'USD' && selectedCurrency === 'USD') return amount;
    // If base is USD, convert to selected currency
    if (exchangeRates.base_code === 'USD') {
      const rate = exchangeRates.conversion_rates?.[selectedCurrency];
      return rate ? amount * rate : amount;
    }
    // If base is not USD, convert from base to USD first, then to selected
    if (selectedCurrency === 'USD') {
      const rate = exchangeRates.conversion_rates?.['USD'];
      return rate ? amount / rate : amount;
    }
    // Convert from base to selected currency
    const rate = exchangeRates.conversion_rates?.[selectedCurrency];
    return rate ? amount * rate : amount;
  };

  if (loading || !trip) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Calculate budget metrics
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const numDays = days.length;
  const dailyBudget = trip.budget / numDays;

  // Calculate expenses by category
  const expensesByCategory: { [key: string]: number } = {
    TRAVEL: 0,
    STAY: 0,
    EXPERIENCE: 0,
    BUFFER: 0,
  };

  let totalExpense = 0;
  const dayTotals = new Map<string, number>();

  trip.sections.forEach(section => {
    section.activities.forEach(sa => {
      const expense = sa.expense || sa.activity.cost || 0;
      const category = sa.activity.type || 'BUFFER';
      expensesByCategory[category] = (expensesByCategory[category] || 0) + expense;
      totalExpense += expense;

      const dateKey = format(new Date(sa.scheduledDate), 'yyyy-MM-dd');
      dayTotals.set(dateKey, (dayTotals.get(dateKey) || 0) + expense);
    });
  });

  const avgPerDay = numDays > 0 ? totalExpense / numDays : 0;
  const remaining = trip.budget - totalExpense;
  const overBudget = totalExpense > trip.budget;

  // Calculate percentages for pie chart
  const categoryData = Object.entries(expensesByCategory)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      category,
      value,
      percentage: (value / totalExpense) * 100,
    }));

  // Simple pie chart colors
  const colors = ['#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#a78bfa', '#ec4899'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Trip Budget & Cost Breakdown</h1>

        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h2>{trip.name}</h2>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
            </div>
          </div>
          
          {/* Currency Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Currency:</label>
            <select
              className="input"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              style={{ padding: '8px', minWidth: '100px' }}
            >
              {availableCurrencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="container" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
              {selectedCurrency === 'USD' ? '$' : selectedCurrency} {convertCurrency(trip.budget).toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Budget</div>
          </div>
          <div className="container" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: overBudget ? '#ef4444' : '#4ade80' }}>
              {selectedCurrency === 'USD' ? '$' : selectedCurrency} {convertCurrency(totalExpense).toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Expenses</div>
          </div>
          <div className="container" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: remaining < 0 ? '#ef4444' : '#4ade80' }}>
              {selectedCurrency === 'USD' ? '$' : selectedCurrency} {convertCurrency(remaining).toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Remaining</div>
          </div>
          <div className="container" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {selectedCurrency === 'USD' ? '$' : selectedCurrency} {convertCurrency(avgPerDay).toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Avg per Day</div>
          </div>
          <div className="container" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {selectedCurrency === 'USD' ? '$' : selectedCurrency} {convertCurrency(dailyBudget).toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Daily Budget</div>
          </div>
        </div>

        {/* Cost Breakdown by Category */}
        <div className="container" style={{ padding: '30px', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Cost Breakdown by Category</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
            {/* Pie Chart Visualization */}
            <div>
              <h4 style={{ marginBottom: '15px' }}>Expense Distribution</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {categoryData.map((item, idx) => (
                  <div key={item.category} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: colors[idx % colors.length],
                        borderRadius: '4px',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 'bold' }}>{item.category}</span>
                        <span>${item.value.toFixed(2)}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${item.percentage}%`,
                            height: '100%',
                            backgroundColor: colors[idx % colors.length],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category List */}
            <div>
              <h4 style={{ marginBottom: '15px' }}>Category Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categoryData.map((item, idx) => (
                  <div key={item.category} className="container" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{item.category}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {item.percentage.toFixed(1)}% of total
                        </div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors[idx % colors.length] }}>
                        {selectedCurrency === 'USD' ? '$' : selectedCurrency} {convertCurrency(item.value).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Budget Breakdown */}
        <div className="container" style={{ padding: '30px', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Daily Budget Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {days.map((day, dayIndex) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTotal = dayTotals.get(dateKey) || 0;
              const isOverBudget = dayTotal > dailyBudget;

              return (
                <div
                  key={dateKey}
                  className="container"
                  style={{
                    padding: '15px',
                    backgroundColor: isOverBudget ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                    borderColor: isOverBudget ? '#ef4444' : 'var(--border-primary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Day {dayIndex + 1} - {format(day, 'MMM dd, yyyy')}</div>
                      {isOverBudget && (
                        <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>
                          ⚠️ Over budget by ${(dayTotal - dailyBudget).toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Budget</div>
                        <div>{selectedCurrency === 'USD' ? '$' : selectedCurrency} {convertCurrency(dailyBudget).toFixed(2)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Spent</div>
                        <div style={{ fontWeight: 'bold', color: isOverBudget ? '#ef4444' : '#4ade80' }}>
                          {selectedCurrency === 'USD' ? '$' : selectedCurrency} {convertCurrency(dayTotal).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          <button
            className="button"
            onClick={() => navigate(`/trips/view/${tripId}`)}
            style={{ flex: 1 }}
          >
            Back to Itinerary
          </button>
          <button
            className="button"
            onClick={() => navigate(`/trips/builder/${tripId}`)}
            style={{ flex: 1 }}
          >
            Edit Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetBreakdown;

