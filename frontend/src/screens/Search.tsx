import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { api } from '../services/api';
import '../styles/global.css';

interface Activity {
  id: string;
  name: string;
  type: string;
  description?: string;
  cost: number;
  duration: number;
  city: {
    name: string;
    country: string;
  };
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || 'Paragliding');

  useEffect(() => {
    performSearch();
  }, []);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await api.searchActivities(searchQuery);
      if (response.data?.activities) {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Activity Search</h1>

        <SearchBar
          placeholder={searchQuery}
          value={searchQuery}
          onChange={setSearchQuery}
          onFilter={handleSearch}
          onSortBy={handleSearch}
        />

        <div>
          <h2 style={{ marginBottom: '20px' }}>Results</h2>
          {loading ? (
            <div>Loading...</div>
          ) : activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {activities.map(activity => (
                <div key={activity.id} className="container" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{activity.name}</div>
                      <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                        {activity.city.name}, {activity.city.country}
                      </div>
                      {activity.description && (
                        <div style={{ fontSize: '12px', marginTop: '10px' }}>{activity.description}</div>
                      )}
                      <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        Type: {activity.type} | Cost: ${activity.cost} | Duration: {activity.duration} min
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;

