import { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import '../styles/global.css';

interface AdminStats {
  userCount: number;
  tripCount: number;
  topCities: Array<{ name: string; country: string; popularityScore: number }>;
  topActivities: Array<{ activity: any; usageCount: number }>;
  activityTypeDistribution: Array<{ type: string; _count: { id: number } }>;
  tripStatusDistribution: Array<{ status: string; _count: { id: number } }>;
  userTrend: Array<{ date: string; count: number }>;
}

const AdminPanel = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.getAdminStats();
      if (response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error);
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

  if (!stats) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Failed to load stats</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Admin Panel</h1>

        <SearchBar />

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--border-primary)' }}>
          <button
            className={`button ${activeTab === 'users' ? '' : ''}`}
            onClick={() => setActiveTab('users')}
            style={{ borderBottom: activeTab === 'users' ? '2px solid var(--accent-blue)' : 'none' }}
          >
            Manage Users
          </button>
          <button
            className={`button ${activeTab === 'cities' ? '' : ''}`}
            onClick={() => setActiveTab('cities')}
            style={{ borderBottom: activeTab === 'cities' ? '2px solid var(--accent-blue)' : 'none' }}
          >
            Popular cities
          </button>
          <button
            className={`button ${activeTab === 'activities' ? '' : ''}`}
            onClick={() => setActiveTab('activities')}
            style={{ borderBottom: activeTab === 'activities' ? '2px solid var(--accent-blue)' : 'none' }}
          >
            Popular Activities
          </button>
          <button
            className={`button ${activeTab === 'analytics' ? '' : ''}`}
            onClick={() => setActiveTab('analytics')}
            style={{ borderBottom: activeTab === 'analytics' ? '2px solid var(--accent-blue)' : 'none' }}
          >
            User Trends and Analytics
          </button>
        </div>

        <div className="container" style={{ padding: '30px', minHeight: '400px' }}>
          {activeTab === 'users' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>Manage User Section:</h2>
              <div>Total Users: {stats.userCount}</div>
              <div style={{ marginTop: '20px' }}>
                <h3>Trip Status Distribution:</h3>
                <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                  {stats.tripStatusDistribution.map(item => (
                    <div key={item.status} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{item._count.id}</div>
                      <div>{item.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cities' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>Popular cities:</h2>
              <div>Lists all the popular cities where the users are visiting based on the current user trends.</div>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.topCities.map((city, idx) => (
                  <div key={idx} style={{ padding: '10px', border: '1px solid var(--border-primary)' }}>
                    {city.name}, {city.country} - Score: {city.popularityScore}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>Popular Activities:</h2>
              <div>List all the popular activities that the users are doing based on the current user trend data.</div>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.topActivities.slice(0, 10).map((item, idx) => (
                  <div key={idx} style={{ padding: '10px', border: '1px solid var(--border-primary)' }}>
                    {item.activity?.name} - Used {item.usageCount} times
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>User trends and Analytics:</h2>
              <div>This section will major focus on the providing analysis across various points and give useful information to the user.</div>
              <div style={{ marginTop: '30px' }}>
                <h3>User Registration Trend (Last 30 Days):</h3>
                <div style={{ marginTop: '15px', display: 'flex', alignItems: 'end', gap: '5px', height: '200px' }}>
                  {stats.userTrend.map((item, idx) => (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ 
                        width: '100%', 
                        height: `${(item.count / Math.max(...stats.userTrend.map(t => t.count), 1)) * 180}px`,
                        backgroundColor: 'var(--accent-blue)',
                        marginBottom: '5px'
                      }} />
                      <div style={{ fontSize: '10px', transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>
                        {item.date.split('-')[2]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '30px' }}>
                <h3>Activity Type Distribution:</h3>
                <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                  {stats.activityTypeDistribution.map(item => (
                    <div key={item.type} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{item._count.id}</div>
                      <div>{item.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

